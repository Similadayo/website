/**
 * Contact extraction from website HTML.
 * Extracts public emails, phones, social links, crawl targets, and named people.
 */

import { isInvalidContactEmail } from "./priority"

const SKIP_EMAIL_PREFIXES = [
  "noreply@",
  "no-reply@",
  "info@example",
  "email@example",
  "support@",
  "admin@",
  "webmaster@",
]

const ROUTE_KEYWORDS = [
  "contact",
  "contact-us",
  "get-in-touch",
  "team",
  "about",
  "about-us",
  "leadership",
  "leadership-team",
  "executive-team",
  "management",
  "company",
  "our-team",
  "our_people",
  "people",
  "staff",
]

const LEADERSHIP_ROLE_PATTERN =
  /\b(founder|co[- ]?founder|ceo|chief executive officer|chief executive|coo|chief operating officer|chief operating|managing director|managing partner|executive director|director|owner|principal|president|partner|vice president|vp of operations|head of operations|operations manager|operations lead|head of recruiting|talent lead|head of talent)\b/i

export interface ExtractedContact {
  emails: string[]
  phones: string[]
  linkedinUrl: string | null
  contactPage: string | null
}

export interface ExtractedEmail {
  email: string
  sourceUrl: string
  evidence: string
  nearbyText: string
  name: string | null
  roleTitle: string | null
  isGenericInbox: boolean
}

export interface ExtractedPerson {
  name: string
  roleTitle: string
  sourceUrl: string
  evidence: string
  email: string | null
  linkedinUrl: string | null
}

export interface ExtractedPageIntel {
  sourceUrl: string
  emails: ExtractedEmail[]
  phones: string[]
  linkedinUrls: string[]
  contactPages: string[]
  routeLinks: string[]
  people: ExtractedPerson[]
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function stripHtml(html: string) {
  return normalizeWhitespace(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|section|article|li|h[1-6]|tr)>/gi, "\n")
      .replace(/<[^>]*>/g, " ")
  )
}

function toAbsoluteUrl(href: string, baseUrl: string) {
  try {
    return new URL(href, baseUrl).href
  } catch {
    return null
  }
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return null
  }
}

function isAssetLikeEmail(email: string) {
  return /\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i.test(email)
}

function isLikelyName(value: string) {
  if (!value || value.length < 5 || value.length > 80) return false
  if (/\d/.test(value)) return false
  if (!/^[A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){1,3}$/.test(value)) return false
  return !/(contact|about|privacy|terms|support|services|blog|news|careers|team page)/i.test(value)
}

function cleanName(value: string) {
  return normalizeWhitespace(value.replace(/\s*[|,-]\s*(founder|ceo|coo|director|owner|principal|partner).*$/i, ""))
}

function detectRole(text: string) {
  const match = text.match(LEADERSHIP_ROLE_PATTERN)
  return match ? normalizeWhitespace(match[0]) : null
}

function extractNearbyText(source: string, index: number, radius = 160) {
  const start = Math.max(0, index - radius)
  const end = Math.min(source.length, index + radius)
  return normalizeWhitespace(source.slice(start, end))
}

function dedupeStrings(values: string[]) {
  return [...new Set(values)]
}

function dedupePeople(people: ExtractedPerson[]) {
  const seen = new Set<string>()
  return people.filter((person) => {
    const key = `${person.name.toLowerCase()}|${person.roleTitle.toLowerCase()}|${person.sourceUrl}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function dedupeEmails(emails: ExtractedEmail[]) {
  const seen = new Set<string>()
  return emails.filter((hit) => {
    const key = `${hit.email}|${hit.sourceUrl}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function decodeObfuscatedEmail(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/\s*(?:\(|\[|\{)?\s*at\s*(?:\)|\]|\})?\s*/g, "@")
    .replace(/\s*(?:\(|\[|\{)?\s*dot\s*(?:\)|\]|\})?\s*/g, ".")
    .replace(/\s+/g, "")

  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalized)) return null
  if (SKIP_EMAIL_PREFIXES.some((skip) => normalized.startsWith(skip))) return null
  if (isAssetLikeEmail(normalized)) return null
  if (isInvalidContactEmail(normalized)) return null
  return normalized
}

