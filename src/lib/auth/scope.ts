import { getCachedAuth } from "@/auth"
import { db } from "@/lib/db"
import { cache } from "react"

export type DashboardScope = {
  isSuperAdmin: boolean
  userId: string
  role: string
  territory: {
    region: string | null
    niche: string | null
  } | null
  // Prisma "where" clauses for common models
  leadsFilter: any
  companiesFilter: any
  researchFilter: any
}

/**
 * Returns the data access scope for the current logged-in user.
 * This is the central source of truth for territory isolation.
 */
export const getAccessScope = cache(async (): Promise<DashboardScope> => {
  const session = await getCachedAuth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const userId = session.user.id
  const role = (session.user as any).role

  // Super admins see everything
  if (role === "super_admin") {
    return {
      isSuperAdmin: true,
      userId,
      role,
      territory: null,
      leadsFilter: {},
      companiesFilter: {},
      researchFilter: {},
    }
  }

  // Fetch the user's current assignment
  const assignment = await db.assignment.findFirst({
    where: { userId, status: "active" }
  })

  const territory = assignment ? {
    region: assignment.region,
    niche: assignment.niche
  } : null

  // Non-super-admins only see records they created/own.
  // Territory assignment governs what they are allowed to search for,
  // not shared read access into other operators' pipelines.
  const scopedFilter = {
    OR: [
      { ownerId: userId },
      { company: { createdById: userId } },
    ]
  }

  // For companies directly
  const companiesScopedFilter = {
    OR: [
      { createdById: userId },
    ]
  }

  return {
    isSuperAdmin: false,
    userId,
    role,
    territory,
    leadsFilter: scopedFilter,
    companiesFilter: companiesScopedFilter,
    researchFilter: { userId }, // researchers see their own research sessions
  }
})

export async function getScopedLeadWhere(id: string) {
  const scope = await getAccessScope()

  return scope.isSuperAdmin
    ? { id }
    : {
        AND: [
          { id },
          scope.leadsFilter,
        ],
      }
}
