import { db } from "@/lib/db"
import { crawlCompanyWebsite, type CompanyCrawlResult } from "./crawler"
import type { ExtractedEmail, ExtractedPerson } from "./extractor"
import {
  getContactTier,
  getOutreachRecommendation,
  isGenericInboxEmail,
  isLeadershipRole,
  type ContactCandidate,
} from "./priority"

export type EmailPattern = "first" | "first.last" | "firstlast" | "f.last" | "flast"
export type EmailStatus = "public" | "inferred" | "unverified"
export type EmailEvidenceLevel = "public_exact" | "public_same_domain" | "pattern_inferred"

export interface EmailPatternInference {
  pattern: EmailPattern | null
  supportingEmails: string[]
  confidence: number
}

export interface ReconIdentity {
  name?: string | null
  roleTitle?: string | null
  linkedinUrl?: string | null
  email?: string | null
  confidenceScore?: number | null
  sourceEvidence?: string | null
  sourceUrl?: string | null
}

type NameParts = {
  first: string
  last: string | null
  initial: string
}

function normalizeDomain(domain?: string | null) {
  return domain?.replace(/^www\./, "").toLowerCase() ?? null
}

function domainFromUrl(url?: string | null) {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return null
  }
}

function getDomainFromEmail(email?: string | null) {
  return email?.split("@")[1]?.toLowerCase() ?? null
}

function normalizeName(name?: string | null): NameParts | null {
  if (!name) return null
  const parts = name
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length < 1) return null

  return {
    first: parts[0],
    last: parts.length > 1 ? parts[parts.length - 1] : null,
    initial: parts[0][0] ?? "",
  }
}

function buildLocalPart(parts: NameParts, pattern: EmailPattern) {
  if (pattern === "first") return parts.first
  if (!parts.last) return null
  if (pattern === "first.last") return `${parts.first}.${parts.last}`
  if (pattern === "firstlast") return `${parts.first}${parts.last}`
  if (pattern === "f.last") return `${parts.initial}.${parts.last}`
  if (pattern === "flast") return `${parts.initial}${parts.last}`
  return null
}

function detectPatternForName(email: string, name?: string | null): EmailPattern | null {
  const parts = normalizeName(name)
  if (!parts) return null
  const localPart = email.split("@")[0]?.toLowerCase() ?? ""

  for (const pattern of ["first", "first.last", "firstlast", "f.last", "flast"] as EmailPattern[]) {
    const candidate = buildLocalPart(parts, pattern)
    if (candidate && candidate === localPart) return pattern
  }

  return null
}

function findLinkedExtractedPerson(email: ExtractedEmail, people: ExtractedPerson[]) {
  if (email.name) {
    return people.find((person) => person.name.toLowerCase() === email.name?.toLowerCase()) ?? null
  }

  return (
    people.find((person) =>
      email.nearbyText.toLowerCase().includes(person.name.toLowerCase()) ||
      (person.roleTitle && email.nearbyText.toLowerCase().includes(person.roleTitle.toLowerCase()))
    ) ?? null
  )
}

export function inferEmailPattern(
  domain: string | null,
  emails: ExtractedEmail[],
  people: ExtractedPerson[]
): EmailPatternInference {
  if (!domain) return { pattern: null, supportingEmails: [], confidence: 0 }

  const votes = new Map<EmailPattern, { count: number; supportingEmails: string[] }>()

  for (const hit of emails) {
    if (isGenericInboxEmail(hit.email)) continue
    if (getDomainFromEmail(hit.email) !== domain) continue

    const linkedPerson = findLinkedExtractedPerson(hit, people)
    const pattern = detectPatternForName(hit.email, linkedPerson?.name ?? hit.name)
    if (!pattern) continue

    const current = votes.get(pattern) ?? { count: 0, supportingEmails: [] }
    current.count += 1
    current.supportingEmails.push(hit.email)
    votes.set(pattern, current)
  }

  const sorted = [...votes.entries()].sort((a, b) => b[1].count - a[1].count)
  const winner = sorted[0]
  if (!winner) return { pattern: null, supportingEmails: [], confidence: 0 }

  const totalVotes = sorted.reduce((sum, [, value]) => sum + value.count, 0)
  return {
    pattern: winner[0],
    supportingEmails: [...new Set(winner[1].supportingEmails)],
    confidence: totalVotes > 0 ? winner[1].count / totalVotes : 0,
  }
}

