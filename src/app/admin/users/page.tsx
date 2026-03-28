import { db } from "@/lib/db"
import { auth } from "@/auth"
import { Shield, UserCheck, UserX, Plus, MapPin, Target, Mail } from "lucide-react"
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
    <div className="space-y-12 animate-fadein pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-black" />
            Command Center
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium italic">Manage administrative clearance and territory assignments for the operations team.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

        {/* User list */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
            <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Active Operatives ({users.length})</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {users.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <p className="font-bold uppercase tracking-widest text-xs">No personnel detected</p>
                </div>
              ) : (
                users.map((user: any) => (
                  <div key={user.id} className={`px-10 py-8 flex items-start justify-between gap-8 transition-colors ${!user.active ? "opacity-40 grayscale" : "hover:bg-gray-50/30"}`}>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200 overflow-hidden font-black text-gray-400 text-lg">
                          {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : user.name?.[0] || 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-gray-900 tracking-tight">{user.name ?? "—"}</span>
                            {user.id === session?.user?.id && (
                              <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2.5 py-1 rounded-lg">Master</span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5 opacity-40" /> {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl border border-gray-200">
                          {user.role.replace("_", " ")}
                        </span>
                        {user.assignments.map((a: any) => (
                          <span key={a.id} className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> {a.region || "Global"} · {a.niche || "General"}
                          </span>
                        ))}
                      </div>

                      {/* Professional assignment form */}
                      <form action={async (fd: FormData) => {
                        "use server"
                        await upsertAssignment(
                          user.id,
                          fd.get("region") as string ?? "",
                          fd.get("niche") as string ?? ""
                        )
                      }} className="flex items-center gap-3 pt-2">
                        <div className="relative group/input">
                           <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within/input:text-black dark:group-focus-within/input:text-white transition-colors" />
                           <input
                            name="region"
                            defaultValue={user.assignments[0]?.region ?? ""}
                            placeholder="Set Region..."
                            className="pl-10 pr-4 py-3 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[11px] font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all w-40 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                          />
                        </div>
                        <div className="relative group/input">
                           <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within/input:text-black dark:group-focus-within/input:text-white transition-colors" />
                           <input
                            name="niche"
                            defaultValue={user.assignments[0]?.niche ?? ""}
                            placeholder="Set Niche..."
                            className="pl-10 pr-4 py-3 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[11px] font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all w-44 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                          />
                        </div>
                        <button type="submit"
                          className="bg-black dark:bg-white dark:text-black text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-95 shadow-lg shadow-gray-100 dark:shadow-none">
                          Assign
                        </button>
                      </form>
                    </div>

                    <div className="flex flex-col items-end gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums leading-none">{user._count.ownedLeads}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{user._count.ownedLeads === 1 ? 'Mission' : 'Missions'}</p>
                      </div>

                      {user.id !== session?.user?.id && (
                        <form action={async () => {
                          "use server"
                          await toggleUserActive(user.id, !user.active)
                        }}>
                          <button type="submit"
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
                              user.active 
                                ? "bg-white dark:bg-white/5 text-gray-400 border-gray-100 dark:border-white/10 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" 
                                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                            }`}>
                            {user.active ? "Suspend" : "Restore"}
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
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm p-10 group hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-none transition-all duration-300">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <Plus className="w-5 h-5 text-black dark:text-white" /> Onboard Operative
            </h2>
            <form action={createUser} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Personnel Name</label>
                <input id="name" name="name" type="text" required placeholder="Jane Smith"
                  className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Clearance Email</label>
                <input id="email" name="email" type="email" required placeholder="jane@brancr.com"
                  className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Role</label>
                <select id="role" name="role"
                  className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all appearance-none cursor-pointer">
                  {ROLES.map((r: string) => (
                    <option key={r} value={r} className="bg-white dark:bg-gray-900">{r.replace("_", " ").toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <button type="submit"
                className="w-full bg-black dark:bg-white dark:text-black text-white text-[10px] font-black uppercase tracking-[0.3em] py-5 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-95 shadow-2xl shadow-gray-200 dark:shadow-none flex items-center justify-center gap-3">
                Initialize Operative
              </button>
            </form>
          </div>

          <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-widest">Protocol Reminder</h3>
            </div>
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic">
              Assignments define the operational footprint. Researchers will only see intel and outreach targets from their assigned sectors.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
