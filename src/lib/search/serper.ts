/**
 * Serper.dev Google Maps/Places search client.
 * Uses /maps endpoint for richer local business data.
 * Returns: name, address, phone, website, rating, reviews, category.
 */

export interface PlacesResult {
  name:        string
  url:         string
  domain:      string
  description: string
  phone:       string | null
  address:     string | null
  rating:      number | null
  reviewCount: number | null
  category:    string | null
}

export async function searchSerperMaps(query: string, num = 20): Promise<PlacesResult[]> {
  const key = process.env.SERPER_API_KEY
  if (!key) throw new Error("SERPER_API_KEY is not set in .env")

  const res = await fetch("https://google.serper.dev/maps", {
    method:  "POST",
    headers: {
      "X-API-KEY":    key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    throw new Error(`Serper Maps API error ${res.status}: ${await res.text()}`)
  }

  const data = await res.json() as {
    places?: {
      title:       string
      address?:    string
      phoneNumber?: string
      website?:    string
      rating?:     number
      ratingCount?: number
      category?:   string
      cid?:        string
    }[]
  }

  const results: PlacesResult[] = []

  for (const place of data.places ?? []) {
    // Skip entries without a website — we can't analyze them
    if (!place.website) continue

    try {
      const url    = place.website.startsWith("http") ? place.website : `https://${place.website}`
      const parsed = new URL(url)
      const domain = parsed.hostname.replace(/^www\./, "").toLowerCase()

      // Filter out social platforms and directories
      const blocklist = [
        "linkedin.com", "facebook.com", "twitter.com", "x.com",
        "yelp.com", "indeed.com", "glassdoor.com", "reed.co.uk",
        "totaljobs.com", "wikipedia.org", "youtube.com", "google.com",
      ]
      if (blocklist.some(b => domain.includes(b))) continue

      results.push({
        name:        place.title,
        url,
        domain,
        description: [place.category, place.address].filter(Boolean).join(" · "),
        phone:       place.phoneNumber ?? null,
        address:     place.address ?? null,
        rating:      place.rating ?? null,
        reviewCount: place.ratingCount ?? null,
        category:    place.category ?? null,
      })
    } catch {
      // skip malformed URLs
    }
  }

  return results
}

// Keep web search as fallback for broader/non-local queries
export async function searchSerperWeb(query: string, num = 10): Promise<PlacesResult[]> {
  const key = process.env.SERPER_API_KEY
  if (!key) throw new Error("SERPER_API_KEY is not set in .env")

  const res = await fetch("https://google.serper.dev/search", {
    method:  "POST",
    headers: {
      "X-API-KEY":    key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num }),
    signal: AbortSignal.timeout(12_000),
  })

  if (!res.ok) {
    throw new Error(`Serper API error ${res.status}: ${await res.text()}`)
  }

  const data = await res.json() as {
    organic?: { title: string; link: string; snippet: string }[]
  }

  const results: PlacesResult[] = []
  for (const item of data.organic ?? []) {
    try {
      const url    = new URL(item.link)
      const domain = url.hostname.replace(/^www\./, "").toLowerCase()
      const blocklist = [
        "linkedin.com", "facebook.com", "twitter.com", "x.com",
        "yelp.com", "indeed.com", "glassdoor.com", "wikipedia.org", "youtube.com",
      ]
      if (blocklist.some(b => domain.includes(b))) continue

      results.push({
        name:        item.title.split("|")[0].split("-")[0].trim(),
        url:         item.link,
        domain,
        description: item.snippet ?? "",
        phone:       null,
        address:     null,
        rating:      null,
        reviewCount: null,
        category:    null,
      })
    } catch { /* skip */ }
  }

  return results
}
