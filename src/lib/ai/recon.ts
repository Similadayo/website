import OpenAI from "openai"
import { searchSerperWeb } from "../search/serper"
import { db } from "../db"
import {
  getContactTier,
  getOutreachRecommendation,
  isLeadershipRole,
} from "../contacts/priority"

/**
 * Deep Reconnaissance: Finds operator-level decision makers via LinkedIn and web search.
 */
export async function runDeepRecon(leadId: string): Promise<any[]> {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: { company: true }
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

  if (searchResults.length === 0) return []

  const contextText = searchResults.map(r => `Title: ${r.name}\nSnippet: ${r.description}\nLink: ${r.url}`).join("\n\n---\n\n")

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
        Use email only if clearly visible in the source text. Use linkedinUrl when present. Keep only current employees or current operators. Avoid past employees or similar sounding companies.`
      },
      { role: "user", content: contextText }
    ],
    response_format: { type: "json_object" }
  })

  const rawJson = response.choices[0]?.message?.content ?? "{}"
  const parsed = JSON.parse(rawJson)
  const contacts = parsed.contacts || parsed.people || Object.values(parsed)[0] || []

  if (!Array.isArray(contacts)) return []

  // Clean and save
  const savedContacts = []
  for (const c of contacts) {
    const role = typeof c.role === "string" ? c.role : null
    const linkedinUrl = typeof c.linkedinUrl === "string" ? c.linkedinUrl : null
    const email = typeof c.email === "string" ? c.email : null

    if (!role || (!linkedinUrl && !email) || !isLeadershipRole(role)) continue

    const existing = await db.contact.findFirst({
      where: {
        companyId: lead.companyId,
        OR: [
          ...(linkedinUrl ? [{ linkedinUrl }] : []),
          ...(email ? [{ email }] : []),
          ...(c.name ? [{ name: c.name, roleTitle: role }] : []),
        ],
      },
    })

    if (existing) {
      const updated = await db.contact.update({
        where: { id: existing.id },
        data: {
          roleTitle: existing.roleTitle || role,
          email: existing.email || email,
          linkedinUrl: existing.linkedinUrl || linkedinUrl,
          confidenceScore: Math.max(existing.confidenceScore ?? 0, c.confidence || 0.5),
          sourceEvidence: existing.sourceEvidence || (typeof c.evidence === "string" ? c.evidence : "Operator discovered via deep recon."),
          verified: existing.verified || !!email || !!linkedinUrl,
          isPrimaryDecisionMaker: true,
          isGenericInbox: false,
          contactTier: getContactTier({
            roleTitle: existing.roleTitle || role,
            email: existing.email || email,
            linkedinUrl: existing.linkedinUrl || linkedinUrl,
            isPrimaryDecisionMaker: true,
          }),
          outreachRecommendation: getOutreachRecommendation({
            roleTitle: existing.roleTitle || role,
            email: existing.email || email,
            linkedinUrl: existing.linkedinUrl || linkedinUrl,
            isPrimaryDecisionMaker: true,
          }),
        },
      })
      savedContacts.push(updated)
      continue
    }

    const saved = await db.contact.create({
      data: {
        companyId: lead.companyId,
        name: typeof c.name === "string" ? c.name : null,
        roleTitle: role,
        email,
        linkedinUrl,
        confidenceScore: c.confidence || 0.5,
        contactType: "operator_recon",
        sourceEvidence: typeof c.evidence === "string" ? c.evidence : "Operator discovered via deep recon.",
        verified: true,
        isGenericInbox: false,
        isPrimaryDecisionMaker: true,
        contactTier: getContactTier({
          roleTitle: role,
          email,
          linkedinUrl,
          isPrimaryDecisionMaker: true,
        }),
        outreachRecommendation: getOutreachRecommendation({
          roleTitle: role,
          email,
          linkedinUrl,
          isPrimaryDecisionMaker: true,
        }),
      }
    })
    savedContacts.push(saved)
  }

  return savedContacts
}
