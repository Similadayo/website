"use client"

import { useState } from "react"
import { CheckCircle2, Edit3, Save, X, RefreshCw } from "lucide-react"
import { updateOutreachMessage, markOutreachSent } from "@/app/admin/outreach/actions"
import { reAnalyzeAndRegenerateOutreach } from "@/app/admin/leads/[id]/actions"
import Link from "next/link"
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
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-6 transition-all hover:shadow-xl hover:shadow-gray-100 group">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h3 className="font-black text-2xl text-gray-900 tracking-tight">{lead.company.name}</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">{lead.company.niche ?? "Target Account"}</p>
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
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
            <p className="text-xs text-gray-500">
              {contactStrategy.bestContact
                ? `Best contact: ${contactStrategy.bestContact.name || contactStrategy.bestContact.email || "Unnamed contact"}`
                : "Best contact: manual review needed"}
              {contactStrategy.fallbackContact?.email ? ` • Fallback: ${contactStrategy.fallbackContact.email}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] bg-black text-white font-black px-4 py-2 rounded-xl border border-black uppercase tracking-widest shadow-lg shadow-gray-200">
            Final Draft Ready
          </span>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 space-y-6 relative">
        {requiresReview && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Manual contact review required</p>
            <p className="mt-2">{contactStrategy.reason}</p>
          </div>
        )}
        {isEditing ? (
          <div className="space-y-6 animate-fadein transition-all">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject Line</label>
              <input 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Body</label>
              <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-black outline-none transition-all leading-relaxed shadow-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest transition-colors"
              >
                Discard Changes
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-black text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-40"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Commit Draft
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fadein transition-all">
            <div className="flex justify-between items-start mb-6">
               <div className="flex-1 pr-12">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject</p>
                 <p className="font-black text-gray-900 text-base tracking-tight">{subject}</p>
               </div>
               <button 
                 onClick={() => setIsEditing(true)}
                 className="p-3 text-gray-300 hover:text-black hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100"
                 title="Edit Draft"
               >
                 <Edit3 className="w-5 h-5" />
               </button>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm font-medium">
                {body}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button 
          onClick={handleSend}
          disabled={isSending || isEditing || requiresReview}
          className="flex-1 sm:flex-none bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] px-10 py-5 rounded-3xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-gray-200 active:scale-95 disabled:opacity-30"
        >
          {isSending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {requiresReview ? "Manual Review Needed" : "Transmit Now"}
        </button>
        <button 
          onClick={handleRegenerate}
          disabled={isRegenerating || isEditing}
          className="flex-1 sm:flex-none bg-white border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] px-10 py-5 rounded-3xl hover:text-black hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
        >
          {isRegenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          Re-Analyze + Rewrite
        </button>
        <Link 
          href={`/admin/leads/${lead.id}`}
          className="flex-1 sm:flex-none text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] px-10 py-5 hover:text-black transition-colors flex items-center justify-center gap-3 group/link"
        >
          View Full Lead <span className="transition-transform group-hover/link:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  )
}
