import { extractPageIntel, type ExtractedEmail, type ExtractedPerson } from "./extractor"
import { isGenericInboxEmail } from "./priority"

export interface CrawledPage {
  url: string
  html: string
  text: string
}

export interface CompanyCrawlResult {
  pages: CrawledPage[]
  emails: ExtractedEmail[]
  people: ExtractedPerson[]
  contactPages: string[]
  linkedinUrls: string[]
}

const FIXED_ROUTES = [
  "/contact",
  "/contact-us",
  "/get-in-touch",
  "/about",
  "/about-us",
  "/team",
  "/team/",
  "/meet-the-team",
  "/leadership",
  "/leadership-team",
  "/executive-team",
  "/management",
  "/company",
  "/company/team",
  "/our-team",
  "/our-people",
  "/people",
  "/staff",
  "/founder",
]

function toAbsoluteUrl(pathOrUrl: string, baseUrl: string) {
  try {
    return new URL(pathOrUrl, baseUrl).href
  } catch {
    return null
  }
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return null
  }
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function dedupeByKey<T>(items: T[], keyFn: (item: T) => string) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function crawlCompanyWebsite(baseUrl: string, pageCap = 10): Promise<CompanyCrawlResult> {
  const homepage = toAbsoluteUrl(baseUrl, baseUrl)
  if (!homepage) {
    return { pages: [], emails: [], people: [], contactPages: [], linkedinUrls: [] }
  }

  const homeHost = getHostname(homepage)
  if (!homeHost) {
    return { pages: [], emails: [], people: [], contactPages: [], linkedinUrls: [] }
  }

  const queue = [homepage, ...FIXED_ROUTES.map((route) => toAbsoluteUrl(route, homepage)).filter(Boolean) as string[]]
  const seen = new Set<string>()
  const pages: CrawledPage[] = []
  const emails: ExtractedEmail[] = []
  const people: ExtractedPerson[] = []
  const contactPages = new Set<string>()
  const linkedinUrls = new Set<string>()

  while (queue.length > 0 && pages.length < pageCap) {
    const url = queue.shift()
    if (!url || seen.has(url)) continue
    seen.add(url)

    if (getHostname(url) !== homeHost) continue

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; BrancrBot/1.0)" },
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) continue

      const html = await res.text()
      const text = htmlToText(html)
      pages.push({ url, html, text })

      const intel = extractPageIntel(html, url)
      for (const email of intel.emails) {
        emails.push({
          ...email,
          isGenericInbox: isGenericInboxEmail(email.email),
        })
      }
      people.push(...intel.people)
      intel.contactPages.forEach((value) => contactPages.add(value))
      intel.linkedinUrls.forEach((value) => linkedinUrls.add(value))

      for (const discovered of [...intel.contactPages, ...intel.routeLinks]) {
        if (!seen.has(discovered) && queue.length < pageCap * 3) {
          queue.push(discovered)
        }
      }
    } catch {
      continue
    }
  }

  return {
    pages,
    emails: dedupeByKey(emails, (item) => `${item.email}|${item.sourceUrl}`),
    people: dedupeByKey(people, (item) => `${item.name.toLowerCase()}|${item.roleTitle.toLowerCase()}|${item.sourceUrl}`),
    contactPages: [...contactPages],
    linkedinUrls: [...linkedinUrls],
  }
}

export function buildWebsiteCorpus(result: CompanyCrawlResult, limit = 12_000) {
  return result.pages
    .map((page) => `Page: ${page.url}\n${page.text}`)
    .join("\n\n")
    .slice(0, limit)
}
