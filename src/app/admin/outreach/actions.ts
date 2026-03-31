"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isValidTransition } from "@/lib/stages"
import { logStageChange } from "@/lib/activity-log"
import { getScopedLeadWhere } from "@/lib/auth/scope"
import { formatOutreachRecommendation, getLeadContactStrategy } from "@/lib/contacts/priority"

// ── Generate outreach draft ──────────────────────────────────────────────────

// ── Generate outreach sequence (3 steps) ──────────────────────────────────────────

export async function generateOutreachSequence(leadId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const lead = await db.lead.findFirst({
      where: await getScopedLeadWhere(leadId),
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
    const contactStrategy = getLeadContactStrategy(lead.company.contacts as any[])
    const contact = contactStrategy.primarySendContact
    const bestContact = contactStrategy.bestContact
    const fallbackContact = contactStrategy.fallbackContact
    const outreachRecommendation = formatOutreachRecommendation(contactStrategy.recommendation)
    const company  = lead.company
    const analysisJson = analysis?.rawResponse
      ? JSON.parse(analysis.rawResponse as string) as {
          recommended_owners?: string[]
          operator_contacts?: Array<{
            role: string
            name: string | null
            email: string | null
            linkedin_url: string | null
            evidence: string
          }>
        }
      : null
    const recommendedOwners = analysisJson?.recommended_owners ?? []
    const operatorContacts = analysisJson?.operator_contacts ?? []

    const prompt = [
      `Write a 3-step strategic cold outreach sequence for this company.`,
      `Company: ${company.name}`,
      company.niche    ? `Industry: ${company.niche}` : "",
      analysis?.companySummary ? `What they do: ${analysis.companySummary}` : "",
      analysis?.outreachAngle  ? `Initial outreach angle: ${analysis.outreachAngle}` : "",
      analysis?.painPoints ? `Pain points: ${(JSON.parse(analysis.painPoints as string) as string[]).join(", ")}` : "",
      recommendedOwners.length ? `Likely internal owners: ${recommendedOwners.join("; ")}` : "",
      operatorContacts.length ? `Operator contacts found: ${operatorContacts.map((contact) => `${contact.role}${contact.name ? ` - ${contact.name}` : ""}${contact.email ? ` - ${contact.email}` : ""}${contact.linkedin_url ? ` - ${contact.linkedin_url}` : ""}`).join("; ")}` : "",
      bestContact?.name ? `Best contact: ${bestContact.name}` : "",
      bestContact?.roleTitle ? `Best contact role: ${bestContact.roleTitle}` : "",
      bestContact?.email ? `Best contact email: ${bestContact.email}` : "",
      fallbackContact?.email ? `Fallback contact: ${fallbackContact.email}` : "",
      `Contact coverage: ${contactStrategy.coverageStatus}`,
      `Contact strategy: ${outreachRecommendation}`,
      `Contact rationale: ${contactStrategy.reason}`,
      ``,
      `About Brancr Labs:`,
      `- Brancr Labs builds practical, human-in-the-loop AI workflow prototypes for small operational teams.`,
      `- Brancr Labs audits the current workflow, identifies a narrow high-friction process, and prototypes a practical AI-assisted system the team can test quickly.`,
      `- It is most credible when it shows it understands the prospect's workflow, bottlenecks, and who inside the company owns the process.`,
      `- Do not invent fake case studies, fake client results, or unsupported social proof.`,
      ``,
      `Sequence Structure:`,
      `Step 1: Mission Launch - Intro + specific pain point + value prop. (0 delay)`,
      `Step 2: Escalation - Deeper operational insight or a concrete example of the workflow Brancr could improve. (3 day delay)`,
      `Step 3: Signal Intercept - Quick low-friction check-in/breakup. (7 day delay)`,
      ``,
      `Rules:`,
      `- Keep each email tight: 80-140 words, 2 short paragraphs max`,
      `- Tone: convincing, professional, sharp, commercially aware`,
      `- Avoid generic AI buzzwords, hype, and filler phrases like "hope you're well", "just checking in", or "reaching out because"`,
      `- Never use placeholder tokens such as [First Name], [Company Name], or [Role]`,
      `- If a named operator is available, greet them naturally by name`,
      `- If no named operator is available, use a neutral greeting like "Hello," and write the message so it can be forwarded internally`,
      `- Make Brancr Labs sound capable by showing operational understanding, a plausible workflow diagnosis, and a clear reason Brancr is qualified to help`,
      `- If the likely owner/team is known, tailor the message to that role's responsibilities`,
      `- Use concrete language about operational workflows, handoffs, repetitive tasks, response time, quality control, or client delivery where relevant`,
      `- The CTA should be low-friction and specific: offer a short conversation or a quick workflow review`,
      `- Do not claim prior client wins unless they are explicitly provided in the prompt`,
      `- Step 1 should feel like an informed first contact, not a template`,
      `- Step 2 should deepen credibility with a stronger operational point of view, not weak follow-up language`,
      `- Step 3 should stay professional and concise, not passive-aggressive or needy`,
      `- Contact-path rule: "${outreachRecommendation}"`,
      `- If the contact path is personalized email, write directly to the named operator and make the message role-aware`,
      `- If the contact path is personalized email review, write to the named operator but avoid unsupported claims because the email was inferred from company evidence and still needs review`,
      `- If the contact path is generic inbox fallback, do not pretend you know the recipient. Ask briefly to be pointed to the person who owns the relevant workflow`,
      `- If the contact path is linkedin or manual review, keep the copy adaptable and do not over-personalize unsupported details`,
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
          contactId: contact?.id ?? bestContact?.id ?? null,
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

  const lead = await db.lead.findFirst({ where: await getScopedLeadWhere(leadId) })
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
