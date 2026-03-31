import OpenAI from "openai"
import { searchSerperWeb } from "../search/serper"
import { db } from "../db"
import { isLeadershipRole } from "../contacts/priority"
import { enrichExecutiveContacts, type ReconIdentity } from "../contacts/enrichment"

/**
 * Deep Reconnaissance: finds operator-level decision makers, then enriches emails from public web evidence.
 */
export async function runDeepRecon(leadId: string): Promise<any[]> {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: {
      company: {
        include: {
          contacts: true,
        },
      },
    },
  })

  if (!lead) throw new Error("Lead not found for recon")

  const companyName = lead.company.name
  const leadershipQuery = `site:linkedin.com/in "${companyName}" (Founder OR CEO OR COO OR "Managing Director" OR "Head of Operations" OR "Operations Manager" OR Owner)`
  const companyQuery = `"${companyName}" (founder OR CEO OR COO OR "managing director" OR "head of operations" OR operator) (email OR linkedin OR contact)`

  const [linkedinResults, webResults] = await Promise.all([
    searchSerperWeb(leadershipQuery, 10),
    searchSerperWeb(companyQuery, 10),
  ])

  const searchResults = [...linkedinResults, ...webResults].filter(
    (result, index, items) =>
      items.findIndex((candidate) => candidate.url === result.url) === index
  )

  if (searchResults.length === 0) {
    const enriched = await enrichExecutiveContacts(
      lead.companyId,
      lead.company.websiteUrl,
      lead.company.domain,
      []
    )
    return enriched.contacts
  }

  const contextText = searchResults
    .map((r) => `Title: ${r.name}\nSnippet: ${r.description}\nLink: ${r.url}`)
    .join("\n\n---\n\n")

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a corporate intelligence analyst. Given web and LinkedIn search results for "${companyName}", identify founder/operator decision makers.
Prioritize founder, co-founder, CEO, COO, managing director, owner, head of operations, and operations manager.
Return JSON with a "contacts" key holding an array of objects:
[{ "name": "...", "role": "...", "email": null, "linkedinUrl": null, "confidence": 0.0-1.0, "evidence": "..." }]
Use email only if clearly visible in the source text. Use linkedinUrl when present. Keep only current employees or current operators. Avoid past employees or similar sounding companies.`,
      },
      { role: "user", content: contextText },
    ],
    response_format: { type: "json_object" },
  })

  const rawJson = response.choices[0]?.message?.content ?? "{}"
  const parsed = JSON.parse(rawJson)
  const contacts = parsed.contacts || parsed.people || Object.values(parsed)[0] || []
  const reconContacts: ReconIdentity[] = []

  if (Array.isArray(contacts)) {
    for (const c of contacts) {
      const roleTitle = typeof c.role === "string" ? c.role : null
      if (!roleTitle || !isLeadershipRole(roleTitle)) continue

      reconContacts.push({
        name: typeof c.name === "string" ? c.name : null,
        roleTitle,
        email: typeof c.email === "string" ? c.email.toLowerCase() : null,
        linkedinUrl: typeof c.linkedinUrl === "string" ? c.linkedinUrl : null,
        confidenceScore: typeof c.confidence === "number" ? c.confidence : 0.55,
        sourceEvidence: typeof c.evidence === "string" ? c.evidence : "Operator discovered via deep recon.",
      })
    }
  }

  const enriched = await enrichExecutiveContacts(
    lead.companyId,
    lead.company.websiteUrl,
    lead.company.domain,
    reconContacts
  )

  return enriched.contacts
}
