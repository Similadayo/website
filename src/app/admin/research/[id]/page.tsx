import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { AutoRefresh } from "@/components/admin/AutoRefresh"
import { deleteResearchSession } from "../actions"
import { formatAdminTimestamp, getRelativeDayLabel } from "@/lib/datetime"
import { hasLeadBeenReachedOutTo } from "@/lib/outreach/status"
import { AlertCircle, ArrowLeft, CheckCircle2, Copy, Loader2, Radar, Trash2, XCircle } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ResearchSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userSession = await auth()
  if (!userSession?.user?.id) redirect("/login")

  const isSuperAdmin = (userSession.user as any).role === "super_admin"
  const session = await db.researchSession.findFirst({
    where: { id },
    include: {
      results: { orderBy: { id: "asc" } },
      user: { select: { name: true, email: true } },
    },
  })

  if (!session) return notFound()
  if (!isSuperAdmin && session.userId !== userSession.user.id) return notFound()

  const isRunning = session.status === "running" || session.status === "pending"
  const processedCount = session.totalAnalyzed + session.totalSkipped
  const progress = session.totalFound > 0 ? Math.round((processedCount / session.totalFound) * 100) : 0

  const leadIds = session.results.map((result: any) => result.leadId).filter(Boolean)
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
  const reachedOutCount = session.results.filter((result: any) => result.leadId && reachedOutLeadIds.has(result.leadId)).length

  return (
    <div className="space-y-6">
      {isRunning && <AutoRefresh intervalMs={4000} />}

      <section className="admin-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Link href="/admin/research" className="admin-pill admin-pill-neutral">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            <div>
              <p className="admin-eyebrow">Research Session</p>
              <h1 className="admin-section-title mt-3">
                {session.niche} in {session.region}
              </h1>
              <p className="admin-section-copy mt-4">
                Started {getRelativeDayLabel(session.createdAt)} at {formatAdminTimestamp(session.createdAt)}
                {session.user?.name ? ` • ${session.user.name}` : ""}
              </p>
              {session.completedAt && <p className="mt-2 text-sm text-[color:var(--admin-soft-text)]">Completed {formatAdminTimestamp(session.completedAt)}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <SessionStatusBadge status={session.status} />
            {isSuperAdmin && (
              <form action={deleteResearchSession.bind(null, session.id)}>
                <button type="submit" className="admin-pill admin-pill-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr] lg:items-center">
          <div className="flex justify-center">
            <div className="relative">
              <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#ddd6cc" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={session.status === "failed" ? "#b64b3b" : "#2457f5"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold tracking-tight text-[color:var(--admin-ink)]">{progress}%</span>
                <span className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">{session.status}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Found" value={session.totalFound} />
            <Metric label="Analyzed" value={session.totalAnalyzed} />
            <Metric label="Reached Out" value={reachedOutCount} />
          </div>
        </div>

        {session.status === "failed" && session.error && (
          <div className="mt-5 rounded-[20px] border border-[color:var(--admin-danger)]/20 bg-[color:var(--admin-danger-soft)] p-4 text-sm text-[color:var(--admin-ink)]">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-[color:var(--admin-danger)]" />
              <span>{session.error}</span>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        {session.results.length === 0 ? (
          <div className="admin-card p-6">
            <p className="text-xl font-semibold text-[color:var(--admin-ink)]">No results captured yet.</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">Discovered companies will appear here as the session progresses.</p>
          </div>
        ) : (
          session.results.map((result: any) => (
            <div key={result.id} className="admin-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <ResultIcon status={result.status} />
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-[color:var(--admin-ink)]">{result.name}</p>
                    <p className="mt-1 text-sm text-[color:var(--admin-soft-text)]">{result.domain ?? "No domain captured"}</p>
                    {result.note && <p className="mt-2 text-sm text-[color:var(--admin-warning)]">{result.note}</p>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {result.leadId && reachedOutLeadIds.has(result.leadId) && <span className="admin-pill admin-pill-success">Reached Out</span>}
                  {result.status === "created" && result.leadId && (
                    <Link href={`/admin/leads/${result.leadId}`} className="admin-pill admin-pill-accent">
                      View Lead
                    </Link>
                  )}
                  {result.status === "duplicate" && <span className="admin-pill admin-pill-neutral">Duplicate</span>}
                  {result.status === "failed" && <span className="admin-pill admin-pill-danger">Failed</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {session.status === "completed" && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/admin/leads" className="flex items-center justify-center rounded-full bg-[color:var(--admin-accent)] px-6 py-3 text-sm font-bold text-white">
            View All Leads
          </Link>
          <Link href="/admin/outreach" className="flex items-center justify-center rounded-full border border-[color:var(--admin-border)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--admin-ink)]">
            Go To Outreach
          </Link>
        </div>
      )}
    </div>
  )
}

function SessionStatusBadge({ status }: { status: string }) {
  if (status === "completed") return <span className="admin-pill admin-pill-success"><CheckCircle2 className="h-3.5 w-3.5" />Completed</span>
  if (status === "running") return <span className="admin-pill admin-pill-accent"><Loader2 className="h-3.5 w-3.5 animate-spin" />Running</span>
  if (status === "failed") return <span className="admin-pill admin-pill-danger"><AlertCircle className="h-3.5 w-3.5" />Failed</span>
  return <span className="admin-pill admin-pill-neutral"><Radar className="h-3.5 w-3.5" />Pending</span>
}

function ResultIcon({ status }: { status: string }) {
  if (status === "created") return <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--admin-success-soft)] text-[color:var(--admin-success)]"><CheckCircle2 className="h-5 w-5" /></div>
  if (status === "duplicate") return <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--admin-card-strong)] text-[color:var(--admin-muted)]"><Copy className="h-5 w-5" /></div>
  return <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--admin-danger-soft)] text-[color:var(--admin-danger)]"><XCircle className="h-5 w-5" /></div>
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-[color:var(--admin-border)] bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--admin-ink)]">{value}</p>
    </div>
  )
}
