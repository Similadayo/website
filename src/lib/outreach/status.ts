export type LeadOutreachLike = {
  stage?: string | null
  threads?: Array<{
    messages?: Array<{
      sentAt?: Date | string | null
    }>
  }>
}

export function hasLeadBeenReachedOutTo(lead: LeadOutreachLike | null | undefined) {
  if (!lead) return false
  if (lead.stage === "contacted") return true

  return !!lead.threads?.some((thread) =>
    thread.messages?.some((message) => !!message.sentAt)
  )
}