function mergeIdentities(existingContacts: ContactCandidate[], crawlPeople: ExtractedPerson[], reconContacts: ReconIdentity[]) {
  const merged: ReconIdentity[] = []
  const seen = new Set<string>()

  const push = (contact: ReconIdentity) => {
    const roleTitle = contact.roleTitle ?? ""
    const name = contact.name ?? ""
    const email = contact.email ?? ""
    const linkedinUrl = contact.linkedinUrl ?? ""
    const key = `${name.toLowerCase()}|${roleTitle.toLowerCase()}|${email.toLowerCase()}|${linkedinUrl.toLowerCase()}`
    if (!key.replace(/\|/g, "")) return
    if (seen.has(key)) return
    seen.add(key)
    merged.push(contact)
  }

  for (const contact of existingContacts) {
    if (contact.name || contact.roleTitle || contact.email || contact.linkedinUrl) {
      push(contact)
    }
  }
  for (const person of crawlPeople) {
    push({
      name: person.name,
      roleTitle: person.roleTitle,
      email: person.email,
      linkedinUrl: person.linkedinUrl,
      sourceEvidence: person.evidence,
      sourceUrl: person.sourceUrl,
      confidenceScore: 0.72,
    })
  }
  for (const contact of reconContacts) {
    push(contact)
  }

  return merged.filter((contact) => !!contact.roleTitle && isLeadershipRole(contact.roleTitle))
}

function buildEvidenceAndStatus(contact: ReconIdentity, matchingEmail: ExtractedEmail | null, inferredEmail: string | null) {
  if (matchingEmail) {
    const contextualMatch = !!(matchingEmail.name || matchingEmail.roleTitle)
    return {
      email: matchingEmail.email,
      emailStatus: "public" as EmailStatus,
      emailEvidenceLevel: contextualMatch ? "public_same_domain" as EmailEvidenceLevel : "public_exact" as EmailEvidenceLevel,
      sourceEvidence:
        contextualMatch
          ? `${matchingEmail.evidence}. Matched to ${contact.name || contact.roleTitle} from nearby context.`
          : matchingEmail.evidence,
      sourceUrl: matchingEmail.sourceUrl,
      verified: true,
    }
  }

  if (inferredEmail) {
    return {
      email: inferredEmail,
      emailStatus: "inferred" as EmailStatus,
      emailEvidenceLevel: "pattern_inferred" as EmailEvidenceLevel,
      sourceEvidence: contact.sourceEvidence ?? "Executive email inferred from a public company email pattern.",
      sourceUrl: contact.sourceUrl ?? null,
      verified: false,
    }
  }

  return {
    email: contact.email ?? null,
    emailStatus: contact.email ? ("public" as EmailStatus) : ("unverified" as EmailStatus),
    emailEvidenceLevel: contact.email ? ("public_exact" as EmailEvidenceLevel) : null,
    sourceEvidence: contact.sourceEvidence ?? "Executive identified during recon.",
    sourceUrl: contact.sourceUrl ?? null,
    verified: !!contact.email,
  }
}

function computeConfidence(
  contact: ReconIdentity,
  emailEvidenceLevel: EmailEvidenceLevel | null,
  patternConfidence: number
) {
  const base = contact.confidenceScore ?? 0.55
  if (emailEvidenceLevel === "public_exact") return Math.max(base, 0.9)
  if (emailEvidenceLevel === "public_same_domain") return Math.max(base, 0.82)
  if (emailEvidenceLevel === "pattern_inferred") return Math.max(Math.min(base, 0.78), patternConfidence * 0.75)
  return base
}

