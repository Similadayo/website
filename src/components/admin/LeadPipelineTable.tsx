"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Clock, Trash2, X, XCircle } from "lucide-react"
import { bulkDeleteLeadIntel, deleteFilteredLeadIntel, deleteLeadIntel } from "@/app/admin/leads/actions"
import { formatOutreachRecommendation, getLeadContactStrategy } from "@/lib/contacts/priority"
import { STAGE_LABELS, LeadStage } from "@/lib/stages"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type LeadRow = any
type ConfirmState =
  | { kind: "single"; leadId: string; title: string; message: string; confirmLabel: string }
  | { kind: "selected"; leadIds: string[]; title: string; message: string; confirmLabel: string }
  | { kind: "filter"; title: string; message: string; confirmLabel: string }

type FeedbackState = {
  tone: "success" | "error"
  message: string
}

export function LeadPipelineTable({
  leads,
  sort,
  order,
  isSuperAdmin,
  currentUserId,
  selectedMemberId,
  totalFilteredCount,
  currentFilterLabel,
}: {
  leads: LeadRow[]
  sort: string
  order: string
  isSuperAdmin: boolean
  currentUserId: string
  selectedMemberId: string
  totalFilteredCount: number
  currentFilterLabel: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [isPending, startTransition] = useTransition()
  const visibleLeads = useMemo(
    () => leads.filter((lead) => !hiddenIds.includes(lead.id)),
    [hiddenIds, leads]
  )

  const allVisibleSelected =
    visibleLeads.length > 0 && visibleLeads.every((lead) => selectedIds.includes(lead.id))
  const toggleOrder = order === "asc" ? "desc" : "asc"

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  function queryFor(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams?.toString())
    const entries = {
      sort,
      order,
      ...(isSuperAdmin ? { member: selectedMemberId } : {}),
      ...next,
    }

    for (const [key, value] of Object.entries(entries)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }

    const query = params.toString()
    return `${pathname}${query ? `?${query}` : ""}`
  }

  function toggleSelected(leadId: string) {
    setFeedback(null)
    setSelectedIds((current) =>
      current.includes(leadId)
        ? current.filter((id) => id !== leadId)
        : [...current, leadId]
    )
  }

  function toggleSelectAll() {
    setFeedback(null)
    setSelectedIds(allVisibleSelected ? [] : visibleLeads.map((lead) => lead.id))
  }

  function openSingleDelete(leadId: string) {
    setFeedback(null)
    setConfirmState({
      kind: "single",
      leadId,
      title: "Delete lead intel",
      message: "Delete this lead and any orphaned company intel tied only to it? This cannot be undone.",
      confirmLabel: "Delete lead",
    })
  }

  function openBulkDelete() {
    if (selectedIds.length === 0) return
    setFeedback(null)
    setConfirmState({
      kind: "selected",
      leadIds: selectedIds,
      title: "Delete selected lead intel",
      message: `Delete ${selectedIds.length} selected lead records from this page? This cannot be undone.`,
      confirmLabel: `Delete ${selectedIds.length} leads`,
    })
  }

  function openFilterDelete() {
    if (totalFilteredCount === 0) return
    setFeedback(null)
    setConfirmState({
      kind: "filter",
      title: "Delete all lead intel in this filter",
      message: `Delete all ${totalFilteredCount} leads in "${currentFilterLabel}"? This clears the full filtered lead set, not just this page.`,
      confirmLabel: `Delete all ${totalFilteredCount}`,
    })
  }

  function handleDeleteConfirm() {
    if (!confirmState) return
    startTransition(async () => {
      let res:
        | Awaited<ReturnType<typeof deleteLeadIntel>>
        | Awaited<ReturnType<typeof bulkDeleteLeadIntel>>
        | Awaited<ReturnType<typeof deleteFilteredLeadIntel>>

      if (confirmState.kind === "single") {
        res = await deleteLeadIntel(confirmState.leadId)
      } else if (confirmState.kind === "selected") {
        res = await bulkDeleteLeadIntel(confirmState.leadIds)
      } else {
        res = await deleteFilteredLeadIntel(selectedMemberId)
      }

      if (!res.success) {
        setFeedback({
          tone: "error",
          message: res.error || "Delete failed. Check related records and try again.",
        })
        return
      }

      if (confirmState.kind === "single") {
        setHiddenIds((current) => [...new Set([...current, confirmState.leadId])])
        setSelectedIds((current) => current.filter((id) => id !== confirmState.leadId))
        setFeedback({ tone: "success", message: "Lead intel deleted." })
      } else if (confirmState.kind === "selected") {
        setHiddenIds((current) => [...new Set([...current, ...confirmState.leadIds])])
        setSelectedIds([])
        setFeedback({
          tone: "success",
          message: `${confirmState.leadIds.length} lead record${confirmState.leadIds.length === 1 ? "" : "s"} deleted.`,
        })
      } else {
        const deletedCount = "count" in res ? res.count : undefined
        setHiddenIds((current) => [...new Set([...current, ...visibleLeads.map((lead) => lead.id)])])
        setSelectedIds([])
        setFeedback({
          tone: "success",
          message: deletedCount
            ? `${deletedCount} lead record${deletedCount === 1 ? "" : "s"} deleted from ${currentFilterLabel}.`
            : `Lead intel deleted from ${currentFilterLabel}.`,
        })
      }

      setConfirmState(null)
      router.refresh()
    })
  }

  return (
    <>
      {feedback && (
        <div className={`mx-8 mt-6 rounded-2xl border px-5 py-4 text-sm font-semibold ${
          feedback.tone === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}>
          {feedback.message}
        </div>
      )}

      {isSuperAdmin && visibleLeads.length > 0 && (
        <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 transition-colors hover:border-black hover:text-black"
              >
                {allVisibleSelected ? "Clear Selection" : "Select All Visible"}
              </button>
              <span className="text-xs font-semibold text-gray-500">
                {selectedIds.length} selected
              </span>
            </div>
            <button
              type="button"
              onClick={openBulkDelete}
              disabled={selectedIds.length === 0 || isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-700 transition-colors hover:border-red-300 hover:text-red-900 disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected
            </button>
            <button
              type="button"
              onClick={openFilterDelete}
              disabled={totalFilteredCount === 0 || isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-700 transition-colors hover:border-red-400 hover:text-red-900 disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete All In Filter
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-full md:min-w-[1100px]">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100 font-black tracking-[0.2em]">
              <tr>
                {isSuperAdmin && <th className="px-4 py-5 text-center">Select</th>}
                <th className="px-8 py-5">
                  <Link href={queryFor({ sort: "name", order: sort === "name" ? toggleOrder : "asc", page: undefined })} className="flex items-center gap-1 hover:text-black transition-colors">
                    Company
                    {sort === "name" ? (order === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </Link>
                </th>
                <th className="px-8 py-5">
                  <Link href={queryFor({ sort: "stage", order: sort === "stage" ? toggleOrder : "asc", page: undefined })} className="flex items-center gap-1 hover:text-black transition-colors">
                    Stage
                    {sort === "stage" ? (order === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </Link>
                </th>
                <th className="px-8 py-5">
                  <Link href={queryFor({ sort: "fit", order: sort === "fit" ? toggleOrder : "desc", page: undefined })} className="flex items-center gap-1 hover:text-black transition-colors">
                    Fit Score
                    {sort === "fit" ? (order === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </Link>
                </th>
                <th className="px-8 py-5 font-black text-gray-400 hidden xl:table-cell">Analysis Summary</th>
                <th className="px-8 py-5 text-right hidden lg:table-cell">
                  <Link href={queryFor({ sort: "created", order: sort === "created" ? toggleOrder : "desc", page: undefined })} className="flex items-center gap-1 hover:text-black transition-colors justify-end">
                    {sort === "created" ? (order === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    Added
                  </Link>
                </th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleLeads.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 6} className="px-8 py-20 text-center text-gray-400">
                    No leads found.
                  </td>
                </tr>
              ) : (
                visibleLeads.map((lead: any) => {
                  const analysis = lead.analyses[0]
                  const contactStrategy = getLeadContactStrategy(lead.company.contacts || [])
                  const ownerName = lead.owner?.name || lead.owner?.email || "Unassigned"
                  const creatorName = lead.company.createdBy?.name || lead.company.createdBy?.email || "Unknown"

                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                      {isSuperAdmin && (
                        <td className="px-4 py-6 text-center">
                          <input
                            type="checkbox"
                            checked={selectedSet.has(lead.id)}
                            onChange={() => toggleSelected(lead.id)}
                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                          />
                        </td>
                      )}
                      <td className="px-8 py-6">
                        <div className="font-black text-gray-900 group-hover:text-black transition-colors">{lead.company.name}</div>
                        <div className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-tight">{lead.company.niche || lead.company.domain || "Target"}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {lead.hasBeenReachedOutTo && (
                            <span className="inline-flex items-center rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                              Reached Out
                            </span>
                          )}
                          <span className={`inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
                            contactStrategy.coverageStatus === "high"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : contactStrategy.coverageStatus === "medium"
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : contactStrategy.coverageStatus === "low"
                                  ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                                  : "bg-gray-50 text-gray-500 border border-gray-100"
                          }`}>
                            {contactStrategy.coverageStatus} contact coverage
                          </span>
                          <span className="inline-flex items-center rounded-lg border border-gray-100 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            {formatOutreachRecommendation(contactStrategy.recommendation)}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {contactStrategy.bestContact
                            ? `Best contact: ${contactStrategy.bestContact.name || contactStrategy.bestContact.email || "Unnamed contact"}`
                            : "Best contact: manual review needed"}
                          {contactStrategy.fallbackContact?.email ? ` • Fallback: ${contactStrategy.fallbackContact.email}` : ""}
                        </div>
                        {isSuperAdmin && selectedMemberId !== currentUserId && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold">
                            <span className="inline-flex items-center rounded-lg px-2 py-1 uppercase tracking-widest border border-slate-200 bg-slate-50 text-slate-500">
                              Member View
                            </span>
                            <span className="text-slate-400 normal-case tracking-normal">Owner: {ownerName}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 normal-case tracking-normal">Created by: {creatorName}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <StageBadge stage={lead.stage as LeadStage} />
                      </td>
                      <td className="px-8 py-6">
                        {analysis?.fitScore != null ? (
                          <div className={`inline-flex w-10 h-10 rounded-xl items-center justify-center font-black text-xs shadow-sm ring-1 ring-inset ${
                            analysis.fitScore >= 80 ? "bg-green-50 text-green-700 ring-green-100" :
                            analysis.fitScore >= 60 ? "bg-blue-50 text-blue-700 ring-blue-100" :
                            analysis.fitScore >= 40 ? "bg-orange-50 text-orange-700 ring-orange-100" :
                            "bg-red-50 text-red-700 ring-red-100"
                          }`}>
                            {analysis.fitScore}%
                          </div>
                        ) : (
                          <span className="text-gray-300 text-[10px] font-black italic tracking-widest">PENDING</span>
                        )}
                      </td>
                      <td className="px-8 py-6 hidden xl:table-cell">
                        <div className="max-w-xs line-clamp-2 text-gray-500 font-medium text-xs leading-relaxed" title={analysis?.companySummary ?? ""}>
                          {analysis?.companySummary ?? <span className="text-gray-300 italic">Waiting for AI qualification...</span>}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right hidden lg:table-cell font-black text-[10px] text-gray-400 uppercase tracking-widest">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end gap-3">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="text-white font-black text-[10px] uppercase tracking-[0.2em] px-6 py-3.5 bg-black rounded-xl hover:bg-gray-800 transition-all active:scale-95 inline-block shadow-lg shadow-gray-200"
                          >
                            Review Lead
                          </Link>
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => openSingleDelete(lead.id)}
                              disabled={isPending}
                              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-700 transition-colors hover:border-red-300 hover:text-red-900 disabled:opacity-40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-red-600">
                  Destructive Action
                </div>
                <h3 className="mt-2 text-2xl font-black text-gray-900">{confirmState.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                disabled={isPending}
                className="rounded-xl border border-gray-200 p-2 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:opacity-40"
                aria-label="Close delete confirmation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              {confirmState.message}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                disabled={isPending}
                className="rounded-xl border border-gray-200 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-600 transition-colors hover:border-gray-300 hover:text-black disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-red-700 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
                {isPending ? "Deleting..." : confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function StageBadge({ stage }: { stage: LeadStage }) {
  const label = STAGE_LABELS[stage] ?? stage
  if (stage === "approved") return <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100"><CheckCircle2 className="w-3.5 h-3.5" />{label}</span>
  if (stage === "rejected") return <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100"><XCircle className="w-3.5 h-3.5" />{label}</span>
  if (stage === "pending_review") return <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100"><Clock className="w-3.5 h-3.5" />{label}</span>
  return <span className="inline-flex items-center bg-gray-50 text-gray-500 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100">{label}</span>
}
