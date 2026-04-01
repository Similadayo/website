import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import {
  Building2, CheckCircle2, XCircle, BrainCircuit,
  ExternalLink, Activity, Mail, Linkedin
} from "lucide-react"
import {
  updateLeadStage,
  runLeadAIAnalysis,
  sendLeadEmail,
  startDeepRecon,
  setPrimaryContact,
  approveGenericInboxContact,
  markContactForManualReview,
  transferLeadToAdminReview,
} from "./actions"
import { generateOutreachSequence } from "@/app/admin/outreach/actions"
import { STAGE_LABELS } from "@/lib/stages"
import { OutreachSection } from "@/components/admin/OutreachSection"
import { getAccessScope, getScopedLeadWhere } from "@/lib/auth/scope"
import {
  getLeadContactStrategy,
  getContactTier,
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
      analyses:    { orderBy: { createdAt: "desc" }, take: 1 },
      threads: {
        include: {
          messages: { orderBy: { createdAt: "asc" } }
        }
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { actor: true },
      },
    },
  })

  if (!lead) return notFound()

  const analysis   = lead.analyses[0]
  const thread     = lead.threads[0]
  const messages   = thread?.messages || []
  const contactStrategy = getLeadContactStrategy(lead.company.contacts as any[])
  const contact    = contactStrategy.primarySendContact
  const analysisJson = analysis?.rawResponse
    ? JSON.parse(analysis.rawResponse as string) as {
        recommended_owners?: string[]
        operator_contacts?: Array<{
          role: string
          name: string | null
          email: string | null
          linkedin_url: string | null
          evidence: string
        }>
      }
    : null
  const recommendedOwners = analysisJson?.recommended_owners ?? []
  const operatorContacts = analysisJson?.operator_contacts ?? []

  const stageLabel = STAGE_LABELS[lead.stage as keyof typeof STAGE_LABELS] ?? lead.stage
  const canApprove = lead.stage === "pending_review"
  const canReject  = !["rejected", "closed_won", "closed_lost"].includes(lead.stage)
  const canAnalyze = ["new", "researching", "analyzed"].includes(lead.stage)
  const canDraft   = ["analyzed", "approved", "outreach_ready"].includes(lead.stage)
  const canSend    = messages.some((m: any) => m.direction !== "inbound" && !m.sentAt) && ["outreach_ready", "approved", "analyzed", "replied"].includes(lead.stage)
  const ownerName = lead.owner?.name || lead.owner?.email || "Unassigned"
  const creatorName = lead.company.createdBy?.name || lead.company.createdBy?.email || "Unknown"
  const isMine = lead.ownerId === scope.userId || lead.company.createdById === scope.userId
  const shouldTransferToAdmin =
    !scope.isSuperAdmin &&
    !!contactStrategy.bestContact?.linkedinUrl &&
    contactStrategy.recommendation === "linkedin_or_manual_review"

  return (
    <div className="space-y-6 animate-fadein pb-12">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 sm:gap-6 bg-white dark:bg-gray-900 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 w-full">
          <div className="w-full lg:w-auto min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase break-words w-full sm:w-auto leading-tight">{lead.company.name}</h1>
              <span className="w-fit shrink-0 bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-black dark:border-white">
                {stageLabel}
              </span>
            </div>
            {scope.isSuperAdmin && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold">
                <span className={`inline-flex items-center rounded-lg px-2 py-1 uppercase tracking-widest border ${
                  isMine
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                }`}>
                  {isMine ? "My Lead" : "Other Member"}
                </span>
                <span className="text-slate-400">Owner: {ownerName}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400">Created by: {creatorName}</span>
              </div>
            )}
            {lead.company.websiteUrl && (
            <a href={lead.company.websiteUrl} target="_blank" rel="noopener noreferrer"
               className="text-xs text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-2 mt-4 font-bold transition-all group">
              {lead.company.websiteUrl} <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          {canReject && (
            <form action={async () => {
              "use server"
              await updateLeadStage(lead.id, "rejected", "Manual review rejection")
            }}>
              <button type="submit"
                className="bg-white dark:bg-white/5 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm">
                <XCircle className="w-4 h-4 inline mr-1.5" /> Reject Lead
              </button>
            </form>
          )}
          
          {canApprove && (
            <form action={async () => {
              "use server"
              await updateLeadStage(lead.id, "approved")
            }}>
              <button type="submit"
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-gray-200 dark:shadow-none transition-all active:scale-95">
                <CheckCircle2 className="w-4 h-4 inline mr-1.5" /> Approve Intel
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* AI Qualification */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
              <BrainCircuit className="w-5 h-5 text-indigo-600" /> AI Qualification
            </h2>

            {!analysis ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                <BrainCircuit className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 mb-4 max-w-sm mx-auto">This lead has not been evaluated by the AI yet.</p>
                {canAnalyze ? (
                  <form action={async () => {
                    "use server"
                    await runLeadAIAnalysis(lead.id)
                  }}>
                    <button type="submit"
                      className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto shadow-sm">
                      <BrainCircuit className="w-4 h-4" /> Run AI Analysis
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-gray-400 italic">AI analysis not available at this stage.</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Scores */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="flex-1 bg-gray-50 sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">Fit Score</p>
                    <div className={`text-2xl sm:text-3xl font-bold ${
                      (analysis.fitScore ?? 0) >= 70 ? "text-green-600" :
                      (analysis.fitScore ?? 0) >= 50 ? "text-yellow-600" : "text-red-500"
                    }`}>
                      {analysis.fitScore ?? "—"} <span className="text-xs sm:text-sm font-medium text-gray-400">/ 100</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-50 sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">Confidence</p>
                    <div className="text-xl font-bold text-gray-800">
                      {((analysis.confidenceScore ?? 0) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Company Summary</p>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed border border-gray-100">
                    {analysis.companySummary}
                  </p>
                </div>

                {/* Fit / Gap analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-2 flex items-center gap-1">
                       <CheckCircle2 className="w-3 h-3" /> Why it&apos;s a fit
                    </p>
                    <div className="text-sm text-green-900 whitespace-pre-wrap leading-relaxed">
                      {analysis.fitReasons || "No specific fit reasons identified."}
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-2 flex items-center gap-1">
                       <XCircle className="w-3 h-3" /> Why it&apos;s NOT a fit (Gaps)
                    </p>
                    <div className="text-sm text-red-900 whitespace-pre-wrap leading-relaxed">
                      {analysis.gapReasons || "No major gaps identified."}
                    </div>
                  </div>
                </div>

                {/* Pain Points */}
                {analysis.painPoints && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2">Likely Pain Points</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {(JSON.parse(analysis.painPoints as string) as string[]).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Use Cases */}
                {analysis.useCases && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2">AI Use Cases</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {(JSON.parse(analysis.useCases as string) as string[]).map((u, i) => (
                        <li key={i}>{u}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendedOwners.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2">Who Inside The Company Should Do What</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {recommendedOwners.map((owner, i) => (
                        <li key={i}>{owner}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {operatorContacts.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2">Operator Contacts Found</p>
                    <div className="space-y-3">
                      {operatorContacts.map((operator, index) => (
                        <div key={`${operator.role}-${operator.name ?? index}`} className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-gray-900">{operator.role}</span>
                            {operator.name && <span className="text-gray-600">• {operator.name}</span>}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            {operator.email && <span>Email: {operator.email}</span>}
                            {operator.linkedin_url && (
                              <a
                                href={operator.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                LinkedIn
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <p className="mt-2 text-xs text-gray-400">{operator.evidence}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Recommended Contact Strategy</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Best Contact</p>
                      {contactStrategy.bestContact ? (
                        <div className="space-y-1 text-sm text-gray-700">
                          <p className="font-semibold text-gray-900">
                            {contactStrategy.bestContact.name || contactStrategy.bestContact.email || "Unnamed contact"}
                          </p>
                          <p>{contactStrategy.bestContact.roleTitle || "No role title captured"}</p>
                          {contactStrategy.bestContact.email && <p>Email: {contactStrategy.bestContact.email}</p>}
                          {contactStrategy.bestContact.linkedinUrl && (
                            <a
                              href={contactStrategy.bestContact.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              LinkedIn Profile
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No credible contact identified yet.</p>
                      )}
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Fallback Route</p>
                      {contactStrategy.fallbackContact ? (
                        <div className="space-y-1 text-sm text-gray-700">
                          <p className="font-semibold text-gray-900">
                            {contactStrategy.fallbackContact.name || contactStrategy.fallbackContact.email || "Fallback contact"}
                          </p>
                          <p>{contactStrategy.fallbackContact.roleTitle || "Public company route"}</p>
                          {contactStrategy.fallbackContact.email && <p>Email: {contactStrategy.fallbackContact.email}</p>}
                          {contactStrategy.fallbackContact.sourceUrl && <p>Source: {contactStrategy.fallbackContact.sourceUrl}</p>}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No fallback route stored.</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-3 py-1 font-semibold uppercase tracking-widest ${
                      contactStrategy.coverageStatus === "high"
                        ? "bg-green-100 text-green-700"
                        : contactStrategy.coverageStatus === "medium"
                          ? "bg-blue-100 text-blue-700"
                          : contactStrategy.coverageStatus === "low"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                    }`}>
                      {contactStrategy.coverageStatus} coverage
                    </span>
                    <span className="rounded-full bg-black px-3 py-1 font-semibold uppercase tracking-widest text-white">
                      {contactStrategy.recommendation.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{contactStrategy.reason}</p>
                  {shouldTransferToAdmin && (
                    <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                      <p className="text-sm font-semibold text-blue-900">Admin handoff required</p>
                      <p className="mt-1 text-sm text-blue-800">
                        The strongest route here is LinkedIn, so this lead should move to admin review instead of staying with researcher outreach.
                      </p>
                      <form
                        action={async () => {
                          "use server"
                          await transferLeadToAdminReview(lead.id)
                        }}
                        className="mt-3"
                      >
                        <button
                          type="submit"
                          className="rounded-xl bg-black px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-gray-800"
                        >
                          Transfer To Admin Pipeline
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Outreach Angle */}
                {analysis.outreachAngle && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-2">Recommended Outreach Angle</p>
                    <div className="bg-blue-50/50 p-4 rounded-lg border-l-4 border-blue-500 text-sm italic text-gray-700">
                      &quot;{analysis.outreachAngle}&quot;
                    </div>
                  </div>
                )}

                {/* Re-run */}
                {canAnalyze && (
                  <form action={async () => {
                    "use server"
                    await runLeadAIAnalysis(lead.id)
                  }}>
                    <button type="submit"
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mt-2">
                      <BrainCircuit className="w-3.5 h-3.5" /> Re-run Analysis
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Email Outreach */}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Details */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Building2 className="w-4 h-4 text-gray-400" /> Company Details
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "Niche",     value: lead.company.niche },
                { label: "Location",  value: lead.company.location },
                { label: "Domain",    value: lead.company.domain },
                { label: "LinkedIn",  value: lead.company.linkedinUrl },
                { label: "Added",     value: lead.company.createdAt.toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b border-gray-50 pb-2 last:border-0">
                  <span className="text-gray-500">{label}</span>
                  {label === "LinkedIn" && value ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 inline-flex items-center gap-1 truncate text-right font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Company LinkedIn
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="font-medium text-gray-900 truncate ml-4 text-right">{value || "—"}</span>
                  )}
                </div>
              ))}
            </div>
            {lead.company.summary && (
              <div className="mt-4 bg-gray-50 p-3 rounded-lg text-xs text-gray-600 border border-gray-100">
                <p className="font-semibold text-gray-500 mb-1">Summary</p>
                {lead.company.summary}
              </div>
            )}
          </div>

          {/* Contacts & Decision Makers */}
          <div className="bg-white dark:bg-gray-900 p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 group hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-none transition-all duration-300 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
              <h3 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2 sm:gap-3">
                <Linkedin className="w-4 h-4 text-blue-500 shrink-0" /> Decision Makers
              </h3>
              <form action={async () => {
                "use server"
                await startDeepRecon(lead.id)
              }}>
                <button type="submit"
                  className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline flex items-center gap-1.5 transition-all">
                  <Activity className="w-3.5 h-3.5" /> Start Deep Recon
                </button>
              </form>
            </div>
            
            <div className="space-y-4">
              {lead.company.contacts.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-gray-50 dark:border-white/5 rounded-3xl">
                  <Linkedin className="w-10 h-10 text-gray-100 dark:text-white/5 mx-auto mb-3" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting Intelligence</p>
                </div>
              ) : (
                contactStrategy.ranked.map((c: any) => (
                  <div key={c.id} className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 group/item hover:bg-black dark:hover:bg-white transition-all cursor-default overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                      <div className="min-w-0 pr-4 w-full">
                        <p className="text-sm font-black text-gray-900 dark:text-white group-hover/item:text-white dark:group-hover/item:text-black transition-colors break-words leading-tight">{c.name || c.email || "Unnamed contact"}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 group-hover/item:text-gray-300 dark:group-hover/item:text-gray-600 transition-colors truncate">
                          {c.roleTitle || "Executive"}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                          {contactStrategy.bestContact?.id === c.id && (
                            <span className="rounded-full bg-black px-2 py-1 text-white">
                              Primary
                            </span>
                          )}
                          {contactStrategy.fallbackContact?.id === c.id && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">
                              Fallback
                            </span>
                          )}
                          <span className="rounded-full bg-white px-2 py-1 text-gray-500">
                            {getContactTier(c)}
                          </span>
                          {c.outreachRecommendation && (
                            <span className="rounded-full bg-gray-200 px-2 py-1 text-gray-600">
                              {c.outreachRecommendation.replace(/_/g, " ")}
                            </span>
                          )}
                          {c.email && (
                            <span className={`rounded-full px-2 py-1 ${
                              c.emailStatus === "public"
                                ? "bg-emerald-100 text-emerald-700"
                                : c.emailStatus === "inferred"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-200 text-slate-600"
                            }`}>
                              {c.emailStatus || "unknown email status"}
                            </span>
                          )}
                        </div>
                        {c.sourceEvidence && (
                          <p className="mt-2 text-xs text-gray-500 group-hover/item:text-gray-300 dark:group-hover/item:text-gray-600 line-clamp-3">
                            {c.sourceEvidence}
                          </p>
                        )}
                        {c.email && (
                          <p className="mt-2 text-xs text-gray-500 group-hover/item:text-gray-300 dark:group-hover/item:text-gray-600">
                            {isInferredExecutiveEmail(c)
                              ? "Email was inferred from the company pattern and should be reviewed before sending."
                              : c.emailEvidenceLevel === "public_same_domain"
                                ? "Email is public and matched to this executive from nearby website evidence."
                                : "Email is public and visible on a company source."}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <form action={async () => {
                            "use server"
                            await setPrimaryContact(lead.id, c.id)
                          }}>
                            <button
                              type="submit"
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 transition-colors hover:border-black hover:text-black"
                            >
                              Promote Primary
                            </button>
                          </form>
                          {c.email && (
                            <form action={async () => {
                              "use server"
                              await approveGenericInboxContact(lead.id, c.id)
                            }}>
                              <button
                                type="submit"
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 transition-colors hover:border-black hover:text-black"
                              >
                                Approve Inbox
                              </button>
                            </form>
                          )}
                          <form action={async () => {
                            "use server"
                            await markContactForManualReview(lead.id, c.id)
                          }}>
                            <button
                              type="submit"
                              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-700 transition-colors hover:border-amber-300 hover:text-amber-900"
                            >
                              Needs Review
                            </button>
                          </form>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end sm:self-auto shrink-0">
                        {c.linkedinUrl && (
                          <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer"
                             className="w-8 h-8 rounded-lg bg-white dark:bg-black/20 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform shadow-sm">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {c.email && (
                          <a href={`mailto:${c.email}`}
                             className="w-8 h-8 rounded-lg bg-white dark:bg-black/20 flex items-center justify-center text-gray-400 group-hover/item:text-white dark:group-hover/item:text-black hover:scale-110 transition-all shadow-sm">
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" /> Activity Log
            </h3>
            <div className="space-y-4">
              {lead.activityLogs.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No activity recorded.</p>
              ) : (
                lead.activityLogs.map((log: any) => (
                  <div key={log.id} className="text-sm flex gap-3">
                    <div className="w-2 relative mt-1.5 flex-shrink-0 flex justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-400 z-10" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">
                        {log.actionType.replace(/_/g, " ")}
                        {log.actor?.name && (
                          <span className="text-gray-500 font-normal"> by {log.actor.name}</span>
                        )}
                      </p>
                      {log.newValue && (() => {
                        let parsed: any = null
                        try {
                          parsed = JSON.parse(log.newValue)
                        } catch {
                          parsed = null
                        }

                        if (parsed?.summary) {
                          return <p className="text-xs text-gray-500 mt-0.5">{parsed.summary}</p>
                        }

                        return <p className="text-xs text-gray-500 mt-0.5 font-mono">{log.newValue}</p>
                      })()}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
