"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Loader2, Search } from "lucide-react"

interface Props {
  disabled?: boolean
}

export function ResearchStartButton({ disabled }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleStart() {
    if (disabled || isPending) return

    setError(null)
    startTransition(async () => {
      const response = await fetch("/api/admin/research/start", {
        method: "POST",
      })

      const data = (await response.json()) as { error?: string; sessionId?: string }

      if (!response.ok || !data.sessionId) {
        const nextError = data.error ?? "unknown"
        setError(nextError)
        router.push(`/admin/research?error=${encodeURIComponent(nextError)}`)
        return
      }

      router.push(`/admin/research/${data.sessionId}`)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleStart}
        disabled={disabled || isPending}
        className="bg-black hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-gray-200 transition-all active:scale-95 min-w-[240px] justify-center"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Initializing...
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            Start New Search Session
          </>
        )}
      </button>
      {error && (
        <p className="text-[11px] font-medium text-red-500">
          {error === "no_assignment" ? "Assign a region or niche before starting research." : "Unable to start research."}
        </p>
      )}
    </div>
  )
}
