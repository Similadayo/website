import OpenAI from "openai"
import { searchSerperWeb } from "../search/serper"
import { db } from "../db"

/**
 * Deep Reconnaissance: Finds specific decision makers via LinkedIn search and parses them with AI.
 */
export async function runDeepRecon(leadId: string): Promise<any[]> {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: { company: true }
  })

  if (!lead) throw new Error("Lead not found for recon")

  const companyName = lead.company.name
  // We prioritize executive and growth roles relevant to recruitment/agency focus
  const searchQuery = `site:linkedin.com/in "${companyName}" (Founder OR CEO OR "Managing Director" OR recruitment OR "Head of Talent")`
  
  const searchResults = await searchSerperWeb(searchQuery, 10)
  
  if (searchResults.length === 0) return []

  const contextText = searchResults.map(r => `Title: ${r.name}\nSnippet: ${r.description}\nLink: ${r.url}`).join("\n\n---\n\n")

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a corporate intelligence analyst. Given search results for LinkedIn profiles at "${companyName}", identify and extract the most relevant decision makers.
        Return a JSON array of objects: [{ "name": "...", "role": "...", "linkedinUrl": "...", "confidence": 0.0-1.0 }]
        Focus only on people actually working at this company currently. Avoid past employees or similar sounding agencies.`
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
    if (!c.name || !c.linkedinUrl) continue
    
    const saved = await db.contact.create({
      data: {
        companyId: lead.companyId,
        name: c.name,
        roleTitle: c.role,
        linkedinUrl: c.linkedinUrl,
        confidenceScore: c.confidence || 0.5,
        contactType: "linkedin_discovery"
      }
    })
    savedContacts.push(saved)
  }

  return savedContacts
}
