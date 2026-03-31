"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

async function assertSuperAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const role = (session.user as any).role
  if (role !== "super_admin") {
    throw new Error("Forbidden")
  }

  return session.user.id
}

async function deleteLeadRecord(leadId: string, actorId: string) {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: {
      company: {
        include: {
          leads: { select: { id: true } },
        },
      },
    },
  })

  if (!lead) return

  const deletionNote =
    lead.company.leads.filter((candidate) => candidate.id !== leadId).length === 0
      ? "Lead and orphaned company intel removed"
      : "Lead intel removed"

  await db.leadActivityLog.create({
    data: {
      leadId,
      actorId,
      actionType: "LEAD_INTEL_DELETE_REQUESTED",
      newValue: deletionNote,
    },
  }).catch(() => {
      // Best-effort audit entry.
    })

  await db.researchResult.updateMany({
    where: { leadId },
    data: { leadId: null },
  })

  await db.lead.delete({
    where: { id: leadId },
  })

  const remainingLeadIds = lead.company.leads
    .map((candidate) => candidate.id)
    .filter((id) => id !== leadId)

  if (remainingLeadIds.length === 0) {
    await db.researchResult.updateMany({
      where: { companyId: lead.companyId },
      data: { companyId: null },
    })

    await db.company.delete({
      where: { id: lead.companyId },
    })
  }
}

export async function deleteLeadIntel(leadId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const actorId = await assertSuperAdmin()
    await deleteLeadRecord(leadId, actorId)
    revalidatePath("/admin/leads")
    revalidatePath("/admin/outreach")
    revalidatePath("/admin/companies")
    revalidatePath("/admin/research")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete lead intel" }
  }
}

export async function bulkDeleteLeadIntel(leadIds: string[]): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const actorId = await assertSuperAdmin()
    const uniqueIds = [...new Set(leadIds.filter(Boolean))]

    for (const leadId of uniqueIds) {
      await deleteLeadRecord(leadId, actorId)
    }

    revalidatePath("/admin/leads")
    revalidatePath("/admin/outreach")
    revalidatePath("/admin/companies")
    revalidatePath("/admin/research")
    return { success: true, count: uniqueIds.length }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to bulk delete lead intel" }
  }
}

export async function deleteFilteredLeadIntel(memberId: string): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const actorId = await assertSuperAdmin()
    const leads = await db.lead.findMany({
      where: {
        OR: [
          { ownerId: memberId },
          { company: { createdById: memberId } },
        ],
      },
      select: { id: true },
    })

    for (const lead of leads) {
      await deleteLeadRecord(lead.id, actorId)
    }

    revalidatePath("/admin/leads")
    revalidatePath("/admin/outreach")
    revalidatePath("/admin/companies")
    revalidatePath("/admin/research")
    return { success: true, count: leads.length }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete current filter intel" }
  }
}
