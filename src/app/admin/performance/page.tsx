import { db } from "@/lib/db"
import { auth } from "@/auth"
import { CheckCircle2, Mail, Send, Star, Users } from "lucide-react"

export default async function PerformancePage() {
  const session = await auth()
  if (!session?.user?.id) return null

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
              messages: {
                select: { sentAt: true },
                where: { sentAt: { not: null } },
              },
            },
          },
        },
      },
      researchSessions: {
        select: { id: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const leaderboard = users
    .map((user: any) => {
      const totalLeads = user.ownedLeads.length
      const contactedLeads = user.ownedLeads.filter((lead: any) => ["contacted", "replied", "booked_call", "closed_won"].includes(lead.stage)).length
      const repliedLeads = user.ownedLeads.filter((lead: any) => ["replied", "booked_call", "closed_won"].includes(lead.stage)).length
      const bookedCalls = user.ownedLeads.filter((lead: any) => ["booked_call", "closed_won"].includes(lead.stage)).length
      const emailsSent = user.ownedLeads.reduce(
        (sum: number, lead: any) => sum + lead.threads.reduce((threadSum: number, thread: any) => threadSum + thread.messages.length, 0),
        0
      )

      return {
        id: user.id,
        name: user.name ?? user.email ?? "Operator",
        role: user.role,
        region: user.assignments[0]?.region ?? "Unassigned",
        niche: user.assignments[0]?.niche ?? "General",
        totalLeads,
        emailsSent,
        contactedLeads,
        repliedLeads,
        bookedCalls,
        totalSessions: user.researchSessions.length,
      }
    })
    .sort((a, b) => b.contactedLeads - a.contactedLeads)

  const totalEmails = leaderboard.reduce((sum, user) => sum + user.emailsSent, 0)
  const totalContacted = leaderboard.reduce((sum, user) => sum + user.contactedLeads, 0)
  const totalReplies = leaderboard.reduce((sum, user) => sum + user.repliedLeads, 0)
  const totalBooked = leaderboard.reduce((sum, user) => sum + user.bookedCalls, 0)

  return (
    <div className="space-y-6">
      <section className="admin-card p-6 sm:p-8">
        <p className="admin-eyebrow">Team</p>
        <h1 className="admin-section-title mt-3 max-w-3xl">See who is pushing research into real conversations.</h1>
        <p className="admin-section-copy mt-4 max-w-2xl">
          Team performance is summarized for quick management review without turning the product into a dense reporting dashboard.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <TopStat label="Emails sent" value={totalEmails} icon={<Mail className="h-4 w-4" />} />
          <TopStat label="Contacted" value={totalContacted} icon={<Send className="h-4 w-4" />} />
          <TopStat label="Replies" value={totalReplies} icon={<CheckCircle2 className="h-4 w-4" />} />
          <TopStat label="Booked calls" value={totalBooked} icon={<Star className="h-4 w-4" />} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {leaderboard.map((user, index) => (
          <div key={user.id} className="admin-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[color:var(--admin-card-strong)] text-lg font-black text-[color:var(--admin-ink)]">
                  {index + 1}
                </div>
                <div>
                  <p className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">{user.name}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--admin-muted)]">
                    {user.role.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <span className="admin-pill admin-pill-neutral">{user.totalSessions} sessions</span>
            </div>

            <div className="mt-5 rounded-[22px] bg-[color:var(--admin-card-strong)] p-4">
              <p className="text-sm font-semibold text-[color:var(--admin-ink)]">
                {user.region} • {user.niche}
              </p>
              <p className="mt-2 text-sm text-[color:var(--admin-soft-text)]">
                {user.totalLeads} leads owned, {user.contactedLeads} contacted, {user.repliedLeads} replies, {user.bookedCalls} booked.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="Leads" value={user.totalLeads} />
              <MiniStat label="Emails" value={user.emailsSent} />
              <MiniStat label="Replies" value={user.repliedLeads} />
              <MiniStat label="Booked" value={user.bookedCalls} />
            </div>
          </div>
        ))}
      </section>

      {leaderboard.length === 0 && (
        <div className="admin-card p-6">
          <p className="text-xl font-semibold text-[color:var(--admin-ink)]">No active operators found.</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">Add team members and assignments to populate the performance view.</p>
        </div>
      )}
    </div>
  )
}

function TopStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-[color:var(--admin-border)] bg-white p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]">
          {icon}
        </span>
        {label}
      </div>
      <p className="admin-metric-value mt-4">{value}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-[color:var(--admin-border)] bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--admin-ink)]">{value}</p>
    </div>
  )
}
