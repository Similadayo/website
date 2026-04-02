import { auth } from "@/auth"
import { db } from "@/lib/db"
import { ASSIGNMENT_NICHE_OPTIONS, ASSIGNMENT_REGION_OPTIONS } from "@/lib/assignments"
import { formatAdminTimestamp, getRelativeDayLabel } from "@/lib/datetime"
import { createUser, deleteUser, toggleUserActive, upsertAssignment } from "./actions"
import { BriefcaseBusiness, ChevronDown, MapPin, Shield, Trash2, UserCheck, UserPlus, UserX, Users } from "lucide-react"

const ROLES = [
  { value: "researcher", label: "Researcher", desc: "Owns discovery, qualification, and first-pass outreach review." },
  { value: "admin", label: "Administrator", desc: "Manages operations and assists with team coordination." },
  { value: "super_admin", label: "Super Admin", desc: "Controls global access, users, and system-wide administration." },
] as const

export default async function UsersPage() {
  const session = await auth()
  const currentUser = session?.user

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignments: true,
      _count: { select: { ownedLeads: true } },
    },
  })
  const activeRegionAssignments = users.flatMap((user) =>
    user.assignments
      .filter((assignment) => assignment.status === "active" && assignment.region)
      .map((assignment) => ({ userId: user.id, region: assignment.region as string }))
  )

  return (
    <div className="space-y-6">
      <section className="admin-card p-6 sm:p-8">
        <p className="admin-eyebrow">Users</p>
        <h1 className="admin-section-title mt-3 max-w-3xl">Keep team structure, assignments, and access in one place.</h1>
        <p className="admin-section-copy mt-4 max-w-2xl">
          This is the operating roster. Each user card is optimized for quick assignment updates, status changes, and role visibility.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--admin-border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--admin-soft-text)]">
          <Users className="h-4 w-4 text-[color:var(--admin-accent)]" />
          {users.length} active records
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {users.map((user) => {
            const isMe = user.id === currentUser?.id
            const activeAssignment = user.assignments[0]
            const assignmentAction = upsertAssignment.bind(null, user.id)
            const currentRegion = activeAssignment?.region ?? ""
            const currentNiche = activeAssignment?.niche ?? ""
            const takenRegionsByOthers = new Set(
              activeRegionAssignments
                .filter((assignment) => assignment.userId !== user.id)
                .map((assignment) => assignment.region)
            )
            const hasCustomRegion = currentRegion && !ASSIGNMENT_REGION_OPTIONS.includes(currentRegion as (typeof ASSIGNMENT_REGION_OPTIONS)[number])
            const hasCustomNiche = currentNiche && !ASSIGNMENT_NICHE_OPTIONS.includes(currentNiche as (typeof ASSIGNMENT_NICHE_OPTIONS)[number])

            return (
              <div key={user.id} className={`admin-card p-5 sm:p-6 ${!user.active ? "opacity-70" : ""}`}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--admin-card-strong)] text-sm font-black text-[color:var(--admin-ink)]">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">{user.name || "Unnamed user"}</p>
                          {isMe && <span className="admin-pill admin-pill-accent">You</span>}
                          {!user.active && <span className="admin-pill admin-pill-warning">Suspended</span>}
                        </div>
                        <p className="mt-1 text-sm text-[color:var(--admin-soft-text)]">{user.email}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="admin-pill admin-pill-neutral">{user.role.replace(/_/g, " ")}</span>
                      <span className="admin-pill admin-pill-neutral">{user._count.ownedLeads} owned leads</span>
                      <span className="admin-pill admin-pill-neutral">
                        {user.lastLoginAt ? `${getRelativeDayLabel(user.lastLoginAt)} • ${formatAdminTimestamp(user.lastLoginAt)}` : "No successful login yet"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!isMe && (
                      <form
                        action={async () => {
                          "use server"
                          await toggleUserActive(user.id, !user.active)
                        }}
                      >
                        <button type="submit" className={`admin-pill ${user.active ? "admin-pill-warning" : "admin-pill-success"}`}>
                          {user.active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                          {user.active ? "Suspend" : "Activate"}
                        </button>
                      </form>
                    )}

                    {!isMe && (currentUser as any)?.role === "super_admin" && (
                      <form
                        action={async () => {
                          "use server"
                          await deleteUser(user.id)
                        }}
                      >
                        <button type="submit" className="admin-pill admin-pill-danger">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </form>
                    )}

                    {isMe && (
                      <span className="admin-pill admin-pill-accent">
                        <Shield className="h-3.5 w-3.5" />
                        Protected
                      </span>
                    )}
                  </div>
                </div>

                <form action={assignmentAction} className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_140px] lg:items-end">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 px-1 text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">
                      <MapPin className="h-3.5 w-3.5" />
                      Region
                    </label>
                    <div className="relative overflow-hidden rounded-[20px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,242,233,0.95))] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition focus-within:border-[color:var(--admin-accent)] focus-within:ring-2 focus-within:ring-[color:var(--admin-accent)]/10">
                      <select
                        name="region"
                        defaultValue={currentRegion}
                        className="h-16 w-full appearance-none bg-transparent pl-4 pr-12 text-sm font-semibold text-[color:var(--admin-ink)] outline-none"
                      >
                        <option value="">Select region</option>
                        {ASSIGNMENT_REGION_OPTIONS.map((option) => {
                          const disabled = option !== currentRegion && takenRegionsByOthers.has(option)
                          return (
                            <option key={option} value={option} disabled={disabled}>
                              {disabled ? `${option} (Assigned)` : option}
                            </option>
                          )
                        })}
                        {hasCustomRegion && <option value={currentRegion}>{currentRegion}</option>}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--admin-muted)]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 px-1 text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">
                      <BriefcaseBusiness className="h-3.5 w-3.5" />
                      Niche
                    </label>
                    <div className="relative overflow-hidden rounded-[20px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,242,233,0.95))] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition focus-within:border-[color:var(--admin-accent)] focus-within:ring-2 focus-within:ring-[color:var(--admin-accent)]/10">
                      <select
                        name="niche"
                        defaultValue={currentNiche}
                        className="h-16 w-full appearance-none bg-transparent pl-4 pr-12 text-sm font-semibold text-[color:var(--admin-ink)] outline-none"
                      >
                        <option value="">Select niche</option>
                        {ASSIGNMENT_NICHE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                        {hasCustomNiche && <option value={currentNiche}>{currentNiche}</option>}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--admin-muted)]" />
                    </div>
                  </div>
                  <button type="submit" className="h-16 rounded-[20px] bg-[color:var(--admin-accent)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(36,87,245,0.18)] transition hover:translate-y-[-1px] hover:shadow-[0_22px_44px_rgba(36,87,245,0.22)]">
                    Save assignment
                  </button>
                </form>
                {takenRegionsByOthers.size > 0 && (
                  <p className="mt-3 text-xs text-[color:var(--admin-soft-text)]">
                    Regions already assigned to someone else are shown as unavailable.
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="space-y-4">
          <div className="admin-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--admin-accent)] text-white">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Add a new operator</p>
                <p className="mt-1 text-sm text-[color:var(--admin-soft-text)]">Provision a teammate and place them into the active workflow.</p>
              </div>
            </div>

            <form action={createUser} className="mt-6 space-y-4">
              <input
                name="name"
                type="text"
                required
                placeholder="Full name"
                className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm text-[color:var(--admin-ink)] outline-none"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="name@brancr.com"
                className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm text-[color:var(--admin-ink)] outline-none"
              />

              <div className="space-y-3">
                {ROLES.map((role) => (
                  <label key={role.value} className="block rounded-[18px] border border-[color:var(--admin-border)] bg-[color:var(--admin-card-strong)] p-4">
                    <input type="radio" name="role" value={role.value} defaultChecked={role.value === "researcher"} className="mr-3" />
                    <span className="text-sm font-semibold text-[color:var(--admin-ink)]">{role.label}</span>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">{role.desc}</p>
                  </label>
                ))}
              </div>

              <button type="submit" className="w-full rounded-[18px] bg-[color:var(--admin-accent)] px-5 py-3 text-sm font-bold text-white">
                Create operator
              </button>
            </form>
          </div>

          <div className="admin-card p-6">
            <p className="text-sm font-semibold text-[color:var(--admin-ink)]">Access note</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">
              New users start with default credentials until they rotate their password. Assign region and niche immediately so the home and research flows stay relevant.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
