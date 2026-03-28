"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Sidebar } from "./Sidebar"
import { AdminHeader } from "./AdminHeader"

export function DashboardContainer({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar - Desktop (Static) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile (Drawer) */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm shadow-xl shadow-black/30" onClick={() => setIsSidebarOpen(false)} />
        <div className="relative w-72 h-full bg-white shadow-2xl">
          <div className="absolute top-4 right-4 z-50">
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <Sidebar />
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="flex items-center">
           <div className="lg:hidden pl-4 pt-2">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-3 text-gray-500 hover:text-black hover:bg-gray-200/50 rounded-xl transition-all bg-white shadow-sm border border-gray-100 active:scale-95"
             >
               <Menu className="w-6 h-6" />
             </button>
           </div>
           <AdminHeader />
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
