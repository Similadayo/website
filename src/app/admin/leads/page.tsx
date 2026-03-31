import { db } from "@/lib/db"
import { Users } from "lucide-react"
import Link from "next/link"
import { Pagination } from "@/components/admin/Pagination"
import { getAccessScope } from "@/lib/auth/scope"
import { ExportLeadButton } from "@/components/admin/ExportLeadButton"
import { LeadPipelineTable } from "@/components/admin/LeadPipelineTable"
import { hasLeadBeenReachedOutTo } from "@/lib/outreach/status"

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string; member?: string }>
}) {
  const { page, sort = "created", order = "desc", member } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10

  const scope = await getAccessScope()
  const selectedMemberId = typeof member === "string" && member.trim() ? member : scope.userId

  const members = scope.isSuperAdmin
    ? await db.user.findMany({
        where: { active: true },
        orderBy: [{ role: "asc" }, { name: "asc" }],
        select: { id: true, name: true, email: true },
      })
    : []

  const sortMap: Record<string, any> = {
    name: { company: { name: order } },
    created: { createdAt: order },
    stage: { stage: order },
  }

  const isSpecialSort = sort === "fit"
  const leadsWhere = scope.isSuperAdmin
    ? {
        OR: [
          { ownerId: selectedMemberId },
          { company: { createdById: selectedMemberId } },
        ],
      }
    : scope.leadsFilter

  const allLeads = await db.lead.findMany({
    where: leadsWhere,
    orderBy: isSpecialSort ? undefined : (sortMap[sort] || { createdAt: "desc" }),
    include: {
      company: {
        include: {
          contacts: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      owner: {
        select: { id: true, name: true, email: true },
      },
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      threads: {
        include: {
          messages: {
            where: { sentAt: { not: null } },
            select: { sentAt: true },
            take: 1,
          },
        },
        take: 1,
      },
    },
  })

  if (sort === "fit") {
    allLeads.sort((a: any, b: any) => {
      const scoreA = a.analyses[0]?.fitScore ?? 0
      const scoreB = b.analyses[0]?.fitScore ?? 0
      return order === "asc" ? scoreA - scoreB : scoreB - scoreA
    })
  }

  const leadsWithOutreachStatus = allLeads.map((lead: any) => ({
    ...lead,
    hasBeenReachedOutTo: hasLeadBeenReachedOutTo(lead),
  }))

  const totalItems = leadsWithOutreachStatus.length
  const paginatedLeads = leadsWithOutreachStatus.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const selectedMember =
    scope.isSuperAdmin
      ? members.find((candidate) => candidate.id === selectedMemberId) ?? null
      : null
  const selectedMemberLabel =
    selectedMemberId === scope.userId
      ? "My Leads"
      : selectedMember?.name || selectedMember?.email || "Member Leads"

  const queryFor = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const entries = {
      sort,
      order,
      page: currentPage > 1 ? String(currentPage) : undefined,
      ...(scope.isSuperAdmin ? { member: selectedMemberId } : {}),
      ...next,
    }

    for (const [key, value] of Object.entries(entries)) {
      if (value) params.set(key, value)
    }

    const query = params.toString()
    return `/admin/leads${query ? `?${query}` : ""}`
  }

  return (
    <div className="space-y-8 animate-fadein pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white flex items-center gap-4">
            <Users className="w-10 h-10 text-black dark:text-white" />
            Lead Pipeline
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium italic">
            Analyze intelligence and approve accounts for prioritized outreach missions.
          </p>
        </div>
        <ExportLeadButton leads={leadsWithOutreachStatus} />
      </div>

      {scope.isSuperAdmin && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Lead Owner View</p>
              <p className="text-sm text-gray-500 mt-1">
                Super admins default to their own pipeline. Open another member&apos;s lead list only when needed.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={queryFor({ member: scope.userId, page: undefined })}
                className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                  selectedMemberId === scope.userId
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:text-black"
                }`}
              >
                My Leads
              </Link>
              {members
                .filter((candidate) => candidate.id !== scope.userId)
                .map((candidate) => (
                  <Link
                    key={candidate.id}
                    href={queryFor({ member: candidate.id, page: undefined })}
                    className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-colors ${
                      selectedMemberId === candidate.id
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white text-gray-500 hover:text-black"
                    }`}
                  >
                    {candidate.name || candidate.email || "Member"}
                  </Link>
                ))}
            </div>
            <p className="text-xs font-semibold text-gray-700">
              Showing: {selectedMemberLabel}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none lg:hidden z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <LeadPipelineTable
          leads={paginatedLeads as any[]}
          allFilteredLeadIds={leadsWithOutreachStatus.map((lead: any) => lead.id)}
          sort={sort}
          order={order}
          isSuperAdmin={scope.isSuperAdmin}
          currentUserId={scope.userId}
          selectedMemberId={selectedMemberId}
          totalFilteredCount={totalItems}
          currentFilterLabel={selectedMemberLabel}
        />
      </div>

      <Pagination totalItems={totalItems} pageSize={pageSize} currentPage={currentPage} />
    </div>
  )
}
