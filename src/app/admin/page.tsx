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
  ChevronRight
} from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const session = await auth()
  
  // Fetch high-level metrics
  const [
    totalLeads,
    totalCompanies,
    sentEmails,
    highlyQualified,
    recentActivity
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

      {/* Hero Metrics Grid */}
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
        
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 overflow-hidden">
            <div className="p-8 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-black dark:text-white" />
                 Global Activity Feed
              </h2>
              <Link href="/admin/leads" className="text-xs font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest">
                Browse All Activity
              </Link>
            </div>
            
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {recentActivity.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-medium">No activity logged yet. Start researching!</div>
              ) : (
                recentActivity.map((log: any) => (
                  <div key={log.id} className="p-6 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      log.actionType === "STAGE_CHANGE" && log.newValue === "contacted" ? "bg-green-500" :
                      log.actionType === "STAGE_CHANGE" && log.newValue === "approved" ? "bg-blue-500" :
                      "bg-gray-300 dark:bg-gray-700"
                    }`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                          {log.actor?.name || "AI Assistant"}{" "}
                          <span className="font-medium text-gray-500 dark:text-gray-400">
                            {formatAction(log.actionType, log.newValue)}
                          </span>{" "}
                          <span className="text-black dark:text-gray-300">{log.lead.company.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter ml-4">
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

        {/* Action Sidebar */}
        <div className="space-y-6">
          <div className="bg-black dark:bg-white rounded-3xl p-8 text-white dark:text-black shadow-2xl shadow-gray-300 dark:shadow-none relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BrainCircuit className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <span className="bg-white/10 dark:bg-black/5 text-white/80 dark:text-black/80 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border border-white/10 dark:border-black/10">
                Action Required
              </span>
              <h3 className="font-extrabold text-2xl mt-4 leading-tight">Human Approval Needed</h3>
              <p className="text-gray-400 dark:text-gray-600 text-sm mt-3 font-medium">
                AI has found {highlyQualified} high-potential leads that match your ICP. Review them to unlock outreach.
              </p>
              <Link 
                href="/admin/leads"
                className="mt-8 bg-white dark:bg-black text-black dark:text-white px-6 py-3 rounded-2xl text-sm font-extrabold hover:bg-gray-100 dark:hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
              >
                Go to Inbox
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <Clock className="w-4 h-4 text-gray-400" />
              Upcoming Tasks
            </h4>
            <div className="space-y-5">
               <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                 <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Follow up with Propeller Digital</p>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800" />
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
    <div className={`bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 flex flex-col justify-between group hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-none transition-all duration-300 ${highlight ? "ring-2 ring-black dark:ring-white ring-offset-2 dark:ring-offset-black" : ""}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-extrabold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full uppercase tracking-tight">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">{title}</p>
        <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h3>
        {description && <p className="text-gray-400 text-xs mt-2 font-medium leading-relaxed">{description}</p>}
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