async function upsertExecutiveContact(
  companyId: string,
  domain: string | null,
  pattern: EmailPattern | null,
  patternConfidence: number,
  identity: ReconIdentity,
  emails: ExtractedEmail[]
) {
  const parts = normalizeName(identity.name)
  const inferredLocalPart = parts && pattern ? buildLocalPart(parts, pattern) : null
  const inferredEmail =
    !identity.email && inferredLocalPart && domain && !isGenericInboxEmail(inferredLocalPart)
      ? `${inferredLocalPart}@${domain}`
      : null

  const matchingEmail =
    emails.find((hit) => identity.email && hit.email === identity.email) ??
    emails.find((hit) => {
      if (!identity.name) return false
      const matchesName = hit.name?.toLowerCase() === identity.name.toLowerCase() || hit.nearbyText.toLowerCase().includes(identity.name.toLowerCase())
      const matchesRole = identity.roleTitle ? hit.nearbyText.toLowerCase().includes(identity.roleTitle.toLowerCase()) : false
      return matchesName || matchesRole
    }) ??
    null

  const evidence = buildEvidenceAndStatus(identity, matchingEmail, inferredEmail)
  const confidenceScore = computeConfidence(identity, evidence.emailEvidenceLevel ?? null, patternConfidence)
  const isGenericInbox = isGenericInboxEmail(evidence.email)

  const candidate: ContactCandidate = {
    name: identity.name,
    roleTitle: identity.roleTitle,
    email: evidence.email,
    linkedinUrl: identity.linkedinUrl,
    sourceUrl: evidence.sourceUrl,
    sourceEvidence: evidence.sourceEvidence,
    verified: evidence.verified,
    isGenericInbox,
    isPrimaryDecisionMaker: true,
    confidenceScore,
    contactType: matchingEmail ? "executive_enriched" : inferredEmail ? "executive_inferred" : "operator_recon",
    emailStatus: evidence.emailStatus,
    emailEvidenceLevel: evidence.emailEvidenceLevel ?? undefined,
    emailPattern: pattern ?? undefined,
  }

  const identityClauses = [
    ...(candidate.email ? [{ email: candidate.email }] : []),
    ...(candidate.linkedinUrl ? [{ linkedinUrl: candidate.linkedinUrl }] : []),
    ...(candidate.name ? [{ name: candidate.name }] : []),
  ]

  const existing = identityClauses.length
    ? await db.contact.findFirst({
        where: {
          companyId,
          OR: identityClauses,
        },
      })
    : null

  const updateData = {
    name: candidate.name ?? undefined,
    roleTitle: candidate.roleTitle ?? undefined,
    email: existing?.email || candidate.email,
    linkedinUrl: existing?.linkedinUrl || candidate.linkedinUrl,
    sourceUrl: existing?.sourceUrl || candidate.sourceUrl,
    sourceEvidence: existing?.sourceEvidence || candidate.sourceEvidence,
    verified: existing?.verified || candidate.verified || false,
    isGenericInbox,
    isPrimaryDecisionMaker: true,
    confidenceScore: Math.max(existing?.confidenceScore ?? 0, candidate.confidenceScore ?? 0),
    contactType: candidate.contactType,
    emailStatus: existing?.emailStatus || candidate.emailStatus || null,
    emailEvidenceLevel: existing?.emailEvidenceLevel || candidate.emailEvidenceLevel || null,
    emailPattern: candidate.emailPattern ?? existing?.emailPattern ?? null,
    contactTier: getContactTier(candidate),
    outreachRecommendation: getOutreachRecommendation(candidate),
  }

  if (existing) {
    return db.contact.update({
      where: { id: existing.id },
      data: updateData,
    })
  }

  return db.contact.create({
    data: {
      companyId,
      ...updateData,
    },
  })
}

export async function enrichExecutiveContacts(
  companyId: string,
  websiteUrl: string | null,
  domain: string | null,
  reconContacts: ReconIdentity[]
) {
  const companyContacts = await db.contact.findMany({ where: { companyId } })
  const crawlResult = websiteUrl ? await crawlCompanyWebsite(websiteUrl) : emptyCrawlResult()
  const normalizedDomain =
    normalizeDomain(domain) ??
    domainFromUrl(websiteUrl)

  const identities = mergeIdentities(companyContacts, crawlResult.people, reconContacts)
  const patternInference = inferEmailPattern(normalizedDomain, crawlResult.emails, crawlResult.people)

  const saved = []
  for (const identity of identities) {
    const result = await upsertExecutiveContact(
      companyId,
      normalizedDomain,
      patternInference.pattern,
      patternInference.confidence,
      identity,
      crawlResult.emails
    )
    saved.push(result)
  }

  return {
    contacts: saved,
    crawlResult,
    patternInference,
  }
}

function emptyCrawlResult(): CompanyCrawlResult {
  return { pages: [], emails: [], people: [], contactPages: [], linkedinUrls: [] }
}

