"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AutoRefresh({ intervalMs = 4000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      void fetch("/api/admin/research/resume", {
        method: "POST",
        cache: "no-store",
      }).catch(() => undefined)
      router.refresh()
    }, intervalMs)
    return () => clearInterval(interval)
  }, [router, intervalMs])

  return null
}
