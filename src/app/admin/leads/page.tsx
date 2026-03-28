import { db } from "@/lib/db"
import { Users, Clock, CheckCircle2, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import Link from "next/link"
import { STAGE_LABELS, LeadStage } from "@/lib/stages"
import { Pagination } from "@/components/admin/Pagination"
import { getAccessScope } from "@/lib/auth/scope"

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  const { page, sort = "created", order = "desc" } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10
  
  const scope = await getAccessScope()

  // Sorting logic mapping for standard fields
  const sortMap: Record<string, any> = {
    name: { company: { name: order } },
    created: { createdAt: order },
    stage: { stage: order },
  }

  // We'll fetch more to allow manual sorting if needed, 
  // but for standard sorts we stay efficient.
  const isSpecialSort = sort === "fit"
  
  let allLeads = await db.lead.findMany({
    where: scope.leadsFilter,
    orderBy: isSpecialSort ? undefined : (sortMap[sort] || { createdAt: "desc" }),
    include: {
      company: true,
      analyses: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  })

  // Manual sort for Fit Score
  if (sort === "fit") {
    allLeads.sort((a: any, b: any) => {
      const scoreA = a.analyses[0]?.fitScore ?? 0
      const scoreB = b.analyses[0]?.fitScore ?? 0
      return order === "asc" ? scoreA - scoreB : scoreB - scoreA
    })
  }

  const totalItems = allLeads.length
  const paginatedLeads = allLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const toggleOrder = order === "asc" ? "desc" : "asc"

  return (
    <div className="space-y-6 animate-fadein pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-black" />
            Lead Pipeline
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium italic">Review AI analysis and approve accounts for high-impact outreach.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
        {/* Mobile Scroll Hint */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none lg:hidden z-10 opaitcy-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="overflow-x-auto">
          <div className="min-w-full md:min-w-[1000px]">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100 font-black tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5">
                    <Link 
                      href={`/admin/leads?sort=name&order=${sort === "name" ? toggleOrder : "asc"}`}
                      className="flex items-center gap-1 hover:text-black transition-colors"
                    >
                      Company
                      {sort === "name" ? (order === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </Link>
                  </th>
                  <th className="px-8 py-5">
                    <Link 
                      href={`/admin/leads?sort=stage&order=${sort === "stage" ? toggleOrder : "asc"}`}
                      className="flex items-center gap-1 hover:text-black transition-colors"
                    >
                      Stage
                      {sort === "stage" ? (order === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </Link>
                  </th>
                  <th className="px-8 py-5">
                    <Link 
                      href={`/admin/leads?sort=fit&order=${sort === "fit" ? toggleOrder : "desc"}`}
                      className="flex items-center gap-1 hover:text-black transition-colors"
                    >
                      Fit Score
                      {sort === "fit" ? (order === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </Link>
                  </th>
                  <th className="px-8 py-5 font-black text-gray-400 hidden xl:table-cell">Analysis Summary</th>
                  <th className="px-8 py-5 text-right hidden lg:table-cell">
                    <Link 
                      href={`/admin/leads?sort=created&order=${sort === "created" ? toggleOrder : "desc"}`}
                      className="flex items-center gap-1 hover:text-black transition-colors justify-end"
                    >
                      {sort === "created" ? (order === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      Added
                    </Link>
                  </th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400">
                      <Users className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                      <p className="font-black text-gray-900 uppercase tracking-widest text-sm text-center">Empty Pipeline</p>
                      <p className="text-xs text-center mt-1">Start a research session to discover target accounts.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead: any) => {
                    const analysis = lead.analyses[0]
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="font-black text-gray-900 group-hover:text-black transition-colors">{lead.company.name}</div>
                          <div className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-tight">{lead.company.niche || lead.company.domain || "Target"}</div>
                        </td>
                        <td className="px-8 py-6">
                          <StageBadge stage={lead.stage as LeadStage} />
                        </td>
                        <td className="px-8 py-6">
                          {analysis?.fitScore != null ? (
                            <div className={`inline-flex w-10 h-10 rounded-xl items-center justify-center font-black text-xs shadow-sm ring-1 ring-inset ${
                              analysis.fitScore >= 80 ? "bg-green-50 text-green-700 ring-green-100" :
                              analysis.fitScore >= 60 ? "bg-blue-50 text-blue-700 ring-blue-100" :
                              analysis.fitScore >= 40 ? "bg-orange-50 text-orange-700 ring-orange-100" :
                              "bg-red-50 text-red-700 ring-red-100"
                            }`}>
                              {analysis.fitScore}%
                            </div>
                          ) : (
                            <span className="text-gray-300 text-[10px] font-black italic tracking-widest">PENDING</span>
                          )}
                        </td>
                        <td className="px-8 py-6 hidden xl:table-cell">
                          <div className="max-w-xs line-clamp-2 text-gray-500 font-medium text-xs leading-relaxed" title={analysis?.companySummary ?? ""}>
                            {analysis?.companySummary ?? <span className="text-gray-300 italic">Waiting for AI qualification...</span>}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right hidden lg:table-cell font-black text-[10px] text-gray-400 uppercase tracking-widest">
                           {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="text-white font-black text-[10px] uppercase tracking-[0.2em] px-6 py-3.5 bg-black rounded-xl hover:bg-gray-800 transition-all active:scale-95 inline-block shadow-lg shadow-gray-200"
                          >
                            Review Lead
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Pagination 
        totalItems={totalItems} 
        pageSize={pageSize} 
        currentPage={currentPage} 
      />
    </div>
  )
}

function StageBadge({ stage }: { stage: LeadStage }) {
  const label = STAGE_LABELS[stage] ?? stage
  if (stage === "approved")       return <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100"><CheckCircle2 className="w-3.5 h-3.5" />{label}</span>
  if (stage === "rejected")       return <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100"><XCircle className="w-3.5 h-3.5" />{label}</span>
  if (stage === "pending_review") return <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100"><Clock className="w-3.5 h-3.5" />{label}</span>
  return <span className="inline-flex items-center bg-gray-50 text-gray-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100">{label}</span>
}
