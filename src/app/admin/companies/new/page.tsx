import Link from "next/link"
import { ArrowLeft, Building2 } from "lucide-react"
import { createCompany } from "../actions"

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="admin-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Link href="/admin/companies" className="admin-pill admin-pill-neutral">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <div>
            <p className="admin-eyebrow">New Company</p>
            <h1 className="admin-section-title mt-3">Add an account and create the first lead automatically.</h1>
            <p className="admin-section-copy mt-4 max-w-2xl">This form stays lightweight on mobile while still capturing the context needed for research and AI qualification.</p>
          </div>
        </div>
      </section>

      <section className="admin-card p-6 sm:p-8">
        <form action={createCompany} className="space-y-6">
          <Field label="Company Name" required>
            <input name="name" type="text" required placeholder="Acme Recruiting Agency" className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm text-[color:var(--admin-ink)] outline-none" />
          </Field>

          <Field label="Website URL">
            <input name="websiteUrl" type="url" placeholder="https://example.com" className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm text-[color:var(--admin-ink)] outline-none" />
            <p className="mt-2 text-sm text-[color:var(--admin-soft-text)]">Used for AI analysis and duplicate detection.</p>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Niche / Industry">
              <input name="niche" type="text" placeholder="Recruiting, SaaS" className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm text-[color:var(--admin-ink)] outline-none" />
            </Field>
            <Field label="Location">
              <input name="location" type="text" placeholder="London, UK" className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm text-[color:var(--admin-ink)] outline-none" />
            </Field>
          </div>

          <Field label="LinkedIn URL">
            <input name="linkedinUrl" type="url" placeholder="https://linkedin.com/company/..." className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm text-[color:var(--admin-ink)] outline-none" />
          </Field>

          <Field label="Research Notes">
            <textarea name="summary" rows={5} placeholder="What do you already know about this company and why does it matter?" className="w-full rounded-[18px] border border-[color:var(--admin-border)] bg-white px-4 py-4 text-sm leading-6 text-[color:var(--admin-ink)] outline-none resize-none" />
          </Field>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="flex items-center justify-center gap-2 rounded-full bg-[color:var(--admin-accent)] px-6 py-3 text-sm font-bold text-white">
              <Building2 className="h-4 w-4" />
              Add company & create lead
            </button>
            <Link href="/admin/companies" className="flex items-center justify-center rounded-full border border-[color:var(--admin-border)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--admin-ink)]">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}

function Field({
  label,
  children,
  required,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--admin-muted)]">
        {label} {required ? "*" : ""}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  )
}
