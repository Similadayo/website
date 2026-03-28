"use client"

import {
  LayoutDashboard,
  Building2,
  Users,
  SendHorizontal,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Search,
  Trophy,
  Clock,
  MapPin,
  Target
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"

const navigation = [
  { name: "Dashboard",   href: "/admin",             icon: LayoutDashboard },
  { name: "Research",    href: "/admin/research",    icon: Search },
  { name: "Companies",   href: "/admin/companies",   icon: Building2 },
  { name: "Leads",       href: "/admin/leads",       icon: Users },
  { name: "Outreach",    href: "/admin/outreach",    icon: SendHorizontal },
  { name: "Sent History", href: "/admin/outreach/history", icon: Clock },
  { name: "Performance", href: "/admin/performance", icon: Trophy },
  { name: "Reports",     href: "/admin/reports",     icon: BarChart3 },
  { name: "Users",       href: "/admin/users",       icon: Shield },
  { name: "Settings",    href: "/admin/settings",    icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user as any

  const isResearcher = user?.role === "researcher"
  const assignment = user?.assignment

  return (
    <div className="flex flex-col w-72 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-white/5 relative z-40 transition-colors">
      <div className="p-8 pb-6 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-black dark:bg-white rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-gray-200 dark:shadow-none">
            <span className="text-white dark:text-black font-black text-xl italic tracking-tighter">B</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white group-hover:text-black dark:group-hover:text-gray-300 transition-colors">Brancr</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 py-1">
        {navigation.map((item) => {
          // Hide "Users" for researchers
          if (item.href === "/admin/users" && isResearcher) return null

          // Handle specific overlap between /admin/outreach and /admin/outreach/history
          let isActive = false
          if (item.href === "/admin" || item.href === "/admin/outreach") {
            isActive = pathname === item.href
          } else {
            isActive = pathname.startsWith(item.href)
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? "bg-gray-900 dark:bg-white text-white dark:text-black shadow-md shadow-gray-200 dark:shadow-none" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-white dark:text-black" : "text-gray-400"}`} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Territory Indicator for Researchers */}
      {isResearcher && assignment && (
        <div className="px-5 py-4 mx-4 mb-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 animate-fadein">
           <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 leading-none">
             <Target className="w-3 h-3" /> Mission Assignment
           </p>
           <div className="space-y-1">
             <p className="text-sm font-black text-emerald-900 dark:text-emerald-100 truncate">
               {assignment.niche || assignment.region || "Global Ops"}
             </p>
             <p className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-500/60 uppercase tracking-tight truncate italic">
               Operational Territory
             </p>
           </div>
        </div>
      )}

      {/* Admin Indicator for Super Admins */}
      {!isResearcher && user?.role === "super_admin" && (
        <div className="px-5 py-4 mx-4 mb-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 italic transition-all hover:bg-gray-100/50 dark:hover:bg-white/10 group/admin">
           <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5 group-hover/admin:text-indigo-500 transition-colors">
             <Shield className="w-3 h-3" /> Command Mode
           </p>
           <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Global Oversight</p>
        </div>
      )}

      <div className="p-4 border-t border-gray-100 mt-auto">
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
