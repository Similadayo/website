import OpenAI from "openai"
import { searchSerperWeb, searchSerperWebWithOptions, type PlacesResult } from "../search/serper"
import { db } from "../db"
import { isLeadershipRole } from "../contacts/priority"
import { enrichExecutiveContacts, type ReconIdentity } from "../contacts/enrichment"

function normalizeLinkedinProfileUrl(url: string) {
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.toLowerCase().includes("linkedin.com")) return null
    if (!/\/in\//i.test(parsed.pathname)) return null
    parsed.search = ""
    parsed.hash = ""
    return parsed.toString()
  } catch {
    return null
  }
}

function parseLinkedinResult(result: PlacesResult, companyName: string): ReconIdentity | null {
  const linkedinUrl = normalizeLinkedinProfileUrl(result.url)
  if (!linkedinUrl) return null

  const cleanedTitle = result.name
    .replace(/\|\s*LinkedIn\s*$/i, "")
    .replace(/\s*-\s*LinkedIn\s*$/i, "")
    .trim()

  const titleParts = cleanedTitle.split(/\s+-\s+/).map((part) => part.trim()).filter(Boolean)
  const name = titleParts[0] ?? null
  const possibleRole = titleParts.slice(1).find((part) => isLeadershipRole(part)) ?? null
  const snippetRole = possibleRole ?? (result.description.match(/\b(founder|co[- ]?founder|ceo|chief executive officer|chief executive|coo|chief operating officer|chief operating|managing director|managing partner|executive director|director|owner|principal|president|partner|vice president|vp of operations|head of operations|operations manager|operations lead|head of recruiting|talent lead|head of talent)\b/i)?.[0] ?? null)

  if (!name || !snippetRole || !isLeadershipRole(snippetRole)) return null

  const mentionsCompany =
    cleanedTitle.toLowerCase().includes(companyName.toLowerCase()) ||
    result.description.toLowerCase().includes(companyName.toLowerCase())

  return {
    name,
    roleTitle: snippetRole,
    email: null,
    linkedinUrl,
    confidenceScore: mentionsCompany ? 0.82 : 0.68,
    sourceEvidence: `LinkedIn profile result matched during deep recon: ${cleanedTitle}`,
    sourceUrl: linkedinUrl,
  }
}

function dedupeReconContacts(contacts: ReconIdentity[]) {
  const seen = new Set<string>()
  return contacts.filter((contact) => {
    const key = `${(contact.name ?? "").toLowerCase()}|${(contact.roleTitle ?? "").toLowerCase()}|${(contact.linkedinUrl ?? "").toLowerCase()}|${(contact.email ?? "").toLowerCase()}`
    if (!key.replace(/\|/g, "")) return false
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

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
  const leadershipQuery = `site:linkedin.com/in "${companyName}" (Founder OR CEO OR COO OR "Managing Director" OR "Managing Partner" OR "Head of Operations" OR "Operations Manager" OR Owner OR Principal)`
  const leadershipQueryAlt = `site:linkedin.com/in "${companyName}" (co-founder OR president OR partner OR "head of talent" OR "head of recruiting")`
  const companyQuery = `"${companyName}" (founder OR CEO OR COO OR "managing director" OR "head of operations" OR operator OR leadership) (email OR linkedin OR contact)`

  const [linkedinResults, linkedinResultsAlt, webResults] = await Promise.all([
    searchSerperWebWithOptions(leadershipQuery, 10, { allowDomainFragments: ["linkedin.com"], preserveTitle: true }),
    searchSerperWebWithOptions(leadershipQueryAlt, 10, { allowDomainFragments: ["linkedin.com"], preserveTitle: true }),
    searchSerperWeb(companyQuery, 10),
  ])

  const heuristicLinkedinContacts = dedupeReconContacts(
    [...linkedinResults, ...linkedinResultsAlt]
      .map((result) => parseLinkedinResult(result, companyName))
      .filter((contact): contact is ReconIdentity => !!contact)
  )

  const searchResults = [...linkedinResults, ...linkedinResultsAlt, ...webResults].filter(
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

  const reconContacts: ReconIdentity[] = [...heuristicLinkedinContacts]

  if (process.env.OPENAI_API_KEY) {
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
  }

  const enriched = await enrichExecutiveContacts(
    lead.companyId,
    lead.company.websiteUrl,
    lead.company.domain,
    dedupeReconContacts(reconContacts)
  )

  return enriched.contacts
}
