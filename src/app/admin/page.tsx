import Link from "next/link"
import { getCachedAuth } from "@/auth"
import { db } from "@/lib/db"
import { getAccessScope } from "@/lib/auth/scope"
import { formatAdminTimestamp, getRelativeDayLabel } from "@/lib/datetime"
import { STAGE_LABELS } from "@/lib/stages"
import { getLeadContactStrategy } from "@/lib/contacts/priority"
import { hasLeadBeenReachedOutTo } from "@/lib/outreach/status"
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  MessageSquareReply,
  Radar,
  Send,
  Sparkles,
  Target,
} from "lucide-react"

export default async function AdminDashboardPage() {
  const session = await getCachedAuth()
  const scope = await getAccessScope()

  const [totalLeads, totalCompanies, activeResearch, pendingApprovals, sendReadyLeads, latestReplies, recentActivity] =
    await Promise.all([
      db.lead.count({ where: scope.leadsFilter }),
      db.company.count({ where: scope.companiesFilter }),
      db.researchSession.findFirst({
        where: {
          ...(scope.isSuperAdmin ? {} : scope.researchFilter),
          status: "running",
        },
        orderBy: { createdAt: "desc" },
      }),
      db.lead.findMany({
        where: {
          AND: [scope.leadsFilter, { stage: { in: ["pending_review", "analyzed"] } }],
        },
        include: {
          company: { include: { contacts: true } },
          analyses: { orderBy: { createdAt: "desc" }, take: 1 },
          owner: { select: { name: true, email: true } },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      db.lead.findMany({
        where: {
          AND: [scope.leadsFilter, { stage: { in: ["approved", "outreach_ready", "contacted", "replied"] } }],
        },
        include: {
          company: { include: { contacts: true } },
          threads: {
            include: {
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
            take: 1,
          },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      db.outreachMessage.findMany({
        where: {
          direction: "inbound",
          receivedAt: { not: null },
          thread: {
            lead: scope.leadsFilter,
          },
        },
        include: {
          thread: {
            include: {
              lead: {
                include: {
                  company: true,
                },
              },
            },
          },
        },
        take: 4,
        orderBy: { receivedAt: "desc" },
      }),
      db.leadActivityLog.findMany({
        where: {
          lead: scope.leadsFilter,
        },
        include: {
          lead: { include: { company: true } },
          actor: true,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ])

  const readyDrafts = sendReadyLeads.filter((lead: any) => lead.threads[0]?.messages[0] && !hasLeadBeenReachedOutTo(lead))

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="admin-card overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <span className="admin-pill admin-pill-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Today&apos;s command center
            </span>
            <h1 className="admin-section-title mt-5 max-w-3xl">
              {session?.user?.name || "Operator"}, your highest-value work is already sorted.
            </h1>
            <p className="admin-section-copy mt-4 max-w-2xl">
              Review approvals, dispatch the strongest drafts, and pick up live replies without bouncing between heavy admin pages.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/admin/leads" className="inline-flex items-center gap-2 rounded-full bg-[color:var(--admin-accent)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_36px_rgba(36,87,245,0.24)]">
                Open Pipeline
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/admin/research" className="inline-flex items-center gap-2 rounded-full border border-[color:var(--admin-border)] bg-white px-5 py-3 text-sm font-bold text-[color:var(--admin-ink)]">
                Start Research
                <Radar className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <MetricTile label="Leads in view" value={totalLeads} tone="accent" />
            <MetricTile label="Accounts tracked" value={totalCompanies} tone="neutral" />
            <MetricTile label="Awaiting approval" value={pendingApprovals.length} tone="warning" />
            <MetricTile label="Ready to send" value={readyDrafts.length} tone="success" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="admin-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="admin-eyebrow">Focus Queue</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--admin-ink)]">What needs your attention now</h2>
            </div>
            <Link href="/admin/outreach" className="admin-pill admin-pill-neutral">
              All queues
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            <QueueCard
              title="Review high-intent leads"
              description={`${pendingApprovals.length} leads are waiting for approval or final qualification.`}
              href="/admin/leads"
              icon={<Target className="h-4 w-4" />}
              tone="warning"
            />
            <QueueCard
              title="Send outreach drafts"
              description={`${readyDrafts.length} accounts already have a draft that can move today.`}
              href="/admin/outreach"
              icon={<Send className="h-4 w-4" />}
              tone="success"
            />
            <QueueCard
              title="Handle fresh replies"
              description={`${latestReplies.length} inbound replies need review, routing, or a next step.`}
              href="/admin/outreach/history?view=received"
              icon={<MessageSquareReply className="h-4 w-4" />}
              tone="accent"
            />
          </div>
        </div>

        <div className="admin-card p-5 sm:p-6">
          <p className="admin-eyebrow">Research Status</p>
          <div className="mt-4 rounded-[24px] bg-[color:var(--admin-card-strong)] p-5">
            {activeResearch ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="admin-pill admin-pill-accent">
                    <Radar className="h-3.5 w-3.5" />
                    Running
                  </span>
                  <span className="text-xs font-bold text-[color:var(--admin-soft-text)]">{getRelativeDayLabel(activeResearch.createdAt)}</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--admin-ink)]">
                  {activeResearch.niche} in {activeResearch.region}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">
                  {activeResearch.totalFound} found, {activeResearch.totalAnalyzed} analyzed, {activeResearch.totalSkipped} skipped.
                </p>
              </>
            ) : (
              <>
                <span className="admin-pill admin-pill-neutral">
                  <Clock3 className="h-3.5 w-3.5" />
                  No active run
                </span>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Start the next discovery sprint.</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">
                  Launch a new research session when you want fresh companies added to the active pipeline.
                </p>
              </>
            )}
          </div>

          <div className="mt-5 rounded-[24px] border border-[color:var(--admin-border)] bg-white p-5">
            <p className="text-sm font-semibold text-[color:var(--admin-ink)]">Assigned territory</p>
            <p className="mt-2 text-sm text-[color:var(--admin-soft-text)]">
              {scope.territory?.niche || scope.territory?.region
                ? `${scope.territory?.niche || "General"}${scope.territory?.region ? `, ${scope.territory.region}` : ""}`
                : "Global operator visibility"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="admin-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="admin-eyebrow">Approval Queue</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Strong leads worth reviewing next</h2>
            </div>
            <Link href="/admin/leads" className="text-sm font-semibold text-[color:var(--admin-accent)]">
              Open pipeline
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {pendingApprovals.length === 0 ? (
              <EmptyState title="No approvals waiting" body="When new AI-reviewed leads arrive, they will surface here first." />
            ) : (
              pendingApprovals.map((lead: any) => {
                const analysis = lead.analyses[0]
                const contactStrategy = getLeadContactStrategy(lead.company.contacts || [])

                return (
                  <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="block rounded-[24px] border border-[color:var(--admin-border)] bg-white p-4 transition-transform hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold tracking-tight text-[color:var(--admin-ink)]">{lead.company.name}</p>
                        <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-[color:var(--admin-muted)]">
                          {lead.company.niche || lead.company.domain || "Target account"}
                        </p>
                      </div>
                      <span className="admin-pill admin-pill-accent">{analysis?.fitScore ?? "?"}% fit</span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">
                      {analysis?.companySummary || "AI qualification pending. Open detail to review contact evidence and next actions."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="admin-pill admin-pill-warning">{STAGE_LABELS[lead.stage as keyof typeof STAGE_LABELS] || lead.stage}</span>
                      <span className="admin-pill admin-pill-neutral">{contactStrategy.coverageStatus} contact coverage</span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="admin-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="admin-eyebrow">Replies</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Latest inbound replies</h2>
              </div>
              <Link href="/admin/outreach/history?view=received" className="text-sm font-semibold text-[color:var(--admin-accent)]">
                See all
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {latestReplies.length === 0 ? (
                <EmptyState title="No replies yet" body="New inbound responses will appear here as soon as outreach threads start moving." />
              ) : (
                latestReplies.map((message: any) => (
                  <Link key={message.id} href={`/admin/leads/${message.thread.lead.id}`} className="block rounded-[24px] bg-[color:var(--admin-card-strong)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[color:var(--admin-ink)]">{message.thread.lead.company.name}</p>
                      <span className="text-xs font-semibold text-[color:var(--admin-muted)]">{getRelativeDayLabel(message.receivedAt)}</span>
                    </div>
                    <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">
                      {message.fromEmail || "Inbound reply"}
                    </p>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[color:var(--admin-soft-text)]">{message.body}</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="admin-card p-5 sm:p-6">
            <p className="admin-eyebrow">Live Activity</p>
            <div className="mt-4 space-y-4">
              {recentActivity.map((item: any) => (
                <div key={item.id} className="flex gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[color:var(--admin-accent)]" />
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--admin-ink)]">
                      {item.actor?.name || "System"} updated {item.lead?.company?.name || "a lead"}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--admin-soft-text)]">
                      {item.actionType.replace(/_/g, " ").toLowerCase()} {item.newValue ? `to ${item.newValue.replace(/_/g, " ")}` : ""}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[color:var(--admin-muted)]">{formatAdminTimestamp(item.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function MetricTile({ label, value, tone }: { label: string; value: number; tone: "accent" | "neutral" | "warning" | "success" }) {
  const toneClass =
    tone === "accent"
      ? "bg-[color:var(--admin-accent-soft)]"
      : tone === "warning"
        ? "bg-[color:var(--admin-warning-soft)]"
        : tone === "success"
          ? "bg-[color:var(--admin-success-soft)]"
          : "bg-white"

  return (
    <div className={`rounded-[24px] border border-[color:var(--admin-border)] p-4 ${toneClass}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">{label}</p>
      <p className="admin-metric-value mt-3">{value}</p>
    </div>
  )
}

function QueueCard({
  title,
  description,
  href,
  icon,
  tone,
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  tone: "accent" | "warning" | "success"
}) {
  const toneClasses =
    tone === "accent"
      ? "bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]"
      : tone === "warning"
        ? "bg-[color:var(--admin-warning-soft)] text-[color:var(--admin-warning)]"
        : "bg-[color:var(--admin-success-soft)] text-[color:var(--admin-success)]"

  return (
    <Link href={href} className="flex items-start gap-4 rounded-[24px] border border-[color:var(--admin-border)] bg-white p-4 transition-transform hover:-translate-y-0.5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-[16px] ${toneClasses}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold tracking-tight text-[color:var(--admin-ink)]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[color:var(--admin-soft-text)]">{description}</p>
      </div>
      <ArrowRight className="mt-1 h-4 w-4 text-[color:var(--admin-muted)]" />
    </Link>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-card-strong)] p-5">
      <p className="text-base font-semibold text-[color:var(--admin-ink)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">{body}</p>
    </div>
  )
}
