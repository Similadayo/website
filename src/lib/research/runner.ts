import { db } from "@/lib/db"
import { discoverCompanies } from "@/lib/search"
import { isValidTransition } from "@/lib/stages"
import { crawlCompanyWebsite, buildWebsiteCorpus } from "@/lib/contacts/crawler"
import { persistCrawlContacts, enrichExecutiveContacts } from "@/lib/contacts/enrichment"
import { normalizeDomain } from "@/lib/validators"
import { runAIFitAnalysis } from "@/lib/ai/analyzer"
import { logActivity, logStageChange } from "@/lib/activity-log"

type DiscoveredCompany = {
  name: string
  url?: string | null
  domain?: string | null
  category?: string | null
  address?: string | null
  description?: string | null
  phone?: string | null
  rating?: number | null
  reviewCount?: number | null
}

type ResearchTaskPayload = {
  sessionId: string
  userId: string
  region: string
  niche: string
  cursor: number
  discovered?: DiscoveredCompany[]
}

const researchTaskRegistry =
  (globalThis as typeof globalThis & { __researchTaskRegistry?: Set<string> }).__researchTaskRegistry ??
  new Set<string>()

;(globalThis as typeof globalThis & { __researchTaskRegistry?: Set<string> }).__researchTaskRegistry =
  researchTaskRegistry

function parsePayload(value: string | null): ResearchTaskPayload | null {
  if (!value) return null

  try {
    return JSON.parse(value) as ResearchTaskPayload
  } catch {
    return null
  }
}

async function saveTaskPayload(taskId: string, payload: ResearchTaskPayload) {
  await db.task.update({
    where: { id: taskId },
    data: {
      payloadJson: JSON.stringify(payload),
    },
  })
}

