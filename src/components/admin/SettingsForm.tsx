"use client"

import { useState } from "react"
import { User, Mail, Shield, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { updateUserSettings } from "@/app/admin/settings/actions"

interface SettingsFormProps {
  user: {
    name: string | null
    email: string | null
    senderEmail: string | null
    role: string
  }
}

export function SettingsForm({ user }: SettingsFormProps) {
  const { data: session, update } = useSession()
  const [name, setName] = useState(user.name || "")
  const [senderEmail, setSenderEmail] = useState(user.senderEmail || "")
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setStatus(null)

    try {
      const res = await updateUserSettings({ name, senderEmail })
      if (res.success) {
        // Trigger session update to refresh the name globally in the UI
        await update({ name })
        setStatus({ success: true, message: "Settings updated successfully!" })
      } else {
        setStatus({ success: false, message: res.error || "Failed to update settings" })
      }
    } catch (err: any) {
      setStatus({ success: false, message: err.message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-12">
      {status && (
        <div className={`p-6 rounded-[2rem] flex items-center gap-4 text-sm font-black uppercase tracking-widest animate-fadein ${
          status.success ? "bg-black text-white border border-black shadow-2xl shadow-gray-200" : "bg-red-50 text-red-700 border border-red-100"
        }`}>
          {status.success ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Profile Section */}
        <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200">
               <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">Executive Profile</h3>
              <p className="text-xs text-gray-400 font-medium mt-1 italic">Administrative identity and system credentials.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Account Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all text-sm font-bold text-gray-900"
              />
            </div>
            <div className="space-y-3 opacity-60">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Authentication Email</label>
              <div className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 text-gray-400 text-sm font-bold flex items-center gap-3">
                <Mail className="w-4 h-4 opacity-40" /> {user.email}
              </div>
            </div>
          </div>
        </section>

        {/* Outreach Section */}
        <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
               <Mail className="w-7 h-7 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">Outreach Protocols</h3>
              <p className="text-xs text-gray-400 font-medium mt-1 italic">Configure how your agency persona appears in transmissions.</p>
            </div>
          </div>

          <div className="space-y-8 max-w-2xl">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Professional Sender Identity</label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="name@brancr.com"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all text-sm font-bold text-gray-900"
              />
              <p className="text-[10px] text-gray-400 ml-1 mt-4 flex items-center gap-2 font-black uppercase tracking-wider">
                <Shield className="w-4 h-4 text-black" /> 
                System Validation Required: Must be a verified @brancr.com node.
              </p>
            </div>
            
            <div className="bg-orange-50/30 p-6 rounded-2xl border border-orange-100/50">
              <p className="text-[11px] text-orange-800 leading-relaxed font-bold uppercase tracking-tight">
                Policy Reminder: If null, the system defaults to contact@brancr.com for all outgoing missions.
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto bg-black text-white px-12 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-3">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {isSaving ? "Syncing Protocols..." : "Save Executive Settings"}
          </button>
        </div>
      </form>
    </div>
  )
}
