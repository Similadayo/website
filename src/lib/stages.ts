// All valid lead stages in the pipeline
export const LEAD_STAGES = [
  "new",
  "researching",
  "analyzed",
  "pending_review",
  "approved",
  "rejected",
  "outreach_ready",
  "contacted",
  "replied",
  "follow_up_due",
  "booked_call",
  "closed_won",
  "closed_lost",
] as const

export type LeadStage = (typeof LEAD_STAGES)[number]

// Strict allowed transitions — key = current stage, value = stages it can move to
export const ALLOWED_TRANSITIONS: Record<LeadStage, LeadStage[]> = {
  new:            ["researching", "rejected"],
  researching:    ["analyzed", "rejected"],
  analyzed:       ["pending_review", "rejected"],
  pending_review: ["approved", "rejected", "researching"],
  approved:       ["outreach_ready", "rejected"],
  rejected:       [], // terminal — must be manually overridden by admin
  outreach_ready: ["contacted"],
  contacted:      ["follow_up_due", "replied", "closed_lost"],
  replied:        ["booked_call", "follow_up_due", "closed_lost"],
  follow_up_due:  ["contacted", "replied", "closed_lost"],
  booked_call:    ["closed_won", "closed_lost"],
  closed_won:     [], // terminal
  closed_lost:    [], // terminal
}

export function isValidTransition(from: string, to: string): boolean {
  const allowed = ALLOWED_TRANSITIONS[from as LeadStage] ?? []
  return allowed.includes(to as LeadStage)
}

export const STAGE_LABELS: Record<LeadStage, string> = {
  new:            "New",
  researching:    "In Research",
  analyzed:       "AI Analyzed",
  pending_review: "Pending Review",
  approved:       "Approved",
  rejected:       "Rejected",
  outreach_ready: "Outreach Ready",
  contacted:      "Contacted",
  replied:        "Replied",
  follow_up_due:  "Follow-up Due",
  booked_call:    "Booked Call",
  closed_won:     "Closed Won",
  closed_lost:    "Closed Lost",
}
