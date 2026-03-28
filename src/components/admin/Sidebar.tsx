"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Clock
} from "lucide-react"
import { signOut } from "next-auth/react"

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

  return (
    <div className="flex flex-col w-72 h-full bg-white border-r border-gray-100 relative z-40">
      <div className="p-8 pb-6 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg shadow-gray-200">
            <span className="text-white font-black text-xl italic tracking-tighter">B</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-gray-900 group-hover:text-black transition-colors">Brancr</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 py-1">
        {navigation.map((item) => {
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
                  ? "bg-gray-900 text-white shadow-md shadow-gray-200" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

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
