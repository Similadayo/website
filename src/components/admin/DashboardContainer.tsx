"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Activity,
  ArrowLeftRight,
  Bell,
  ChevronRight,
  Home,
  Menu,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react"
import { CommandPalette } from "./CommandPalette"
import { ResearchTaskHeartbeat } from "./ResearchTaskHeartbeat"

const primaryNavigation = [
  { label: "Home", href: "/admin", icon: Home },
  { label: "Pipeline", href: "/admin/leads", icon: Search },
  { label: "Outreach", href: "/admin/outreach", icon: ArrowLeftRight },
  { label: "Activity", href: "/admin/outreach/history", icon: Activity },
  { label: "Team", href: "/admin/performance", icon: Users },
] as const

const secondaryNavigation = [
  { label: "Research", href: "/admin/research" },
  { label: "Companies", href: "/admin/companies" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Users", href: "/admin/users" },
  { label: "Settings", href: "/admin/settings" },
] as const

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href
  }

  // Keep nested outreach history from activating both "Outreach" and "Activity".
  if (href === "/admin/outreach") {
    return pathname === href
  }

  if (href === "/admin/outreach/history") {
    return pathname === href || pathname.startsWith("/admin/outreach/history/")
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function getPageMeta(pathname: string) {
  if (pathname.startsWith("/admin/leads")) {
    return {
      eyebrow: "Pipeline",
      title: pathname === "/admin/leads" ? "Review and move the strongest leads first." : "Lead intelligence, contact quality, and outreach actions in one place.",
    }
  }

  if (pathname.startsWith("/admin/outreach/history")) {
    return {
      eyebrow: "Activity",
      title: "Keep sent mail, inbound replies, and operator actions in one live feed.",
    }
  }

  if (pathname.startsWith("/admin/outreach")) {
    return {
      eyebrow: "Outreach",
      title: "Edit, approve, and dispatch outreach without leaving the queue.",
    }
  }

  if (pathname.startsWith("/admin/performance")) {
    return {
      eyebrow: "Team",
      title: "See who is moving the pipeline and where support is needed next.",
    }
  }

  if (pathname.startsWith("/admin/settings")) {
    return {
      eyebrow: "Settings",
      title: "Manage sender identity, integrations, and account security.",
    }
  }

  return {
    eyebrow: "Home",
    title: "Stay on top of approvals, draft readiness, replies, and active research.",
  }
}

export function DashboardContainer({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const pageMeta = useMemo(() => getPageMeta(pathname), [pathname])
  const user = session?.user as any
  const shouldRunResearchHeartbeat = pathname === "/admin" || pathname.startsWith("/admin/research")

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  return (
    <div className="admin-shell min-h-screen">
      {shouldRunResearchHeartbeat && <ResearchTaskHeartbeat />}
      <CommandPalette />

      <div
        className={`fixed inset-0 z-50 lg:hidden transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute inset-0 bg-[#171717]/25 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div className="relative h-full w-[88%] max-w-xs border-r border-[color:var(--admin-border)] bg-[color:var(--admin-panel)] px-5 py-6 shadow-[0_24px_80px_rgba(23,23,23,0.22)]">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--admin-muted)]">Brancr Ops</p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--admin-ink)]">{user?.name || "Operator"}</p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-2xl border border-[color:var(--admin-border)] bg-[color:var(--admin-card)] p-2 text-[color:var(--admin-ink)]"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="space-y-2">
            {primaryNavigation.map((item) => {
              const active = isActivePath(pathname, item.href)
              return (
                <Link key={item.href} href={item.href} prefetch className={`admin-nav-link ${active ? "admin-nav-link-active" : ""}`}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 border-t border-[color:var(--admin-border)] pt-5">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--admin-muted)]">More</p>
            <div className="space-y-2">
              {secondaryNavigation.map((item) => {
                const active = isActivePath(pathname, item.href)

                return (
                  <Link key={item.href} href={item.href} prefetch className={`admin-nav-link ${active ? "admin-nav-link-active" : ""}`}>
                    <span>{item.label}</span>
                    {active && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden lg:flex lg:w-[292px] lg:flex-col lg:gap-8 lg:border-r lg:border-[color:var(--admin-border)] lg:px-6 lg:py-8">
          <div className="rounded-[32px] bg-[color:var(--admin-card-strong)] p-6 text-[color:var(--admin-ink)] shadow-[var(--admin-shadow-soft)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--admin-accent)] text-white shadow-[0_18px_40px_rgba(36,87,245,0.28)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[color:var(--admin-muted)]">Brancr</p>
                <p className="mt-1 text-xl font-semibold">Field Operations</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-[color:var(--admin-soft-text)]">
              Research, approvals, outreach, and reply handling in one workspace.
            </p>
          </div>

          <nav className="space-y-2">
            {primaryNavigation.map((item) => {
              const active = isActivePath(pathname, item.href)
              return (
                <Link key={item.href} href={item.href} prefetch className={`admin-nav-link ${active ? "admin-nav-link-active" : ""}`}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="rounded-[28px] border border-[color:var(--admin-border)] bg-[color:var(--admin-card)] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--admin-muted)]">Workspace</p>
            <div className="mt-4 space-y-2">
              {secondaryNavigation.map((item) => {
                const active = isActivePath(pathname, item.href)

                return (
                  <Link key={item.href} href={item.href} prefetch className={`admin-secondary-link ${active ? "admin-secondary-link-active" : ""}`}>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[color:var(--admin-border)] bg-[color:var(--admin-shell)]/90 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-10">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-[color:var(--admin-border)] bg-[color:var(--admin-card)] text-[color:var(--admin-ink)] lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[color:var(--admin-muted)]">{pageMeta.eyebrow}</p>
                <p className="mt-1 truncate text-sm font-medium text-[color:var(--admin-soft-text)] sm:text-base">{pageMeta.title}</p>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-card)] px-4 py-3 text-sm text-[color:var(--admin-soft-text)] md:flex">
                <Search className="h-4 w-4 text-[color:var(--admin-muted)]" />
                <span>Search workspace</span>
                <span className="rounded-full border border-[color:var(--admin-border)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">
                  Ctrl K
                </span>
              </div>

              <button className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-[color:var(--admin-border)] bg-[color:var(--admin-card)] text-[color:var(--admin-ink)]">
                <Bell className="h-5 w-5" />
              </button>

              <Link
                href="/admin/settings"
                className="hidden items-center gap-3 rounded-full border border-[color:var(--admin-border)] bg-[color:var(--admin-card)] px-3 py-2.5 sm:flex"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--admin-accent-soft)] text-sm font-black text-[color:var(--admin-accent)]">
                  {user?.name?.[0]?.toUpperCase() || "B"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[color:var(--admin-ink)]">{user?.name || "Operator"}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--admin-muted)]">{user?.role || "member"}</p>
                </div>
              </Link>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-x-hidden px-4 pb-36 pt-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--admin-border)] bg-[color:var(--admin-panel)]/96 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl lg:hidden">
            <div className="grid grid-cols-5 gap-2">
              {primaryNavigation.map((item) => {
                const active = isActivePath(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    className={`flex flex-col items-center min-w-0 gap-1 rounded-[20px] px-1 py-2.5 text-[9px] sm:text-[10px] sm:px-2 font-black uppercase tracking-[0.15em] transition-colors ${
                      active
                        ? "bg-[color:var(--admin-accent)] text-white shadow-[0_16px_34px_rgba(36,87,245,0.24)]"
                        : "text-[color:var(--admin-muted)]"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="w-full truncate text-center">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}
