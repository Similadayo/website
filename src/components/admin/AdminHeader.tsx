"use client"

import { usePathname } from "next/navigation"
import { Search, User, Bell } from "lucide-react"
import { useSession } from "next-auth/react"

export function AdminHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Breadcrumb logic: /admin/leads/[id] -> Leads / ID
  const parts = pathname.split("/").filter(Boolean).slice(1) // skip "admin"
  const breadcrumbs = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "))

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 w-full transition-all">
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        <div className="flex items-center text-sm font-medium text-gray-400 overflow-hidden whitespace-nowrap">
          <span className="hover:text-gray-600 cursor-default hidden md:inline">Admin</span>
          {breadcrumbs.map((b, i) => (
            <div key={i} className="flex items-center min-w-0">
              <span className="mx-2 text-gray-300 hidden md:inline">/</span>
              <span className={`truncate ${i === breadcrumbs.length - 1 ? "text-gray-900 font-bold" : "hover:text-gray-600 cursor-default hidden sm:inline"}`}>
                {b}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Quick Search */}
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 w-64 group focus-within:ring-2 focus-within:ring-black transition-all">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search leads..." 
            className="bg-transparent border-none outline-none text-xs ml-2 w-full text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">{session?.user?.name || "Researcher"}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase mt-1 tracking-wider">
                {session?.user?.role || "Team Member"}
              </p>
            </div>
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 overflow-hidden">
              {session?.user?.image ? (
                <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
