"use client"

import { usePathname } from "next/navigation"
import Navbar from "./Navbar"
import Footer from "./Footer"

export function SiteWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/admin") || pathname?.startsWith("/login")

  if (isDashboard) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-[68px]">
        {children}
      </main>
      <Footer />
    </div>
  )
}
