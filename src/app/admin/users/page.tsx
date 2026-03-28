import { db } from "@/lib/db"
import { auth } from "@/auth"
import { Shield, UserCheck, UserX, Plus, Target, Mail, Trash2 } from "lucide-react"
import { createUser, toggleUserActive, upsertAssignment, deleteUser } from "./actions"

const ROLES = ["researcher", "admin", "super_admin"] as const

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
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-black dark:text-white" />
          Command Center
        </h1>
        <p className="text-gray-500 text-sm mt-1 font-medium italic">Manage administrative clearance and territory assignments for the operations team.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* User list */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden group hover:shadow-xl dark:hover:shadow-none transition-all duration-300">
            <div className="px-10 py-8 border-b border-gray-50 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Active Operatives ({users.length})</h2>
            </div>
            
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {users.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <p className="font-bold uppercase tracking-widest text-xs">No personnel detected</p>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className={`px-10 py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 transition-colors ${!user.active ? "opacity-40 grayscale" : "hover:bg-gray-50/20 dark:hover:bg-white/5"}`}>
                    
                    {/* Personnel Info */}
                    <div className="flex items-center gap-6 min-w-[300px]">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ${
                        user.role === 'super_admin' ? 'bg-black text-white' : 
                        user.role === 'admin' ? 'bg-blue-600 text-white' : 
                        'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-white/10'
                      }`}>
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider">{user.name}</h3>
                          {user.id === session?.user?.id && (
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-md">Master</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md tracking-widest uppercase bg-gray-100 dark:bg-white/10 text-gray-400">
                            {user.role}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Territory Assignment */}
                    <div className="flex-1 max-w-xl">
                      <form action={async (formData: FormData) => {
                        "use server"
                        const territory = formData.get("territory") as string
                        await upsertAssignment(user.id, territory)
                      }} className="flex items-center gap-3">
                        <div className="relative group/input flex-1">
                           <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within/input:text-black dark:group-focus-within/input:text-white transition-colors" />
                           <input
                            name="territory"
                            defaultValue={user.assignments[0]?.niche ?? ""}
                            placeholder="Operational Territory (e.g. Texas Recruiting)"
                            className="pl-10 pr-4 py-3 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[11px] font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all w-full placeholder:text-gray-400 dark:placeholder:text-gray-500"
                          />
                        </div>
                        <button type="submit"
                          className="bg-black dark:bg-white dark:text-black text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-95 shadow-lg shadow-gray-100 dark:shadow-none">
                          Deploy
                        </button>
                      </form>
                    </div>

                    {/* Operational Actions */}
                    <div className="flex items-center justify-end gap-6 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums leading-none">{user._count.ownedLeads}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Missions</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {user.id !== session?.user?.id && (
                          <>
                            <form action={async () => {
                              "use server"
                              await toggleUserActive(user.id, !user.active)
                            }}>
                              <button type="submit"
                                title={user.active ? "Suspend" : "Restore"}
                                className={`p-3 rounded-xl border transition-all active:scale-95 ${
                                  user.active 
                                    ? "bg-white dark:bg-white/5 text-gray-400 border-gray-100 dark:border-white/10 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20" 
                                    : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100"
                                }`}>
                                {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </button>
                            </form>

                            {(session?.user as any).role === "super_admin" && (
                              <form action={async () => {
                                "use server"
                                // Note: In a real app we'd use a custom client-side confirmation dialog
                                await deleteUser(user.id)
                              }}>
                                <button type="submit"
                                  className="p-3 rounded-xl bg-white dark:bg-white/5 text-gray-300 border border-gray-100 dark:border-white/10 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-95">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </form>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm p-10 group hover:shadow-xl dark:hover:shadow-none transition-all duration-300">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <Plus className="w-5 h-5 text-black dark:text-white" /> Onboard Operative
            </h2>
            <form action={createUser} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Personnel Name</label>
                <input id="name" name="name" type="text" required placeholder="Jane Smith"
                  className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Clearance Email</label>
                <input id="email" name="email" type="email" required placeholder="jane@brancr.com"
                  className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Access Role</label>
                <select id="role" name="role"
                  className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all appearance-none cursor-pointer">
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">{r.replace("_", " ").toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <button type="submit"
                className="w-full bg-black dark:bg-white dark:text-black text-white text-[10px] font-black uppercase tracking-[0.3em] py-5 rounded-3xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-95 shadow-2xl shadow-gray-200 dark:shadow-none flex items-center justify-center gap-3">
                Initialize Operative
              </button>
            </form>
          </div>

          <div className="bg-gray-900 dark:bg-white/5 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-gray-200 dark:shadow-none grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Tactical Note</h3>
            </div>
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic">
              Operatives are initialized with the default clearance password: <strong className="text-white">Brancr2024!</strong>. 
              Prompt them to rotate their credentials immediately upon first mission briefing.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
