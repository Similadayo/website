"use client"

import Link from "next/link"
import { Dialog } from "@base-ui/react/dialog"
import { useMemo, useState, useTransition } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Clock, Trash2, X, XCircle } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { bulkDeleteLeadIntel, deleteFilteredLeadIntel, deleteLeadIntel } from "@/app/admin/leads/actions"
import { formatOutreachRecommendation, getLeadContactStrategy } from "@/lib/contacts/priority"
import { STAGE_LABELS, LeadStage } from "@/lib/stages"

type LeadRow = any
type ConfirmState =
  | { kind: "single"; leadId: string; title: string; message: string; confirmLabel: string; scopeLabel: string; affectedCount: number }
  | { kind: "selected"; leadIds: string[]; title: string; message: string; confirmLabel: string; scopeLabel: string; affectedCount: number }
  | { kind: "filter"; title: string; message: string; confirmLabel: string; scopeLabel: string; affectedCount: number }

type FeedbackState = {
  tone: "success" | "error"
  message: string
}

export function LeadPipelineTable({
  leads,
  allFilteredLeadIds,
  sort,
  order,
  isSuperAdmin,
  currentUserId,
  selectedMemberId,
  totalFilteredCount,
  currentFilterLabel,
}: {
  leads: LeadRow[]
  allFilteredLeadIds: string[]
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
  const selectableLeadIds = useMemo(
    () => allFilteredLeadIds.filter((leadId) => !hiddenIds.includes(leadId)),
    [allFilteredLeadIds, hiddenIds]
  )
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const allFilteredSelected =
    selectableLeadIds.length > 0 && selectableLeadIds.every((leadId) => selectedIds.includes(leadId))
  const toggleOrder = order === "asc" ? "desc" : "asc"

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
    setSelectedIds(allFilteredSelected ? [] : selectableLeadIds)
  }

  function openSingleDelete(leadId: string) {
    setFeedback(null)
    setConfirmState({
      kind: "single",
      leadId,
      title: "Delete lead intel",
      message: "Delete this lead and any orphaned company intel tied only to it? This cannot be undone.",
      confirmLabel: "Delete lead",
      scopeLabel: "Single lead record",
      affectedCount: 1,
    })
  }

  function openBulkDelete() {
    if (selectedIds.length === 0) return
    const deletingWholeFilter = selectedIds.length === selectableLeadIds.length && selectableLeadIds.length > 0
    setFeedback(null)
    setConfirmState({
      kind: "selected",
      leadIds: selectedIds,
      title: deletingWholeFilter ? "Delete all selected lead intel" : "Delete selected lead intel",
      message: deletingWholeFilter
        ? `Delete all ${selectedIds.length} leads in "${currentFilterLabel}"? Any company intel that becomes orphaned will also be removed. This cannot be undone.`
        : `Delete ${selectedIds.length} selected lead record${selectedIds.length === 1 ? "" : "s"} from "${currentFilterLabel}"? Any company intel that becomes orphaned will also be removed. This cannot be undone.`,
      confirmLabel: deletingWholeFilter ? `Delete all ${selectedIds.length}` : `Delete ${selectedIds.length} selected`,
      scopeLabel: deletingWholeFilter ? currentFilterLabel : `${selectedIds.length} manually selected lead${selectedIds.length === 1 ? "" : "s"}`,
      affectedCount: selectedIds.length,
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
      scopeLabel: currentFilterLabel,
      affectedCount: totalFilteredCount,
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
        <div
          className={`mx-4 mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold sm:mx-6 lg:mx-8 ${
            feedback.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {isSuperAdmin && visibleLeads.length > 0 && (
        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 transition-colors hover:border-black hover:text-black"
              >
                {allFilteredSelected ? "Clear Selection" : "Select All In Filter"}
              </button>
              <span className="text-xs font-semibold text-gray-500">
                {selectedIds.length} selected
                {totalFilteredCount > visibleLeads.length ? ` of ${totalFilteredCount} in ${currentFilterLabel}` : ""}
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
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
        </div>
      )}

      <div className="space-y-4 px-4 py-4 sm:px-6 lg:hidden">
        {visibleLeads.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-400">
            No leads found.
          </div>
        ) : (
          visibleLeads.map((lead: LeadRow) => {
            const analysis = lead.analyses[0]
            const contactStrategy = getLeadContactStrategy(lead.company.contacts || [])
            const ownerName = lead.owner?.name || lead.owner?.email || "Unassigned"
            const creatorName = lead.company.createdBy?.name || lead.company.createdBy?.email || "Unknown"

            return (
              <article
                key={lead.id}
                className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-start gap-3">
                  {isSuperAdmin && (
                    <input
                      type="checkbox"
                      checked={selectedSet.has(lead.id)}
                      onChange={() => toggleSelected(lead.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-black text-gray-900">{lead.company.name}</h3>
                        <p className="mt-1 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
                          {lead.company.niche || lead.company.domain || "Target"}
                        </p>
                      </div>
                      <FitScoreBadge score={analysis?.fitScore} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <StageBadge stage={lead.stage as LeadStage} />
                      {lead.hasBeenReachedOutTo && (
                        <span className="inline-flex items-center rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                          Reached Out
                        </span>
                      )}
                      <CoverageBadge coverageStatus={contactStrategy.coverageStatus} />
                      <span className="inline-flex items-center rounded-lg border border-gray-100 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {formatOutreachRecommendation(contactStrategy.recommendation)}
                      </span>
                    </div>

                    <div className="mt-4 rounded-2xl bg-gray-50/70 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Best Contact</div>
                      <div className="mt-1 text-sm font-semibold text-gray-700">
                        {contactStrategy.bestContact
                          ? contactStrategy.bestContact.name || contactStrategy.bestContact.email || "Unnamed contact"
                          : "Manual review needed"}
                      </div>
                      {contactStrategy.fallbackContact?.email && (
                        <div className="mt-1 text-xs text-gray-500">Fallback: {contactStrategy.fallbackContact.email}</div>
                      )}

                      <div className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Analysis Summary</div>
                      <div className="mt-1 text-sm leading-6 text-gray-600">
                        {analysis?.companySummary ?? "Waiting for AI qualification..."}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-gray-500">
                      <span>Added {new Date(lead.createdAt).toLocaleDateString()}</span>
                      {isSuperAdmin && selectedMemberId !== currentUserId && (
                        <span className="truncate text-right">Owner: {ownerName}</span>
                      )}
                    </div>

                    {isSuperAdmin && selectedMemberId !== currentUserId && (
                      <div className="mt-2 text-xs font-medium text-gray-400">
                        Created by: {creatorName}
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white transition-colors hover:bg-gray-800"
                      >
                        Review Lead
                      </Link>
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => openSingleDelete(lead.id)}
                          disabled={isPending}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-red-700 transition-colors hover:border-red-300 hover:text-red-900 disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <div className="min-w-full xl:min-w-[1100px]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
              <tr>
                {isSuperAdmin && <th className="px-4 py-5 text-center">Select</th>}
                <th className="px-6 py-5 xl:px-8">
                  <Link
                    href={queryFor({ sort: "name", order: sort === "name" ? toggleOrder : "asc", page: undefined })}
                    className="flex items-center gap-1 transition-colors hover:text-black"
                  >
                    Company
                    {sort === "name"
                      ? order === "asc"
                        ? <ArrowUp className="h-3 w-3" />
                        : <ArrowDown className="h-3 w-3" />
                      : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                  </Link>
                </th>
                <th className="px-6 py-5 xl:px-8">
                  <Link
                    href={queryFor({ sort: "stage", order: sort === "stage" ? toggleOrder : "asc", page: undefined })}
                    className="flex items-center gap-1 transition-colors hover:text-black"
                  >
                    Stage
                    {sort === "stage"
                      ? order === "asc"
                        ? <ArrowUp className="h-3 w-3" />
                        : <ArrowDown className="h-3 w-3" />
                      : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                  </Link>
                </th>
                <th className="px-6 py-5 xl:px-8">
                  <Link
                    href={queryFor({ sort: "fit", order: sort === "fit" ? toggleOrder : "desc", page: undefined })}
                    className="flex items-center gap-1 transition-colors hover:text-black"
                  >
                    Fit Score
                    {sort === "fit"
                      ? order === "asc"
                        ? <ArrowUp className="h-3 w-3" />
                        : <ArrowDown className="h-3 w-3" />
                      : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                  </Link>
                </th>
                <th className="hidden px-6 py-5 font-black text-gray-400 xl:table-cell xl:px-8">Analysis Summary</th>
                <th className="hidden px-6 py-5 text-right lg:table-cell xl:px-8">
                  <Link
                    href={queryFor({ sort: "created", order: sort === "created" ? toggleOrder : "desc", page: undefined })}
                    className="flex items-center justify-end gap-1 transition-colors hover:text-black"
                  >
                    {sort === "created"
                      ? order === "asc"
                        ? <ArrowUp className="h-3 w-3" />
                        : <ArrowDown className="h-3 w-3" />
                      : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                    Added
                  </Link>
                </th>
                <th className="px-6 py-5 text-right xl:px-8">Action</th>
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
                visibleLeads.map((lead: LeadRow) => {
                  const analysis = lead.analyses[0]
                  const contactStrategy = getLeadContactStrategy(lead.company.contacts || [])
                  const ownerName = lead.owner?.name || lead.owner?.email || "Unassigned"
                  const creatorName = lead.company.createdBy?.name || lead.company.createdBy?.email || "Unknown"

                  return (
                    <tr key={lead.id} className="group transition-colors hover:bg-gray-50/50">
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
                      <td className="px-6 py-6 xl:px-8">
                        <div className="font-black text-gray-900 transition-colors group-hover:text-black">{lead.company.name}</div>
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-tight text-gray-400">
                          {lead.company.niche || lead.company.domain || "Target"}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {lead.hasBeenReachedOutTo && (
                            <span className="inline-flex items-center rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                              Reached Out
                            </span>
                          )}
                          <CoverageBadge coverageStatus={contactStrategy.coverageStatus} />
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
                            <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 uppercase tracking-widest text-slate-500">
                              Member View
                            </span>
                            <span className="normal-case tracking-normal text-slate-400">Owner: {ownerName}</span>
                            <span className="text-slate-300">•</span>
                            <span className="normal-case tracking-normal text-slate-400">Created by: {creatorName}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-6 xl:px-8">
                        <StageBadge stage={lead.stage as LeadStage} />
                      </td>
                      <td className="px-6 py-6 xl:px-8">
                        <FitScoreBadge score={analysis?.fitScore} />
                      </td>
                      <td className="hidden px-6 py-6 xl:table-cell xl:px-8">
                        <div className="max-w-xs line-clamp-2 text-xs font-medium leading-relaxed text-gray-500" title={analysis?.companySummary ?? ""}>
                          {analysis?.companySummary ?? <span className="italic text-gray-300">Waiting for AI qualification...</span>}
                        </div>
                      </td>
                      <td className="hidden px-6 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400 lg:table-cell xl:px-8">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-6 text-right xl:px-8">
                        <div className="flex flex-col items-end gap-3">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="inline-block rounded-xl bg-black px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-gray-200 transition-all hover:bg-gray-800 active:scale-95"
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
        <Dialog.Root
          open
          onOpenChange={(open) => {
            if (!open && !isPending) setConfirmState(null)
          }}
        >
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
            <div className="fixed inset-0 z-[71] overflow-y-auto px-4 py-8">
              <div className="flex min-h-full items-center justify-center">
                <Dialog.Popup className="w-full max-w-lg rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_32px_120px_rgba(15,23,42,0.32)] transition duration-200 data-ending-style:translate-y-3 data-ending-style:opacity-0 data-starting-style:translate-y-3 data-starting-style:opacity-0 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-red-700">
                        Delete Confirmation
                      </div>
                      <Dialog.Title className="mt-3 text-2xl font-black tracking-tight text-gray-900">
                        {confirmState.title}
                      </Dialog.Title>
                    </div>
                    <Dialog.Close
                      render={
                        <button
                          type="button"
                          disabled={isPending}
                          className="rounded-xl border border-gray-200 p-2 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:opacity-40"
                          aria-label="Close delete confirmation"
                        />
                      }
                    >
                      <X className="h-4 w-4" />
                    </Dialog.Close>
                  </div>

                  <Dialog.Description className="mt-4 text-sm leading-6 text-gray-600">
                    {confirmState.message}
                  </Dialog.Description>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Delete Scope</div>
                      <div className="mt-2 text-sm font-semibold text-gray-900">{confirmState.scopeLabel}</div>
                    </div>
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">Impact</div>
                      <div className="mt-2 text-sm font-semibold text-red-900">
                        {confirmState.affectedCount} lead record{confirmState.affectedCount === 1 ? "" : "s"}
                      </div>
                      <div className="mt-1 text-xs text-red-700/80">
                        Orphaned company intel tied only to those leads will also be removed.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Dialog.Close
                      render={
                        <button
                          type="button"
                          disabled={isPending}
                          className="rounded-xl border border-gray-200 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-600 transition-colors hover:border-gray-300 hover:text-black disabled:opacity-40"
                        />
                      }
                    >
                      Cancel
                    </Dialog.Close>
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
                </Dialog.Popup>
              </div>
            </div>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </>
  )
}

function CoverageBadge({ coverageStatus }: { coverageStatus: "high" | "medium" | "low" | "missing" }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
        coverageStatus === "high"
          ? "border-green-100 bg-green-50 text-green-700"
          : coverageStatus === "medium"
            ? "border-blue-100 bg-blue-50 text-blue-700"
            : coverageStatus === "low"
              ? "border-yellow-100 bg-yellow-50 text-yellow-700"
              : "border-gray-100 bg-gray-50 text-gray-500"
      }`}
    >
      {coverageStatus} contact coverage
    </span>
  )
}

function FitScoreBadge({ score }: { score?: number | null }) {
  if (score == null) {
    return <span className="text-[10px] font-black italic tracking-widest text-gray-300">PENDING</span>
  }

  return (
    <div
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-sm ring-1 ring-inset ${
        score >= 80
          ? "bg-green-50 text-green-700 ring-green-100"
          : score >= 60
            ? "bg-blue-50 text-blue-700 ring-blue-100"
            : score >= 40
              ? "bg-orange-50 text-orange-700 ring-orange-100"
              : "bg-red-50 text-red-700 ring-red-100"
      }`}
    >
      {score}%
    </div>
  )
}

function StageBadge({ stage }: { stage: LeadStage }) {
  const label = STAGE_LABELS[stage] ?? stage

  if (stage === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-green-100 bg-green-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {label}
      </span>
    )
  }

  if (stage === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-700">
        <XCircle className="h-3.5 w-3.5" />
        {label}
      </span>
    )
  }

  if (stage === "pending_review") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-orange-100 bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-orange-700">
        <Clock className="h-3.5 w-3.5" />
        {label}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-xl border border-gray-100 bg-gray-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
      {label}
    </span>
  )
}
