import OpenAI from "openai"
import { db } from "@/lib/db"

let openaiClient: OpenAI | null = null

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set.")
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  return openaiClient
}

export async function generateReplyDraftForThread(threadId: string) {
  const thread = await db.outreachThread.findUnique({
    where: { id: threadId },
    include: {
      lead: {
        include: {
          company: true,
          owner: true,
          analyses: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      contact: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!thread) {
    throw new Error("Outreach thread not found.")
  }

  const latestInbound = [...thread.messages].reverse().find((message) => message.direction === "inbound")
  if (!latestInbound) {
    throw new Error("No inbound message found for reply drafting.")
  }

  if (!process.env.OPENAI_API_KEY) {
    return null
  }

  const client = getOpenAIClient()
  const analysis = thread.lead.analyses[0]
  const priorMessages = thread.messages
    .slice(-8)
    .map((message) => {
      const direction = message.direction === "inbound" ? "Prospect" : "Brancr"
      return `${direction}: ${message.subject ? `Subject: ${message.subject}\n` : ""}${message.body}`
    })
    .join("\n\n---\n\n")

  const prompt = [
    `Write a professional email reply draft for Brancr Labs.`,
    `Company: ${thread.lead.company.name}`,
    thread.lead.company.niche ? `Industry: ${thread.lead.company.niche}` : "",
    thread.contact?.name ? `Contact: ${thread.contact.name}` : "",
    thread.contact?.roleTitle ? `Contact role: ${thread.contact.roleTitle}` : "",
    analysis?.companySummary ? `Company summary: ${analysis.companySummary}` : "",
    analysis?.outreachAngle ? `Original outreach angle: ${analysis.outreachAngle}` : "",
    `Latest inbound subject: ${latestInbound.subject || "(no subject)"}`,
    `Latest inbound body:\n${latestInbound.body}`,
    `Recent conversation:\n${priorMessages}`,
    `Sender name: ${thread.lead.owner?.name || "Brancr Labs"}`,
    ``,
    `Rules:`,
    `- Keep it concise, professional, and commercially aware.`,
    `- Directly answer the prospect's latest message.`,
    `- If they asked a question, answer it clearly.`,
    `- If they expressed interest, suggest a practical next step.`,
    `- Do not invent pricing, case studies, or capabilities not already known.`,
    `- Return JSON with keys: subject, body.`,
  ]
    .filter(Boolean)
    .join("\n")

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.4,
  })

  const raw = response.choices[0]?.message?.content ?? "{}"
  const parsed = JSON.parse(raw) as { subject?: string; body?: string }
  if (!parsed.body) {
    throw new Error("Reply draft generation returned an empty body.")
  }

  await db.outreachMessage.deleteMany({
    where: {
      threadId,
      direction: "outbound",
      messageType: "reply_draft",
      sentAt: null,
    },
  })

  return db.outreachMessage.create({
    data: {
      threadId,
      direction: "outbound",
      messageType: "reply_draft",
      subject: parsed.subject || `Re: ${latestInbound.subject || thread.lead.company.name}`,
      body: parsed.body,
      generatedByAi: true,
      reviewedByUser: false,
      stepNumber: 0,
      delayDays: 0,
      inReplyTo: latestInbound.providerMessageId || latestInbound.inReplyTo || null,
      toEmail: latestInbound.fromEmail || thread.contact?.email || null,
      replyToEmail: latestInbound.toEmail || null,
    },
  })
}
