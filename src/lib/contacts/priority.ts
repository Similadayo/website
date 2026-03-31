const LEADERSHIP_ROLE_PATTERN =
  /\b(founder|co[- ]?founder|ceo|chief executive|coo|chief operating|managing director|director|head of operations|operations manager|owner|principal|head of recruiting|talent lead)\b/i

const GENERIC_INBOX_PATTERN =
  /^(info|hello|contact|sales|team|support|admin|office|careers|jobs|hi|enquiries|enquiry|inquiries|inquiry)\b/i

export type ContactCandidate = {
  id?: string | null
  name?: string | null
  roleTitle?: string | null
  email?: string | null
  linkedinUrl?: string | null
  sourceUrl?: string | null
  sourceEvidence?: string | null
  verified?: boolean | null
  isGenericInbox?: boolean | null
  isPrimaryDecisionMaker?: boolean | null
  contactTier?: string | null
  outreachRecommendation?: string | null
  confidenceScore?: number | null
  contactType?: string | null
}

export function isLeadershipRole(role?: string | null) {
  return !!role && LEADERSHIP_ROLE_PATTERN.test(role)
}

export function isGenericInboxEmail(email?: string | null) {
  if (!email) return false
  const [localPart] = email.toLowerCase().split("@")
  return GENERIC_INBOX_PATTERN.test(localPart ?? "")
}

export function getContactTier(contact: ContactCandidate) {
  const hasEmail = !!contact.email
  const leadership = !!contact.isPrimaryDecisionMaker || isLeadershipRole(contact.roleTitle)
  const genericInbox = !!contact.isGenericInbox || isGenericInboxEmail(contact.email)
  const hasProfileOrRoute = !!contact.linkedinUrl || !!contact.sourceUrl

  if (leadership && hasEmail && !genericInbox) return "tier_1"
  if (leadership && hasProfileOrRoute) return "tier_2"
  if (hasEmail || hasProfileOrRoute) return "tier_3"
  return "tier_4"
}

export function getOutreachRecommendation(contact: ContactCandidate) {
  const tier = getContactTier(contact)

  if (tier === "tier_1") return "personalized_email"
  if (tier === "tier_2") return contact.linkedinUrl ? "linkedin_or_manual_review" : "manual_review"
  if (tier === "tier_3") return contact.email ? "generic_inbox_fallback" : "manual_review"
  return "skip"
}

export function formatOutreachRecommendation(recommendation?: string | null) {
  if (!recommendation) return "unknown"
  return recommendation.replace(/_/g, " ")
}

export function isEmailDispatchReady(recommendation?: string | null) {
  return recommendation === "personalized_email" || recommendation === "generic_inbox_fallback"
}

export function requiresManualContactReview(recommendation?: string | null) {
  return !isEmailDispatchReady(recommendation)
}

function numericTier(tier: string) {
  if (tier === "tier_1") return 1
  if (tier === "tier_2") return 2
  if (tier === "tier_3") return 3
  return 4
}

function contactScore(contact: ContactCandidate) {
  const tier = getContactTier(contact)
  const leadership = !!contact.isPrimaryDecisionMaker || isLeadershipRole(contact.roleTitle)
  const hasEmail = !!contact.email
  const genericInbox = !!contact.isGenericInbox || isGenericInboxEmail(contact.email)
  const verified = !!contact.verified
  const confidence = contact.confidenceScore ?? 0

  return (
    (5 - numericTier(tier)) * 100 +
    (leadership ? 35 : 0) +
    (hasEmail ? 20 : 0) +
    (verified ? 15 : 0) +
    (genericInbox ? -15 : 0) +
    confidence * 10
  )
}

export function rankContacts<T extends ContactCandidate>(contacts: T[]) {
  return [...contacts].sort((a, b) => contactScore(b) - contactScore(a))
}

export function pickBestOutreachContact<T extends ContactCandidate>(contacts: T[]) {
  return rankContacts(contacts)[0] || null
}

export function getLeadContactStrategy<T extends ContactCandidate>(contacts: T[]) {
  const ranked = rankContacts(contacts)
  const bestContact = ranked[0] || null
  const fallbackContact =
    ranked.find((contact) => !!contact.email && (contact.isGenericInbox || isGenericInboxEmail(contact.email))) ||
    ranked.find((contact) => !!contact.email && contact !== bestContact) ||
    null

  const primarySendContact =
    ranked.find((contact) => getContactTier(contact) === "tier_1" && !!contact.email) ||
    fallbackContact ||
    ranked.find((contact) => !!contact.email) ||
    null

  const recommendation =
    primarySendContact ? getOutreachRecommendation(primarySendContact) :
    bestContact ? getOutreachRecommendation(bestContact) :
    "skip"

  const coverageStatus =
    bestContact && getContactTier(bestContact) === "tier_1" ? "high" :
    bestContact && getContactTier(bestContact) === "tier_2" ? "medium" :
    primarySendContact ? "low" :
    "missing"

  const reason =
    bestContact && getContactTier(bestContact) === "tier_1"
      ? "Named decision-maker with a usable work email."
      : bestContact && getContactTier(bestContact) === "tier_2" && fallbackContact?.email
        ? "Named operator found, but no direct email. Use the company inbox as fallback."
        : bestContact && getContactTier(bestContact) === "tier_2"
          ? "Named operator found, but outreach likely needs LinkedIn or manual follow-up."
          : primarySendContact?.email
            ? "No named operator email was found, so the safest route is the public company contact."
            : "No credible outreach route has been verified yet."

  return {
    ranked,
    bestContact,
    fallbackContact,
    primarySendContact,
    recommendation,
    coverageStatus,
    reason,
  }
}