async function processResearchCompany(
  payload: ResearchTaskPayload,
  company: DiscoveredCompany
) {
  const domain = company.domain || (company.url ? normalizeDomain(company.url) : undefined)

  const existingResult = await db.researchResult.findFirst({
    where: {
      sessionId: payload.sessionId,
      OR: [
        ...(domain ? [{ domain }] : []),
        { name: company.name },
      ],
    },
  })

  if (existingResult) {
    return
  }

  const existing = domain
    ? await db.company.findFirst({ where: { domain } })
    : null

  if (existing) {
    await db.researchResult.create({
      data: {
        sessionId: payload.sessionId,
        companyId: existing.id,
        name: company.name,
        domain: domain ?? null,
        status: "duplicate",
        note: `Owned by ${existing.createdById === payload.userId ? "you" : "another operative"}`,
      },
    })

    await db.researchSession.update({
      where: { id: payload.sessionId },
      data: { totalSkipped: { increment: 1 } },
    })
    return
  }

  let newCompany: Awaited<ReturnType<typeof db.company.create>>

  try {
    newCompany = await db.company.create({
      data: {
        name: company.name,
        websiteUrl: company.url,
        domain,
        niche: company.category || payload.niche,
        location: company.address || payload.region,
        summary: company.description || null,
        createdById: payload.userId,
      },
    })
  } catch {
    await db.researchResult.create({
      data: {
        sessionId: payload.sessionId,
        name: company.name,
        domain: domain ?? null,
        status: "failed",
        note: "Failed to save company",
      },
    })

    await db.researchSession.update({
      where: { id: payload.sessionId },
      data: { totalSkipped: { increment: 1 } },
    })
    return
  }

  const lead = await db.lead.create({
    data: {
      companyId: newCompany.id,
      stage: "researching",
      ownerId: payload.userId,
    },
  })

  await logActivity({
    entity: "lead",
    entityId: lead.id,
    actorId: payload.userId,
    action: "RESEARCH_SESSION_CREATED",
    metadata: { sessionId: payload.sessionId, source: "auto" },
  })

  if (company.phone) {
    try {
      await db.contact.create({
        data: {
          companyId: newCompany.id,
          name: `Phone: ${company.phone}`,
          contactType: "places",
          sourceUrl: newCompany.websiteUrl ?? undefined,
          sourceEvidence: "Phone number surfaced from discovery results.",
          verified: true,
          contactTier: "tier_3",
          outreachRecommendation: "manual_review",
        },
      })
    } catch {
      // Non-fatal.
    }
  }

  let crawlResult = {
    pages: [],
    emails: [],
    people: [],
    contactPages: [],
    linkedinUrls: [],
  } as Awaited<ReturnType<typeof crawlCompanyWebsite>>
  let websiteText = ""

  if (newCompany.websiteUrl) {
    try {
      crawlResult = await crawlCompanyWebsite(newCompany.websiteUrl)
      websiteText = buildWebsiteCorpus(crawlResult)
    } catch {
      // Non-fatal.
    }
  }

  if (crawlResult.pages.length > 0 && newCompany.websiteUrl) {
    try {
      const companyLinkedin =
        crawlResult.linkedinUrls.find((url) => /linkedin\.com\/company\//i.test(url)) ??
        crawlResult.linkedinUrls[0] ??
        null

      if (companyLinkedin && !newCompany.linkedinUrl) {
        newCompany = await db.company.update({
          where: { id: newCompany.id },
          data: { linkedinUrl: companyLinkedin },
        })
      }

      await persistCrawlContacts(newCompany.id, crawlResult)

      for (const phone of [
        ...new Set(
          crawlResult.pages.flatMap((page) => {
            const matches = page.text.match(/(?:\+?\d[\d\s\-()]{7,}\d)/g) ?? []
            return matches
              .map((value) => value.replace(/[^\d+]/g, "").trim())
              .filter((value) => value.length >= 8)
          })
        ),
      ].slice(0, 2)) {
        const existingPhone = await db.contact.findFirst({
          where: { companyId: newCompany.id, name: `Phone: ${phone}` },
        })

        if (existingPhone) continue

        await db.contact.create({
          data: {
            companyId: newCompany.id,
            name: `Phone: ${phone}`,
            contactType: "extracted",
            sourceUrl: newCompany.websiteUrl,
            sourceEvidence: `Public phone extracted from ${newCompany.websiteUrl}`,
            verified: true,
            contactTier: "tier_3",
            outreachRecommendation: "manual_review",
          },
        })
      }

      await enrichExecutiveContacts(newCompany.id, newCompany.websiteUrl, newCompany.domain, [])
    } catch {
      // Non-fatal.
    }
  }

  const contextText = [
    `Company: ${newCompany.name}`,
    company.category ? `Google Business Category: ${company.category}` : "",
    company.address ? `Address: ${company.address}` : payload.region ? `Region: ${payload.region}` : "",
    company.rating ? `Google Rating: ${company.rating}/5 (${company.reviewCount ?? 0} reviews)` : "",
    company.phone ? `Phone: ${company.phone}` : "",
    payload.niche ? `Research Niche: ${payload.niche}` : "",
    company.description ? `Description: ${company.description}` : "",
    websiteText ? `Website content:\n${websiteText}` : "No website content available.",
  ]
    .filter(Boolean)
    .join("\n\n")

  try {
    if (process.env.OPENAI_API_KEY) {
      await runAIFitAnalysis(lead.id, contextText)

      if (isValidTransition("researching", "analyzed")) {
        await db.lead.update({ where: { id: lead.id }, data: { stage: "analyzed" } })

        await logStageChange({
          leadId: lead.id,
          actorId: payload.userId,
          from: "researching",
          to: "analyzed",
          reason: "AI analysis completed via research session",
        })
      }
    }
  } catch {
    // AI analysis failure should not stop the queue.
  }

  await db.researchResult.create({
    data: {
      sessionId: payload.sessionId,
      companyId: newCompany.id,
      leadId: lead.id,
      name: newCompany.name,
      domain: domain ?? null,
      status: "created",
    },
  })

  await db.researchSession.update({
    where: { id: payload.sessionId },
    data: { totalAnalyzed: { increment: 1 } },
  })
}

export async function runResearchTask(taskId: string) {
  if (researchTaskRegistry.has(taskId)) return

  researchTaskRegistry.add(taskId)

  try {
    const task = await db.task.findUnique({ where: { id: taskId } })
    if (!task || task.type !== "research_session" || task.status === "completed") {
      return
    }

    const payload = parsePayload(task.payloadJson)
    if (!payload) {
      throw new Error("Research task payload is missing.")
    }

    await db.task.update({
      where: { id: taskId },
      data: {
        status: "running",
        attempts: { increment: 1 },
      },
    })

    await db.researchSession.update({
      where: { id: payload.sessionId },
      data: {
        status: "running",
        error: null,
        completedAt: null,
      },
    })

    if (!payload.discovered) {
      const discoveredRaw = await discoverCompanies(payload.niche, payload.region, 60)
      const candidateDomains = discoveredRaw.map((entry: DiscoveredCompany) => entry.domain).filter(Boolean) as string[]
      const existingDomains = candidateDomains.length
        ? await db.company.findMany({
            where: { domain: { in: candidateDomains } },
            select: { domain: true },
          })
        : []
      const existingSet = new Set(existingDomains.map((entry) => entry.domain))

      payload.discovered = discoveredRaw
        .filter((entry: DiscoveredCompany) => !entry.domain || !existingSet.has(entry.domain))
        .slice(0, 40)
      payload.cursor = 0

      await saveTaskPayload(taskId, payload)
      await db.researchSession.update({
        where: { id: payload.sessionId },
        data: { totalFound: payload.discovered.length },
      })
    }

    for (let index = payload.cursor; index < payload.discovered.length; index += 1) {
      await processResearchCompany(payload, payload.discovered[index])
      payload.cursor = index + 1
      await saveTaskPayload(taskId, payload)
    }

    const updatedSession = await db.researchSession.findUnique({
      where: { id: payload.sessionId },
      select: {
        totalAnalyzed: true,
        totalSkipped: true,
      },
    })

    await db.researchSession.update({
      where: { id: payload.sessionId },
      data: {
        status: "completed",
        completedAt: new Date(),
        totalAnalyzed: updatedSession?.totalAnalyzed ?? 0,
        totalSkipped: updatedSession?.totalSkipped ?? 0,
      },
    })

    await db.task.update({
      where: { id: taskId },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Research task failed."
    const task = await db.task.findUnique({ where: { id: taskId } })
    const payload = parsePayload(task?.payloadJson ?? null)

    if (payload?.sessionId) {
      await db.researchSession.update({
        where: { id: payload.sessionId },
        data: {
          status: "failed",
          error: message,
        },
      })
    }

    if (task) {
      await db.task.update({
        where: { id: taskId },
        data: {
          status: "failed",
          completedAt: new Date(),
        },
      })
    }
  } finally {
    researchTaskRegistry.delete(taskId)
  }
}

export function queueResearchTask(taskId: string) {
  setTimeout(() => {
    void runResearchTask(taskId)
  }, 0)
}

export async function createResearchSessionJob(input: {
  userId: string
  region: string
  niche: string
}) {
  const researchSession = await db.researchSession.create({
    data: {
      userId: input.userId,
      region: input.region,
      niche: input.niche,
      status: "pending",
    },
  })

  const task = await db.task.create({
    data: {
      type: "research_session",
      entityId: researchSession.id,
      status: "queued",
      payloadJson: JSON.stringify({
        sessionId: researchSession.id,
        userId: input.userId,
        region: input.region,
        niche: input.niche,
        cursor: 0,
      } satisfies ResearchTaskPayload),
      scheduledFor: new Date(),
    },
  })

  queueResearchTask(task.id)

  return researchSession
}

export async function resumeResearchTasks(sessionIds: string[]) {
  if (sessionIds.length === 0) return

  const tasks = await db.task.findMany({
    where: {
      type: "research_session",
      entityId: { in: sessionIds },
      status: { in: ["queued", "running", "failed"] },
    },
    orderBy: { createdAt: "desc" },
  })

  const seenSessions = new Set<string>()
  for (const task of tasks) {
    if (!task.entityId || seenSessions.has(task.entityId)) continue
    seenSessions.add(task.entityId)

    if (task.status === "failed") {
      await db.task.update({
        where: { id: task.id },
        data: {
          status: "queued",
          completedAt: null,
        },
      })
    }

    queueResearchTask(task.id)
  }
}
