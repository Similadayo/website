import { db } from "@/lib/db"
import { auth } from "@/auth"
import { Shield, UserCheck, UserX, Plus, MapPin } from "lucide-react"
import { createUser, toggleUserActive, upsertAssignment } from "./actions"

const ROLES = ["super_admin", "researcher", "reviewer", "outreach"] as const

export default async function UsersPage() {
  const session = await auth()
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignments: true,
      _count: { select: { ownedLeads: true } },
    },
  })

  return (
    <div className="space-y-8 animate-fadein">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-600" /> Team Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage user accounts, roles, and assignments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* User list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Team Members ({users.length})</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {users.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  <p>No team members yet. Invite someone using the form.</p>
                </div>
              ) : (
                users.map((user: any) => (
                  <div key={user.id} className={`px-6 py-4 flex items-center justify-between gap-4 ${!user.active ? "opacity-50" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 truncate">{user.name ?? "—"}</span>
                        {user.id === session?.user?.id && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">You</span>
                        )}
                        {!user.active && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Inactive</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <div className="flex gap-2 mt-1 flex-wrap items-center">
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium capitalize">
                          {user.role.replace("_", " ")}
                        </span>
                        {user.assignments.map((a: any) => (
                          <span key={a.id} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{[a.region, a.niche].filter(Boolean).join(" · ")}
                          </span>
                        ))}
                      </div>

                      {/* Inline assignment form */}
                      <form action={async (fd: FormData) => {
                        "use server"
                        await upsertAssignment(
                          user.id,
                          fd.get("region") as string ?? "",
                          fd.get("niche")  as string ?? ""
                        )
                      }} className="flex gap-2 mt-2 flex-wrap">
                        <input
                          name="region"
                          defaultValue={user.assignments[0]?.region ?? ""}
                          placeholder="Region (e.g. London)"
                          className="text-xs border border-gray-200 rounded px-2 py-1.5 w-36 focus:ring-1 focus:ring-indigo-400 outline-none"
                        />
                        <input
                          name="niche"
                          defaultValue={user.assignments[0]?.niche ?? ""}
                          placeholder="Niche (e.g. Recruitment)"
                          className="text-xs border border-gray-200 rounded px-2 py-1.5 w-40 focus:ring-1 focus:ring-indigo-400 outline-none"
                        />
                        <button type="submit"
                          className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 transition-colors font-medium">
                          Save
                        </button>
                      </form>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 text-sm text-gray-500">
                      <span className="tabular-nums">{user._count.ownedLeads} leads</span>
                      {user.id !== session?.user?.id && (
                        <form action={async () => {
                          "use server"
                          await toggleUserActive(user.id, !user.active)
                        }}>
                          <button type="submit"
                            className={`p-1.5 rounded-lg transition-colors ${user.active ? "hover:bg-red-50 text-gray-400 hover:text-red-500" : "hover:bg-green-50 text-gray-400 hover:text-green-500"}`}
                            title={user.active ? "Deactivate" : "Activate"}>
                            {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add user form */}
        <div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" /> Add Team Member
            </h2>
            <form action={createUser} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                <input id="name" name="name" type="text" required placeholder="Jane Smith"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input id="email" name="email" type="email" required placeholder="jane@brancr.co"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label htmlFor="role" className="block text-xs font-semibold text-gray-600 mb-1.5">Role</label>
                <select id="role" name="role"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white">
                  {ROLES.map((r: string) => (
                    <option key={r} value={r}>{r.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <button type="submit"
                className="w-full bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors">
                Add Member
              </button>
              <p className="text-xs text-gray-400 text-center">
                User will sign in via Google or set a password on first login.
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
