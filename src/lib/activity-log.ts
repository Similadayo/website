import { db } from "@/lib/db"

export type ActivityEntity = "lead" | "company" | "outreach" | "user"

export interface LogActivityArgs {
  entity:   ActivityEntity
  entityId: string
  actorId?: string
  action:   string
  metadata?: Record<string, unknown>
}

/**
 * Standard activity log writer.
 * All state changes in the system should go through this.
 */
export async function logActivity({
  entity,
  entityId,
  actorId,
  action,
  metadata,
}: LogActivityArgs): Promise<void> {
  // Map entity type to the correct id field for LeadActivityLog
  // (schema uses leadId — for now we log lead-entity events directly,
  //  others go into the metadata until a generic log table is added)
  if (entity === "lead") {
    await db.leadActivityLog.create({
      data: {
        leadId:     entityId,
        actorId:    actorId ?? null,
        actionType: action,
        newValue:   metadata ? JSON.stringify(metadata) : null,
      },
    })
  }
  // TODO: generic log table for company / outreach / user events in a future migration
}

/**
 * Convenience wrapper for lead stage changes.
 */
export async function logStageChange(args: {
  leadId:    string
  actorId?:  string
  from:      string
  to:        string
  reason?:   string
}): Promise<void> {
  await logActivity({
    entity:   "lead",
    entityId: args.leadId,
    actorId:  args.actorId,
    action:   "STAGE_CHANGE",
    metadata: {
      from:   args.from,
      to:     args.to,
      reason: args.reason ?? null,
    },
  })
}
