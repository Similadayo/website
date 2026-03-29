"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { discoverCompanies } from "@/lib/search"
import { isValidTransition } from "@/lib/stages"
import { extractContacts } from "@/lib/contacts/extractor"
import { generateOutreachSequence } from "@/app/admin/outreach/actions"
import { normalizeDomain } from "@/lib/validators"
import { runAIFitAnalysis } from "@/lib/ai/analyzer"
import { logActivity, logStageChange } from "@/lib/activity-log"

// ── Start research session ────────────────────────────────────────────────────

export async function startResearchSession(
  region: string,
  niche: string
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const role = (session.user as any).role
  const userId = session.user.id

  // 0. Territory Validation for Researchers
  if (role !== "super_admin") {
    const assignment = await db.assignment.findFirst({
      where: { userId, status: "active" }
    })
    
    if (!assignment || (!assignment.region && !assignment.niche)) {
      redirect("/admin/research?error=no_assignment")
    }

    // Unified check: assignment.niche is our "Operational Territory"
    const assignedTarget = (assignment.niche || assignment.region || "").toLowerCase()
    
    // Check if the requested niche or region contains the assigned target
    const searchTarget = (niche + " " + region).toLowerCase()
    
    if (!searchTarget.includes(assignedTarget)) {
      redirect("/admin/research?error=outside_territory")
    }
  }

  if (!process.env.SERPER_API_KEY && !process.env.OPENAI_API_KEY) {
    redirect("/admin/research?error=no_search_key")
  }

  const researchSession = await db.researchSession.create({
    data: {
      userId: session.user.id,
      region,
      niche,
      status: "running",
    },
  })

  try {
    // 1. Google Search via Serper
    const discoveredRaw = await discoverCompanies(niche, region, 60)
    
    // 1b. Filter out existing domains to "search for only new data"
    const existingDomains = await db.company.findMany({
      where: { domain: { in: discoveredRaw.map((d: any) => d.domain).filter(Boolean) as string[] } },
      select: { domain: true }
    })
    const existingSet = new Set(existingDomains.map((e: any) => e.domain))
    const discovered = discoveredRaw.filter((d: any) => !existingSet.has(d.domain)).slice(0, 40)

    await db.researchSession.update({
      where: { id: researchSession.id },
      data:  { totalFound: discovered.length },
    })

    let analyzed = 0
    let skipped  = 0

    for (const company of discovered) {
      const domain = company.domain || normalizeDomain(company.url)
      
      // 3. Global Deduplication Check
      const existing = await db.company.findFirst({
        where: { domain }
      })

      if (existing) {
        await db.researchResult.create({
          data: {
            sessionId: researchSession.id,
            companyId: existing.id,
            name:      company.name,
            domain:    domain ?? null,
            status:    "duplicate",
            note:      `Owned by ${existing.createdById === userId ? 'you' : 'another operative'}`,
          },
        })
        skipped++
        continue
      }

      // 4. Create company record
      let newCompany: Awaited<ReturnType<typeof db.company.create>>
      try {
        newCompany = await db.company.create({
          data: {
            name:        company.name,
            websiteUrl:  company.url,
            domain,
            niche:       company.category || niche,
            location:    company.address || region,
            summary:     company.description || null,
            createdById: userId,
          },
        })
      } catch {
        await db.researchResult.create({
          data: {
            sessionId: researchSession.id,
            name:      company.name,
            domain:    domain ?? null,
            status:    "failed",
            note:      "Failed to save company",
          },
        })
        skipped++
        continue
      }

      // 4. Create lead
      const lead = await db.lead.create({
        data: {
          companyId: newCompany.id,
          stage:     "researching",
          ownerId:   session.user.id,
        },
      })

      await logActivity({
        entity:   "lead",
        entityId: lead.id,
        actorId:  session.user.id,
        action:   "RESEARCH_SESSION_CREATED",
        metadata: { sessionId: researchSession.id, source: "auto" },
      })

      // 4b. Save phone from Google Places as contact
      if (company.phone) {
        try {
          await db.contact.create({
            data: {
              companyId:   newCompany.id,
              name:        `Phone: ${company.phone}`,
              contactType: "places",
              sourceUrl:   newCompany.websiteUrl ?? undefined,
            },
          })
        } catch { /* non-fatal */ }
      }

      // 5. Fetch website — keep raw HTML for contact extraction
      let rawHtml    = ""
      let websiteText = ""
      if (newCompany.websiteUrl) {
        try {
          const res = await fetch(newCompany.websiteUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; BrancrBot/1.0)" },
            signal:  AbortSignal.timeout(10_000),
          })
          if (res.ok) {
            rawHtml = await res.text()
            websiteText = rawHtml
              .replace(/<script[\s\S]*?<\/script>/gi, "")
              .replace(/<style[\s\S]*?<\/style>/gi, "")
              .replace(/<[^>]*>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 12_000)
          }
        } catch { /* non-fatal */ }
      }

      // 6. Extract contacts from website HTML
      if (rawHtml && newCompany.websiteUrl) {
        try {
          const contacts = extractContacts(rawHtml, newCompany.websiteUrl)

          if (contacts.linkedinUrl && !newCompany.linkedinUrl) {
            await db.company.update({
              where: { id: newCompany.id },
              data:  { linkedinUrl: contacts.linkedinUrl },
            })
          }

          for (const email of contacts.emails.slice(0, 3)) {
            await db.contact.create({
              data: {
                companyId:   newCompany.id,
                email,
                contactType: "extracted",
                sourceUrl:   newCompany.websiteUrl,
              },
            })
          }

          for (const phone of contacts.phones.slice(0, 2)) {
            await db.contact.create({
              data: {
                companyId:   newCompany.id,
                name:        `Phone: ${phone}`,
                contactType: "extracted",
                sourceUrl:   newCompany.websiteUrl,
              },
            })
          }
        } catch { /* contact extraction non-fatal */ }
      }

      // 7. AI qualification with rich Places context
      const contextText = [
        `Company: ${newCompany.name}`,
        company.category ? `Google Business Category: ${company.category}` : "",
        company.address  ? `Address: ${company.address}` : (region ? `Region: ${region}` : ""),
        company.rating   ? `Google Rating: ${company.rating}/5 (${company.reviewCount ?? 0} reviews)` : "",
        company.phone    ? `Phone: ${company.phone}` : "",
        niche ? `Research Niche: ${niche}` : "",
        company.description ? `Description: ${company.description}` : "",
        websiteText ? `Website content:\n${websiteText}` : "No website content available.",
      ].filter(Boolean).join("\n\n")

      try {
        if (process.env.OPENAI_API_KEY) {
          await runAIFitAnalysis(lead.id, contextText)

          if (isValidTransition("researching", "analyzed")) {
            await db.lead.update({ where: { id: lead.id }, data: { stage: "analyzed" } })
            await logStageChange({
              leadId:  lead.id,
              actorId: session.user.id,
              from:    "researching",
              to:      "analyzed",
              reason:  "AI analysis completed via research session",
            })

            // 8. Auto-draft email if analyzed
            try {
              await generateOutreachSequence(lead.id)
            } catch { /* ignore draft failures */ }
          }
        }
      } catch { /* AI failed — lead stays at "researching" */ }

      analyzed++

      await db.researchResult.create({
        data: {
          sessionId: researchSession.id,
          companyId: newCompany.id,
          leadId:    lead.id,
          name:      newCompany.name,
          domain:    domain ?? null,
          status:    "created",
        },
      })

      await db.researchSession.update({
        where: { id: researchSession.id },
        data:  { totalAnalyzed: analyzed },
      })
    }

    // Done
    await db.researchSession.update({
      where: { id: researchSession.id },
      data:  {
        status:      "completed",
        completedAt: new Date(),
        totalSkipped: skipped,
        totalAnalyzed: analyzed,
      },
    })
  } catch (err: any) {
    await db.researchSession.update({
      where: { id: researchSession.id },
      data:  { status: "failed", error: err.message },
    })
  }

  revalidatePath("/admin/research")
  revalidatePath("/admin/leads")
  redirect(`/admin/research/${researchSession.id}`)
}

export async function deleteResearchSession(sessionId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const role = (session.user as any).role
  if (role !== "super_admin") {
    redirect("/admin/research")
  }

  await db.researchSession.delete({
    where: { id: sessionId },
  })

  revalidatePath("/admin/research")
}
