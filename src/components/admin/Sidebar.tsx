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
    <div className="flex flex-col w-64 h-full bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-colors">
      
      {/* Brand Identity */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform shadow-md shadow-black/20 font-sans tracking-tighter">
            B
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-black transition-colors">Brancr</span>
        </Link>
      </div>

      {/* Navigation Nodes */}
      <nav className="flex-1 px-3 space-y-0.5 mt-2">
        {navigation.map((item) => {
          if (item.href === "/admin/users" && isResearcher) return null

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
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm border border-slate-200 dark:border-slate-800" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-900/50"
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-slate-950 dark:text-white" : "text-slate-400 group-hover:text-slate-900"}`} strokeWidth={2.5} />
              <span>{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1 h-4 bg-slate-950 dark:bg-white rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Simplified Status Indicators */}
      <div className="p-4 space-y-3">
        {isResearcher && assignment && (
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                <Target className="w-3 h-3 text-slate-900 dark:text-white" /> Active Assignment
             </div>
             <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {assignment.niche || assignment.region || "Global Ops"}
             </p>
          </div>
        )}

        {!isResearcher && user?.role === "super_admin" && (
          <div className="p-4 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-800">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">
                <Shield className="w-3 h-3" /> Root Access
             </div>
             <p className="text-[10px] font-bold">Global Administration</p>
          </div>
        )}

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded-lg transition-all uppercase tracking-widest"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate</span>
          </div>
        </button>
      </div>

    </div>
  )
}
