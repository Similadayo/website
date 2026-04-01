import { auth } from "@/auth"
import { db } from "@/lib/db"
import { formatAdminTimestamp, getRelativeDayLabel } from "@/lib/datetime"
import { hasLeadBeenReachedOutTo } from "@/lib/outreach/status"
import { Pagination } from "@/components/admin/Pagination"
import { ResearchStartButton } from "@/components/admin/ResearchStartButton"
import Link from "next/link"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  Target,
  Trash2,
} from "lucide-react"
import { deleteResearchSession } from "./actions"

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; page?: string }>
}) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const pageSize = 10

  const session = await auth()
  if (!session?.user?.id) return null

  const isSuperAdmin = (session.user as any).role === "super_admin"

  const [[pastSessions, totalSessions], assignment] = await Promise.all([
    Promise.all([
      db.researchSession.findMany({
        where: isSuperAdmin ? {} : { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { name: true, email: true } },
          results: true,
        },
      }),
      db.researchSession.count({
        where: isSuperAdmin ? {} : { userId: session.user.id },
      }),
    ]),
    db.assignment.findFirst({
      where: { userId: session.user.id, status: "active" },
    }),
  ])

  const leadIds = pastSessions.flatMap((researchSession: any) =>
    researchSession.results.map((result: any) => result.leadId).filter(Boolean)
  )
  const reachedOutLeads = leadIds.length
    ? await db.lead.findMany({
        where: { id: { in: leadIds } },
        include: {
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
    : []

  const reachedOutLeadIds = new Set(
    reachedOutLeads.filter((lead: any) => hasLeadBeenReachedOutTo(lead)).map((lead: any) => lead.id)
  )

  const hasKey = !!(process.env.SERPER_API_KEY || process.env.OPENAI_API_KEY)

  return (
    <div className="space-y-8 animate-fadein">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Search className="w-8 h-8 text-black dark:text-white" /> Research Sessions
        </h1>
        <p className="text-gray-500 mt-1 font-medium italic">
          Auto-discover companies in your assigned region and feed directly into the pipeline.
        </p>
      </div>

      {params.error === "no_search_key" && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 text-sm text-red-700 dark:text-red-400 flex items-center gap-3 font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          No search API key found. Add <code className="bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded text-red-900 dark:text-red-300">SERPER_API_KEY</code> to your <code className="bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded text-red-900 dark:text-red-300">.env</code>.
        </div>
      )}

      {params.error === "no_assignment" && (!assignment || (!assignment.niche && !assignment.region)) && (
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-6 text-sm text-orange-700 dark:text-orange-300 flex items-center gap-3 font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          No active assignment found for this user.
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm p-10 group">
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-8 uppercase tracking-widest">Mission Briefing</h2>

        {!assignment || (!assignment.niche && !assignment.region) ? (
          <div className="text-sm font-medium text-gray-500 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
            <AlertCircle className="w-8 h-8 text-orange-400 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">No Operational Territory Assigned</p>
              <p className="mt-1 text-xs">Awaiting mission deployment from Command. Please contact an Administrator.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 border-t border-gray-50 dark:border-white/5 pt-10">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 px-1">Current Assignment</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white dark:text-black" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{assignment.niche || assignment.region}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Primary Operational Theater</p>
                </div>
              </div>
            </div>

            <ResearchStartButton disabled={!hasKey} />
          </div>
        )}
      </div>

      {pastSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden relative group">
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none lg:hidden z-10 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="px-8 py-6 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Activity History</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full md:min-w-[800px] divide-y divide-gray-50 dark:divide-white/5">
              {(pastSessions as any[]).map((researchSession: any) => {
                const reachedOutCount = researchSession.results.filter((result: any) => result.leadId && reachedOutLeadIds.has(result.leadId)).length

                return (
                  <div
                    key={researchSession.id}
                    className="flex items-center justify-between gap-4 px-8 py-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <Link
                      href={`/admin/research/${researchSession.id}`}
                      className="flex min-w-0 flex-1 items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-5 min-w-0">
                        <StatusIcon status={researchSession.status} />
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-blue-400 transition-colors truncate">
                            {researchSession.niche} in {researchSession.region}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">
                            {getRelativeDayLabel(researchSession.createdAt)} • {formatAdminTimestamp(researchSession.createdAt)}
                            {isSuperAdmin
                              ? ` • ${researchSession.user?.name || researchSession.user?.email || "Unknown member"}`
                              : ""}
                          </p>
                          {researchSession.completedAt && (
                            <p className="text-[10px] font-medium text-gray-400 mt-1">
                              Completed {formatAdminTimestamp(researchSession.completedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
                        <span className="hidden md:flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400" /><strong className="text-gray-900 dark:text-gray-300">{researchSession.totalAnalyzed}</strong> Discovery</span>
                        <span className="hidden md:flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><strong className="text-gray-900 dark:text-gray-300">{reachedOutCount}</strong> Reached Out</span>
                        <span className="hidden lg:flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" /><strong className="text-gray-900 dark:text-gray-300">{researchSession.totalSkipped}</strong> Filters</span>
                        <span className="text-black dark:text-white font-black opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          View Report →
                        </span>
                      </div>
                    </Link>
                    {isSuperAdmin && (
                      <form action={deleteResearchSession.bind(null, researchSession.id)}>
                        <button
                          type="submit"
                          title="Delete Research Session"
                          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500/30 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <Pagination totalItems={totalSessions} pageSize={pageSize} currentPage={currentPage} />
        </div>
      )}

      {pastSessions.length === 0 && assignment && (
        <div className="text-center py-24 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] text-gray-400 bg-white dark:bg-gray-900 shadow-sm">
          <Search className="w-16 h-16 mx-auto mb-6 text-gray-100 dark:text-white/5" />
          <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">System Ready</p>
          <p className="text-xs mt-2 font-medium italic">Initialize a new search to discover target accounts.</p>
        </div>
      )}
    </div>
  )
}

function StatusIcon({ status }: { status: string }) {
  if (status === "completed") return <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-green-600 dark:text-green-400"><CheckCircle2 className="w-5 h-5" /></div>
  if (status === "running") return <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg dark:shadow-none animate-pulse"><Loader2 className="w-5 h-5 animate-spin" /></div>
  if (status === "failed") return <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400"><AlertCircle className="w-5 h-5" /></div>
  return <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500"><Clock className="w-5 h-5" /></div>
}
