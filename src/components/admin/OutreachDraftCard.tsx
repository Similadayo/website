"use client"

import Link from "next/link"
import { useState } from "react"
import { CheckCircle2, Edit3, RefreshCw, Save } from "lucide-react"
import { markOutreachSent, updateOutreachMessage } from "@/app/admin/outreach/actions"
import { reAnalyzeAndRegenerateOutreach } from "@/app/admin/leads/[id]/actions"
import { formatOutreachRecommendation, getLeadContactStrategy, requiresManualContactReview } from "@/lib/contacts/priority"

interface OutreachDraftCardProps {
  lead: any
  message: any
}

export function OutreachDraftCard({ lead, message }: OutreachDraftCardProps) {
  const contactStrategy = getLeadContactStrategy(lead.company.contacts || [])
  const requiresReview = requiresManualContactReview(contactStrategy.recommendation)
  const [isEditing, setIsEditing] = useState(false)
  const [subject, setSubject] = useState(message.subject || "")
  const [body, setBody] = useState(message.body || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      await updateOutreachMessage(message.id, { subject, body })
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSend() {
    setIsSending(true)
    try {
      await markOutreachSent(lead.id, message.id)
    } finally {
      setIsSending(false)
    }
  }

  async function handleRegenerate() {
    setIsRegenerating(true)
    try {
      await reAnalyzeAndRegenerateOutreach(lead.id)
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="admin-card p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">{lead.company.name}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--admin-muted)]">
            {lead.company.niche ?? "Target account"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`admin-pill ${contactStrategy.coverageStatus === "high" ? "admin-pill-success" : contactStrategy.coverageStatus === "medium" ? "admin-pill-accent" : "admin-pill-warning"}`}>
              {contactStrategy.coverageStatus} contact coverage
            </span>
            <span className="admin-pill admin-pill-neutral">{formatOutreachRecommendation(contactStrategy.recommendation)}</span>
          </div>
        </div>

        <span className="admin-pill admin-pill-success">Final draft ready</span>
      </div>

      <div className="mt-5 rounded-[24px] bg-[color:var(--admin-card-strong)] p-5">
        <p className="text-sm text-[color:var(--admin-soft-text)]">
          {contactStrategy.bestContact
            ? `Best contact: ${contactStrategy.bestContact.name || contactStrategy.bestContact.email || "Unnamed contact"}`
            : "Best contact: manual review needed"}
          {contactStrategy.fallbackContact?.email ? ` • Fallback: ${contactStrategy.fallbackContact.email}` : ""}
        </p>

        {requiresReview && (
          <div className="mt-4 rounded-[18px] border border-[color:var(--admin-warning)]/20 bg-[color:var(--admin-warning-soft)] p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--admin-warning)]">Manual contact review required</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--admin-ink)]">{contactStrategy.reason}</p>
          </div>
        )}

        {isEditing ? (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--admin-muted)]">Subject</label>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="mt-2 w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--admin-ink)] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--admin-muted)]">Body</label>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={10}
                className="mt-2 w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-4 py-4 text-sm leading-6 text-[color:var(--admin-soft-text)] outline-none"
              />
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <button onClick={() => setIsEditing(false)} className="admin-pill admin-pill-neutral">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="admin-pill admin-pill-accent">
                {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Draft
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--admin-muted)]">Subject</p>
                <p className="mt-2 text-base font-semibold text-[color:var(--admin-ink)]">{subject}</p>
              </div>
              <button onClick={() => setIsEditing(true)} className="admin-pill admin-pill-neutral">
                <Edit3 className="h-3.5 w-3.5" />
                Edit
              </button>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[color:var(--admin-soft-text)]">{body}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleSend}
          disabled={isSending || isEditing || requiresReview}
          className="flex items-center justify-center gap-2 rounded-full bg-[color:var(--admin-accent)] px-6 py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {requiresReview ? "Manual review needed" : "Send now"}
        </button>
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating || isEditing}
          className="flex items-center justify-center gap-2 rounded-full border border-[color:var(--admin-border)] bg-white px-6 py-3 text-sm font-bold text-[color:var(--admin-ink)] disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
          Re-analyze + rewrite
        </button>
        <Link href={`/admin/leads/${lead.id}`} className="flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-[color:var(--admin-accent)]">
          View full lead
        </Link>
      </div>
    </div>
  )
}
