"use client"

import { useState } from "react"
import { Mail, SendHorizontal, BrainCircuit, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface OutreachSectionProps {
  leadId: string
  message: {
    id: string
    subject: string | null
    body: string
    sentAt: Date | null
  }
  contactEmail?: string
  canDraft: boolean
  canSend: boolean
  onSend: (leadId: string, to: string, subject: string, body: string, messageId: string) => Promise<{ success: boolean; error?: string }>
  onDraft: (leadId: string) => Promise<{ success: boolean; error?: string }>
}

export function OutreachSection({
  leadId,
  message,
  contactEmail,
  canDraft,
  canSend,
  onSend,
  onDraft
}: OutreachSectionProps) {
  const [isSending, setIsSending] = useState(false)
  const [isDrafting, setIsDrafting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSend = async () => {
    if (!contactEmail || !message.subject) return
    setIsSending(true)
    setResult(null)
    try {
      const res = await onSend(leadId, contactEmail, message.subject, message.body, message.id)
      if (res.success) {
        setResult({ success: true, message: "Email sent successfully!" })
      } else {
        setResult({ success: false, message: res.error || "Failed to send email" })
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message })
    } finally {
      setIsSending(false)
    }
  }

  const handleDraft = async () => {
    setIsDrafting(true)
    setResult(null)
    try {
      const res = await onDraft(leadId)
      if (res.success) {
        setResult({ success: true, message: "Draft generated!" })
      } else {
        setResult({ success: false, message: res.error || "Failed to generate draft" })
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message })
    } finally {
      setIsDrafting(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
        <Mail className="w-5 h-5 text-blue-600" /> Email Outreach
      </h2>

      {!message ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
          <Mail className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 mb-4 max-w-sm mx-auto">No outreach draft has been generated for this lead yet.</p>
          {canDraft ? (
            <button
              onClick={handleDraft}
              disabled={isDrafting}
              className="bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto shadow-sm disabled:opacity-50">
              {isDrafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              {isDrafting ? "Generating..." : "Generate AI Draft"}
            </button>
          ) : (
            <p className="text-sm text-gray-400 italic">Complete AI analysis first to enable drafting.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {result && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
              result.success ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {result.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {result.message}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-blue-500" />
                 <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Drafted Message</span>
              </div>
              {message.sentAt && (
                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" /> SENT {new Date(message.sentAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Subject</label>
                <p className="text-sm font-semibold text-gray-900">{message.subject}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Body</label>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-serif italic">
                  {message.body}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handleDraft}
              disabled={isDrafting}
              className="text-xs text-gray-500 hover:text-blue-600 font-medium flex items-center gap-1 disabled:opacity-50">
              {isDrafting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
              Regenerate Draft
            </button>

            {canSend && (
              <button
                onClick={handleSend}
                disabled={isSending}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 group disabled:opacity-50">
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                {isSending ? "Sending..." : `Send to ${contactEmail}`}
              </button>
            )}

            {message.sentAt && !canSend && (
              <div className="text-xs text-gray-400 italic">
                Sent to {contactEmail || "unknown contact"}
              </div>
            )}
            
            {!contactEmail && !message.sentAt && (
              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                <AlertCircle className="w-3.5 h-3.5" /> Missing contact email
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
