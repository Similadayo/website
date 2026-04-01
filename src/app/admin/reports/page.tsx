import { db } from "@/lib/db"
import { STAGE_LABELS, LeadStage } from "@/lib/stages"
import { BarChart3, BrainCircuit, Building2, SendHorizontal, TrendingUp, Users, XCircle } from "lucide-react"

export default async function ReportsPage() {
  const [totalCompanies, totalLeads, totalAnalyses, totalSent] = await Promise.all([
    db.company.count(),
    db.lead.count(),
    db.aIAnalysis.count(),
    db.outreachMessage.count({ where: { sentAt: { not: null } } }),
  ])

  const stageCounts = await db.lead.groupBy({ by: ["stage"], _count: { _all: true } })
  const stageMap = Object.fromEntries(stageCounts.map((item: any) => [item.stage, item._count._all]))

  const approvedCount = stageMap["approved"] ?? 0
  const contactedCount = stageMap["contacted"] ?? 0
  const repliedCount = stageMap["replied"] ?? 0
  const bookedCount = stageMap["booked_call"] ?? 0
  const rejectedCount = stageMap["rejected"] ?? 0

  const approvalRate = totalLeads ? Math.round((approvedCount / totalLeads) * 100) : 0
  const outreachRate = approvedCount ? Math.round((contactedCount / approvedCount) * 100) : 0
  const replyRate = contactedCount ? Math.round((repliedCount / contactedCount) * 100) : 0
  const bookedRate = repliedCount ? Math.round((bookedCount / repliedCount) * 100) : 0

  const researcherStats = await db.lead.groupBy({
    by: ["ownerId"],
    _count: { _all: true },
    where: { ownerId: { not: null } },
  })
  const researcherIds = researcherStats.map((item: any) => item.ownerId!).filter(Boolean)
  const researchers = researcherIds.length
    ? await db.user.findMany({ where: { id: { in: researcherIds } }, select: { id: true, name: true } })
    : []
  const researcherMap = Object.fromEntries(researchers.map((item: any) => [item.id, item.name ?? item.id]))

  const nicheRaw = await db.company.groupBy({
    by: ["niche"],
    _count: { _all: true },
    where: { niche: { not: null } },
  })
  const nicheStats = [...nicheRaw].sort((a: any, b: any) => b._count._all - a._count._all).slice(0, 10)

  return (
    <div className="space-y-6">
      <section className="admin-card p-6 sm:p-8">
        <p className="admin-eyebrow">Reports</p>
        <h1 className="admin-section-title mt-3 max-w-3xl">Read the funnel without losing the product feel.</h1>
        <p className="admin-section-copy mt-4 max-w-2xl">
          Reporting is intentionally compact here: enough to see conversion quality, operator distribution, and where the pipeline is leaking.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Companies" value={totalCompanies} icon={<Building2 className="h-4 w-4" />} />
          <Metric label="Leads" value={totalLeads} icon={<Users className="h-4 w-4" />} />
          <Metric label="AI analyses" value={totalAnalyses} icon={<BrainCircuit className="h-4 w-4" />} />
          <Metric label="Emails sent" value={totalSent} icon={<SendHorizontal className="h-4 w-4" />} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="admin-card p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[color:var(--admin-ink)]">
            <TrendingUp className="h-5 w-5 text-[color:var(--admin-accent)]" />
            <h2 className="text-xl font-semibold tracking-tight">Pipeline conversion</h2>
          </div>
          <div className="mt-5 space-y-5">
            {[
              { label: "Approval rate", value: approvalRate, sub: `${approvedCount} of ${totalLeads}` },
              { label: "Outreach rate", value: outreachRate, sub: `${contactedCount} of ${approvedCount}` },
              { label: "Reply rate", value: replyRate, sub: `${repliedCount} of ${contactedCount}` },
              { label: "Booked rate", value: bookedRate, sub: `${bookedCount} of ${repliedCount}` },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[color:var(--admin-ink)]">{item.label}</p>
                  <p className="text-sm font-bold text-[color:var(--admin-accent)]">{item.value}%</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--admin-card-strong)]">
                  <div className="h-full rounded-full bg-[color:var(--admin-accent)]" style={{ width: `${item.value}%` }} />
                </div>
                <p className="mt-2 text-xs text-[color:var(--admin-muted)]">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[color:var(--admin-ink)]">
            <BarChart3 className="h-5 w-5 text-[color:var(--admin-accent)]" />
            <h2 className="text-xl font-semibold tracking-tight">Leads by stage</h2>
          </div>
          <div className="mt-5 space-y-3">
            {(Object.entries(stageMap) as [string, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between rounded-[18px] bg-[color:var(--admin-card-strong)] px-4 py-3">
                  <span className="text-sm font-semibold text-[color:var(--admin-ink)]">{STAGE_LABELS[stage as LeadStage] ?? stage}</span>
                  <span className="text-sm font-black text-[color:var(--admin-accent)]">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="admin-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Leads per researcher</h2>
          <div className="mt-5 space-y-3">
            {researcherStats.length === 0 ? (
              <p className="text-sm text-[color:var(--admin-soft-text)]">No assignments yet.</p>
            ) : (
              researcherStats
                .sort((a: any, b: any) => b._count._all - a._count._all)
                .map((item: any) => (
                  <div key={item.ownerId} className="flex items-center justify-between rounded-[18px] bg-[color:var(--admin-card-strong)] px-4 py-3">
                    <span className="text-sm font-semibold text-[color:var(--admin-ink)]">{researcherMap[item.ownerId!] ?? "Unknown"}</span>
                    <span className="text-sm font-black text-[color:var(--admin-accent)]">{item._count._all}</span>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="admin-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Companies by niche</h2>
          <div className="mt-5 space-y-3">
            {nicheStats.length === 0 ? (
              <p className="text-sm text-[color:var(--admin-soft-text)]">No niche data yet.</p>
            ) : (
              nicheStats.map((item: any) => (
                <div key={item.niche} className="flex items-center justify-between rounded-[18px] bg-[color:var(--admin-card-strong)] px-4 py-3">
                  <span className="text-sm font-semibold text-[color:var(--admin-ink)]">{item.niche}</span>
                  <span className="text-sm font-black text-[color:var(--admin-accent)]">{item._count._all}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {rejectedCount > 0 && (
        <div className="admin-card p-5 sm:p-6">
          <div className="flex items-start gap-3 text-[color:var(--admin-danger)]">
            <XCircle className="mt-0.5 h-5 w-5" />
            <p className="text-sm leading-6">
              <strong>{rejectedCount}</strong> leads were rejected. Review rejection reasons to improve research quality and contact precision.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-[color:var(--admin-border)] bg-white p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]">{icon}</span>
        {label}
      </div>
      <p className="admin-metric-value mt-4">{value}</p>
    </div>
  )
}
