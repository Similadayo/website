import { db } from "@/lib/db"
import { auth } from "@/auth"
import Link from "next/link"
import { Search, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { startResearchSession } from "./actions"
import { ResearchStartButton } from "@/components/admin/ResearchStartButton"
import { Pagination } from "@/components/admin/Pagination"

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

  const [[pastSessions, totalSessions], assignment] = await Promise.all([
    Promise.all([
      db.researchSession.findMany({
        where:   { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip:    (currentPage - 1) * pageSize,
        take:    pageSize,
      }),
      db.researchSession.count({ where: { userId: session.user.id } })
    ]),
    db.assignment.findFirst({
      where: { userId: session.user.id, status: "active" },
    }),
  ])

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

      {/* Assignment + Start */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-8 group">
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Global Assignment</h2>

        {!assignment ? (
          <div className="text-sm font-medium text-gray-500 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
            <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0" />
            <div className="text-center sm:text-left">
              No region or niche assigned yet. 
              <Link href="/admin/users" className="text-black dark:text-white underline font-black ml-1 uppercase text-[10px] tracking-widest">Go to Assignments →</Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 border-t border-gray-50 dark:border-white/5 pt-8">
            <div className="flex gap-12">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Target Region</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{assignment.region || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Industry Niche</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{assignment.niche || "—"}</p>
              </div>
            </div>

            <form action={startResearchSession.bind(null, assignment.region ?? "", assignment.niche ?? "")}>
              <ResearchStartButton disabled={!hasKey} />
            </form>
          </div>
        )}
      </div>

      {/* Past sessions */}
      {pastSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden relative group">
           {/* Mobile Scroll Hint */}
           <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none lg:hidden z-10 opaitcy-0 group-hover:opacity-100 transition-opacity" />
           
          <div className="px-8 py-6 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Activity History</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full md:min-w-[800px] divide-y divide-gray-50 dark:divide-white/5">
              {(pastSessions as any[]).map((s: any) => (
                <Link
                  key={s.id}
                  href={`/admin/research/${s.id}`}
                  className="flex items-center justify-between px-8 py-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-5">
                    <StatusIcon status={s.status} />
                    <div>
                      <p className="font-black text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-blue-400 transition-colors">
                        {s.niche} in {s.region}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">
                        {new Date(s.createdAt).toLocaleString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
                    <span className="hidden md:flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400" /><strong className="text-gray-900 dark:text-gray-300">{s.totalAnalyzed}</strong> Discovery</span>
                    <span className="hidden lg:flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" /><strong className="text-gray-900 dark:text-gray-300">{s.totalSkipped}</strong> Filters</span>
                    <span className="text-black dark:text-white font-black opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      View Report →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <Pagination 
            totalItems={totalSessions} 
            pageSize={pageSize} 
            currentPage={currentPage}
          />
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
  if (status === "running")   return <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg dark:shadow-none animate-pulse"><Loader2 className="w-5 h-5 animate-spin" /></div>
  if (status === "failed")    return <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400"><AlertCircle className="w-5 h-5" /></div>
  return <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500"><Clock className="w-5 h-5" /></div>
}
