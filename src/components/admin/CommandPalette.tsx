"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { Activity, ArrowLeftRight, Building2, Command, Search, Settings, Sparkles, Target, Users, X } from "lucide-react"

const paletteItems = [
  { label: "Home", href: "/admin", icon: Sparkles, group: "Navigate", keywords: ["dashboard", "home", "overview"] },
  { label: "Pipeline", href: "/admin/leads", icon: Search, group: "Navigate", keywords: ["leads", "pipeline", "review"] },
  { label: "Outreach", href: "/admin/outreach", icon: ArrowLeftRight, group: "Navigate", keywords: ["outreach", "drafts", "send"] },
  { label: "Activity", href: "/admin/outreach/history", icon: Activity, group: "Navigate", keywords: ["history", "mail", "replies"] },
  { label: "Research", href: "/admin/research", icon: Target, group: "Navigate", keywords: ["research", "sessions", "discover"] },
  { label: "Companies", href: "/admin/companies", icon: Building2, group: "Navigate", keywords: ["accounts", "companies"] },
  { label: "Team", href: "/admin/performance", icon: Users, group: "Navigate", keywords: ["team", "performance"] },
  { label: "Users", href: "/admin/users", icon: Users, group: "Manage", keywords: ["users", "operators"] },
  { label: "Settings", href: "/admin/settings", icon: Settings, group: "Manage", keywords: ["settings", "profile", "security"] },
] as const

export function CommandPalette() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return paletteItems
    return paletteItems.filter((item) => {
      const haystack = [item.label, item.group, ...item.keywords].join(" ").toLowerCase()
      return haystack.includes(needle)
    })
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] bg-[#171717]/30 backdrop-blur-sm">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-start justify-center px-4 pt-16 sm:pt-24">
        <div className="w-full overflow-hidden rounded-[32px] border border-[color:var(--admin-border)] bg-[color:var(--admin-panel)] shadow-[0_30px_80px_rgba(23,23,23,0.22)]">
          <div className="flex items-center gap-3 border-b border-[color:var(--admin-border)] px-5 py-4">
            <Search className="h-5 w-5 text-[color:var(--admin-muted)]" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Jump to a page or action"
              className="w-full bg-transparent text-sm text-[color:var(--admin-ink)] outline-none placeholder:text-[color:var(--admin-muted)]"
            />
            <button onClick={() => setOpen(false)} className="admin-pill admin-pill-neutral">
              <X className="h-3.5 w-3.5" />
              Close
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-3">
            {filtered.length === 0 ? (
              <div className="rounded-[24px] bg-[color:var(--admin-card-strong)] p-5 text-sm text-[color:var(--admin-soft-text)]">
                No result for <span className="font-semibold text-[color:var(--admin-ink)]">{query}</span>.
              </div>
            ) : (
              filtered.map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-4 rounded-[24px] px-4 py-4 hover:bg-white">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[color:var(--admin-ink)]">{item.label}</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">{item.group}</p>
                  </div>
                  <div className="hidden items-center gap-1 rounded-full border border-[color:var(--admin-border)] bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)] sm:flex">
                    <Command className="h-3 w-3" />
                    K
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
