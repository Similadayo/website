const LEADERSHIP_ROLE_PATTERN =
  /\b(founder|co[- ]?founder|ceo|chief executive|coo|chief operating|managing director|director|head of operations|operations manager|owner|principal)\b/i

export function isLeadershipRole(role?: string | null) {
  return !!role && LEADERSHIP_ROLE_PATTERN.test(role)
}

export function pickBestOutreachContact<T extends { email?: string | null; roleTitle?: string | null }>(
  contacts: T[]
) {
  return (
    contacts.find((contact) => !!contact.email && isLeadershipRole(contact.roleTitle)) ||
    contacts.find((contact) => !!contact.email) ||
    contacts.find((contact) => isLeadershipRole(contact.roleTitle)) ||
    contacts[0] ||
    null
  )
}
