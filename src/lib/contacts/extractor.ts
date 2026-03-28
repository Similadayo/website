/**
 * Contact extraction from website HTML.
 * Extracts emails, phone numbers, and social links.
 */

export interface ExtractedContact {
  emails:      string[]
  phones:      string[]
  linkedinUrl: string | null
  contactPage: string | null
}

// Common email patterns (skip generic ones)
const SKIP_EMAILS = [
  "noreply@", "no-reply@", "info@example", "email@example",
  "support@", "admin@", "webmaster@",
]

export function extractContacts(html: string, baseUrl: string): ExtractedContact {
  const result: ExtractedContact = {
    emails:      [],
    phones:      [],
    linkedinUrl: null,
    contactPage: null,
  }

  // ── Emails ──────────────────────────────────────────────────────────────
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const rawEmails = html.match(emailRegex) ?? []
  const seen = new Set<string>()

  for (const email of rawEmails) {
    const lower = email.toLowerCase()
    if (SKIP_EMAILS.some((skip: string) => lower.startsWith(skip))) continue
    // Skip image/asset extensions
    if (/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i.test(lower)) continue
    if (!seen.has(lower)) {
      seen.add(lower)
      result.emails.push(lower)
    }
  }

  // ── Phone numbers ───────────────────────────────────────────────────────
  // Match tel: links and common formats
  const telRegex = /(?:href="tel:([^"]+)"|(?:\+?\d[\d\s\-()]{7,}\d))/g
  let match: RegExpExecArray | null
  const seenPhones = new Set<string>()

  while ((match = telRegex.exec(html)) !== null) {
    const phone = (match[1] ?? match[0])
      .replace(/[^\d+]/g, "")
      .trim()
    if (phone.length >= 8 && !seenPhones.has(phone)) {
      seenPhones.add(phone)
      result.phones.push(phone)
    }
  }

  // ── LinkedIn ────────────────────────────────────────────────────────────
  const linkedinMatch = html.match(
    /href="(https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[^"]+)"/i
  )
  if (linkedinMatch) {
    result.linkedinUrl = linkedinMatch[1]
  }

  // ── Contact page ────────────────────────────────────────────────────────
  const contactLinkMatch = html.match(
    /href="([^"]*(?:contact|get-in-touch|reach-us|enquir)[^"]*)"/i
  )
  if (contactLinkMatch) {
    try {
      result.contactPage = new URL(contactLinkMatch[1], baseUrl).href
    } catch {
      result.contactPage = contactLinkMatch[1]
    }
  }

  return result
}
