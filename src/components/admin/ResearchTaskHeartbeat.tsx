"use client"

import { useEffect } from "react"

export function ResearchTaskHeartbeat({ intervalMs = 15000 }: { intervalMs?: number }) {
  useEffect(() => {
    let cancelled = false

    async function ping() {
      if (cancelled || document.visibilityState === "hidden") return

      try {
        await fetch("/api/admin/research/resume", {
          method: "POST",
          cache: "no-store",
        })
      } catch {
        // Best-effort only.
      }
    }

    void ping()
    const interval = window.setInterval(() => {
      void ping()
    }, intervalMs)

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void ping()
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [intervalMs])

  return null
}
