"use client"

import { useState } from "react"
import { Mail, SendHorizontal, BrainCircuit, CheckCircle2, AlertCircle, Loader2, Edit3, Save, X } from "lucide-react"
import { updateOutreachMessage } from "@/app/admin/outreach/actions"

interface OutreachSectionProps {
  leadId: string
  messages?: Array<{
    id: string
    subject: string | null
    body: string
    sentAt: Date | null
    stepNumber: number
    delayDays: number
  }>
  contactEmail?: string
  canDraft: boolean
  canSend: boolean
  onSend: (leadId: string, to: string, subject: string, body: string, messageId?: string) => Promise<{ success: boolean; error?: string }>
  onGenerateSequence: (leadId: string) => Promise<{ success: boolean; error?: string }>
}

export function OutreachSection({
  leadId,
  messages = [],
  contactEmail,
  canDraft,
  canSend,
  onSend,
  onGenerateSequence
}: OutreachSectionProps) {
  const [isSendingId, setIsSendingId] = useState<string | null>(null)
  const [isDrafting, setIsDrafting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [recipientEmail, setRecipientEmail] = useState(contactEmail || "")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftSubject, setDraftSubject] = useState("")
  const [draftBody, setDraftBody] = useState("")
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  const handleSend = async (msg: any) => {
    const targetEmail = recipientEmail.trim()
    if (!targetEmail || !msg.subject) return
    setIsSendingId(msg.id)
    setResult(null)
    try {
      const res = await onSend(leadId, targetEmail, msg.subject!, msg.body, msg.id)
      if (res.success) {
        setResult({ success: true, message: "Step transmission successful!" })
      } else {
        setResult({ success: false, message: res.error || "Transmission failure" })
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message })
    } finally {
      setIsSendingId(null)
    }
  }

  const handleGenerate = async () => {
    setIsDrafting(true)
    setResult(null)
    try {
      const res = await onGenerateSequence(leadId)
      if (res.success) {
        setResult({ success: true, message: "Mission sequence synchronized!" })
      } else {
        setResult({ success: false, message: res.error || "Failed to generate sequence" })
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message })
    } finally {
      setIsDrafting(false)
    }
  }

  const handleStartEdit = (msg: any) => {
    setEditingId(msg.id)
    setDraftSubject(msg.subject || "")
    setDraftBody(msg.body || "")
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
      await updateOutreachMessage(messageId, {
        subject: draftSubject,
        body: draftBody,
      })
      setEditingId(null)
      setResult({ success: true, message: "Draft updated and ready to send." })
    } catch (err: any) {
      setResult({ success: false, message: err.message || "Failed to update draft" })
    } finally {
      setIsSavingDraft(false)
    }
  }

  const sortedMessages = [...messages].sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Outreach Mission Sequence
        </h2>
        {sortedMessages.length > 0 && (
          <button
            onClick={handleGenerate}
            disabled={isDrafting}
            className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline flex items-center gap-1.5 transition-all disabled:opacity-50">
            {isDrafting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
            Regenerate Sequence
          </button>
        )}
      </div>

      {sortedMessages.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2rem] bg-gray-50/30 dark:bg-white/5">
          <BrainCircuit className="w-12 h-12 text-gray-200 dark:text-white/5 mx-auto mb-4" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">No sequence active</p>
          {canDraft ? (
            <button
              onClick={handleGenerate}
              disabled={isDrafting}
              className="bg-black dark:bg-white text-white dark:text-black font-black px-8 py-3.5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-3 mx-auto shadow-xl shadow-gray-200 dark:shadow-none disabled:opacity-50">
              {isDrafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {isDrafting ? "Synchronizing..." : "Initiate 3-Step Sequence"}
            </button>
          ) : (
            <p className="text-[10px] text-gray-400 italic font-bold">Complete AI analysis first to enable sequencing.</p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-gray-100 dark:border-white/5 bg-gray-50/40 dark:bg-white/5 p-5 space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dispatch Target</p>
            <input
              type="email"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              placeholder="Insert email address for testing"
              className="w-full rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-sm font-medium text-gray-900 dark:text-white outline-none transition-all focus:border-black dark:focus:border-white placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400">
              {contactEmail
                ? `Detected lead email: ${contactEmail}. You can override it here for testing.`
                : "No contact email was found on this lead. Enter a recipient email to test Resend."}
            </p>
          </div>

          {result && (
            <div className={`p-5 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-fadein ${
              result.success ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30"
            }`}>
              {result.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {result.message}
            </div>
          )}

          <div className="space-y-6 relative before:absolute before:left-[1.25rem] before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-50 dark:before:bg-white/5">
            {sortedMessages.map((msg, idx) => (
              <div key={msg.id} className={`relative pl-12 group ${msg.sentAt ? "opacity-60" : ""}`}>
                {/* Step Circle */}
                <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs z-10 transition-all border ${
                  msg.sentAt 
                    ? "bg-emerald-500 text-white border-emerald-600" 
                    : "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg"
                }`}>
                  {msg.sentAt ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>

                <div className="bg-white dark:bg-gray-950/40 rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden group-hover:border-black dark:group-hover:border-white transition-colors">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {idx === 0 ? "Step 1: Mission Launch" : idx === 1 ? "Step 2: Escalation" : "Step 3: Signal Intercept"}
                      {msg.delayDays > 0 && ` (+${msg.delayDays}d)`}
                    </span>
                    <div className="flex items-center gap-3">
                      {!msg.sentAt && (
                        <button
                          onClick={() => handleStartEdit(msg)}
                          disabled={editingId !== null && editingId !== msg.id}
                          className="p-2 text-gray-300 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-white/10 disabled:opacity-30"
                          title="Edit draft"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {msg.sentAt && (
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                          Dispatched {new Date(msg.sentAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {editingId === msg.id ? (
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</label>
                        <input
                          value={draftSubject}
                          onChange={(event) => setDraftSubject(event.target.value)}
                          className="w-full rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-3 text-sm font-black text-gray-900 dark:text-white outline-none transition-all focus:border-black dark:focus:border-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Body</label>
                        <textarea
                          value={draftBody}
                          onChange={(event) => setDraftBody(event.target.value)}
                          rows={10}
                          className="w-full rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none transition-all focus:border-black dark:focus:border-white leading-relaxed"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={handleCancelEdit}
                          disabled={isSavingDraft}
                          className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-40"
                        >
                          <span className="inline-flex items-center gap-2">
                            <X className="w-4 h-4" />
                            Cancel
                          </span>
                        </button>
                        <button
                          onClick={() => handleSaveDraft(msg.id)}
                          disabled={isSavingDraft}
                          className="rounded-2xl bg-black dark:bg-white px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white dark:text-black transition-all hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-40 inline-flex items-center gap-2"
                        >
                          {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Draft
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 space-y-4">
                      <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
                        {msg.subject}
                      </p>
                      <div className="text-[11px] text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed font-medium italic border-l-2 border-gray-100 dark:border-white/10 pl-4 py-1">
                        {msg.body}
                      </div>
                    </div>
                  )}

                  {!msg.sentAt && (
                    <div className="p-4 sm:px-6 sm:py-4 bg-gray-50/50 dark:bg-white/5 flex justify-end items-center">
                      <button
                        onClick={() => handleSend(msg)}
                        disabled={!!isSendingId || !canSend || !recipientEmail.trim() || editingId === msg.id}
                        className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black px-4 sm:px-6 py-3 sm:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 overflow-hidden">
                        {isSendingId === msg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : <SendHorizontal className="w-3.5 h-3.5 shrink-0" />}
                        <span className="truncate">Dispatch to {recipientEmail.trim() || "recipient"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
