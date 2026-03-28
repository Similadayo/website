"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isValidTransition } from "@/lib/stages"
import { logStageChange } from "@/lib/activity-log"

// ── Generate outreach draft ──────────────────────────────────────────────────

export async function generateOutreachDraft(leadId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: {
      company: { include: { contacts: { take: 1 } } },
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })

  if (!lead) throw new Error("Lead not found")
  if (!["analyzed", "approved", "outreach_ready"].includes(lead.stage)) {
    throw new Error("Lead must be analyzed or approved before generating outreach")
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set")
  }

  const analysis = lead.analyses[0]
  const contact  = lead.company.contacts[0]
  const company  = lead.company

  const prompt = [
    `Write a short, personalised cold outreach email for this company.`,
    `Company: ${company.name}`,
    company.niche    ? `Industry: ${company.niche}` : "",
    company.location ? `Location: ${company.location}` : "",
    analysis?.companySummary ? `What they do: ${analysis.companySummary}` : "",
    analysis?.outreachAngle  ? `Recommended angle: ${analysis.outreachAngle}` : "",
    analysis?.painPoints
      ? `Pain points: ${(JSON.parse(analysis.painPoints as string) as string[]).join(", ")}`
      : "",
    contact?.roleTitle ? `Contact role: ${contact.roleTitle}` : "",
    ``,
    `Rules:`,
    `- 3-4 sentences max`,
    `- Direct, professional, no fluff`,
    `- Focus on one specific pain point`,
    `- End with a clear low-friction CTA`,
    `- Do NOT use generic phrases like "I hope this finds you well"`,
    `- The sign-off MUST be exactly: "Best regards,\n\n${session.user.name}\nBrancr Labs"`,
    `- Ensure there are exactly two newlines before the sign-off`,
    `- Do NOT use the placeholder [Your Name] under any circumstances`,
    ``,
    `Return JSON: { "subject": "...", "body": "..." }`,
  ].filter(Boolean).join("\n")

  const { default: OpenAI } = await import("openai")
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 400,
  })

  const raw = res.choices[0]?.message?.content ?? "{}"
  const { subject, body } = JSON.parse(raw) as { subject?: string; body?: string }

  // Clean up any [Your Name] the AI might have still included (redundancy)
  const cleanBody = body?.replace(/\[Your Name\]/gi, session.user.name || "Brancr Team")

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

  await db.outreachMessage.create({
    data: {
      threadId:       thread.id,
      subject:        subject ?? `Reaching out — ${company.name}`,
      body:           cleanBody ?? "",
      generatedByAi:  true,
      reviewedByUser: false,
    },
  })

  if (lead.stage === "approved" && isValidTransition("approved", "outreach_ready")) {
    await db.lead.update({ where: { id: leadId }, data: { stage: "outreach_ready" } })
    await logStageChange({
      leadId, actorId: session.user.id,
      from: "approved", to: "outreach_ready", reason: "Outreach draft generated",
    })
  }

  revalidatePath("/admin/outreach")
  revalidatePath(`/admin/leads/${leadId}`)
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