export function extractPageIntel(html: string, sourceUrl: string): ExtractedPageIntel {
  const text = stripHtml(html)
  const emails: ExtractedEmail[] = []
  const phones: string[] = []
  const linkedinUrls: string[] = []
  const contactPages: string[] = []
  const routeLinks: string[] = []
  const people: ExtractedPerson[] = []
  const sameDomain = getDomain(sourceUrl)

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const rawEmails = html.match(emailRegex) ?? []

  for (const rawEmail of rawEmails) {
    const email = rawEmail.toLowerCase()
    if (SKIP_EMAIL_PREFIXES.some((skip) => email.startsWith(skip))) continue
    if (isAssetLikeEmail(email)) continue
    if (isInvalidContactEmail(email)) continue

    const nearbyText = (() => {
      const htmlIndex = html.toLowerCase().indexOf(email)
      const textIndex = text.toLowerCase().indexOf(email)
      if (textIndex >= 0) return extractNearbyText(text, textIndex)
      if (htmlIndex >= 0) return extractNearbyText(html, htmlIndex)
      return ""
    })()

    const roleTitle = detectRole(nearbyText)
    const nameMatch = nearbyText.match(/[A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){1,3}/)
    const name = nameMatch && isLikelyName(nameMatch[0]) ? cleanName(nameMatch[0]) : null

    emails.push({
      email,
      sourceUrl,
      evidence: `Public email found on ${sourceUrl}`,
      nearbyText,
      name,
      roleTitle,
      isGenericInbox: false,
    })
  }

  const obfuscatedRegex =
    /\b[a-zA-Z0-9._%+-]+\s*(?:\(|\[|\{)?\s*at\s*(?:\)|\]|\})?\s*[a-zA-Z0-9.-]+\s*(?:\(|\[|\{)?\s*dot\s*(?:\)|\]|\})?\s*[a-zA-Z.]{2,}\b/g
  const obfuscatedEmails = text.match(obfuscatedRegex) ?? []

  for (const rawValue of obfuscatedEmails) {
    const email = decodeObfuscatedEmail(rawValue)
    if (!email) continue

    const textIndex = text.toLowerCase().indexOf(rawValue.toLowerCase())
    const nearbyText = textIndex >= 0 ? extractNearbyText(text, textIndex) : ""
    const roleTitle = detectRole(nearbyText)
    const nameMatch = nearbyText.match(/[A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){1,3}/)
    const name = nameMatch && isLikelyName(nameMatch[0]) ? cleanName(nameMatch[0]) : null

    emails.push({
      email,
      sourceUrl,
      evidence: `Obfuscated public email decoded from ${sourceUrl}`,
      nearbyText,
      name,
      roleTitle,
      isGenericInbox: false,
    })
  }

  const mailtoRegex = /mailto:([^"'?#\s>]+)/gi
  let mailtoMatch: RegExpExecArray | null
  while ((mailtoMatch = mailtoRegex.exec(html)) !== null) {
    const email = mailtoMatch[1].toLowerCase()
    if (SKIP_EMAIL_PREFIXES.some((skip) => email.startsWith(skip))) continue
    if (isAssetLikeEmail(email)) continue
    if (isInvalidContactEmail(email)) continue

    const nearbyText = extractNearbyText(html, mailtoMatch.index)
    const roleTitle = detectRole(nearbyText)
    const nameMatch = nearbyText.match(/[A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){1,3}/)
    const name = nameMatch && isLikelyName(nameMatch[0]) ? cleanName(nameMatch[0]) : null

    emails.push({
      email,
      sourceUrl,
      evidence: `mailto link found on ${sourceUrl}`,
      nearbyText: normalizeWhitespace(nearbyText),
      name,
      roleTitle,
      isGenericInbox: false,
    })
  }

  const telRegex = /(?:href="tel:([^"]+)"|(?:\+?\d[\d\s\-()]{7,}\d))/g
  let telMatch: RegExpExecArray | null
  while ((telMatch = telRegex.exec(html)) !== null) {
    const phone = (telMatch[1] ?? telMatch[0]).replace(/[^\d+]/g, "").trim()
    if (phone.length >= 8) phones.push(phone)
  }

  const linkRegex = /href="([^"]+)"/gi
  let linkMatch: RegExpExecArray | null
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const href = linkMatch[1]
    const absolute = toAbsoluteUrl(href, sourceUrl)
    if (!absolute) continue

    const lower = absolute.toLowerCase()
    if (lower.includes("linkedin.com/")) {
      linkedinUrls.push(absolute)
    }

    const absoluteDomain = getDomain(absolute)
    if (!absoluteDomain || (sameDomain && absoluteDomain !== sameDomain)) continue

    if (ROUTE_KEYWORDS.some((keyword) => lower.includes(`/${keyword}`) || lower.includes(`-${keyword}`) || lower.includes(`_${keyword}`))) {
      routeLinks.push(absolute)
      if (/contact|get-in-touch|reach-us|enquir/i.test(lower)) {
        contactPages.push(absolute)
      }
    }
  }

  const chunks = html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
    .split(/<\/?(?:section|article|div|li|p|h[1-6]|tr|td|span|strong|em|a)[^>]*>/gi)
    .map((chunk) => normalizeWhitespace(chunk.replace(/<[^>]*>/g, " ")))
    .filter(Boolean)

  for (const chunk of chunks) {
    if (chunk.length < 12 || chunk.length > 220) continue
    const roleTitle = detectRole(chunk)
    if (!roleTitle) continue

    const nameMatches = chunk.match(/[A-Z][A-Za-z'`.-]+(?:\s+[A-Z][A-Za-z'`.-]+){1,3}/g) ?? []
    const matchedName = nameMatches
      .map(cleanName)
      .find((candidate) => isLikelyName(candidate))

    if (!matchedName) continue

    const emailHit = emails.find((item) => item.nearbyText && item.nearbyText.toLowerCase().includes(matchedName.toLowerCase()))
    const linkedinUrl = linkedinUrls.find((url) => url.toLowerCase().includes(matchedName.toLowerCase().replace(/\s+/g, "-"))) ?? null

    people.push({
      name: matchedName,
      roleTitle,
      sourceUrl,
      evidence: `Leadership signal found on ${sourceUrl}`,
      email: emailHit?.email ?? null,
      linkedinUrl,
    })
  }

  return {
    sourceUrl,
    emails: dedupeEmails(emails),
    phones: dedupeStrings(phones),
    linkedinUrls: dedupeStrings(linkedinUrls),
    contactPages: dedupeStrings(contactPages),
    routeLinks: dedupeStrings(routeLinks),
    people: dedupePeople(people),
  }
}

export function extractContacts(html: string, baseUrl: string): ExtractedContact {
  const intel = extractPageIntel(html, baseUrl)
  const companyLinkedin =
    intel.linkedinUrls.find((url) => /linkedin\.com\/company\//i.test(url)) ??
    intel.linkedinUrls[0] ??
    null

  return {
    emails: intel.emails.map((item) => item.email),
    phones: intel.phones,
    linkedinUrl: companyLinkedin,
    contactPage: intel.contactPages[0] ?? null,
  }
}
