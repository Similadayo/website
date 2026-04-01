"use client"

import { useState } from "react"
import { User, Mail, Shield, CheckCircle2, AlertCircle, Loader2, KeyRound } from "lucide-react"
import { useSession } from "next-auth/react"
import { updateUserSettings, updatePassword } from "@/app/admin/settings/actions"

interface SettingsFormProps {
  user: {
    name: string | null
    email: string | null
    senderEmail: string | null
    resendApiKey: string | null
    role: string
  }
}

export function SettingsForm({ user }: SettingsFormProps) {
  const { data: session, update } = useSession()
  const [name, setName] = useState(user.name || "")
  const [senderEmail, setSenderEmail] = useState(user.senderEmail || "")
  const [resendApiKey, setResendApiKey] = useState(user.resendApiKey || "")
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null)

  // Password state
  const [pwdCurrent, setPwdCurrent] = useState("")
  const [pwdNew, setPwdNew] = useState("")
  const [pwdConfirm, setPwdConfirm] = useState("")
  const [isPwdSaving, setIsPwdSaving] = useState(false)
  const [pwdStatus, setPwdStatus] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setStatus(null)

    try {
      const res = await updateUserSettings({ name, senderEmail, resendApiKey })
      if (res.success) {
        // Trigger session update to refresh the name globally in the UI
        await update({ name })
        setStatus({ success: true, message: "Settings synchronized successfully!" })
      } else {
        setStatus({ success: false, message: res.error || "Failed to update settings" })
      }
    } catch (err: any) {
      setStatus({ success: false, message: err.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwdNew !== pwdConfirm) {
      setPwdStatus({ success: false, message: "Mission Failure: Passwords do not match." })
      return
    }
    
    setIsPwdSaving(true)
    setPwdStatus(null)

    try {
      const res = await updatePassword({ current: pwdCurrent, new: pwdNew })
      if (res.success) {
        setPwdStatus({ success: true, message: "Security Protocols Synchronized! Credentials updated." })
        setPwdCurrent("")
        setPwdNew("")
        setPwdConfirm("")
      } else {
        setPwdStatus({ success: false, message: res.error || "Failed to rotate credentials." })
      }
    } catch (err: any) {
      setPwdStatus({ success: false, message: err.message })
    } finally {
      setIsPwdSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {status && (
        <div className={`rounded-[24px] border p-5 text-sm font-black uppercase tracking-widest animate-fadein ${
          status.success ? "border-[color:var(--admin-success)]/20 bg-[color:var(--admin-success-soft)] text-[color:var(--admin-success)]" : "border-[color:var(--admin-danger)]/20 bg-[color:var(--admin-danger-soft)] text-[color:var(--admin-danger)]"
        }`}>
          <div className="flex items-center gap-4">
          {status.success ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          {status.message}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="admin-card p-6 sm:p-8">
          <div className="flex items-center gap-6 mb-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[color:var(--admin-accent)] text-white">
               <User className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Profile</h3>
              <p className="mt-1 text-sm text-[color:var(--admin-soft-text)]">Administrative identity and account presentation.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-[color:var(--admin-muted)]">Account Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-5 py-4 text-sm font-semibold text-[color:var(--admin-ink)] outline-none"
              />
            </div>
            <div className="space-y-3 opacity-60">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-[color:var(--admin-muted)]">Authentication Email</label>
              <div className="flex w-full items-center gap-3 rounded-[18px] border border-[color:var(--admin-border)] bg-[color:var(--admin-card-strong)] px-5 py-4 text-sm font-semibold text-[color:var(--admin-soft-text)]">
                <Mail className="w-4 h-4 opacity-40" /> {user.email}
              </div>
            </div>
          </div>
        </section>

        <section className="admin-card p-6 sm:p-8">
          <div className="flex items-center gap-6 mb-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[color:var(--admin-card-strong)] text-[color:var(--admin-ink)]">
               <Shield className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Delivery & Integrations</h3>
              <p className="mt-1 text-sm text-[color:var(--admin-soft-text)]">Configure sender identity and outbound delivery tooling.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-[color:var(--admin-muted)]">Professional Sender Identity</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="name@brancr.com"
                  className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-5 py-4 text-sm font-semibold text-[color:var(--admin-ink)] outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-[color:var(--admin-muted)]">Resend API Key</label>
                <input
                  type="password"
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-5 py-4 text-sm font-semibold text-[color:var(--admin-ink)] outline-none"
                />
              </div>
              <div className="rounded-[24px] border border-[color:var(--admin-border)] bg-[color:var(--admin-card-strong)] p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--admin-muted)]">
                  Dispatch Node: Configure your sender identity and Resend key to test live outbound email delivery from Brancr Labs.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-[color:var(--admin-accent)] px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all disabled:opacity-40 sm:w-auto">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {isSaving ? "Syncing..." : "Save Settings"}
          </button>
        </div>
      </form>

      <section className="admin-card p-6 sm:p-8">
        <div className="flex items-center gap-6 mb-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[color:var(--admin-danger-soft)] text-[color:var(--admin-danger)]">
             <KeyRound className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Security</h3>
            <p className="mt-1 text-sm text-[color:var(--admin-soft-text)]">Rotate credentials and keep the workspace secure.</p>
          </div>
        </div>

        {pwdStatus && (
          <div className={`mb-10 rounded-[24px] border p-5 text-[10px] font-black uppercase tracking-widest ${
            pwdStatus.success ? "border-[color:var(--admin-success)]/20 bg-[color:var(--admin-success-soft)] text-[color:var(--admin-success)]" : "border-[color:var(--admin-danger)]/20 bg-[color:var(--admin-danger-soft)] text-[color:var(--admin-danger)]"
          }`}>
            <div className="flex items-center gap-4">
            {pwdStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {pwdStatus.message}
            </div>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-8 max-w-2xl">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-[color:var(--admin-muted)]">Current Password</label>
            <input
              type="password"
              required
              value={pwdCurrent}
              onChange={(e) => setPwdCurrent(e.target.value)}
              className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-5 py-4 text-sm font-semibold text-[color:var(--admin-ink)] outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-[color:var(--admin-muted)]">New Password</label>
              <input
                type="password"
                required
                value={pwdNew}
                onChange={(e) => setPwdNew(e.target.value)}
                className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-5 py-4 text-sm font-semibold text-[color:var(--admin-ink)] outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-[color:var(--admin-muted)]">Confirm New Password</label>
              <input
                type="password"
                required
                value={pwdConfirm}
                onChange={(e) => setPwdConfirm(e.target.value)}
                className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-5 py-4 text-sm font-semibold text-[color:var(--admin-ink)] outline-none"
              />
            </div>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={isPwdSaving}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[color:var(--admin-ink)] px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white disabled:opacity-40 sm:w-auto">
              {isPwdSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              {isPwdSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
