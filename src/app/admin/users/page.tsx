import { auth } from "@/auth"
import { db } from "@/lib/db"
import { formatAdminTimestamp, getRelativeDayLabel } from "@/lib/datetime"
import { createUser, deleteUser, toggleUserActive, upsertAssignment } from "./actions"
import { Shield, Trash2, UserCheck, UserPlus, UserX, Users } from "lucide-react"

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

                <form action={assignmentAction} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    name="region"
                    defaultValue={activeAssignment?.region ?? ""}
                    placeholder="Region"
                    className="rounded-[18px] border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm text-[color:var(--admin-ink)] outline-none"
                  />
                  <input
                    name="niche"
                    defaultValue={activeAssignment?.niche ?? ""}
                    placeholder="Niche"
                    className="rounded-[18px] border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm text-[color:var(--admin-ink)] outline-none"
                  />
                  <button type="submit" className="rounded-[18px] bg-[color:var(--admin-accent)] px-5 py-3 text-sm font-bold text-white">
                    Save assignment
                  </button>
                </form>
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
