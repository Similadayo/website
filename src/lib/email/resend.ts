import { Resend } from "resend"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatEmailHtml(body: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) {
    return "<p></p>"
  }

  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("")
}

function getResendClient(apiKey?: string) {
  const key = apiKey || process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export function getDefaultReplyInbox() {
  return process.env.OUTREACH_REPLY_INBOX || "contact@brancr.com"
}

export function buildReplyToAddress(threadId: string) {
  const inbox = getDefaultReplyInbox()
  const [localPart, domain] = inbox.split("@")
  if (!localPart || !domain) {
    throw new Error("OUTREACH_REPLY_INBOX must be a valid email address.")
  }

  return `${localPart}+${threadId}@${domain}`
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  options?: {
    fromOverride?: string
    apiKey?: string
    threadId?: string
  }
): Promise<{ success: boolean; id?: string; error?: string; replyTo?: string }> {
  const client = getResendClient(options?.apiKey)
  const from = options?.fromOverride || process.env.OUTREACH_FROM_EMAIL || "outreach@brancr.com"

  if (!client) {
    return { success: false, error: "RESEND_API_KEY not set — email logged but not sent" }
  }

  try {
    const replyTo = options?.threadId ? buildReplyToAddress(options.threadId) : getDefaultReplyInbox()

    const { data, error } = await client.emails.send({
      from,
      to: [to],
      subject,
      text: body,
      html: formatEmailHtml(body),
      replyTo,
      headers: options?.threadId
        ? {
            "X-Brancr-Thread-Id": options.threadId,
          }
        : undefined,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id, replyTo }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getReceivedEmailContent(emailId: string) {
  const client = getResendClient()
  if (!client) {
    throw new Error("RESEND_API_KEY not set.")
  }

  const { data, error } = await client.emails.receiving.get(emailId)
  if (error || !data) {
    throw new Error(error?.message || "Failed to load inbound email content.")
  }

  return data
}
