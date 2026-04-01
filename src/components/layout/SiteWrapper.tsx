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
    <div className="site-shell flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-[78px]">
        {children}
      </main>
      <Footer />
    </div>
  )
}
