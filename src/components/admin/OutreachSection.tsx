"use client"

import { useState } from "react"
import { AlertCircle, BrainCircuit, CheckCircle2, Edit3, Loader2, Mail, Save, SendHorizontal, X } from "lucide-react"
import { updateOutreachMessage } from "@/app/admin/outreach/actions"
import { formatAdminDate, formatAdminTimestamp } from "@/lib/datetime"

interface OutreachSectionProps {
  leadId: string
  messages?: Array<{
    id: string
    direction?: string
    messageType?: string
    subject: string | null
    body: string
    sentAt: Date | null
    receivedAt?: Date | null
    fromEmail?: string | null
    toEmail?: string | null
    rawHeaders?: string | null
    stepNumber: number
    delayDays: number
  }>
  contactEmail?: string
  dispatchRecommendation?: string
  dispatchReason?: string
  requiresContactReview?: boolean
  canDraft: boolean
  canSend: boolean
  onSend: (leadId: string, to: string, subject: string, body: string, messageId?: string, overrideContactReview?: boolean) => Promise<{ success: boolean; error?: string }>
  onGenerateSequence: (leadId: string) => Promise<{ success: boolean; error?: string }>
}

export function OutreachSection({
  leadId,
  messages = [],
  contactEmail,
  dispatchRecommendation,
  dispatchReason,
  requiresContactReview = false,
  canDraft,
  canSend,
  onSend,
  onGenerateSequence,
}: OutreachSectionProps) {
  const [isSendingId, setIsSendingId] = useState<string | null>(null)
  const [isDrafting, setIsDrafting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const defaultRecipient = contactEmail || messages.find((message) => message.messageType === "reply_draft" && message.toEmail)?.toEmail || ""
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipient)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftSubject, setDraftSubject] = useState("")
  const [draftBody, setDraftBody] = useState("")
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [allowOverrideSend, setAllowOverrideSend] = useState(false)

  const handleSend = async (message: any) => {
    const targetEmail = recipientEmail.trim()
    if (!targetEmail || !message.subject) return
    setIsSendingId(message.id)
    setResult(null)
    try {
      const response = await onSend(leadId, targetEmail, message.subject!, message.body, message.id, allowOverrideSend)
      setResult({ success: response.success, message: response.success ? "Message sent successfully." : response.error || "Transmission failure." })
    } catch (error: any) {
      setResult({ success: false, message: error.message })
    } finally {
      setIsSendingId(null)
    }
  }

  const handleGenerate = async () => {
    setIsDrafting(true)
    setResult(null)
    try {
      const response = await onGenerateSequence(leadId)
      setResult({ success: response.success, message: response.success ? "Sequence generated." : response.error || "Failed to generate sequence." })
    } catch (error: any) {
      setResult({ success: false, message: error.message })
    } finally {
      setIsDrafting(false)
    }
  }

  const handleStartEdit = (message: any) => {
    setEditingId(message.id)
    setDraftSubject(message.subject || "")
    setDraftBody(message.body || "")
    setResult(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setDraftSubject("")
    setDraftBody("")
  }

  const handleSaveDraft = async (messageId: string) => {
    setIsSavingDraft(true)
    setResult(null)
    try {
      await updateOutreachMessage(messageId, { subject: draftSubject, body: draftBody })
      setEditingId(null)
      setResult({ success: true, message: "Draft updated." })
    } catch (error: any) {
      setResult({ success: false, message: error.message || "Failed to update draft." })
    } finally {
      setIsSavingDraft(false)
    }
  }

  const draftMessages = [...messages]
    .filter((message) => message.direction !== "inbound" && !message.sentAt)
    .sort((a, b) => {
      if ((a.messageType || "sequence") !== (b.messageType || "sequence")) {
        return (a.messageType || "sequence") === "reply_draft" ? -1 : 1
      }
      return (a.stepNumber || 0) - (b.stepNumber || 0)
    })

  const conversationMessages = [...messages]
    .filter((message) => message.direction === "inbound" || !!message.sentAt)
    .sort((a, b) => {
      const left = a.receivedAt || a.sentAt
      const right = b.receivedAt || b.sentAt
      return new Date(right || 0).getTime() - new Date(left || 0).getTime()
    })

  const getInboundMatchLabel = (rawHeaders?: string | null) => {
    if (!rawHeaders) return null

    try {
      const parsed = JSON.parse(rawHeaders) as Record<string, string>
      const matchSource = parsed["x-brancr-match-source"]

      if (matchSource === "reply_alias") return "Matched by reply alias"
      if (matchSource === "message_headers") return "Matched by reply headers"
      if (matchSource === "sender_fallback") return "Matched by sender fallback"
    } catch {}

    return null
  }

  return (
    <section className="admin-card p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="admin-eyebrow">Outreach</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Draft, edit, and dispatch from one thread.</h2>
        </div>
        {draftMessages.length > 0 && (
          <button onClick={handleGenerate} disabled={isDrafting} className="admin-pill admin-pill-accent">
            {isDrafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BrainCircuit className="h-3.5 w-3.5" />}
            Regenerate
          </button>
        )}
      </div>

      {draftMessages.length === 0 ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-card-strong)] p-6 text-center">
          <p className="text-base font-semibold text-[color:var(--admin-ink)]">No sequence active.</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">Generate the first outreach sequence once the lead is ready.</p>
          {canDraft && (
            <button onClick={handleGenerate} disabled={isDrafting} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--admin-accent)] px-6 py-3 text-sm font-bold text-white">
              {isDrafting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Generate sequence
            </button>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {conversationMessages.length > 0 && (
            <div className="rounded-[24px] bg-[color:var(--admin-card-strong)] p-5">
              <p className="text-sm font-semibold text-[color:var(--admin-ink)]">Reply timeline</p>
              <div className="mt-4 space-y-3">
                {conversationMessages.slice(0, 6).map((message) => (
                  <div key={message.id} className="rounded-[18px] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--admin-muted)]">
                          {message.direction === "inbound" ? "Received Reply" : "Sent Message"}
                        </p>
                        {message.direction === "inbound" && getInboundMatchLabel(message.rawHeaders) && (
                          <span className="rounded-full bg-[color:var(--admin-card-strong)] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[color:var(--admin-muted)]">
                            {getInboundMatchLabel(message.rawHeaders)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[color:var(--admin-muted)]">{formatAdminTimestamp(message.receivedAt || message.sentAt || new Date())}</p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[color:var(--admin-ink)]">{message.subject || "(No Subject)"}</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[color:var(--admin-soft-text)]">{message.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-[24px] bg-[color:var(--admin-card-strong)] p-5">
            <p className="text-sm font-semibold text-[color:var(--admin-ink)]">Dispatch target</p>
            <input
              type="email"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              placeholder="Enter recipient email"
              className="mt-4 w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm text-[color:var(--admin-ink)] outline-none"
            />
            <p className="mt-3 text-sm leading-6 text-[color:var(--admin-soft-text)]">
              {contactEmail ? `Detected contact email: ${contactEmail}. You can override it here for testing.` : "No contact email is stored on this lead yet."}
            </p>
            {dispatchRecommendation && (
              <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--admin-muted)]">
                Dispatch path: {dispatchRecommendation.replace(/_/g, " ")}
              </p>
            )}
          </div>

          {requiresContactReview && (
            <div className="rounded-[24px] border border-[color:var(--admin-warning)]/20 bg-[color:var(--admin-warning-soft)] p-5">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[color:var(--admin-warning)]">
                <AlertCircle className="h-4 w-4" />
                Manual contact review required
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--admin-ink)]">{dispatchReason || "This lead does not yet have a send-ready contact path."}</p>
              <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-[color:var(--admin-ink)]">
                <input
                  type="checkbox"
                  checked={allowOverrideSend}
                  onChange={(event) => setAllowOverrideSend(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded"
                />
                <span>Enable test-send override for QA or verification.</span>
              </label>
            </div>
          )}

          {result && (
            <div className={`rounded-[20px] border p-4 text-sm font-semibold ${result.success ? "border-[color:var(--admin-success)]/20 bg-[color:var(--admin-success-soft)] text-[color:var(--admin-success)]" : "border-[color:var(--admin-danger)]/20 bg-[color:var(--admin-danger-soft)] text-[color:var(--admin-danger)]"}`}>
              <div className="flex items-center gap-3">
                {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {result.message}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {draftMessages.map((message, index) => (
              <div key={message.id} className="rounded-[24px] border border-[color:var(--admin-border)] bg-white">
                <div className="flex items-center justify-between gap-3 border-b border-[color:var(--admin-border)] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ${message.sentAt ? "bg-[color:var(--admin-success-soft)] text-[color:var(--admin-success)]" : "bg-[color:var(--admin-accent)] text-white"}`}>
                      {message.sentAt ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--admin-muted)]">
                        {message.messageType === "reply_draft" ? "Suggested Reply Draft" : `Step ${index + 1}`}
                        {message.delayDays > 0 ? ` • +${message.delayDays}d` : ""}
                      </p>
                      {message.sentAt && <p className="mt-1 text-xs text-[color:var(--admin-success)]">Dispatched {formatAdminDate(message.sentAt)}</p>}
                    </div>
                  </div>
                  {!message.sentAt && (
                    <button onClick={() => handleStartEdit(message)} disabled={editingId !== null && editingId !== message.id} className="admin-pill admin-pill-neutral">
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                </div>

                {editingId === message.id ? (
                  <div className="space-y-4 p-5">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--admin-muted)]">Subject</label>
                      <input value={draftSubject} onChange={(event) => setDraftSubject(event.target.value)} className="mt-2 w-full rounded-[18px] border border-[color:var(--admin-border)] bg-[color:var(--admin-card-strong)] px-4 py-3 text-sm font-semibold text-[color:var(--admin-ink)] outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--admin-muted)]">Body</label>
                      <textarea value={draftBody} onChange={(event) => setDraftBody(event.target.value)} rows={10} className="mt-2 w-full rounded-[18px] border border-[color:var(--admin-border)] bg-[color:var(--admin-card-strong)] px-4 py-4 text-sm leading-6 text-[color:var(--admin-soft-text)] outline-none" />
                    </div>
                    <div className="flex flex-wrap justify-end gap-3">
                      <button onClick={handleCancelEdit} disabled={isSavingDraft} className="admin-pill admin-pill-neutral">
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                      <button onClick={() => handleSaveDraft(message.id)} disabled={isSavingDraft} className="admin-pill admin-pill-accent">
                        {isSavingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save Draft
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <p className="text-sm font-semibold text-[color:var(--admin-ink)]">{message.subject}</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[color:var(--admin-soft-text)]">{message.body}</p>
                  </div>
                )}

                {!message.sentAt && (
                  <div className="border-t border-[color:var(--admin-border)] px-5 py-4">
                    <button
                      onClick={() => handleSend(message)}
                      disabled={!!isSendingId || !canSend || !recipientEmail.trim() || editingId === message.id || (requiresContactReview && !allowOverrideSend)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--admin-accent)] px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
                    >
                      {isSendingId === message.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                      Send to {recipientEmail.trim() || "recipient"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
