"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { isValidTransition } from "@/lib/stages"
import { logStageChange, logActivity } from "@/lib/activity-log"
import { runAIFitAnalysis } from "@/lib/ai/analyzer"
import { sendEmail } from "@/lib/email/resend"
import { generateOutreachDraft as generateDraftFn } from "@/app/admin/outreach/actions"

// ─── Stage Update ───────────────────────────────────────────────────────────

export async function updateLeadStage(
  leadId: string,
  newStage: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const lead = await db.lead.findUnique({ where: { id: leadId } })
  if (!lead) return { success: false, error: "Lead not found" }

  // Enforce allowed transitions
  if (!isValidTransition(lead.stage, newStage)) {
    return {
      success: false,
      error: `Invalid transition: ${lead.stage} → ${newStage}`,
    }
  }

  await db.lead.update({
    where: { id: leadId },
    data: {
      stage:            newStage,
      rejectionReason:  newStage === "rejected" ? (reason ?? null) : undefined,
      approvedById:     newStage === "approved" ? session.user.id : undefined,
      approvedAt:       newStage === "approved" ? new Date() : undefined,
    },
  })

  await logStageChange({
    leadId,
    actorId: session.user.id,
    from:    lead.stage,
    to:      newStage,
    reason,
  })

  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath("/admin/leads")

  return { success: true }
}

// ─── AI Analysis ─────────────────────────────────────────────────────────────

