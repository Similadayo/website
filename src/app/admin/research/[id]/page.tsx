import { db } from "@/lib/db"
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Copy,
} from "lucide-react"
import { AutoRefresh } from "@/components/admin/AutoRefresh"
import { deleteResearchSession } from "../actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ResearchSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userSession = await auth()
  if (!userSession?.user?.id) redirect("/login")

  const isSuperAdmin = (userSession.user as any).role === "super_admin"
  const session = await db.researchSession.findFirst({
    where: { id },
    include: {
      results: { orderBy: { id: "asc" } },
      user: { select: { name: true, email: true } },
    },
  })

  if (!session) return notFound()
  if (!isSuperAdmin && session.userId !== userSession.user.id) return notFound()

  const isRunning = session.status === "running"
  const progress =
    session.totalFound > 0
      ? Math.round(((session.totalAnalyzed + session.totalSkipped) / session.totalFound) * 100)
      : 0

  return (
    <div className="space-y-6 animate-fadein">
      <div className="flex items-center gap-3">
        <Link href="/admin/research" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">
            {session.niche} in {session.region}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(session.createdAt).toLocaleString()}
            {session.user?.name ? ` Â· ${session.user.name}` : ""}
          </p>
        </div>
        {isSuperAdmin && (
          <form action={deleteResearchSession.bind(null, session.id)}>
            <button
              type="submit"
              className="mr-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Delete Session
            </button>
          </form>
        )}
        <SessionStatusBadge status={session.status} />
      </div>

      {isRunning && <AutoRefresh intervalMs={4000} />}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative flex-shrink-0">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={session.status === "failed" ? "#f87171" : "#6366f1"}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isRunning ? (
                <>
                  <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
                  <span className="text-xs text-gray-400 mt-0.5">searching</span>
                </>
              ) : session.status === "completed" ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <span className="text-xs text-gray-500 mt-1">done</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-7 h-7 text-red-400" />
                  <span className="text-xs text-gray-500 mt-1">failed</span>
                </>
              )}
            </div>
            {isRunning && (
              <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping opacity-30 pointer-events-none" />
            )}
          </div>

          <div className="flex-1 w-full space-y-3">
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>{isRunning ? "Runningâ€¦" : session.status === "completed" ? "Completed" : "Failed"}</span>
              <span className="text-gray-400 text-xs">{session.totalAnalyzed + session.totalSkipped} / {session.totalFound} processed</span>
            </div>

            {session.status === "failed" && session.error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-100">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                {session.error}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { label: "Found", value: session.totalFound, color: "text-gray-900" },
                { label: "Analyzed", value: session.totalAnalyzed, color: "text-indigo-600" },
                { label: "Skipped", value: session.totalSkipped, color: "text-amber-600" },
              ].map((metric: any) => (
                <div key={metric.label} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                  <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {session.results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Companies Discovered</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(session.results as any[]).map((result: any) => (
              <div key={result.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <ResultIcon status={result.status} />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{result.name}</p>
                    <p className="text-xs text-gray-400 truncate">{result.domain ?? "â€”"}</p>
                    {result.note && (
                      <p className="text-xs text-amber-600 mt-0.5">{result.note}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {result.status === "created" && result.leadId && (
                    <Link
                      href={`/admin/leads/${result.leadId}`}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
                    >
                      View Lead â†’
                    </Link>
                  )}
                  {result.status === "duplicate" && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                      Duplicate
                    </span>
                  )}
                  {result.status === "failed" && (
                    <span className="text-xs bg-red-50 text-red-500 px-2.5 py-1 rounded-full font-medium">
                      Failed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {session.status === "completed" && (
        <div className="flex gap-4">
          <Link
            href="/admin/leads"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            View All Leads â†’
          </Link>
          <Link
            href="/admin/outreach"
            className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Go to Outreach â†’
          </Link>
        </div>
      )}
    </div>
  )
}

function SessionStatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
      </span>
    )
  }
  if (status === "running") {
    return (
      <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 flex items-center gap-1.5">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Running
      </span>
    )
  }
  if (status === "failed") {
    return (
      <span className="bg-red-50 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200 flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5" /> Failed
      </span>
    )
  }
  return <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">Pending</span>
}

function ResultIcon({ status }: { status: string }) {
  if (status === "created") return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
  if (status === "duplicate") return <Copy className="w-4 h-4 text-gray-400 flex-shrink-0" />
  return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
}
