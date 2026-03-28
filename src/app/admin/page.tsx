import { db } from "@/lib/db"
import { auth } from "@/auth"
import { 
  Building2, 
  Users, 
  SendHorizontal, 
  BrainCircuit,
  ArrowUpRight,
  Clock,
  TrendingUp,
  Target,
  Mail,
  ChevronRight,
  BarChart3,
  Trophy
} from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const session = await auth()
  
  // Fetch metrics & analytics
  const [
    totalLeads,
    totalCompanies,
    sentEmails,
    highlyQualified,
    recentActivity,
    topOperatives,
    nicheStats
  ] = await Promise.all([
    db.lead.count(),
    db.company.count(),
    db.outreachMessage.count({ where: { sentAt: { not: null } } }),
    db.aIAnalysis.count({ where: { fitScore: { gte: 80 } } }),
    db.leadActivityLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        lead: { include: { company: true } },
        actor: true
      }
    }),
    db.user.findMany({
      take: 5,
      where: { role: "researcher", active: true },
      select: {
        id: true,
        name: true,
        _count: { select: { ownedLeads: true } }
      },
      orderBy: { ownedLeads: { _count: "desc" } }
    }),
    db.company.groupBy({
      by: ["niche"],
      _count: { _all: true },
      orderBy: { _count: { niche: "desc" } },
      take: 10
    })
  ])

  return (
    <div className="space-y-10 animate-fadein pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Command Center
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">
            Overview for {session?.user?.name || "Agency Manager"} — {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <Link 
          href="/admin/research"
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-gray-200 dark:shadow-none hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          Start New Search
        </Link>
      </header>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Accounts" 
          value={totalCompanies} 
          icon={<Building2 className="w-6 h-6 text-black dark:text-white" />} 
          description="Target companies discovered"
        />
        <MetricCard 
           title="Lead Pipeline" 
           value={totalLeads} 
           icon={<Users className="w-6 h-6 text-black dark:text-white" />} 
           description="Qualified leads ready for outreach"
        />
        <MetricCard 
          title="Outreach Volume" 
          value={sentEmails} 
          icon={<Mail className="w-6 h-6 text-black dark:text-white" />} 
          description="Total emails sent this sprint"
          trend={`${sentEmails > 0 ? "+12%" : "0%"}`}
        />
        <MetricCard 
          title="High Fit Leads" 
          value={highlyQualified} 
          icon={<BrainCircuit className="w-6 h-6 text-black dark:text-white" />} 
          description="Score > 80% AI confidence"
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Theater Performance Chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <BarChart3 className="w-6 h-6" /> Mission Theater Performance
            </h2>
            <div className="space-y-6">
              {nicheStats.map((stat, i) => {
                const max = Math.max(...nicheStats.map(s => s._count._all), 1)
                const percentage = (stat._count._all / max) * 100
                return (
                  <div key={i} className="space-y-2 group">
                    <div className="flex justify-between items-end px-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-black dark:group-hover:text-white transition-colors">
                        {stat.niche || "General Operations"}
                      </span>
                      <span className="text-xs font-black text-gray-900 dark:text-white tabular-nums">{stat._count._all} Leads</span>
                    </div>
                    <div className="h-2.5 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden border border-gray-100 dark:border-white/10">
                      <div 
                        className="h-full bg-black dark:bg-white rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {nicheStats.length === 0 && (
                <div className="py-20 text-center text-gray-400 font-medium italic">No mission data recorded for any theater.</div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="p-10 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-widest">
                 <TrendingUp className="w-6 h-6" /> Operations Feed
              </h2>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {recentActivity.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-medium italic">No recent maneuvers detected.</div>
              ) : (
                recentActivity.map((log: any) => (
                  <div key={log.id} className="p-8 flex items-start gap-4 hover:bg-gray-50/20 dark:hover:bg-white/5 transition-colors group">
                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      log.actionType === "STAGE_CHANGE" && log.newValue === "contacted" ? "bg-green-500" :
                      log.actionType === "STAGE_CHANGE" && log.newValue === "approved" ? "bg-blue-500" :
                      "bg-gray-300 dark:bg-white/10"
                    }`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          <span className="text-blue-600 dark:text-blue-400">{log.actor?.name || "AI"}</span>{" "}
                          <span className="font-medium text-gray-400">
                            {formatAction(log.actionType, log.newValue)}
                          </span>{" "}
                          <span className="font-black underline decoration-gray-100 dark:decoration-white/10 decoration-2 underline-offset-4">{log.lead.company.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter whitespace-nowrap ml-4">
                          {formatTime(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tactical Intel & Top Operatives */}
        <div className="space-y-8">
          {/* Top Operatives */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-white/5 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <Trophy className="w-4 h-4 text-orange-400" /> Lead Operatives
            </h3>
            <div className="space-y-6">
              {topOperatives.map((opt, i) => (
                <div key={opt.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center font-black text-sm text-gray-400 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{opt.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Operative</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-gray-900 dark:text-white tabular-nums leading-none">{opt._count.ownedLeads}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Found</p>
                  </div>
                </div>
              ))}
              {topOperatives.length === 0 && (
                <div className="py-6 text-center text-gray-400 text-xs italic">Awaiting operative deployment.</div>
              )}
            </div>
          </div>

          <div className="bg-black dark:bg-white rounded-[2.5rem] p-10 text-white dark:text-black shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BrainCircuit className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <span className="bg-white/10 dark:bg-black/5 text-white/80 dark:text-black/80 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-white/10 dark:border-black/10">
                Action Required
              </span>
              <h3 className="font-black text-2xl mt-6 leading-tight uppercase tracking-tight">Intelligence Queue</h3>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-4 font-medium leading-relaxed">
                AI has prioritized {highlyQualified} high-potential accounts. Approve them to initialize outreach sequences.
              </p>
              <Link 
                href="/admin/leads"
                className="mt-10 bg-white dark:bg-black text-black dark:text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-900 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Go to Inbox
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-white/5 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
              <Clock className="w-4 h-4 text-gray-400" /> System Tasks
            </h4>
            <div className="space-y-6">
               <div className="flex items-center gap-4 group">
                 <div className="w-1.5 h-1.5 rounded-full bg-orange-400 group-hover:scale-150 transition-transform" />
                 <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Follow up with Propeller Digital</p>
               </div>
               <div className="flex items-center gap-4 group">
                 <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 group-hover:scale-150 transition-transform" />
                 <p className="text-xs font-medium text-gray-400">Expand research in UK region</p>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, description, trend, highlight }: { 
  title: string, 
  value: number | string, 
  icon: React.ReactNode, 
  description?: string, 
  trend?: string,
  highlight?: boolean
}) {
  return (
    <div className={`bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 flex flex-col justify-between group hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-none transition-all duration-300 ${highlight ? "ring-2 ring-black dark:ring-white ring-offset-4 dark:ring-offset-black" : ""}`}>
      <div className="flex justify-between items-start mb-8">
        <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-green-100 dark:border-green-900/40">
            <TrendingUp className="w-3.5 h-3.5" />
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">{title}</p>
        <h3 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums">{value}</h3>
        {description && <p className="text-gray-400 text-[11px] mt-4 font-medium leading-relaxed italic">{description}</p>}
      </div>
    </div>
  )
}

function formatAction(type: string, value: string | null) {
  if (type === "STAGE_CHANGE") {
    if (value === "contacted") return "sent personalized outreach to"
    if (value === "approved") return "approved for the pipeline"
    if (value === "analyzed") return "finished AI qualification for"
    return `moved to ${value?.replace('_', ' ')}`
  }
  if (type === "EMAIL_SENT") return "sent a direct message to"
  if (type === "AI_ANALYSIS_TRIGGERED") return "started AI analysis for"
  return "updated"
}

function formatTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
