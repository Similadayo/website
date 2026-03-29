"use client"

import { usePathname } from "next/navigation"
import { Search, User, Bell, ChevronRight, Activity, Globe, Menu } from "lucide-react"
import { useSession } from "next-auth/react"

export function AdminHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Breadcrumb logic: /admin/leads/[id] -> Leads / ID
  const parts = pathname.split("/").filter(Boolean).slice(1) // skip "admin"
  const breadcrumbs = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "))

  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 md:px-8 w-full transition-colors z-30 sticky top-0">
      
      {/* Navigation Context & Path */}
      <div className="flex items-center gap-4 flex-1 min-w-0 group">
        <div className="flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500 min-w-0">
          <div className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors cursor-default hidden md:flex shrink-0">
            <Activity className="w-3.5 h-3.5" />
            <span>Admin Control</span>
          </div>
          {breadcrumbs.map((b, i) => (
            <div key={i} className="flex items-center min-w-0 overflow-hidden">
              <span className="mx-3 text-slate-300 dark:text-slate-700 hidden md:inline">/</span>
              <span className={`truncate ${i === breadcrumbs.length - 1 ? "text-slate-900 dark:text-white font-bold" : "hover:text-slate-600 dark:hover:text-slate-300 cursor-default hidden sm:inline"}`}>
                {i === breadcrumbs.length - 1 && <ChevronRight className="w-3.5 h-3.5 md:hidden inline mr-1" />}
                <span>{b}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        
        {/* Search Registry */}
        <div className="hidden lg:flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 w-64 group focus-within:ring-2 focus-within:ring-slate-900 dark:focus-within:ring-white/20 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="Search registry..." 
            className="bg-transparent border-none outline-none text-xs ml-2.5 w-full text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
          />
          <kbd className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded ml-2 border border-slate-200 dark:border-slate-600">⌘K</kbd>
        </div>

        {/* Global Identity & Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-800">
             <button title="Notifications" className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white relative transition-all active:scale-90">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-slate-950" />
             </button>
          </div>
          
          <div className="flex items-center gap-3 pl-1">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-none truncate max-w-[120px]">{session?.user?.name || "Operative"}</p>
              <div className="flex items-center justify-end gap-1.5 mt-1 leading-none">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                 <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">
                    {session?.user?.role || "Unit User"}
                 </p>
              </div>
            </div>
            
            <div className="relative group/avatar cursor-default">
              <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group-hover:border-slate-900 dark:group-hover:border-white transition-colors">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
