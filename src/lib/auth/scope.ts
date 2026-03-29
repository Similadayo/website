import { auth } from "@/auth"
import { db } from "@/lib/db"

export type DashboardScope = {
  isSuperAdmin: boolean
  userId: string
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
export async function getAccessScope(): Promise<DashboardScope> {
  const session = await auth()
  
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

  // Researchers see only their assigned territory
  // We check BOTH direct ownership (createdById/ownerId) AND matching location/niche
  const scopedFilter = {
    OR: [
      { ownerId: userId },
      { company: { createdById: userId } },
      ...(territory?.region || territory?.niche ? [{
        company: {
          AND: [
            territory.region ? { location: { contains: territory.region } } : {},
            territory.niche ? { niche: { contains: territory.niche } } : {},
          ]
        }
      }] : [])
    ]
  }

  // For companies directly
  const companiesScopedFilter = {
    OR: [
      { createdById: userId },
      ...(territory?.region || territory?.niche ? [{
        AND: [
          territory.region ? { location: { contains: territory.region } } : {},
          territory.niche ? { niche: { contains: territory.niche } } : {},
        ]
      }] : [])
    ]
  }

  return {
    isSuperAdmin: false,
    userId,
    territory,
    leadsFilter: scopedFilter,
    companiesFilter: companiesScopedFilter,
    researchFilter: { userId }, // researchers see their own research sessions
  }
}
