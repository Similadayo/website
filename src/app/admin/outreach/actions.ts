"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isValidTransition } from "@/lib/stages"
import { logStageChange } from "@/lib/activity-log"

// ── Generate outreach draft ──────────────────────────────────────────────────

// ── Generate outreach sequence (3 steps) ──────────────────────────────────────────

export async function generateOutreachSequence(leadId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        company: { include: { contacts: { take: 5 } } },
        analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    })

    if (!lead) return { success: false, error: "Lead not found" }
    
    if (!["analyzed", "approved", "outreach_ready"].includes(lead.stage)) {
      return { success: false, error: "Lead must be analyzed or approved before generating outreach" }
    }

    if (!process.env.OPENAI_API_KEY) {
      return { success: false, error: "OPENAI_API_KEY is not set" }
    }

    const analysis = lead.analyses[0]
    const contact  = lead.company.contacts.find(c => c.email) || lead.company.contacts[0]
    const company  = lead.company

    const prompt = [
      `Write a 3-step strategic cold outreach sequence for this company.`,
      `Company: ${company.name}`,
      company.niche    ? `Industry: ${company.niche}` : "",
      analysis?.companySummary ? `What they do: ${analysis.companySummary}` : "",
      analysis?.outreachAngle  ? `Initial outreach angle: ${analysis.outreachAngle}` : "",
      analysis?.painPoints ? `Pain points: ${(JSON.parse(analysis.painPoints as string) as string[]).join(", ")}` : "",
      contact?.roleTitle ? `Contact role: ${contact.roleTitle}` : "",
      ``,
      `Sequence Structure:`,
      `Step 1: Mission Launch - Intro + specific pain point + value prop. (0 delay)`,
      `Step 2: Escalation - Deeper value or small case-study/social proof. (3 day delay)`,
      `Step 3: Signal Intercept - Quick low-friction check-in/breakup. (7 day delay)`,
      ``,
      `Rules:`,
      `- Keep emails short (3-4 sentences)`,
      `- Direct, professional, no fluff`,
      `- The sign-off MUST be: "Best regards,\n\n${session.user.name}\nBrancr Labs"`,
      `- Return a JSON object with a "sequence" key holding an array of 3 objects: { subject, body, delayDays, stepNumber }`,
    ].join("\n")

    const { default: OpenAI } = await import("openai")
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    })

    const raw = res.choices[0]?.message?.content ?? "{}"
    const parsed = JSON.parse(raw)
    const steps = parsed.sequence || []

    let thread = await db.outreachThread.findFirst({
      where: { leadId, status: { in: ["drafted", "ready"] } },
    })

    if (!thread) {
      thread = await db.outreachThread.create({
        data: {
          leadId,
          contactId: contact?.id ?? null,
          channel:   "email",
          status:    "drafted",
        },
      })
    }

    // Clear existing drafted/unreviewed messages to start fresh
    await db.outreachMessage.deleteMany({
      where: { threadId: thread.id, sentAt: null }
    })

    for (const step of steps) {
      await db.outreachMessage.create({
        data: {
          threadId:       thread.id,
          subject:        step.subject,
          body:           step.body,
          stepNumber:     step.stepNumber || 1,
          delayDays:      step.delayDays || 0,
          generatedByAi:  true,
        },
      })
    }

    if (lead.stage === "approved" && isValidTransition("approved", "outreach_ready")) {
      await db.lead.update({ where: { id: leadId }, data: { stage: "outreach_ready" } })
    }

    revalidatePath("/admin/outreach")
    revalidatePath(`/admin/leads/${leadId}`)
    
    return { success: true }
  } catch (err: any) {
    console.error("Sequence generation error:", err)
    return { success: false, error: err.message }
  }
}

export async function updateOutreachMessage(
  messageId: string,
  data: { body: string; subject: string }
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  await db.outreachMessage.update({
    where: { id: messageId },
    data: {
      body:    data.body,
      subject: data.subject,
      reviewedByUser: true,
    },
  })

  revalidatePath("/admin/outreach")
}

// ── Mark outreach as sent ────────────────────────────────────────────────────

export async function markOutreachSent(leadId: string, messageId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  await db.outreachMessage.update({
    where: { id: messageId },
    data:  { sentAt: new Date(), reviewedByUser: true },
  })

  await db.outreachThread.updateMany({
    where: { leadId },
    data:  { status: "sent", lastSentAt: new Date() },
  })

  const lead = await db.lead.findUnique({ where: { id: leadId } })
  if (lead && isValidTransition(lead.stage, "contacted")) {
    await db.lead.update({ where: { id: leadId }, data: { stage: "contacted" } })
    await logStageChange({
      leadId, actorId: session.user.id,
      from: lead.stage, to: "contacted", reason: "Outreach marked as sent",
    })
  }

  revalidatePath("/admin/outreach")
  revalidatePath(`/admin/leads/${leadId}`)
}
