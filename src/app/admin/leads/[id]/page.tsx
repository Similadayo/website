import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ExternalLink,
  Linkedin,
  Mail,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react"
import {
  approveExecutiveEmailContact,
  approveGenericInboxContact,
  markContactForManualReview,
  runLeadAIAnalysis,
  sendLeadEmail,
  setPrimaryContact,
  startDeepRecon,
  transferLeadToAdminReview,
  updateLeadStage,
} from "./actions"
import { generateOutreachSequence } from "@/app/admin/outreach/actions"
import { STAGE_LABELS } from "@/lib/stages"
import { OutreachSection } from "@/components/admin/OutreachSection"
import { getAccessScope, getScopedLeadWhere } from "@/lib/auth/scope"
import {
  getContactTier,
  getLeadContactStrategy,
  isInferredExecutiveEmail,
  requiresManualContactReview,
} from "@/lib/contacts/priority"

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const scope = await getAccessScope()
  const lead = await db.lead.findFirst({
    where: await getScopedLeadWhere(id),
    include: {
      company: {
        include: {
          contacts: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      owner: {
        select: { id: true, name: true, email: true },
      },
      analyses: { orderBy: { createdAt: "desc" }, take: 1 },
      threads: {
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { actor: true },
      },
    },
  })

  if (!lead) return notFound()

  const analysis = lead.analyses[0]
  const thread = lead.threads[0]
  const messages = thread?.messages || []
  const contactStrategy = getLeadContactStrategy(lead.company.contacts as any[])
  const contact = contactStrategy.primarySendContact
  const analysisJson = analysis?.rawResponse
    ? (JSON.parse(analysis.rawResponse as string) as {
        recommended_owners?: string[]
        operator_contacts?: Array<{
          role: string
          name: string | null
          email: string | null
          linkedin_url: string | null
          evidence: string
        }>
      })
    : null
  const recommendedOwners = analysisJson?.recommended_owners ?? []
  const operatorContacts = analysisJson?.operator_contacts ?? []

  const stageLabel = STAGE_LABELS[lead.stage as keyof typeof STAGE_LABELS] ?? lead.stage
  const canApprove = lead.stage === "pending_review"
  const canReject = !["rejected", "closed_won", "closed_lost"].includes(lead.stage)
  const canAnalyze = ["new", "researching", "analyzed"].includes(lead.stage)
  const canDraft = ["analyzed", "approved", "outreach_ready"].includes(lead.stage)
  const canSend =
    messages.some((message: any) => message.direction !== "inbound" && !message.sentAt) &&
    ["outreach_ready", "approved", "analyzed", "replied"].includes(lead.stage)
  const ownerName = lead.owner?.name || lead.owner?.email || "Unassigned"
  const creatorName = lead.company.createdBy?.name || lead.company.createdBy?.email || "Unknown"
  const isMine = lead.ownerId === scope.userId || lead.company.createdById === scope.userId
  const shouldTransferToAdmin =
    !scope.isSuperAdmin &&
    !!contactStrategy.bestContact?.linkedinUrl &&
    contactStrategy.recommendation === "linkedin_or_manual_review"

  return (
    <div className="space-y-6 pb-28 lg:pb-8">
      <section className="admin-card overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="admin-pill admin-pill-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Lead detail
              </span>
              <span className="admin-pill admin-pill-neutral">{stageLabel}</span>
              {scope.isSuperAdmin && (
                <span className={`admin-pill ${isMine ? "admin-pill-success" : "admin-pill-neutral"}`}>{isMine ? "My lead" : "Member lead"}</span>
              )}
            </div>

            <h1 className="admin-section-title mt-5 max-w-4xl">{lead.company.name}</h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="admin-pill admin-pill-neutral">Owner: {ownerName}</span>
              <span className="admin-pill admin-pill-neutral">Created by: {creatorName}</span>
              {lead.company.niche && <span className="admin-pill admin-pill-neutral">{lead.company.niche}</span>}
            </div>

            {lead.company.websiteUrl && (
              <a
                href={lead.company.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--admin-accent)]"
              >
                {lead.company.websiteUrl}
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {canReject && (
              <form
                action={async () => {
                  "use server"
                  await updateLeadStage(lead.id, "rejected", "Manual review rejection")
                }}
              >
                <button type="submit" className="admin-pill admin-pill-danger">
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </button>
              </form>
            )}

            {canApprove && (
              <form
                action={async () => {
                  "use server"
                  await updateLeadStage(lead.id, "approved")
                }}
              >
                <button type="submit" className="admin-pill admin-pill-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Fit Score"
            value={analysis?.fitScore != null ? `${analysis.fitScore}` : "--"}
            tone={analysis?.fitScore != null && analysis.fitScore >= 70 ? "success" : analysis?.fitScore != null && analysis.fitScore >= 50 ? "warning" : "neutral"}
          />
          <StatCard
            label="Confidence"
            value={analysis?.confidenceScore != null ? `${Math.round(analysis.confidenceScore * 100)}%` : "--"}
            tone="accent"
          />
          <StatCard label="Contact Coverage" value={contactStrategy.coverageStatus} tone="neutral" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="admin-card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="admin-eyebrow">AI Qualification</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Why this account matters and where it breaks.</h2>
              </div>
              {canAnalyze && (
                <form
                  action={async () => {
                    "use server"
                    await runLeadAIAnalysis(lead.id)
                  }}
                >
                  <button type="submit" className="admin-pill admin-pill-accent">
                    <BrainCircuit className="h-3.5 w-3.5" />
                    {analysis ? "Re-run AI" : "Run AI"}
                  </button>
                </form>
              )}
            </div>

            {!analysis ? (
              <div className="mt-5 rounded-[24px] border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-card-strong)] p-6">
                <p className="text-base font-semibold text-[color:var(--admin-ink)]">No AI analysis yet.</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">Run qualification to score fit, surface use cases, and generate the outreach angle.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <InfoBlock title="Company Summary" body={analysis.companySummary || "No summary available."} />

                <div className="grid gap-4 md:grid-cols-2">
                  <InfoBlock title="Why It Fits" body={analysis.fitReasons || "No fit reasons identified."} tone="success" />
                  <InfoBlock title="Gaps / Risks" body={analysis.gapReasons || "No major gaps identified."} tone="danger" />
                </div>

                {analysis.painPoints && (
                  <ListBlock title="Likely Pain Points" items={JSON.parse(analysis.painPoints as string) as string[]} />
                )}

                {analysis.useCases && (
                  <ListBlock title="Relevant Use Cases" items={JSON.parse(analysis.useCases as string) as string[]} />
                )}

                {recommendedOwners.length > 0 && <ListBlock title="Suggested Internal Owners" items={recommendedOwners} />}

                {operatorContacts.length > 0 && (
                  <div className="rounded-[24px] border border-[color:var(--admin-border)] bg-[color:var(--admin-card-strong)] p-5">
                    <p className="text-sm font-semibold text-[color:var(--admin-ink)]">Operator Contacts Found</p>
                    <div className="mt-4 space-y-3">
                      {operatorContacts.map((operator, index) => (
                        <div key={`${operator.role}-${operator.name ?? index}`} className="rounded-[18px] bg-white p-4">
                          <p className="text-sm font-semibold text-[color:var(--admin-ink)]">
                            {operator.role}
                            {operator.name ? ` • ${operator.name}` : ""}
                          </p>
                          <p className="mt-2 text-xs text-[color:var(--admin-soft-text)]">
                            {[operator.email, operator.linkedin_url].filter(Boolean).join(" • ")}
                          </p>
                          <p className="mt-3 text-sm leading-6 text-[color:var(--admin-soft-text)]">{operator.evidence}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-[24px] border border-[color:var(--admin-border)] bg-[color:var(--admin-card-strong)] p-5">
                  <p className="text-sm font-semibold text-[color:var(--admin-ink)]">Contact Strategy</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <ContactSummaryCard
                      title="Best Contact"
                      contact={contactStrategy.bestContact}
                      emptyCopy="No credible contact identified yet."
                    />
                    <ContactSummaryCard
                      title="Fallback Route"
                      contact={contactStrategy.fallbackContact}
                      emptyCopy="No fallback route stored."
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="admin-pill admin-pill-neutral">{contactStrategy.coverageStatus} coverage</span>
                    <span className="admin-pill admin-pill-accent">{contactStrategy.recommendation.replace(/_/g, " ")}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--admin-soft-text)]">{contactStrategy.reason}</p>

                  {shouldTransferToAdmin && (
                    <div className="mt-4 rounded-[18px] border border-[color:var(--admin-accent)]/20 bg-[color:var(--admin-accent-soft)] p-4">
                      <p className="text-sm font-semibold text-[color:var(--admin-ink)]">Admin handoff recommended</p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">
                        The strongest route here is LinkedIn, so this lead should move to admin review instead of staying with researcher outreach.
                      </p>
                      <form
                        action={async () => {
                          "use server"
                          await transferLeadToAdminReview(lead.id)
                        }}
                        className="mt-4"
                      >
                        <button type="submit" className="admin-pill admin-pill-accent">
                          <Target className="h-3.5 w-3.5" />
                          Transfer To Admin
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {analysis.outreachAngle && (
                  <InfoBlock title="Recommended Outreach Angle" body={analysis.outreachAngle} tone="accent" />
                )}
              </div>
            )}
          </section>

          <OutreachSection
            leadId={lead.id}
            messages={messages as any}
            contactEmail={contact?.email ?? undefined}
            dispatchRecommendation={contactStrategy.recommendation}
            dispatchReason={contactStrategy.reason}
            requiresContactReview={requiresManualContactReview(contactStrategy.recommendation)}
            canDraft={canDraft}
            canSend={canSend as boolean}
            onSend={sendLeadEmail}
            onGenerateSequence={generateOutreachSequence}
          />
        </div>

        <div className="space-y-6">
          <section className="admin-card p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[color:var(--admin-accent)]" />
              <h2 className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Company Profile</h2>
            </div>

            <div className="mt-5 space-y-3">
              <DetailRow label="Niche" value={lead.company.niche} />
              <DetailRow label="Location" value={lead.company.location} />
              <DetailRow label="Domain" value={lead.company.domain} />
              <DetailRow label="Added" value={lead.company.createdAt.toLocaleDateString()} />
              <DetailRow
                label="LinkedIn"
                value={
                  lead.company.linkedinUrl ? (
                    <a
                      href={lead.company.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[color:var(--admin-accent)]"
                    >
                      Open company page
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : undefined
                }
              />
            </div>

            {lead.company.summary && (
              <div className="mt-5 rounded-[20px] bg-[color:var(--admin-card-strong)] p-4">
                <p className="text-sm font-semibold text-[color:var(--admin-ink)]">Summary</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">{lead.company.summary}</p>
              </div>
            )}
          </section>

          <section className="admin-card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-[color:var(--admin-accent)]" />
                <h2 className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Contacts</h2>
              </div>
              <form
                action={async () => {
                  "use server"
                  await startDeepRecon(lead.id)
                }}
              >
                <button type="submit" className="admin-pill admin-pill-accent">
                  <Activity className="h-3.5 w-3.5" />
                  Deep Recon
                </button>
              </form>
            </div>

            <div className="mt-5 space-y-4">
              {lead.company.contacts.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[color:var(--admin-border)] bg-[color:var(--admin-card-strong)] p-5">
                  <p className="text-sm font-semibold text-[color:var(--admin-ink)]">No contacts yet.</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">Run deeper recon to enrich the company with decision-maker data.</p>
                </div>
              ) : (
                contactStrategy.ranked.map((contactItem: any) => (
                  <div key={contactItem.id} className="rounded-[24px] bg-[color:var(--admin-card-strong)] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-[color:var(--admin-ink)]">{contactItem.name || contactItem.email || "Unnamed contact"}</p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--admin-muted)]">
                          {contactItem.roleTitle || "Executive"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {contactStrategy.bestContact?.id === contactItem.id && <span className="admin-pill admin-pill-success">Primary</span>}
                          {contactStrategy.fallbackContact?.id === contactItem.id && <span className="admin-pill admin-pill-accent">Fallback</span>}
                          <span className="admin-pill admin-pill-neutral">{getContactTier(contactItem)}</span>
                          {contactItem.outreachRecommendation && (
                            <span className="admin-pill admin-pill-neutral">{contactItem.outreachRecommendation.replace(/_/g, " ")}</span>
                          )}
                          {contactItem.email && (
                            <span className={`admin-pill ${getEmailStatusPillClass(contactItem)}`}>{formatEmailStatus(contactItem)}</span>
                          )}
                          {contactItem.emailEvidenceLevel && (
                            <span className="admin-pill admin-pill-neutral">{formatEmailEvidence(contactItem.emailEvidenceLevel)}</span>
                          )}
                          {contactItem.isGenericInbox && <span className="admin-pill admin-pill-warning">Generic inbox</span>}
                          <span className="admin-pill admin-pill-neutral">{formatConfidenceLabel(contactItem.confidenceScore)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {contactItem.linkedinUrl && (
                          <a
                            href={contactItem.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-pill admin-pill-neutral"
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                            LinkedIn
                          </a>
                        )}
                        {contactItem.email && (
                          <a href={`mailto:${contactItem.email}`} className="admin-pill admin-pill-neutral">
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </a>
                        )}
                      </div>
                    </div>

                    {contactItem.sourceEvidence && (
                      <p className="mt-4 text-sm leading-6 text-[color:var(--admin-soft-text)]">{contactItem.sourceEvidence}</p>
                    )}

                    {contactItem.email && (
                      <div className="mt-3 rounded-[18px] border border-[color:var(--admin-border)] bg-white/70 p-4">
                        <p className="text-sm font-semibold text-[color:var(--admin-ink)]">{contactItem.email}</p>
                        <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">
                          {isInferredExecutiveEmail(contactItem)
                            ? "Email was inferred from the company pattern and should be reviewed before sending."
                            : contactItem.emailEvidenceLevel === "public_same_domain"
                              ? "Email is public and matched to this executive from nearby website evidence."
                              : "Email is public and visible on a company source."}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <form
                        action={async () => {
                          "use server"
                          await setPrimaryContact(lead.id, contactItem.id)
                        }}
                      >
                        <button type="submit" className="admin-pill admin-pill-neutral">
                          Promote Primary
                        </button>
                      </form>

                      {contactItem.email && (
                        <form
                          action={async () => {
                            "use server"
                            await approveGenericInboxContact(lead.id, contactItem.id)
                          }}
                        >
                          <button type="submit" className="admin-pill admin-pill-neutral">
                            Approve Inbox
                          </button>
                        </form>
                      )}

                      {contactItem.emailStatus === "inferred" && (
                        <form
                          action={async () => {
                            "use server"
                            await approveExecutiveEmailContact(lead.id, contactItem.id)
                          }}
                        >
                          <button type="submit" className="admin-pill admin-pill-accent">
                            Approve Executive Email
                          </button>
                        </form>
                      )}

                      <form
                        action={async () => {
                          "use server"
                          await markContactForManualReview(lead.id, contactItem.id)
                        }}
                      >
                        <button type="submit" className="admin-pill admin-pill-warning">
                          Needs Review
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="admin-card p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[color:var(--admin-accent)]" />
              <h2 className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">Activity Log</h2>
            </div>

            <div className="mt-5 space-y-4">
              {lead.activityLogs.length === 0 ? (
                <p className="text-sm text-[color:var(--admin-soft-text)]">No activity recorded.</p>
              ) : (
                lead.activityLogs.map((log: any) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[color:var(--admin-accent)]" />
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--admin-ink)]">
                        {log.actionType.replace(/_/g, " ")}
                        {log.actor?.name ? ` by ${log.actor.name}` : ""}
                      </p>
                      {log.newValue && <p className="mt-1 text-sm leading-6 text-[color:var(--admin-soft-text)]">{summarizeLogValue(log.newValue)}</p>}
                      <p className="mt-1 text-xs text-[color:var(--admin-muted)]">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {(canApprove || canReject) && (
        <div className="fixed inset-x-0 bottom-[76px] z-30 border-t border-[color:var(--admin-border)] bg-[color:var(--admin-panel)]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex gap-3">
            {canReject && (
              <form
                action={async () => {
                  "use server"
                  await updateLeadStage(lead.id, "rejected", "Manual review rejection")
                }}
                className="flex-1"
              >
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--admin-danger)] px-4 py-3 text-sm font-bold text-white">
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </form>
            )}
            {canApprove && (
              <form
                action={async () => {
                  "use server"
                  await updateLeadStage(lead.id, "approved")
                }}
                className="flex-1"
              >
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--admin-success)] px-4 py-3 text-sm font-bold text-white">
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: "accent" | "success" | "warning" | "neutral"
}) {
  const toneClass =
    tone === "accent"
      ? "bg-[color:var(--admin-accent-soft)]"
      : tone === "success"
        ? "bg-[color:var(--admin-success-soft)]"
        : tone === "warning"
          ? "bg-[color:var(--admin-warning-soft)]"
          : "bg-white"

  return (
    <div className={`rounded-[24px] border border-[color:var(--admin-border)] p-4 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--admin-ink)]">{value}</p>
    </div>
  )
}

function InfoBlock({
  title,
  body,
  tone,
}: {
  title: string
  body: string
  tone?: "success" | "danger" | "accent"
}) {
  const toneClass =
    tone === "success"
      ? "bg-[color:var(--admin-success-soft)]"
      : tone === "danger"
        ? "bg-[color:var(--admin-danger-soft)]"
        : tone === "accent"
          ? "bg-[color:var(--admin-accent-soft)]"
          : "bg-[color:var(--admin-card-strong)]"

  return (
    <div className={`rounded-[24px] p-5 ${toneClass}`}>
      <p className="text-sm font-semibold text-[color:var(--admin-ink)]">{title}</p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[color:var(--admin-soft-text)]">{body}</p>
    </div>
  )
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[24px] bg-[color:var(--admin-card-strong)] p-5">
      <p className="text-sm font-semibold text-[color:var(--admin-ink)]">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-3 text-sm leading-6 text-[color:var(--admin-soft-text)]">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[color:var(--admin-accent)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContactSummaryCard({
  title,
  contact,
  emptyCopy,
}: {
  title: string
  contact: any
  emptyCopy: string
}) {
  return (
    <div className="rounded-[20px] bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--admin-muted)]">{title}</p>
      {contact ? (
        <div className="mt-3 space-y-1 text-sm leading-6 text-[color:var(--admin-soft-text)]">
          <p className="font-semibold text-[color:var(--admin-ink)]">{contact.name || contact.email || "Unnamed contact"}</p>
          <p>{contact.roleTitle || "No role title captured"}</p>
          {contact.email && <p>{contact.email}</p>}
          {contact.linkedinUrl && (
            <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[color:var(--admin-accent)]">
              LinkedIn
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-[color:var(--admin-soft-text)]">{emptyCopy}</p>
      )}
    </div>
  )
}

function formatEmailStatus(contact: any) {
  if (contact.isGenericInbox) return "Generic inbox"
  if (contact.emailStatus === "public") return "Public email"
  if (contact.emailStatus === "inferred") return "Inferred email"
  if (contact.emailStatus === "unverified") return "Unverified email"
  return "Unknown email status"
}

function getEmailStatusPillClass(contact: any) {
  if (contact.isGenericInbox) return "admin-pill-warning"
  if (contact.emailStatus === "public") return "admin-pill-success"
  if (contact.emailStatus === "inferred") return "admin-pill-warning"
  return "admin-pill-neutral"
}

function formatEmailEvidence(value: string) {
  if (value === "public_exact") return "Public exact match"
  if (value === "public_same_domain") return "Public nearby match"
  if (value === "pattern_inferred") return "Pattern inferred"
  return value.replace(/_/g, " ")
}

function formatConfidenceLabel(value?: number | null) {
  if (value == null) return "Confidence unknown"
  return `${Math.round(value * 100)}% confidence`
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[18px] bg-[color:var(--admin-card-strong)] px-4 py-3">
      <span className="text-sm font-semibold text-[color:var(--admin-soft-text)]">{label}</span>
      <div className="text-right text-sm text-[color:var(--admin-ink)]">{value || "--"}</div>
    </div>
  )
}

function summarizeLogValue(value: string) {
  try {
    const parsed = JSON.parse(value)
    if (parsed?.summary) return parsed.summary
  } catch {}

  return value
}
