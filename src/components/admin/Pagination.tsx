"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"

interface PaginationProps {
  totalItems: number
  pageSize: number
  currentPage: number
}

export function Pagination({ totalItems, pageSize, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(totalItems / pageSize)

  if (totalPages <= 1) return null

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString())
    params.set("page", page.toString())
    return `${pathname}?${params.toString()}`
  }

  const visiblePages = [...Array(totalPages)].map((_, index) => index + 1).filter((page) => {
    if (totalPages <= 7) return true
    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
  })

  return (
    <div className="admin-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[color:var(--admin-soft-text)]">
          Showing <span className="font-semibold text-[color:var(--admin-ink)]">{(currentPage - 1) * pageSize + 1}</span> to{" "}
          <span className="font-semibold text-[color:var(--admin-ink)]">{Math.min(currentPage * pageSize, totalItems)}</span> of{" "}
          <span className="font-semibold text-[color:var(--admin-ink)]">{totalItems}</span>
        </p>

        <div className="flex items-center gap-2">
          <Link
            href={createPageUrl(currentPage - 1)}
            className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-semibold ${
              currentPage <= 1
                ? "pointer-events-none border-[color:var(--admin-border)] text-[color:var(--admin-muted)] opacity-50"
                : "border-[color:var(--admin-border)] bg-white text-[color:var(--admin-ink)]"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            {visiblePages.map((page, index) => {
              const previous = visiblePages[index - 1]
              const showGap = previous && page - previous > 1

              return (
                <span key={page} className="flex items-center gap-2">
                  {showGap && <span className="px-1 text-[color:var(--admin-muted)]">…</span>}
                  <Link
                    href={createPageUrl(page)}
                    className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full px-3 text-sm font-bold ${
                      page === currentPage
                        ? "bg-[color:var(--admin-accent)] text-white"
                        : "border border-[color:var(--admin-border)] bg-white text-[color:var(--admin-soft-text)]"
                    }`}
                  >
                    {page}
                  </Link>
                </span>
              )
            })}
          </div>

          <Link
            href={createPageUrl(currentPage + 1)}
            className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-semibold ${
              currentPage >= totalPages
                ? "pointer-events-none border-[color:var(--admin-border)] text-[color:var(--admin-muted)] opacity-50"
                : "border-[color:var(--admin-border)] bg-white text-[color:var(--admin-ink)]"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
