import { db } from "@/lib/db"
import { BarChart3, TrendingUp, Users, Building2, BrainCircuit, SendHorizontal, XCircle } from "lucide-react"
import { STAGE_LABELS, LeadStage } from "@/lib/stages"

export default async function ReportsPage() {
  const [totalCompanies, totalLeads, totalAnalyses, totalSent] = await Promise.all([
    db.company.count(),
    db.lead.count(),
    db.aIAnalysis.count(),
    db.outreachMessage.count({ where: { sentAt: { not: null } } }),
  ])

  // Stage funnel (group by stage)
  const stageCounts = await db.lead.groupBy({
    by: ["stage"],
    _count: { _all: true },
  })
  const stageMap = Object.fromEntries(stageCounts.map((s: any) => [s.stage, s._count._all]))

  const approvedCount  = stageMap["approved"]    ?? 0
  const contactedCount = stageMap["contacted"]   ?? 0
  const repliedCount   = stageMap["replied"]     ?? 0
  const bookedCount    = stageMap["booked_call"] ?? 0
  const rejectedCount  = stageMap["rejected"]    ?? 0

  const approvalRate = totalLeads   ? Math.round((approvedCount  / totalLeads)   * 100) : 0
  const outreachRate = approvedCount? Math.round((contactedCount / approvedCount) * 100) : 0
  const replyRate    = contactedCount? Math.round((repliedCount  / contactedCount)* 100) : 0
  const bookedRate   = repliedCount ? Math.round((bookedCount    / repliedCount)  * 100) : 0

  // Per-researcher
  const researcherStats = await db.lead.groupBy({
    by: ["ownerId"],
    _count: { _all: true },
    where: { ownerId: { not: null } },
  })
  const researcherIds = researcherStats.map((r: any) => r.ownerId!).filter(Boolean)
  const researchers   = researcherIds.length
    ? await db.user.findMany({ where: { id: { in: researcherIds } }, select: { id: true, name: true } })
    : []
  const researcherMap = Object.fromEntries(researchers.map((r: any) => [r.id, r.name ?? r.id]))

  // Niche breakdown — sort in JS to avoid groupBy orderBy syntax issues
  const nicheRaw = await db.company.groupBy({
    by: ["niche"],
    _count: { _all: true },
    where: { niche: { not: null } },
  })
  const nicheStats = [...nicheRaw].sort((a: any, b: any) => b._count._all - a._count._all).slice(0, 10)

  return (
    <div className="space-y-8 animate-fadein">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" /> Performance Reports
        </h1>
        <p className="text-gray-500 text-sm mt-1">Live pipeline metrics and team performance.</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Companies",   value: totalCompanies, icon: <Building2 className="w-5 h-5 text-indigo-500" /> },
          { label: "Total Leads", value: totalLeads,     icon: <Users className="w-5 h-5 text-blue-500" /> },
          { label: "AI Analyses", value: totalAnalyses,  icon: <BrainCircuit className="w-5 h-5 text-violet-500" /> },
          { label: "Emails Sent", value: totalSent,      icon: <SendHorizontal className="w-5 h-5 text-green-500" /> },
        ].map((m: any) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-gray-50 rounded-lg">{m.icon}</div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{m.label}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion rates */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Pipeline Conversion
          </h2>
          <div className="space-y-4">
            {[
              { label: "Approval Rate",  value: approvalRate,  sub: `${approvedCount} of ${totalLeads} leads` },
              { label: "Outreach Rate",  value: outreachRate,  sub: `${contactedCount} of ${approvedCount} approved` },
              { label: "Reply Rate",     value: replyRate,     sub: `${repliedCount} of ${contactedCount} contacted` },
              { label: "Booked Rate",    value: bookedRate,    sub: `${bookedCount} of ${repliedCount} replied` },
            ].map((item: any) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${item.value}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stage funnel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> Leads by Stage
          </h2>
          <div className="space-y-2">
            {(Object.entries(stageMap) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-600">{STAGE_LABELS[stage as LeadStage] ?? stage}</span>
                <span className="font-bold text-gray-900 tabular-nums">{count}</span>
              </div>
            ))}
            {Object.keys(stageMap).length === 0 && <p className="text-gray-400 text-sm italic">No leads yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-researcher */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Leads per Researcher</h2>
          <div className="space-y-2">
            {researcherStats.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No assignments yet.</p>
            ) : (
              researcherStats
                .sort((a, b) => b._count._all - a._count._all)
                .map((r: any) => (
                  <div key={r.ownerId} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-700">{researcherMap[r.ownerId!] ?? "Unknown"}</span>
                    <span className="font-bold text-gray-900 tabular-nums">{r._count._all}</span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Niche breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Companies by Niche</h2>
          <div className="space-y-2">
            {nicheStats.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No niche data yet.</p>
            ) : (
              nicheStats.map((n: any) => (
                <div key={n.niche} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-700">{n.niche}</span>
                  <span className="font-bold text-gray-900 tabular-nums">{n._count._all}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {rejectedCount > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-sm">
          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-red-700"><strong>{rejectedCount}</strong> leads rejected — review rejection reasons to improve research quality.</span>
        </div>
      )}
    </div>
  )
}
