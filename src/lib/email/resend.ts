/**
 * Email sending via Resend API.
 * Free tier: 100 emails/day at resend.com
 * Falls back to "manual send" mode if no RESEND_API_KEY is set.
 */

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

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

export async function sendEmail(
  to:       string,
  subject:  string,
  body:     string,
  fromOverride?: string,
  apiKey?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const key    = apiKey || process.env.RESEND_API_KEY
  const from   = fromOverride || process.env.OUTREACH_FROM_EMAIL || "outreach@brancr.com"

  if (!key) {
    return { success: false, error: "RESEND_API_KEY not set — email logged but not sent" }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text: body,
        html: formatEmailHtml(body),
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: `Resend error ${res.status}: ${err}` }
    }

    const data = await res.json() as { id: string }
    return { success: true, id: data.id }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
