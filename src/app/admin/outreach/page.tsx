import Link from "next/link"
import { db } from "@/lib/db"
import { getAccessScope } from "@/lib/auth/scope"
import { OutreachDraftCard } from "@/components/admin/OutreachDraftCard"
import { generateOutreachSequence } from "./actions"
import {
  formatOutreachRecommendation,
  getLeadContactStrategy,
  requiresManualContactReview,
} from "@/lib/contacts/priority"
import { ArrowRight, CheckCircle2, MessageSquareReply, SendHorizontal, Sparkles } from "lucide-react"

export default async function OutreachPage() {
  const scope = await getAccessScope()
  const outreachLeads = await db.lead.findMany({
    where: {
      AND: [scope.leadsFilter, { stage: { in: ["approved", "outreach_ready", "contacted", "replied"] } }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      company: {
        include: {
          contacts: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
      },
      owner: { select: { id: true, name: true, email: true } },
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      threads: {
        include: { messages: { orderBy: { createdAt: "desc" }, take: 3 } },
        orderBy: { id: "desc" },
        take: 1,
      },
    },
  })

  const waitingForDraft = outreachLeads.filter((lead: any) => lead.threads.length === 0 && lead.stage === "approved")
  const withDrafts = outreachLeads.filter((lead: any) => lead.threads.length > 0 && !["contacted", "replied"].includes(lead.stage))
  const readyToSend = withDrafts.filter((lead: any) => !requiresManualContactReview(getLeadContactStrategy(lead.company.contacts || []).recommendation))
  const needsReview = withDrafts.filter((lead: any) => requiresManualContactReview(getLeadContactStrategy(lead.company.contacts || []).recommendation))
  const replied = outreachLeads.filter((lead: any) => lead.stage === "replied")

  return (
    <div className="space-y-6">
      <section className="admin-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-eyebrow">Outreach</p>
            <h1 className="admin-section-title mt-3 max-w-3xl">Ship the right message from the right queue.</h1>
            <p className="admin-section-copy mt-4 max-w-2xl">
              This view is optimized for rapid mobile execution: draft generation, fast review, send readiness, and reply handling.
            </p>
          </div>
          <Link href="/admin/outreach/history" className="inline-flex items-center gap-2 rounded-full bg-[color:var(--admin-accent)] px-5 py-3 text-sm font-bold text-white">
            Open activity
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Awaiting draft" value={waitingForDraft.length} tone="neutral" />
          <SummaryCard label="Ready to send" value={readyToSend.length} tone="success" />
          <SummaryCard label="Needs review" value={needsReview.length} tone="warning" />
          <SummaryCard label="Replies live" value={replied.length} tone="accent" />
        </div>
      </section>

      {waitingForDraft.length > 0 && (
        <section className="space-y-4">
          <SectionHeader title="Awaiting AI draft" body="Approved leads with no sequence yet. Generate the first draft and keep momentum." />
          <div className="grid gap-4 xl:grid-cols-2">
            {waitingForDraft.map((lead: any) => {
              const contactStrategy = getLeadContactStrategy(lead.company.contacts || [])

              return (
                <div key={lead.id} className="admin-card p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">{lead.company.name}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--admin-muted)]">
                        {lead.company.niche || "Target account"}
                      </p>
                    </div>
                    <span className="admin-pill admin-pill-neutral">{formatOutreachRecommendation(contactStrategy.recommendation)}</span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[color:var(--admin-soft-text)]">{contactStrategy.reason}</p>

                  <form
                    action={async () => {
                      "use server"
                      await generateOutreachSequence(lead.id)
                    }}
                    className="mt-5"
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full bg-[color:var(--admin-accent)] px-5 py-3 text-sm font-bold text-white"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate draft
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {readyToSend.length > 0 && (
        <section className="space-y-4">
          <SectionHeader title="Ready to send" body="Drafts with a usable contact path. Edit lightly, then dispatch." />
          <div className="space-y-5">
            {readyToSend.map((lead: any) => (
              <OutreachDraftCard key={lead.id} lead={lead} message={lead.threads[0]?.messages[0]} />
            ))}
          </div>
        </section>
      )}

      {needsReview.length > 0 && (
        <section className="space-y-4">
          <SectionHeader title="Needs contact review" body="Draft exists, but the contact route is still weak, generic, or manual." />
          <div className="grid gap-4 xl:grid-cols-2">
            {needsReview.map((lead: any) => {
              const strategy = getLeadContactStrategy(lead.company.contacts || [])

              return (
                <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="admin-card block p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-[color:var(--admin-ink)]">{lead.company.name}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--admin-muted)]">
                        {formatOutreachRecommendation(strategy.recommendation)}
                      </p>
                    </div>
                    <span className="admin-pill admin-pill-warning">Review</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[color:var(--admin-soft-text)]">{strategy.reason}</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {replied.length > 0 && (
        <section className="space-y-4">
          <SectionHeader title="Reply handling" body="Threads with inbound responses that need a next step." />
          <div className="grid gap-4 xl:grid-cols-2">
            {replied.map((lead: any) => {
              const latestInbound = lead.threads[0]?.messages.find((message: any) => message.direction === "inbound")

              return (
                <Link key={lead.id} href={`/admin/leads/${lead.id}`} className="admin-card block p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-[color:var(--admin-ink)]">{lead.company.name}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--admin-muted)]">
                        {latestInbound?.fromEmail || "Reply received"}
                      </p>
                    </div>
                    <span className="admin-pill admin-pill-accent">
                      <MessageSquareReply className="h-3.5 w-3.5" />
                      Replied
                    </span>
                  </div>
                  {latestInbound && (
                    <p className="mt-4 line-clamp-4 text-sm leading-6 text-[color:var(--admin-soft-text)]">{latestInbound.body}</p>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {outreachLeads.length === 0 && (
        <div className="admin-card p-6">
          <p className="text-xl font-semibold text-[color:var(--admin-ink)]">No outreach work is queued yet.</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">
            Approve leads from the pipeline and they will appear here with AI-generated draft support.
          </p>
        </div>
      )}
    </div>
  )
}

function SectionHeader({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="admin-eyebrow">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">{body}</p>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "neutral" | "success" | "warning" | "accent" }) {
  const toneClass =
    tone === "success"
      ? "bg-[color:var(--admin-success-soft)]"
      : tone === "warning"
        ? "bg-[color:var(--admin-warning-soft)]"
        : tone === "accent"
          ? "bg-[color:var(--admin-accent-soft)]"
          : "bg-white"

  return (
    <div className={`rounded-[24px] border border-[color:var(--admin-border)] p-4 ${toneClass}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">{label}</p>
      <p className="admin-metric-value mt-3">{value}</p>
    </div>
  )
}
