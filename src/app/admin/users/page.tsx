import { db } from "@/lib/db"
import { auth } from "@/auth"
import { Users, UserPlus, Shield, UserCheck, UserX, Trash2, MapPin, Target, BarChart3, Mail, MoreHorizontal } from "lucide-react"
import { createUser, toggleUserActive, upsertAssignment, deleteUser } from "./actions"

const ROLES = [
  { value: "researcher", label: "Researcher", desc: "Foundational research and lead discovery." },
  { value: "admin", label: "Administrator", desc: "Full access to research and management." },
  { value: "super_admin", label: "Super Admin", desc: "Global system oversight and configuration." },
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
    <div className="max-w-7xl mx-auto space-y-8 py-8 animate-in fade-in duration-500">
      
      {/* Professional Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
             User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage personnel, assignments, and access levels for your agency.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
             <Users className="w-3.5 h-3.5" />
             <span>{users.length} Users</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Main Section: High-Efficiency Data List */}
        <div className="xl:col-span-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            
            {/* Table Header (Desktop) */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
               <div className="col-span-4">Operative</div>
               <div className="col-span-2">Role</div>
               <div className="col-span-3">Assignment</div>
               <div className="col-span-1 text-center">Missions</div>
               <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.length === 0 ? (
                <div className="p-20 text-center">
                   <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-slate-400" />
                   </div>
                   <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No users found</h3>
                   <p className="text-xs text-slate-500 mt-1">Start by adding your first operative to the platform.</p>
                </div>
              ) : (
                users.map((user) => {
                  const isActive = user.active
                  const activeAssignment = user.assignments[0]
                  const isMe = user.id === currentUser?.id
                  const assignmentAction = upsertAssignment.bind(null, user.id)

                  return (
                    <div key={user.id} className={`grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-5 items-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/20 ${!isActive && "opacity-50"}`}>
                      
                      {/* Identity Column */}
                      <div className="col-span-1 lg:col-span-4 flex items-center gap-4 min-w-0">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold relative shrink-0 ${
                            isMe ? "bg-slate-900 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                         }`}>
                           {user.name?.[0]?.toUpperCase() || "U"}
                           {isActive && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />
                           )}
                         </div>
                         <div className="min-w-0">
                            <div className="flex items-center gap-2">
                               <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                               {isMe && <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter shadow-sm">You</span>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                               <Mail className="w-3 h-3 text-slate-400" />
                               <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                         </div>
                      </div>

                      {/* Role Column */}
                      <div className="col-span-1 lg:col-span-2">
                         <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800">
                           {user.role.replace("_", " ")}
                         </span>
                      </div>

                      {/* Assignment Column (Interactive) */}
                      <div className="col-span-1 lg:col-span-3">
                         <form action={assignmentAction} className="flex items-center gap-1 group">
                            <div className="flex flex-col sm:flex-row gap-1 w-full lg:w-auto">
                               <input 
                                 name="region" 
                                 defaultValue={activeAssignment?.region ?? ""} 
                                 placeholder="Region"
                                 className="text-xs px-3 py-1.5 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 rounded-md outline-none transition-all w-full leading-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400" 
                               />
                               <input 
                                 name="niche" 
                                 defaultValue={activeAssignment?.niche ?? ""} 
                                 placeholder="Niche"
                                 className="text-xs px-3 py-1.5 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 rounded-md outline-none transition-all w-full leading-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400" 
                               />
                            </div>
                            <button type="submit" className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0">
                               <Target className="w-3.5 h-3.5" />
                            </button>
                         </form>
                      </div>

                      {/* Metrics Column */}
                      <div className="col-span-1 lg:col-span-1 text-center">
                         <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <BarChart3 className="w-3 h-3 text-slate-400" />
                            <span className="text-xs font-black text-slate-900 dark:text-white">{user._count.ownedLeads}</span>
                         </div>
                      </div>

                      {/* Actions Column */}
                      <div className="col-span-1 lg:col-span-2 flex items-center justify-end gap-2">
                        {!isMe && (
                          <>
                            <form action={async () => {
                              "use server"
                              await toggleUserActive(user.id, !user.active)
                            }}>
                              <button type="submit" title={isActive ? "Suspend User" : "Activate User"}
                                className={`p-2 rounded-lg border transition-all ${
                                  isActive 
                                    ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-orange-500 hover:border-orange-500/30" 
                                    : "bg-green-500 text-white border-green-600 hover:bg-green-600"
                                }`}>
                                {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </button>
                            </form>
                            
                            {(currentUser as any)?.role === "super_admin" && (
                              <form action={async () => {
                                "use server"
                                await deleteUser(user.id)
                              }}>
                                <button type="submit" title="Delete User"
                                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500/30 transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </form>
                            )}
                          </>
                        )}
                        {isMe && <div className="p-2 text-slate-300 dark:text-slate-700"><Shield className="w-4 h-4" /></div>}
                      </div>

                    </div>
                  )
                })
              )}
            </div>
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
               <p className="text-[10px] text-slate-400 font-medium italic">Protocol Status: High-Performance Data Mode Active / All assignments synchronized.</p>
            </div>
          </div>
        </div>

        {/* Sidebar: Clean Provisioning Side Block */}
        <div className="xl:col-span-4 space-y-6 lg:sticky lg:top-8">
           
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 bg-slate-900 dark:bg-white dark:text-black rounded-lg text-white">
                    <UserPlus className="w-5 h-5" />
                 </div>
                 <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New User</h2>
              </div>

              <form action={createUser} className="space-y-5">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                   <input name="name" type="text" required placeholder="Operative Name"
                     className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" />
                </div>
                
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                   <input name="email" type="email" required placeholder="operative@brancr.com"
                     className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400" />
                </div>

                <div className="space-y-3">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Assigned Role</label>
                   <div className="space-y-2">
                     {ROLES.map((r) => (
                       <label key={r.value} className="relative flex flex-col p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent peer-checked:border-blue-500 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                         <input type="radio" name="role" value={r.value} defaultChecked={r.value === "researcher"} className="absolute opacity-0" />
                         <span className="text-xs font-bold text-slate-900 dark:text-white uppercase leading-none mb-1">{r.label}</span>
                         <span className="text-[10px] text-slate-500 leading-tight">{r.desc}</span>
                       </label>
                     ))}
                   </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-lg text-sm transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2">
                   Initialize Operative
                </button>
              </form>
           </div>

           <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                 <Shield className="w-4 h-4 text-slate-400" />
                 <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Access Control</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                 Default access credentials apply to all new operatives until security rotation. Active personnel can update assigned mission niches in real-time within the registry rows.
              </p>
           </div>

        </div>

      </div>
    </div>
  )
}