export async function runLeadAIAnalysis(
  leadId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: { company: true },
  })

  if (!lead) return { success: false, error: "Lead not found" }

  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: "OPENAI_API_KEY is not configured. Add it to your .env file.",
    }
  }

  const websiteUrl = lead.company.websiteUrl
  let websiteText = ""

  // Fetch website text if URL available
  if (websiteUrl) {
    try {
      const res = await fetch(websiteUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; BrancrBot/1.0)" },
        signal: AbortSignal.timeout(10_000),
      })
      if (res.ok) {
        const html = await res.text()
        // Strip HTML tags, collapse whitespace, limit tokens (~3000 words)
        websiteText = html
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 12_000)
      }
    } catch (err: any) {
      // Non-fatal: proceed with company metadata only
      websiteText = `[Website fetch failed: ${err.message}]`
    }
  }

  const contextText = [
    `Company: ${lead.company.name}`,
    lead.company.niche    ? `Niche: ${lead.company.niche}` : "",
    lead.company.location ? `Location: ${lead.company.location}` : "",
    websiteText           ? `Website content:\n${websiteText}` : "No website available.",
  ]
    .filter(Boolean)
    .join("\n\n")

  try {
    await runAIFitAnalysis(leadId, contextText)

    // Move lead to "analyzed" if currently in a qualifying state
    const qualifyingStages = ["new", "researching"]
    if (qualifyingStages.includes(lead.stage)) {
      if (isValidTransition(lead.stage, "analyzed")) {
        await db.lead.update({ where: { id: leadId }, data: { stage: "analyzed" } })
        await logStageChange({
          leadId,
          actorId: session.user.id,
          from: lead.stage,
          to: "analyzed",
          reason: "AI analysis completed",
        })
      }
    }

    await logActivity({
      entity:   "lead",
      entityId: leadId,
      actorId:  session.user.id,
      action:   "AI_ANALYSIS_TRIGGERED",
      metadata: { websiteUrl: websiteUrl ?? null },
    })

    revalidatePath(`/admin/leads/${leadId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: `AI analysis failed: ${err.message}` }
  }
}

// ─── Outreach generation ─────────────────────────────────────────────────────

export async function generateNewOutreachDraft(leadId: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }
  
  try {
    await generateDraftFn(leadId)
    revalidatePath(`/admin/leads/${leadId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─── Email Sending ───────────────────────────────────────────────────────────

export async function sendLeadEmail(
  leadId: string,
  to: string,
  subject: string,
  body: string,
  messageId?: string // if it was already drafted
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const currentUser = await (db.user as any).findUnique({
    where: { id: session.user.id },
    select: { senderEmail: true, resendApiKey: true }
  })

  const res = await sendEmail(
    to, 
    subject, 
    body, 
    currentUser?.senderEmail || undefined, 
    currentUser?.resendApiKey || undefined
  )
  if (!res.success) {
    return { success: false, error: res.error || "Failed to send email" }
  }

  // Update lead stage
  const lead = await db.lead.findUnique({ where: { id: leadId } })
  if (lead && isValidTransition(lead.stage, "contacted")) {
    await db.lead.update({
      where: { id: leadId },
      data: { stage: "contacted" },
    })
    await logStageChange({
      leadId,
      actorId: session.user.id,
      from: lead.stage,
      to: "contacted",
      reason: "Email sent directly from dashboard",
    })
  }

  // Mark message as sent OR create new sent message record
  if (messageId) {
    await db.outreachMessage.update({
      where: { id: messageId },
      data: { sentAt: new Date(), reviewedByUser: true },
    })
  } else {
    // Spontaneous email: create thread and message
    let thread = await db.outreachThread.findFirst({
      where: { leadId, status: { in: ["drafted", "ready"] } },
    })

    if (!thread) {
      thread = await db.outreachThread.create({
        data: { leadId, channel: "email", status: "sent", lastSentAt: new Date() },
      })
    } else {
      await db.outreachThread.update({
        where: { id: thread.id },
        data: { status: "sent", lastSentAt: new Date() },
      })
    }

    await db.outreachMessage.create({
      data: {
        threadId: thread.id,
        subject,
        body,
        sentAt: new Date(),
        reviewedByUser: true,
      },
    })
  }

  await logActivity({
    entity: "lead",
    entityId: leadId,
    actorId: session.user.id,
    action: "EMAIL_SENT",
    metadata: { to, subject, provider: "resend" },
  })

  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true }
}
import { runDeepRecon } from "@/lib/ai/recon"

// ─── Deep Reconnaissance ───────────────────────────────────────────────────

export async function startDeepRecon(leadId: string): Promise<{ success: boolean; count?: number; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  try {
    const contacts = await runDeepRecon(leadId)
    await logActivity({
      entity: "lead",
      entityId: leadId,
      actorId: session.user.id,
      action: "DEEP_RECON_COMPLETED",
      metadata: { count: contacts.length }
    })
    revalidatePath(`/admin/leads/${leadId}`)
    return { success: true, count: contacts.length }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─── CRM Synchronization ───────────────────────────────────────────────────

export async function pushToCRM(leadId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const user = await (db.user as any).findUnique({
    where: { id: session.user.id },
    select: { webhookUrl: true }
  })

  if (!user?.webhookUrl) {
    return { success: false, error: "Mission Intel Missing: Configure Webhook URL in Settings first." }
  }

  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: {
      company: { include: { contacts: { take: 10 } } },
      analyses: { take: 1, orderBy: { createdAt: "desc" } }
    }
  })

  if (!lead) return { success: false, error: "Lead search failed." }

  try {
    const res = await fetch(user.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "Brancr Labs Command Center",
        missionTerritory: lead.company.niche,
        company: {
          name: lead.company.name,
          website: lead.company.websiteUrl,
          domain: lead.company.domain,
          location: lead.company.location,
        },
        lead: {
          id: lead.id,
          stage: lead.stage,
          fitScore: lead.analyses[0]?.fitScore || 0,
          summary: lead.analyses[0]?.companySummary || "",
        },
        contacts: lead.company.contacts.map(c => ({
          name: c.name,
          role: c.roleTitle,
          email: c.email,
          linkedin: c.linkedinUrl
        }))
      })
    })

    if (!res.ok) throw new Error(`External bridge failure: ${res.status} ${res.statusText}`)

    await logActivity({
      entity: "lead",
      entityId: leadId,
      actorId: session.user.id,
      action: "CRM_SYNC_COMPLETED",
      metadata: { endpoint: user.webhookUrl }
    })

    return { success: true }
  } catch (err: any) {
    return { success: false, error: `Sync failed: ${err.message}` }
  }
}
