import Link from "next/link"
import { db } from "@/lib/db"
import { getAccessScope } from "@/lib/auth/scope"
import { ExportLeadButton } from "@/components/admin/ExportLeadButton"
import { STAGE_LABELS } from "@/lib/stages"
import { getLeadContactStrategy } from "@/lib/contacts/priority"
import { hasLeadBeenReachedOutTo } from "@/lib/outreach/status"
import { CheckCircle2, ChevronRight, Search, XCircle } from "lucide-react"

const pipelineFilters = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "analyzed", label: "AI Reviewed" },
  { key: "contacted", label: "Contacted" },
] as const

const coverageWeight = {
  high: 4,
  medium: 3,
  low: 2,
  missing: 1,
} as const

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stage?: string; member?: string; sort?: string }>
}) {
  const { q, stage = "all", member, sort = "fit_desc" } = await searchParams
  const scope = await getAccessScope()
  const selectedMemberId = typeof member === "string" && member.trim() ? member : "all"

  const stageWhere =
    stage === "all"
      ? {}
      : { stage }

  const memberWhere =
    scope.isSuperAdmin && selectedMemberId !== "all"
      ? {
          OR: [{ ownerId: selectedMemberId }, { company: { createdById: selectedMemberId } }],
        }
      : scope.leadsFilter

  const where = {
    AND: [
      memberWhere,
      stageWhere,
      q
        ? {
            OR: [
              { company: { name: { contains: q, mode: "insensitive" } } },
              { company: { domain: { contains: q, mode: "insensitive" } } },
              { company: { niche: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {},
    ],
  }

  const members = scope.isSuperAdmin
    ? await db.user.findMany({
        where: {
          active: true,
          OR: [
            { ownedLeads: { some: where } },
            { createdComps: { some: { leads: { some: where } } } },
          ],
        },
        orderBy: [{ name: "asc" }, { email: "asc" }],
        select: { id: true, name: true, email: true },
      })
    : []

  const leads = await db.lead.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: 24,
    include: {
      company: {
        include: {
          contacts: {
            select: {
              id: true,
              name: true,
              roleTitle: true,
              email: true,
              emailStatus: true,
              emailEvidenceLevel: true,
              linkedinUrl: true,
              sourceUrl: true,
              verified: true,
              isGenericInbox: true,
              isPrimaryDecisionMaker: true,
              confidenceScore: true,
              contactType: true,
            },
          },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      },
      owner: { select: { id: true, name: true, email: true } },
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

  const leadsWithStatus = leads
    .map((lead: any) => {
      const analysis = lead.analyses[0]
      const contactStrategy = getLeadContactStrategy(lead.company.contacts || [])
      const hasBeenReachedOutTo = hasLeadBeenReachedOutTo(lead)

      return {
        ...lead,
        analysis,
        contactStrategy,
        hasBeenReachedOutTo,
      }
    })
    .sort((left: any, right: any) => compareLeads(left, right, stage, sort))

  const queryFor = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const entries = {
      ...(q ? { q } : {}),
      ...(scope.isSuperAdmin && selectedMemberId !== "all" ? { member: selectedMemberId } : {}),
      ...(stage && stage !== "all" ? { stage } : {}),
      ...(sort !== "fit_desc" ? { sort } : {}),
      ...next,
    }

    for (const [key, value] of Object.entries(entries)) {
      if (value && value !== "all") params.set(key, value)
    }

    const query = params.toString()
    return `/admin/leads${query ? `?${query}` : ""}`
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <section className="admin-card overflow-hidden p-5 sm:p-8">
        <div className="space-y-4 sm:hidden">
          <div>
            <p className="admin-eyebrow">Pipeline</p>
            <h1 className="mt-3 text-[1.9rem] font-semibold leading-[1.02] tracking-[-0.05em] text-[color:var(--admin-ink)]">
              Review leads without fighting the screen.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[color:var(--admin-soft-text)]">
              Search, filter, and open the next lead. Everything else stays secondary.
            </p>
          </div>

          <div className="grid min-w-0 gap-3">
            <Link href="/admin/outreach" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--admin-accent)] px-5 py-3 text-sm font-bold text-white">
              Open Outreach
              <ChevronRight className="h-4 w-4" />
            </Link>
            <ExportLeadButton leads={leadsWithStatus} />
          </div>
        </div>

        <div className="hidden flex-col gap-5 sm:flex lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="admin-eyebrow">Pipeline</p>
            <h1 className="admin-section-title mt-3 max-w-full text-balance sm:max-w-3xl">Review faster, decide faster, move better leads forward.</h1>
            <p className="admin-section-copy mt-4 max-w-2xl">
              Every lead is summarized for mobile review first: fit score, contact quality, owner context, and next step.
            </p>
          </div>
          <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-wrap">
            <Link href="/admin/outreach" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--admin-accent)] px-5 py-3 text-sm font-bold text-white sm:w-auto">
              Open Outreach
              <ChevronRight className="h-4 w-4" />
            </Link>
            <ExportLeadButton leads={leadsWithStatus} />
          </div>
        </div>

        <div className="mt-5 grid min-w-0 gap-3">
          <form className="flex min-w-0 items-center gap-3 rounded-full border border-[color:var(--admin-border)] bg-white px-4 py-3">
            <Search className="h-4 w-4 text-[color:var(--admin-muted)]" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search company, domain, or niche"
              className="min-w-0 w-full bg-transparent text-sm text-[color:var(--admin-ink)] outline-none placeholder:text-[color:var(--admin-muted)]"
            />
            {stage !== "all" && <input type="hidden" name="stage" value={stage} />}
            {scope.isSuperAdmin && selectedMemberId !== "all" && <input type="hidden" name="member" value={selectedMemberId} />}
          </form>

          {scope.isSuperAdmin && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Link
                href={queryFor({ member: undefined })}
                className={`admin-pill shrink-0 whitespace-nowrap ${selectedMemberId === "all" ? "admin-pill-accent" : "admin-pill-neutral"}`}
              >
                All owners
              </Link>
              {members.map((candidate) => (
                <Link
                  key={candidate.id}
                  href={queryFor({ member: candidate.id })}
                  className={`admin-pill shrink-0 whitespace-nowrap ${selectedMemberId === candidate.id ? "admin-pill-accent" : "admin-pill-neutral"}`}
                >
                  {candidate.name || candidate.email || "Member"}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="flex min-w-0 gap-2 overflow-x-auto pb-1 pr-2">
        {pipelineFilters.map((filter) => {
          const active = stage === filter.key || (!stage && filter.key === "all")
          return (
            <Link
              key={filter.key}
              href={queryFor({ stage: filter.key === "all" ? undefined : filter.key })}
              className={`whitespace-nowrap rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] ${
                active
                  ? "bg-[color:var(--admin-accent)] text-white"
                  : "border border-[color:var(--admin-border)] bg-white text-[color:var(--admin-soft-text)]"
              }`}
            >
              {filter.label}
            </Link>
          )
        })}
      </section>

      <section className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">Sort by fit score</p>
        <div className="flex gap-2">
          <Link
            href={queryFor({ sort: "fit_desc" })}
            className={`rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] ${
              sort === "fit_desc"
                ? "bg-[color:var(--admin-accent)] text-white"
                : "border border-[color:var(--admin-border)] bg-white text-[color:var(--admin-soft-text)]"
            }`}
          >
            High to low
          </Link>
          <Link
            href={queryFor({ sort: "fit_asc" })}
            className={`rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] ${
              sort === "fit_asc"
                ? "bg-[color:var(--admin-accent)] text-white"
                : "border border-[color:var(--admin-border)] bg-white text-[color:var(--admin-soft-text)]"
            }`}
          >
            Low to high
          </Link>
        </div>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-2">
        {leadsWithStatus.length === 0 ? (
          <div className="admin-card p-6">
            <p className="text-xl font-semibold text-[color:var(--admin-ink)]">No leads match this view.</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">
              Adjust the stage filter or start a fresh research session to refill the pipeline.
            </p>
          </div>
        ) : (
          leadsWithStatus.map((lead: any) => {
            const analysis = lead.analysis
            const contactStrategy = lead.contactStrategy
            const fitScore = analysis?.fitScore ?? 0

            return (
              <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="admin-card block min-w-0 overflow-hidden p-4 transition-transform hover:-translate-y-0.5 sm:p-6">
                <div className="sm:hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-lg font-semibold tracking-tight text-[color:var(--admin-ink)]">{lead.company.name}</p>
                      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">
                        {lead.company.niche || lead.company.domain || "Target account"}
                      </p>
                    </div>
                    <FitScorePill score={fitScore} />
                  </div>

                  <div className="mt-3 flex min-w-0 flex-wrap gap-2">
                    <StagePill stage={lead.stage} />
                    <span className="admin-pill admin-pill-neutral">{contactStrategy.coverageStatus} contact coverage</span>
                    {lead.hasBeenReachedOutTo && <span className="admin-pill admin-pill-success">Reached out</span>}
                  </div>

                  <p className="mt-3 line-clamp-2 break-words text-sm leading-6 text-[color:var(--admin-soft-text)]">
                    {analysis?.companySummary || "Open the lead to review qualification, contacts, and next action."}
                  </p>

                  <div className="mt-4 rounded-[18px] bg-[color:var(--admin-card-strong)] p-3.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[color:var(--admin-muted)]">Best contact path</p>
                    <p className="mt-2 break-words text-sm font-semibold text-[color:var(--admin-ink)]">
                      {contactStrategy.bestContact
                        ? contactStrategy.bestContact.name || contactStrategy.bestContact.email || "Unnamed contact"
                        : "Manual contact review needed"}
                    </p>
                    <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-[color:var(--admin-soft-text)]">{contactStrategy.reason}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0 truncate text-[color:var(--admin-soft-text)]">
                      Owner: {lead.owner?.name || lead.owner?.email || lead.company.createdBy?.name || "Unassigned"}
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-[color:var(--admin-accent)]">
                      Open
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="break-words text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">{lead.company.name}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--admin-muted)]">
                        {lead.company.niche || lead.company.domain || "Target account"}
                      </p>
                    </div>
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] text-sm font-black ${
                        fitScore >= 80
                          ? "bg-[color:var(--admin-success-soft)] text-[color:var(--admin-success)]"
                          : fitScore >= 60
                            ? "bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]"
                            : fitScore >= 40
                              ? "bg-[color:var(--admin-warning-soft)] text-[color:var(--admin-warning)]"
                              : "bg-[color:var(--admin-danger-soft)] text-[color:var(--admin-danger)]"
                      }`}
                    >
                      {fitScore ? `${fitScore}%` : "--"}
                    </div>
                  </div>

                  <div className="mt-4 flex min-w-0 flex-wrap gap-2">
                    <StagePill stage={lead.stage} />
                    <span className="admin-pill admin-pill-neutral">{contactStrategy.coverageStatus} contact coverage</span>
                    {lead.hasBeenReachedOutTo && <span className="admin-pill admin-pill-success">Reached out</span>}
                  </div>

                  <p className="mt-4 line-clamp-3 break-words text-sm leading-6 text-[color:var(--admin-soft-text)]">
                    {analysis?.companySummary || "Open the lead to review AI qualification, contact evidence, and next outreach actions."}
                  </p>

                  <div className="mt-5 min-w-0 rounded-[22px] bg-[color:var(--admin-card-strong)] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">Best contact path</p>
                    <p className="mt-2 break-words text-sm font-semibold text-[color:var(--admin-ink)]">
                      {contactStrategy.bestContact
                        ? contactStrategy.bestContact.name || contactStrategy.bestContact.email || "Unnamed contact"
                        : "Manual contact review needed"}
                    </p>
                    <p className="mt-1 break-words text-sm text-[color:var(--admin-soft-text)]">{contactStrategy.reason}</p>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="min-w-0 break-words text-[color:var(--admin-soft-text)]">
                      Owner: {lead.owner?.name || lead.owner?.email || lead.company.createdBy?.name || "Unassigned"}
                    </div>
                    <span className="inline-flex items-center gap-1 font-semibold text-[color:var(--admin-accent)]">
                      Review lead
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </section>
    </div>
  )
}

function StagePill({ stage }: { stage: string }) {
  if (stage === "approved") {
    return (
      <span className="admin-pill admin-pill-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage}
      </span>
    )
  }

  if (stage === "rejected") {
    return (
      <span className="admin-pill admin-pill-danger">
        <XCircle className="h-3.5 w-3.5" />
        {STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage}
      </span>
    )
  }

  return <span className="admin-pill admin-pill-warning">{STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage}</span>
}

function FitScorePill({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "bg-[color:var(--admin-success-soft)] text-[color:var(--admin-success)]"
      : score >= 60
        ? "bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]"
        : score >= 40
          ? "bg-[color:var(--admin-warning-soft)] text-[color:var(--admin-warning)]"
          : "bg-[color:var(--admin-danger-soft)] text-[color:var(--admin-danger)]"

  return <span className={`admin-pill shrink-0 ${tone}`}>{score ? `${score}% fit` : "No score"}</span>
}

function compareLeads(left: any, right: any, stage: string, sort: string) {
  const fitDelta =
    sort === "fit_asc"
      ? (left.analysis?.fitScore ?? 0) - (right.analysis?.fitScore ?? 0)
      : (right.analysis?.fitScore ?? 0) - (left.analysis?.fitScore ?? 0)

  if (fitDelta !== 0) return fitDelta

  const stageSpecificDelta = stagePriority(right, stage) - stagePriority(left, stage)
  if (stageSpecificDelta !== 0) return stageSpecificDelta

  const resultDelta = leadResultScore(right) - leadResultScore(left)
  if (resultDelta !== 0) return resultDelta

  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
}

function leadResultScore(lead: any) {
  const fitScore = lead.analysis?.fitScore ?? 0
  const coverageScore = coverageWeight[lead.contactStrategy?.coverageStatus as keyof typeof coverageWeight] ?? 0
  const reachedOutBonus = lead.hasBeenReachedOutTo ? 15 : 0
  const directContactBonus = lead.contactStrategy?.bestContact?.email ? 18 : 0
  const decisionMakerBonus = lead.contactStrategy?.bestContact?.isPrimaryDecisionMaker ? 10 : 0

  return fitScore * 5 + coverageScore * 40 + reachedOutBonus + directContactBonus + decisionMakerBonus
}

function stagePriority(lead: any, selectedStage: string) {
  const fitScore = lead.analysis?.fitScore ?? 0
  const coverageScore = coverageWeight[lead.contactStrategy?.coverageStatus as keyof typeof coverageWeight] ?? 0

  if (selectedStage === "pending_review") {
    return fitScore * 10 + coverageScore * 30
  }

  if (selectedStage === "approved") {
    return coverageScore * 100 + fitScore * 5
  }

  if (selectedStage === "contacted" || selectedStage === "replied") {
    return lead.hasBeenReachedOutTo ? 1000 : 0
  }

  if (selectedStage === "new") {
    return coverageScore * 20
  }

  return fitScore * 5 + coverageScore * 20
}
