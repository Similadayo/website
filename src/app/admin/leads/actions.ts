"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateLeadStage(leadId: string, stage: string, rejectionReason?: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const lead = await db.lead.update({
    where: { id: leadId },
    data: {
      stage,
      rejectionReason: rejectionReason || null,
      approvedById: stage === "approved" ? session.user.id : null,
      approvedAt: stage === "approved" ? new Date() : null,
    }
  })

  // Log activity
  await db.leadActivityLog.create({
    data: {
      leadId,
      actorId: session.user.id,
      actionType: "STAGE_CHANGE",
      newValue: stage
    }
  })

  revalidatePath("/admin/leads")
  revalidatePath(`/admin/leads/${leadId}`)
  
  return { success: true }
}
