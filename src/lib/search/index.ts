/**
 * Search provider index.
 * Primary: Serper Maps (Google Places — richer data)
 * Fallback: Serper Web + GPT-4o
 *
 * Runs multiple query variations for broader coverage.
 */

import { searchSerperMaps, searchSerperWeb, type PlacesResult } from "./serper"
import { discoverViaGPT } from "./gpt-discovery"

export type { PlacesResult }

export async function discoverCompanies(
  niche:  string,
  region: string,
  count = 40
): Promise<PlacesResult[]> {
  if (process.env.SERPER_API_KEY) {
    const all: PlacesResult[] = []
    const seenDomains = new Set<string>()

    // Maps queries — Google Places returns local businesses (small-mid)
    const mapsQueries = [
      `${niche} in ${region}`,
      `${niche} agency ${region}`,
      `${niche} firms ${region}`,
      `recruiting agency ${region}`,
      `staffing firms ${region}`,
      `recruitment companies ${region}`,
      `digital marketing ${region}`,
      `${niche} services ${region}`,
    ]

    for (const q of mapsQueries) {
      try {
        const results = await searchSerperMaps(q, 50)
        for (const r of results) {
          if (!seenDomains.has(r.domain)) {
            seenDomains.add(r.domain)
            all.push(r)
          }
        }
      } catch { /* non-fatal — try next query */ }
      if (all.length >= count) break
    }

    // If Maps didn't return enough, supplement with web search
    if (all.length < count) {
      try {
        const webResults = await searchSerperWeb(`small ${niche} companies in ${region}`, 10)
        for (const r of webResults) {
          if (!seenDomains.has(r.domain)) {
            seenDomains.add(r.domain)
            all.push(r)
          }
        }
      } catch { /* non-fatal */ }
    }

    return all.slice(0, count)
  }

  // No Serper key — fallback to GPT discovery
  const gptResults = await discoverViaGPT(niche, region, count)
  return gptResults.map(r => ({
    ...r,
    phone:       null,
    address:     null,
    rating:      null,
    reviewCount: null,
    category:    null,
  }))
}
