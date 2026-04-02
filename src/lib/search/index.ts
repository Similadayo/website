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

type DiscoverCompaniesOptions = {
  excludeDomains?: Iterable<string | null | undefined>
  excludeNames?: Iterable<string | null | undefined>
}

function normalizeName(value?: string | null) {
  return value?.trim().toLowerCase() ?? ""
}

function isLikelyArticleTitle(value: string) {
  return /\b(best|top|leading|directory|directories|list|lists|roundup|compare|comparison|agencies in|companies in|firms in|services in)\b/i.test(value)
}

function shouldIncludeResult(
  result: PlacesResult,
  seenDomains: Set<string>,
  seenNames: Set<string>
) {
  const normalizedName = normalizeName(result.name)
  if (!normalizedName) return false
  if (isLikelyArticleTitle(result.name)) return false
  if (seenNames.has(normalizedName)) return false
  if (result.domain && seenDomains.has(result.domain)) return false
  return true
}

export async function discoverCompanies(
  niche:  string,
  region: string,
  count = 40,
  options: DiscoverCompaniesOptions = {}
): Promise<PlacesResult[]> {
  const seenDomains = new Set(
    [...(options.excludeDomains ?? [])]
      .map((value) => value?.replace(/^www\./, "").toLowerCase())
      .filter((value): value is string => !!value)
  )
  const seenNames = new Set(
    [...(options.excludeNames ?? [])]
      .map((value) => normalizeName(value))
      .filter(Boolean)
  )

  if (process.env.SERPER_API_KEY) {
    const all: PlacesResult[] = []

    // Maps queries — Google Places returns local businesses (small-mid)
    const mapsQueries = [
      `${niche} in ${region}`,
      `${niche} agency ${region}`,
      `${niche} firms ${region}`,
      `${niche} services ${region}`,
      `${niche} consultants ${region}`,
      `${niche} companies ${region}`,
      `${niche} business ${region}`,
      `boutique ${niche} ${region}`,
      `small ${niche} ${region}`,
      `growing ${niche} ${region}`,
    ]

    for (const q of mapsQueries) {
      try {
        const results = await searchSerperMaps(q, 50)
        for (const r of results) {
          if (shouldIncludeResult(r, seenDomains, seenNames)) {
            if (r.domain) seenDomains.add(r.domain)
            seenNames.add(normalizeName(r.name))
            all.push(r)
          }
        }
      } catch { /* non-fatal — try next query */ }
      if (all.length >= count) break
    }

    // If Maps didn't return enough, prefer GPT supplementation over web titles.
    if (all.length < count) {
      if (process.env.OPENAI_API_KEY) {
        try {
          const gptResults = await discoverViaGPT(niche, region, Math.max((count - all.length) * 2, 12))
          for (const r of gptResults) {
            if (shouldIncludeResult(r, seenDomains, seenNames)) {
              if (r.domain) seenDomains.add(r.domain)
              seenNames.add(normalizeName(r.name))
              all.push(r)
            }
          }
        } catch { /* non-fatal */ }
      }
    }

    // Keep web search only as a last resort when no model fallback is available.
    if (all.length < count && !process.env.OPENAI_API_KEY) {
      const webQueries = [
        `${niche} firm ${region}`,
        `${niche} agency ${region}`,
        `${niche} company ${region}`,
      ]

      for (const q of webQueries) {
        try {
          const webResults = await searchSerperWeb(q, 10)
          for (const r of webResults) {
            if (shouldIncludeResult(r, seenDomains, seenNames)) {
              if (r.domain) seenDomains.add(r.domain)
              seenNames.add(normalizeName(r.name))
              all.push(r)
            }
          }
        } catch { /* non-fatal */ }
        if (all.length >= count) break
      }
    }

    return all.slice(0, count)
  }

  // No Serper key — fallback to GPT discovery
  const gptResults = await discoverViaGPT(niche, region, Math.max(count * 2, 20))
  const filtered = gptResults.filter((result) => {
    if (!shouldIncludeResult(result, seenDomains, seenNames)) return false
    if (result.domain) seenDomains.add(result.domain)
    seenNames.add(normalizeName(result.name))
    return true
  })

  return filtered
    .slice(0, count)
    .map((r: any) => ({
      ...r,
      phone:       null,
      address:     null,
      rating:      null,
      reviewCount: null,
      category:    null,
    }))
}
