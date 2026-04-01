import Link from "next/link"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { formatAdminTimestamp, getRelativeDayLabel } from "@/lib/datetime"
import { hasLeadBeenReachedOutTo } from "@/lib/outreach/status"
import { Pagination } from "@/components/admin/Pagination"
import { ResearchStartButton } from "@/components/admin/ResearchStartButton"
import { deleteResearchSession } from "./actions"
import { AlertCircle, CheckCircle2, Clock, Loader2, Radar, Target, Trash2 } from "lucide-react"

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
      db.researchSession.count({ where: isSuperAdmin ? {} : { userId: session.user.id } }),
    ]),
    db.assignment.findFirst({ where: { userId: session.user.id, status: "active" } }),
  ])

  const leadIds = pastSessions.flatMap((session: any) => session.results.map((result: any) => result.leadId).filter(Boolean))
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

  const reachedOutLeadIds = new Set(reachedOutLeads.filter((lead: any) => hasLeadBeenReachedOutTo(lead)).map((lead: any) => lead.id))
  const hasKey = !!(process.env.SERPER_API_KEY || process.env.OPENAI_API_KEY)

  return (
    <div className="space-y-6">
      <section className="admin-card p-6 sm:p-8">
        <p className="admin-eyebrow">Research</p>
        <h1 className="admin-section-title mt-3 max-w-3xl">Launch discovery sessions that feed qualified accounts into the pipeline.</h1>
        <p className="admin-section-copy mt-4 max-w-2xl">
          Research is framed as an active operational sprint: territory, live run state, output quality, and downstream outreach impact.
        </p>

        {(params.error === "no_search_key" || (params.error === "no_assignment" && (!assignment || (!assignment.niche && !assignment.region)))) && (
          <div className="mt-6 rounded-[24px] border border-[color:var(--admin-warning)]/20 bg-[color:var(--admin-warning-soft)] p-4 text-sm text-[color:var(--admin-ink)]">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-[color:var(--admin-warning)]" />
              <div>
                {params.error === "no_search_key" && <p>Add a search key such as <code>SERPER_API_KEY</code> to enable company discovery.</p>}
                {params.error === "no_assignment" && <p>This user needs an active region or niche assignment before a research run can start.</p>}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="rounded-[24px] bg-[color:var(--admin-card-strong)] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--admin-muted)]">Current assignment</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--admin-accent)] text-white">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">{assignment?.niche || assignment?.region || "No active territory"}</p>
                <p className="mt-1 text-sm text-[color:var(--admin-soft-text)]">
                  {assignment ? "This assignment will be used to frame your next search." : "Ask an administrator to assign a region or niche."}
                </p>
              </div>
            </div>
          </div>

          <ResearchStartButton disabled={!hasKey || !assignment || (!assignment.niche && !assignment.region)} />
        </div>
      </section>

      <section className="space-y-4">
        {pastSessions.length === 0 ? (
          <div className="admin-card p-6">
            <p className="text-xl font-semibold text-[color:var(--admin-ink)]">No research sessions yet.</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">
              Start a discovery run to generate companies, leads, and AI analysis for your current territory.
            </p>
          </div>
        ) : (
          pastSessions.map((researchSession: any) => {
            const reachedOutCount = researchSession.results.filter((result: any) => result.leadId && reachedOutLeadIds.has(result.leadId)).length
            return (
              <div key={researchSession.id} className="admin-card p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <Link href={`/admin/research/${researchSession.id}`} className="min-w-0 flex-1">
                    <div className="flex items-start gap-4">
                      <StatusIcon status={researchSession.status} />
                      <div className="min-w-0">
                        <p className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">
                          {researchSession.niche} in {researchSession.region}
                        </p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--admin-muted)]">
                          {getRelativeDayLabel(researchSession.createdAt)} • {formatAdminTimestamp(researchSession.createdAt)}
                          {isSuperAdmin ? ` • ${researchSession.user?.name || researchSession.user?.email || "Unknown member"}` : ""}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {isSuperAdmin && (
                    <form action={deleteResearchSession.bind(null, researchSession.id)}>
                      <button type="submit" className="admin-pill admin-pill-danger">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </form>
                  )}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <StatTile label="Analyzed" value={researchSession.totalAnalyzed} />
                  <StatTile label="Reached Out" value={reachedOutCount} />
                  <StatTile label="Skipped" value={researchSession.totalSkipped} />
                </div>
              </div>
            )
          })
        )}
      </section>

      <Pagination totalItems={totalSessions} pageSize={pageSize} currentPage={currentPage} />
    </div>
  )
}

function StatusIcon({ status }: { status: string }) {
  if (status === "completed") return <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--admin-success-soft)] text-[color:var(--admin-success)]"><CheckCircle2 className="h-5 w-5" /></div>
  if (status === "running") return <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]"><Loader2 className="h-5 w-5 animate-spin" /></div>
  if (status === "failed") return <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--admin-danger-soft)] text-[color:var(--admin-danger)]"><AlertCircle className="h-5 w-5" /></div>
  return <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--admin-card-strong)] text-[color:var(--admin-muted)]"><Clock className="h-5 w-5" /></div>
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[20px] bg-[color:var(--admin-card-strong)] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--admin-ink)]">{value}</p>
    </div>
  )
}
