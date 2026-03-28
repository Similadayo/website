"use client"

import { useFormStatus } from "react-dom"
import { Search, Loader2 } from "lucide-react"

interface Props {
  disabled?: boolean
}

export function ResearchStartButton({ disabled }: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="bg-black hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-gray-200 transition-all active:scale-95 min-w-[240px] justify-center"
    >
      {pending ? (
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
  )
}
