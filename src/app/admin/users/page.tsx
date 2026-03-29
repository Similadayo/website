import { db } from "@/lib/db"
import { auth } from "@/auth"
import { Shield, UserCheck, UserX, Plus, Target, Trash2, MapPin, Activity, Terminal, ExternalLink, MoreVertical } from "lucide-react"
import { createUser, toggleUserActive, upsertAssignment, deleteUser } from "./actions"

const ROLES = [
  { value: "researcher", label: "Researcher", desc: "Access to lead research and discovery tools." },
  { value: "admin", label: "Administrator", desc: "Full access to research and lead management." },
  { value: "super_admin", label: "Super Admin", desc: "Global oversight, recruitment and settings." },
] as const

export default async function UsersPage() {
  const session = await auth()
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignments: true,
      _count: { select: { ownedLeads: true } },
    },
  })

  const currentUser = session?.user

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Section */}
      <header className="relative space-y-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black dark:bg-white rounded-2xl shadow-xl shadow-black/10 dark:shadow-white/5">
            <Shield className="w-8 h-8 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
              Command Center
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              Administrative clearance and territory assignments.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Operatives Grid (Main Content) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2 px-2">
             <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
               Personnel Directory <span className="opacity-30">/</span> {users.length} Active
             </h2>
          </div>

          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] py-24 flex flex-col items-center justify-center text-center">
                <Terminal className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed"> No personnel detected in terminal.<br/><span className="text-[10px] font-medium normal-case opacity-50 italic font-serif">Awaiting initial operative onboarding...</span></p>
              </div>
            ) : (
              users.map((user) => {
                const isActive = user.active
                const activeAssignment = user.assignments[0]
                const isMe = user.id === currentUser?.id
                const assignmentAction = upsertAssignment.bind(null, user.id)

                return (
                  <div 
                    key={user.id} 
                    className={`group relative bg-white dark:bg-gray-900/40 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5 ${!isActive && "opacity-60 grayscale scale-[0.98]"}`}
                  >
                    {/* Status Glow (Top Bar) */}
                    <div className={`h-1 w-full absolute top-0 left-0 transition-opacity ${isActive ? (user.role === 'super_admin' ? 'bg-indigo-500' : 'bg-emerald-500') : 'bg-gray-400'} opacity-0 group-hover:opacity-100 duration-500`} />

                    <div className="p-8 md:p-10">
                      <div className="flex flex-col xl:flex-row gap-10 xl:items-center">
                        
                        {/* Personnel Detail */}
                        <div className="flex items-center gap-6 min-w-0 xl:w-72 flex-shrink-0">
                          <div className={`relative w-16 h-16 flex-shrink-0 group-hover:scale-105 transition-transform duration-500`}>
                            <div className={`absolute inset-0 rounded-2xl rotate-3 scale-110 opacity-20 blur-sm transition-transform duration-500 group-hover:rotate-6 ${
                              user.role === 'super_admin' ? 'bg-indigo-500' : 
                              user.role === 'admin' ? 'bg-blue-500' : 
                              'bg-emerald-500'
                            }`} />
                            <div className={`relative w-full h-full rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner border-t border-white/20 dark:border-white/10 ${
                              user.role === 'super_admin' ? 'bg-gray-950 text-indigo-400' : 
                              user.role === 'admin' ? 'bg-gray-950 text-blue-400' : 
                              'bg-gray-950 text-emerald-400'
                            }`}>
                              {user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            {isActive && (
                               <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-[3px] border-white dark:border-gray-900 rounded-full shadow-sm animate-pulse" />
                            )}
                          </div>
                          
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                                {user.name}
                              </h3>
                              {isMe && (
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-indigo-500 text-white px-2 py-0.5 rounded-full shadow-lg shadow-indigo-500/20">ME</span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1 italic flex items-center gap-1.5 leading-none">
                              {user.role.replace("_", " ")}
                              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                              <span className="normal-case tracking-tight font-medium text-gray-500 lowercase opacity-80">{user.email}</span>
                            </p>
                          </div>
                        </div>

                        {/* Tactical Assignment Form */}
                        <div className="flex-1">
                          <form action={assignmentAction} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 bg-gray-50/50 dark:bg-white/5 p-2 rounded-3xl border border-gray-100 dark:border-white/5 group/form transition-all duration-300 focus-within:ring-2 focus-within:ring-white/10">
                            <div className="relative">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within/form:text-indigo-500 transition-colors" />
                              <input
                                name="region"
                                defaultValue={activeAssignment?.region ?? ""}
                                placeholder="Assign Region..."
                                className="w-full pl-10 pr-4 py-3.5 bg-transparent border-none text-[11px] font-bold text-gray-900 dark:text-white focus:ring-0 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 tracking-wider"
                              />
                            </div>
                            <div className="relative border-t md:border-t-0 md:border-l border-gray-100 dark:border-white/10">
                              <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within/form:text-emerald-500 transition-colors" />
                              <input
                                name="niche"
                                defaultValue={activeAssignment?.niche ?? ""}
                                placeholder="Niche / Target Sector..."
                                className="w-full pl-10 pr-4 py-3.5 bg-transparent border-none text-[11px] font-bold text-gray-900 dark:text-white focus:ring-0 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 tracking-wider"
                              />
                            </div>
                            <button
                              type="submit"
                              className="bg-black dark:bg-white dark:text-black text-white px-6 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 dark:hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-gray-200 dark:shadow-none flex items-center justify-center gap-2 group/btn"
                            >
                              Deploy
                              <ExternalLink className="w-3 h-3 opacity-50 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </button>
                          </form>
                        </div>

                        {/* Operational Metrics & Actions */}
                        <div className="flex items-center justify-between xl:justify-end gap-10 flex-shrink-0 border-t xl:border-t-0 pt-6 xl:pt-0 border-gray-100 dark:border-white/5">
                          <div className="text-right group/metrics">
                            <div className="flex items-baseline justify-end gap-1 transition-transform group-hover/metrics:-translate-y-1 duration-300">
                              <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums leading-none italic">{user._count.ownedLeads}</p>
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mb-1 opacity-0 group-hover/metrics:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2 opacity-60">Missions Complete</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isMe && (
                              <>
                                <form action={async () => {
                                  "use server"
                                  await toggleUserActive(user.id, !user.active)
                                }}>
                                  <button type="submit"
                                    title={isActive ? "Suspend Access" : "Restore Access"}
                                    className={`p-4 rounded-2xl border transition-all duration-300 active:scale-90 ${
                                      isActive 
                                        ? "bg-white dark:bg-white/5 text-gray-400 border-gray-100 dark:border-white/10 hover:text-orange-500 hover:border-orange-200 dark:hover:border-orange-900 shadow-sm" 
                                        : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100"
                                    }`}>
                                    {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                  </button>
                                </form>

                                {(currentUser as any)?.role === "super_admin" && (
                                  <form action={async () => {
                                    "use server"
                                    await deleteUser(user.id)
                                  }}>
                                    <button type="submit"
                                      className="p-4 rounded-2xl bg-white dark:bg-white/5 text-gray-300 border border-gray-100 dark:border-white/10 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 transition-all active:scale-95 shadow-sm">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </form>
                                )}
                              </>
                            )}
                            {isMe && (
                               <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 text-gray-400 opacity-30 cursor-not-allowed">
                                  <MoreVertical className="w-4 h-4" />
                               </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Control Panel (Sidebar) */}
        <div className="lg:col-span-4 space-y-8 sticky top-6">
          
          {/* Onboarding Panel */}
          <div className="relative bg-white dark:bg-gray-900/40 backdrop-blur-3xl border border-gray-200 dark:border-white/10 rounded-[3rem] p-10 shadow-2xl shadow-black/5 dark:shadow-none overflow-hidden isolate">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-indigo-500/10 dark:bg-white/5 rounded-full blur-3xl -z-10" />
            
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1 flex items-center gap-3">
              <Plus className="w-5 h-5 text-indigo-500" /> New Operative
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8 opacity-60">Initialize new personnel credentials</p>
            
            <form action={createUser} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Personnel Name</label>
                <input id="name" name="name" type="text" required placeholder="Jane Smith"
                  className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600" />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Secure Email</label>
                <input id="email" name="email" type="email" required placeholder="jane@brancr.com"
                  className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600" />
              </div>
              <div className="space-y-4">
                <label htmlFor="role" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Access Role</label>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map((r) => (
                    <label key={r.value} className="relative flex flex-col p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all group/role">
                      <input type="radio" name="role" value={r.value} defaultChecked={r.value === "researcher"} className="absolute opacity-0" />
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-black uppercase text-gray-900 dark:text-gray-100 group-hover/role:text-indigo-600 dark:group-hover/role:text-indigo-400 transition-colors uppercase tracking-widest">{r.label}</span>
                        <div className="w-3 h-3 rounded-full border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all [.group/role_input:checked+&]:border-indigo-500 [.group/role_input:checked+&]:bg-indigo-500" />
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight pr-4">{r.desc}</p>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit"
                className="w-full bg-black dark:bg-white dark:text-black text-white text-[10px] font-black uppercase tracking-[0.3em] py-5 rounded-3xl hover:bg-indigo-600 dark:hover:bg-indigo-400 transition-all active:scale-95 shadow-2xl shadow-indigo-500/20 dark:shadow-none flex items-center justify-center gap-3">
                Initialize System Access
              </button>
            </form>
          </div>

          {/* Tactical Note */}
          <div className="group relative bg-gray-950 dark:bg-white/5 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-black/10 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-transparent to-indigo-500 opacity-50" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400">Tactical Brief</h3>
            </div>
            
            <p className="text-[11px] text-gray-400 font-medium leading-[1.8] italic">
              Operatives are initialized with the default clearance password: 
              <br/>
              <span className="inline-block mt-3 px-3 py-1 bg-white/10 rounded-lg text-white font-black not-italic border border-white/10 group-hover:border-emerald-500/50 transition-colors select-all">
                Brancr2024!
              </span>
            </p>
            <p className="text-[10px] text-gray-500 mt-6 leading-relaxed flex items-start gap-2 border-t border-white/5 pt-6">
              <Activity className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>Mandate immediate credential rotation upon first mission briefing for full clearance audit.</span>
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}
