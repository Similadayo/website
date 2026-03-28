/**
 * GPT-4o company discovery fallback.
 * Used when SERPER_API_KEY is not set.
 */

import type { PlacesResult } from "./serper"

export async function discoverViaGPT(
  niche: string,
  region: string,
  count = 12
): Promise<PlacesResult[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set — cannot use GPT discovery fallback")
  }

  const { default: OpenAI } = await import("openai")
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const prompt = `List ${count} real small-to-mid-sized ${niche} companies based in ${region}.
Focus on companies with 5-200 employees — recruiting firms, agencies, SaaS teams, or B2B service companies.
For each, provide: company name, their actual website URL, and one sentence describing what they do.
Return as a JSON array: [{"name":"...","url":"https://...","description":"..."}]
Only include real businesses you are confident exist. Include their actual domain, not LinkedIn or directory pages.`

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 1500,
  })

  const raw = res.choices[0]?.message?.content ?? "{}"
  const parsed = JSON.parse(raw) as { results?: unknown[]; companies?: unknown[] } | unknown[]

  const items: unknown[] = Array.isArray(parsed)
    ? parsed
    : (parsed as any).results ?? (parsed as any).companies ?? []

  const mapped = items
    .filter((i): i is { name: string; url: string; description?: string } =>
      typeof (i as any)?.name === "string" && typeof (i as any)?.url === "string"
    )
    .map((item): PlacesResult | null => {
      try {
        const url    = new URL(item.url.startsWith("http") ? item.url : `https://${item.url}`)
        const domain = url.hostname.replace(/^www\./, "").toLowerCase()
        return {
          name: item.name, url: item.url, domain,
          description: item.description ?? "",
          phone: null, address: null, rating: null, reviewCount: null, category: null,
        }
      } catch {
        return null
      }
    })

  return mapped.filter((r): r is PlacesResult => r !== null)
}
