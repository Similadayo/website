import { isValidTransition } from "@/lib/stages"
import { getReceivedEmailContent } from "@/lib/email/resend"
import { db } from "@/lib/db"
import { generateReplyDraftForThread } from "@/lib/email/reply-drafts"
import { logActivity, logStageChange } from "@/lib/activity-log"
import { revalidatePath } from "next/cache"
import { Webhook } from "svix"

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function extractEmailAddress(value?: string | null) {
  if (!value) return null
  const match = value.match(/<([^>]+)>/)
  return (match?.[1] || value).trim().toLowerCase()
}

function parseReplyThreadId(addresses: string[]) {
  for (const address of addresses) {
    const email = extractEmailAddress(address)
    if (!email) continue

    const localPart = email.split("@")[0] ?? ""
    const match = localPart.match(/\+([a-z0-9]+)$/i)
    if (match?.[1]) return match[1]
  }

  return null
}

function normalizeHeaders(input: unknown) {
  if (!input) return {} as Record<string, string>

  if (Array.isArray(input)) {
    return Object.fromEntries(
      input
        .map((entry: any) => [String(entry?.name || "").toLowerCase(), String(entry?.value || "")])
        .filter(([key]) => !!key)
    )
  }

  if (typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>).map(([key, value]) => [key.toLowerCase(), String(value ?? "")])
    )
  }

  return {}
}

function asAddressList(value: unknown) {
  if (!value) return [] as string[]
  if (Array.isArray(value)) return value.map((item) => String(item))
  return [String(value)]
}

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    return Response.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  const payload = await request.text()
  const svixId = request.headers.get("svix-id")
  const svixTimestamp = request.headers.get("svix-timestamp")
  const svixSignature = request.headers.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: "Missing webhook signature headers" }, { status: 400 })
  }

  let event: any
  try {
    event = new Webhook(secret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    })
  } catch {
    return Response.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  if (event?.type !== "email.received" || !event?.data?.email_id) {
    return Response.json({ ok: true })
  }

  const email = await getReceivedEmailContent(event.data.email_id)
  const headers = normalizeHeaders((email as any).headers)
  const recipientAddresses = asAddressList((email as any).to)
  const senderAddresses = asAddressList((email as any).from)
  const threadIdFromAddress = parseReplyThreadId(recipientAddresses)
  const inReplyTo = headers["in-reply-to"] || null

  let thread = threadIdFromAddress
    ? await db.outreachThread.findUnique({
        where: { id: threadIdFromAddress },
        include: { lead: true },
      })
    : null

  if (!thread && inReplyTo) {
    const outboundMessage = await db.outreachMessage.findFirst({
      where: { providerMessageId: inReplyTo },
      include: {
        thread: { include: { lead: true } },
      },
    })
    thread = outboundMessage?.thread ?? null
  }

  if (!thread) {
    return Response.json({ ok: true, skipped: "thread_not_found" })
  }

  const inboundProviderId = event.data.email_id as string
  const existing = await db.outreachMessage.findFirst({
    where: {
      OR: [
        { providerMessageId: inboundProviderId },
        ...(headers["message-id"] ? [{ providerMessageId: headers["message-id"] }] : []),
      ],
    },
    select: { id: true },
  })

  if (existing) {
    return Response.json({ ok: true, duplicate: true })
  }

  const body =
    ((email as any).text as string | undefined)?.trim() ||
    stripHtml(((email as any).html as string | undefined) || "") ||
    "(No message body captured)"

  await db.outreachMessage.create({
    data: {
      threadId: thread.id,
      direction: "inbound",
      messageType: "reply",
      subject: (email as any).subject || null,
      body,
      fromEmail: extractEmailAddress(senderAddresses[0]) || null,
      toEmail: extractEmailAddress(recipientAddresses[0]) || null,
      receivedAt: new Date((email as any).created_at || Date.now()),
      providerMessageId: inboundProviderId,
      providerThreadId: inReplyTo,
      inReplyTo,
      rawHeaders: JSON.stringify(headers),
      reviewedByUser: false,
      generatedByAi: false,
      stepNumber: 0,
      delayDays: 0,
    },
  })

  await db.outreachThread.update({
    where: { id: thread.id },
    data: {
      status: "replied",
      lastInboundAt: new Date(),
      unreadCount: { increment: 1 },
    },
  })

  if (thread.lead && isValidTransition(thread.lead.stage, "replied")) {
    await db.lead.update({
      where: { id: thread.lead.id },
      data: { stage: "replied" },
    })

    await logStageChange({
      leadId: thread.lead.id,
      from: thread.lead.stage,
      to: "replied",
      reason: "Inbound email reply received",
    })
  }

  await logActivity({
    entity: "lead",
    entityId: thread.lead.id,
    action: "INBOUND_EMAIL_RECEIVED",
    metadata: {
      subject: (email as any).subject || null,
      from: extractEmailAddress(senderAddresses[0]),
      to: extractEmailAddress(recipientAddresses[0]),
      providerMessageId: inboundProviderId,
    },
  })

  try {
    await generateReplyDraftForThread(thread.id)
  } catch {
    // Non-fatal: the inbound message should still be stored even if AI drafting fails.
  }

  revalidatePath("/admin/outreach")
  revalidatePath("/admin/outreach/history")
  revalidatePath("/admin/leads")
  revalidatePath(`/admin/leads/${thread.lead.id}`)

  return Response.json({ ok: true })
}
