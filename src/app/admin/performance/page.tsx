import { db } from "@/lib/db"
import { auth } from "@/auth"
import {
  Trophy, Users, Mail, Search, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Clock, Send, Star
} from "lucide-react"

export default async function PerformancePage() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Get all active researchers with their stats
  const users = await db.user.findMany({
    where: { active: true },
    include: {
      assignments: { where: { status: "active" }, take: 1 },
      ownedLeads: {
        select: {
          id: true,
          stage: true,
          createdAt: true,
          threads: {
            select: {
              id: true,
              status: true,
              messages: {
                select: { sentAt: true },
                where: { sentAt: { not: null } },
              },
            },
          },
        },
      },
      researchSessions: {
        select: { id: true, totalFound: true, totalAnalyzed: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const leaderboard = users.map((user: any) => {
    const totalLeads      = user.ownedLeads.length
    const analyzedLeads   = user.ownedLeads.filter((l: any) => !["new", "researching"].includes(l.stage)).length
    const approvedLeads   = user.ownedLeads.filter((l: any) => ["approved", "outreach_ready", "contacted", "replied", "booked_call", "closed_won"].includes(l.stage)).length
    const contactedLeads  = user.ownedLeads.filter((l: any) => ["contacted", "replied", "booked_call", "closed_won"].includes(l.stage)).length
    const repliedLeads    = user.ownedLeads.filter((l: any) => ["replied", "booked_call", "closed_won"].includes(l.stage)).length
    const bookedCalls     = user.ownedLeads.filter((l: any) => ["booked_call", "closed_won"].includes(l.stage)).length
    const closedWon       = user.ownedLeads.filter((l: any) => l.stage === "closed_won").length

    const emailsSent = user.ownedLeads.reduce((sum: number, l: any) =>
      sum + l.threads.reduce((ts: number, t: any) => ts + t.messages.length, 0), 0)

    const recentLeads = user.ownedLeads.filter((l: any) => new Date(l.createdAt) > sevenDaysAgo).length
    const totalSessions = user.researchSessions.length

    const assignment = user.assignments[0]

    return {
      id:    user.id,
      name:  user.name ?? user.email ?? "—",
      role:  user.role,
      region: assignment?.region ?? "—",
      niche:  assignment?.niche ?? "—",
      totalLeads,
      analyzedLeads,
      approvedLeads,
      contactedLeads,
      repliedLeads,
      bookedCalls,
      closedWon,
      emailsSent,
      recentLeads,
      totalSessions,
      isActive: recentLeads > 0 || totalSessions > 0,
    }
  }).sort((a: any, b: any) => b.contactedLeads - a.contactedLeads)

  const totalEmails = leaderboard.reduce((s: number, u: any) => s + u.emailsSent, 0)
  const totalContacted = leaderboard.reduce((s: number, u: any) => s + u.contactedLeads, 0)
  const totalReplies = leaderboard.reduce((s: number, u: any) => s + u.repliedLeads, 0)
  const totalBooked = leaderboard.reduce((s: number, u: any) => s + u.bookedCalls, 0)

  return (
    <div className="space-y-8 animate-fadein">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" /> Team Performance
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Track who&apos;s researching, reaching out, and closing.
        </p>
      </div>

      {/* Top-line stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Emails Sent",   value: totalEmails,    icon: Mail,         color: "text-blue-600 bg-blue-50 border-blue-100" },
          { label: "Contacted",     value: totalContacted, icon: Send,         color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
          { label: "Replies",       value: totalReplies,   icon: CheckCircle2, color: "text-green-600 bg-green-50 border-green-100" },
          { label: "Booked Calls",  value: totalBooked,    icon: Star,         color: "text-amber-600 bg-amber-50 border-amber-100" },
        ].map((s: any) => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.color} shadow-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" /> Researcher Leaderboard
          </h2>
          <span className="text-xs text-gray-400">Last 7 days highlighted</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">#</th>
                <th className="text-left px-4 py-3 font-semibold">Researcher</th>
                <th className="text-left px-4 py-3 font-semibold">Region / Niche</th>
                <th className="text-center px-4 py-3 font-semibold">Sessions</th>
                <th className="text-center px-4 py-3 font-semibold">Leads</th>
                <th className="text-center px-4 py-3 font-semibold">Emails</th>
                <th className="text-center px-4 py-3 font-semibold">Contacted</th>
                <th className="text-center px-4 py-3 font-semibold">Replies</th>
                <th className="text-center px-4 py-3 font-semibold">Booked</th>
                <th className="text-center px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leaderboard.map((user: any, idx: number) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{user.role.replace("_", " ")}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">
                    <span className="text-xs">{user.region} · {user.niche}</span>
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-gray-900">{user.totalSessions}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-semibold text-gray-900">{user.totalLeads}</span>
                    {user.recentLeads > 0 && (
                      <span className="ml-1 text-xs text-green-600 font-medium flex items-center justify-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />{user.recentLeads}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center font-semibold text-blue-600">{user.emailsSent}</td>
                  <td className="px-4 py-4 text-center font-semibold text-indigo-600">{user.contactedLeads}</td>
                  <td className="px-4 py-4 text-center font-semibold text-green-600">{user.repliedLeads}</td>
                  <td className="px-4 py-4 text-center font-semibold text-amber-600">{user.bookedCalls}</td>
                  <td className="px-4 py-4 text-center">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" /> Idle
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
