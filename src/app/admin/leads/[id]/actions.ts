"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isValidTransition } from "@/lib/stages"
import { logStageChange, logActivity } from "@/lib/activity-log"
import { runAIFitAnalysis } from "@/lib/ai/analyzer"
import { sendEmail } from "@/lib/email/resend"
import { generateOutreachSequence as generateDraftFn } from "@/app/admin/outreach/actions"
import { getScopedLeadWhere } from "@/lib/auth/scope"
import {
  getLeadContactStrategy,
  getContactTier,
  getOutreachRecommendation,
  requiresManualContactReview,
} from "@/lib/contacts/priority"
import { crawlCompanyWebsite, buildWebsiteCorpus } from "@/lib/contacts/crawler"

// ─── Stage Update ───────────────────────────────────────────────────────────

export async function updateLeadStage(
  leadId: string,
  newStage: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const lead = await db.lead.findFirst({ where: await getScopedLeadWhere(leadId) })
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

  const lead = await db.lead.findFirst({
    where: await getScopedLeadWhere(leadId),
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

  if (websiteUrl) {
    try {
      const crawlResult = await crawlCompanyWebsite(websiteUrl)
      websiteText = buildWebsiteCorpus(crawlResult)
    } catch (err: any) {
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

export async function reAnalyzeAndRegenerateOutreach(
  leadId: string
): Promise<{ success: boolean; error?: string }> {
  const analysisResult = await runLeadAIAnalysis(leadId)
  if (!analysisResult.success) {
    return analysisResult
  }

  return generateNewOutreachDraft(leadId)
}

// ─── Email Sending ───────────────────────────────────────────────────────────

export async function sendLeadEmail(
  leadId: string,
  to: string,
  subject: string,
  body: string,
  messageId?: string, // if it was already drafted
  overrideContactReview = false
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const leadForDispatch = await db.lead.findFirst({
    where: await getScopedLeadWhere(leadId),
    include: {
      company: {
        include: {
          contacts: true,
        },
      },
    },
  })

  if (!leadForDispatch) return { success: false, error: "Lead not found" }

  const contactStrategy = getLeadContactStrategy(leadForDispatch.company.contacts as any[])
  if (requiresManualContactReview(contactStrategy.recommendation) && !overrideContactReview) {
    return {
      success: false,
      error: "This lead still needs manual contact review before dispatch. Use a verified operator or enable a test-send override.",
    }
  }

  const currentUser = await (db.user as any).findUnique({
    where: { id: session.user.id },
    select: { senderEmail: true, resendApiKey: true }
  })

  let thread = await db.outreachThread.findFirst({
    where: { leadId },
    orderBy: { id: "desc" },
  })

  if (!thread) {
    thread = await db.outreachThread.create({
      data: {
        leadId,
        contactId: contactStrategy.primarySendContact?.id ?? contactStrategy.bestContact?.id ?? null,
        channel: "email",
        status: "drafted",
      },
    })
  }

  const res = await sendEmail(
    to, 
    subject, 
    body, 
    {
      fromOverride: currentUser?.senderEmail || undefined,
      apiKey: currentUser?.resendApiKey || undefined,
      threadId: thread.id,
    }
  )
  if (!res.success) {
    return { success: false, error: res.error || "Failed to send email" }
  }

  // Update lead stage
  const lead = leadForDispatch
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
      data: {
        sentAt: new Date(),
        reviewedByUser: true,
        providerMessageId: res.id ?? undefined,
        toEmail: to,
        fromEmail: currentUser?.senderEmail || process.env.OUTREACH_FROM_EMAIL || undefined,
        replyToEmail: res.replyTo ?? undefined,
        direction: "outbound",
      },
    })
  } else {
    // Spontaneous email: create thread and message
    await db.outreachMessage.create({
      data: {
        threadId: thread.id,
        subject,
        body,
        sentAt: new Date(),
        reviewedByUser: true,
        direction: "outbound",
        messageType: "reply_draft",
        providerMessageId: res.id ?? undefined,
        toEmail: to,
        fromEmail: currentUser?.senderEmail || process.env.OUTREACH_FROM_EMAIL || undefined,
        replyToEmail: res.replyTo ?? undefined,
      },
    })
  }

  await db.outreachThread.update({
    where: { id: thread.id },
    data: {
      status: "sent",
      lastSentAt: new Date(),
      unreadCount: 0,
      contactId: thread.contactId ?? contactStrategy.primarySendContact?.id ?? contactStrategy.bestContact?.id ?? null,
    },
  })

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

export async function setPrimaryContact(
  leadId: string,
  contactId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const lead = await db.lead.findFirst({
    where: await getScopedLeadWhere(leadId),
    include: { company: { include: { contacts: true } } },
  })

  if (!lead) return { success: false, error: "Lead not found" }

  const target = lead.company.contacts.find((contact) => contact.id === contactId)
  if (!target) return { success: false, error: "Contact not found" }

  await db.contact.updateMany({
    where: { companyId: lead.companyId },
    data: { isPrimaryDecisionMaker: false },
  })

  await db.contact.update({
    where: { id: contactId },
    data: {
      isPrimaryDecisionMaker: true,
      verified: target.emailStatus === "public" || target.verified,
      contactTier: getContactTier({ ...target, isPrimaryDecisionMaker: true }),
      outreachRecommendation: getOutreachRecommendation({ ...target, isPrimaryDecisionMaker: true }),
    },
  })

  await logActivity({
    entity: "lead",
    entityId: leadId,
    actorId: session.user.id,
    action: "PRIMARY_CONTACT_SET",
    metadata: {
      contactId,
      contactName: target.name || target.email || "Unnamed contact",
      roleTitle: target.roleTitle || null,
      summary: `Primary contact set to ${target.name || target.email || "Unnamed contact"}${target.roleTitle ? ` (${target.roleTitle})` : ""}`,
    },
  })

  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath("/admin/leads")
  revalidatePath("/admin/outreach")
  return { success: true }
}

export async function approveGenericInboxContact(
  leadId: string,
  contactId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const lead = await db.lead.findFirst({
    where: await getScopedLeadWhere(leadId),
    include: { company: { include: { contacts: true } } },
  })

  if (!lead) return { success: false, error: "Lead not found" }

  const target = lead.company.contacts.find((contact) => contact.id === contactId)
  if (!target) return { success: false, error: "Contact not found" }

  await db.contact.update({
    where: { id: contactId },
    data: {
      verified: true,
      isGenericInbox: true,
      emailStatus: target.emailStatus || "public",
      emailEvidenceLevel: target.emailEvidenceLevel || "public_exact",
      contactTier: "tier_3",
      outreachRecommendation: "generic_inbox_fallback",
    },
  })

  await logActivity({
    entity: "lead",
    entityId: leadId,
    actorId: session.user.id,
    action: "GENERIC_INBOX_APPROVED",
    metadata: {
      contactId,
      contactName: target.name || target.email || "Fallback inbox",
      roleTitle: target.roleTitle || null,
      summary: `Fallback inbox approved: ${target.email || target.name || "Public company route"}`,
    },
  })

  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath("/admin/leads")
  revalidatePath("/admin/outreach")
  return { success: true }
}

export async function approveExecutiveEmailContact(
  leadId: string,
  contactId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const lead = await db.lead.findFirst({
    where: await getScopedLeadWhere(leadId),
    include: { company: { include: { contacts: true } } },
  })

  if (!lead) return { success: false, error: "Lead not found" }

  const target = lead.company.contacts.find((contact) => contact.id === contactId)
  if (!target) return { success: false, error: "Contact not found" }
  if (!target.email || target.emailStatus !== "inferred") {
    return { success: false, error: "Only inferred executive emails can be approved here." }
  }

  await db.contact.update({
    where: { id: contactId },
    data: {
      verified: true,
      isGenericInbox: false,
      isPrimaryDecisionMaker: true,
      contactTier: getContactTier({ ...target, verified: true, isPrimaryDecisionMaker: true, isGenericInbox: false }),
      outreachRecommendation: getOutreachRecommendation({ ...target, verified: true, isPrimaryDecisionMaker: true, isGenericInbox: false }),
    },
  })

  await logActivity({
    entity: "lead",
    entityId: leadId,
    actorId: session.user.id,
    action: "INFERRED_EXECUTIVE_EMAIL_APPROVED",
    metadata: {
      contactId,
      contactName: target.name || target.email || "Executive contact",
      roleTitle: target.roleTitle || null,
      summary: `Inferred executive email approved: ${target.email}`,
    },
  })

  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath("/admin/leads")
  revalidatePath("/admin/outreach")
  return { success: true }
}

export async function markContactForManualReview(
  leadId: string,
  contactId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const lead = await db.lead.findFirst({
    where: await getScopedLeadWhere(leadId),
    include: { company: { include: { contacts: true } } },
  })

  if (!lead) return { success: false, error: "Lead not found" }

  const target = lead.company.contacts.find((contact) => contact.id === contactId)
  if (!target) return { success: false, error: "Contact not found" }

  await db.contact.update({
    where: { id: contactId },
    data: {
      verified: false,
      contactTier: target.email ? "tier_3" : "tier_4",
      outreachRecommendation: "manual_review",
      isPrimaryDecisionMaker: false,
    },
  })

  await logActivity({
    entity: "lead",
    entityId: leadId,
    actorId: session.user.id,
    action: "CONTACT_MARKED_FOR_MANUAL_REVIEW",
    metadata: {
      contactId,
      contactName: target.name || target.email || "Unnamed contact",
      roleTitle: target.roleTitle || null,
      summary: `Contact marked for manual review: ${target.name || target.email || "Unnamed contact"}`,
    },
  })

  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath("/admin/leads")
  revalidatePath("/admin/outreach")
  return { success: true }
}

export async function transferLeadToAdminReview(
  leadId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const role = (session.user as any).role as string
  if (role === "super_admin") {
    return { success: false, error: "Super admin already controls this lead." }
  }

  const lead = await db.lead.findFirst({
    where: await getScopedLeadWhere(leadId),
    include: { company: { include: { contacts: true } } },
  })

  if (!lead) return { success: false, error: "Lead not found" }

  const strategy = getLeadContactStrategy(lead.company.contacts as any[])
  const bestContact = strategy.bestContact

  if (!bestContact?.linkedinUrl) {
    return { success: false, error: "No LinkedIn-primary contact found for transfer." }
  }

  const adminUser = await db.user.findFirst({
    where: { role: "super_admin", active: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true },
  })

  if (!adminUser) {
    return { success: false, error: "No active super admin found." }
  }

  await db.lead.update({
    where: { id: leadId },
    data: {
      ownerId: adminUser.id,
      stage: lead.stage === "analyzed" && isValidTransition("analyzed", "pending_review")
        ? "pending_review"
        : lead.stage,
    },
  })

  await logActivity({
    entity: "lead",
    entityId: leadId,
    actorId: session.user.id,
    action: "TRANSFERRED_TO_ADMIN_REVIEW",
    metadata: {
      fromUserId: session.user.id,
      toUserId: adminUser.id,
      contactId: bestContact.id ?? null,
      linkedinUrl: bestContact.linkedinUrl,
      summary: `Lead transferred to admin review for LinkedIn-led follow-up by ${adminUser.name || adminUser.email || "super admin"}.`,
    },
  })

  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath("/admin/leads")
  revalidatePath("/admin/outreach")
  revalidatePath("/admin")

  redirect("/admin/leads")
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

  const lead = await db.lead.findFirst({
    where: await getScopedLeadWhere(leadId),
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