export async function persistCrawlContacts(companyId: string, crawlResult: CompanyCrawlResult) {
  for (const hit of crawlResult.emails.slice(0, 8)) {
    const exists = await db.contact.findFirst({
      where: { companyId, email: hit.email },
    })
    if (exists) continue

    const candidate: ContactCandidate = {
      name: hit.name,
      roleTitle: hit.roleTitle,
      email: hit.email,
      sourceUrl: hit.sourceUrl,
      sourceEvidence: hit.evidence,
      verified: true,
      isGenericInbox: hit.isGenericInbox,
      isPrimaryDecisionMaker: !!hit.roleTitle && isLeadershipRole(hit.roleTitle),
      confidenceScore: hit.name || hit.roleTitle ? 0.82 : hit.isGenericInbox ? 0.6 : 0.74,
      contactType: hit.name || hit.roleTitle ? "public_staff_email" : "extracted",
      emailStatus: "public",
      emailEvidenceLevel: hit.name || hit.roleTitle ? "public_same_domain" : "public_exact",
    }

    await db.contact.create({
      data: {
        companyId,
        name: candidate.name ?? undefined,
        roleTitle: candidate.roleTitle ?? undefined,
        email: candidate.email ?? undefined,
        sourceUrl: candidate.sourceUrl ?? undefined,
        sourceEvidence: candidate.sourceEvidence ?? undefined,
        verified: candidate.verified ?? false,
        isGenericInbox: candidate.isGenericInbox ?? false,
        isPrimaryDecisionMaker: candidate.isPrimaryDecisionMaker ?? false,
        confidenceScore: candidate.confidenceScore ?? undefined,
        contactType: candidate.contactType ?? undefined,
        emailStatus: candidate.emailStatus ?? undefined,
        emailEvidenceLevel: candidate.emailEvidenceLevel ?? undefined,
        emailPattern: candidate.emailPattern ?? undefined,
        contactTier: getContactTier(candidate),
        outreachRecommendation: getOutreachRecommendation(candidate),
      },
    })
  }

  for (const person of crawlResult.people) {
    const exists = await db.contact.findFirst({
      where: {
        companyId,
        OR: [
          { name: person.name, roleTitle: person.roleTitle },
          ...(person.linkedinUrl ? [{ linkedinUrl: person.linkedinUrl }] : []),
        ],
      },
    })
    if (exists) continue

    const candidate: ContactCandidate = {
      name: person.name,
      roleTitle: person.roleTitle,
      email: person.email,
      linkedinUrl: person.linkedinUrl,
      sourceUrl: person.sourceUrl,
      sourceEvidence: person.evidence,
      verified: !!person.email,
      isGenericInbox: isGenericInboxEmail(person.email),
      isPrimaryDecisionMaker: true,
      confidenceScore: person.email ? 0.84 : 0.7,
      contactType: "website_exec",
      emailStatus: person.email ? "public" : "unverified",
      emailEvidenceLevel: person.email ? "public_same_domain" : undefined,
    }

    await db.contact.create({
      data: {
        companyId,
        name: candidate.name ?? undefined,
        roleTitle: candidate.roleTitle ?? undefined,
        email: candidate.email ?? undefined,
        linkedinUrl: candidate.linkedinUrl ?? undefined,
        sourceUrl: candidate.sourceUrl ?? undefined,
        sourceEvidence: candidate.sourceEvidence ?? undefined,
        verified: candidate.verified ?? false,
        isGenericInbox: candidate.isGenericInbox ?? false,
        isPrimaryDecisionMaker: candidate.isPrimaryDecisionMaker ?? false,
        confidenceScore: candidate.confidenceScore ?? undefined,
        contactType: candidate.contactType ?? undefined,
        emailStatus: candidate.emailStatus ?? undefined,
        emailEvidenceLevel: candidate.emailEvidenceLevel ?? undefined,
        contactTier: getContactTier(candidate),
        outreachRecommendation: getOutreachRecommendation(candidate),
      },
    })
  }

  const primaryContactPage = crawlResult.contactPages[0]
  if (primaryContactPage) {
    const exists = await db.contact.findFirst({
      where: { companyId, contactType: "contact_page", sourceUrl: primaryContactPage },
    })
    if (!exists) {
      const candidate: ContactCandidate = {
        name: "Contact Form",
        sourceUrl: primaryContactPage,
        sourceEvidence: `Contact page discovered while scanning ${primaryContactPage}`,
        verified: true,
        confidenceScore: 0.55,
        contactType: "contact_page",
      }

      await db.contact.create({
        data: {
          companyId,
          name: candidate.name ?? undefined,
          sourceUrl: candidate.sourceUrl ?? undefined,
          sourceEvidence: candidate.sourceEvidence ?? undefined,
          verified: candidate.verified ?? false,
          confidenceScore: candidate.confidenceScore ?? undefined,
          contactType: candidate.contactType ?? undefined,
          contactTier: "tier_3",
          outreachRecommendation: "manual_review",
        },
      })
    }
  }
}
