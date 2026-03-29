import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Building2, CheckCircle2, XCircle, BrainCircuit,
  ExternalLink, Activity, AlertCircle, Loader2, Mail, Phone, Linkedin,
  SendHorizontal
} from "lucide-react"
import { updateLeadStage, runLeadAIAnalysis, sendLeadEmail, startDeepRecon, pushToCRM } from "./actions"
import { generateOutreachSequence } from "@/app/admin/outreach/actions"
import { STAGE_LABELS } from "@/lib/stages"
import { OutreachSection } from "@/components/admin/OutreachSection"
import { getAccessScope, getScopedLeadWhere } from "@/lib/auth/scope"

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
  const contact    = lead.company.contacts.find((c: any) => c.email) || lead.company.contacts[0]
  const analysisJson = analysis?.rawResponse
    ? JSON.parse(analysis.rawResponse as string) as { recommended_owners?: string[] }
    : null
  const recommendedOwners = analysisJson?.recommended_owners ?? []

  const stageLabel = STAGE_LABELS[lead.stage as keyof typeof STAGE_LABELS] ?? lead.stage
  const canApprove = lead.stage === "pending_review"
  const canReject  = !["rejected", "closed_won", "closed_lost"].includes(lead.stage)
  const canAnalyze = ["new", "researching", "analyzed"].includes(lead.stage)
  const canDraft   = ["analyzed", "approved", "outreach_ready"].includes(lead.stage)
  const canSend    = messages.some((m: any) => !m.sentAt) && contact?.email && ["outreach_ready", "approved", "analyzed"].includes(lead.stage)
  const ownerName = lead.owner?.name || lead.owner?.email || "Unassigned"
  const creatorName = lead.company.createdBy?.name || lead.company.createdBy?.email || "Unknown"
  const isMine = lead.ownerId === scope.userId || lead.company.createdById === scope.userId

  return (
    <div className="space-y-6 animate-fadein pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5">
          <div>
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">{lead.company.name}</h1>
            <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-black dark:border-white">
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
          
          <form action={async () => {
            "use server"
            await pushToCRM(lead.id)
          }}>
            <button type="submit"
              className="bg-white dark:bg-white/5 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm">
              <ExternalLink className="w-4 h-4 inline mr-1.5" /> Push to CRM
            </button>
          </form>

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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
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
                <div className="flex gap-6">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Fit Score</p>
                    <div className={`text-3xl font-bold ${
                      (analysis.fitScore ?? 0) >= 70 ? "text-green-600" :
                      (analysis.fitScore ?? 0) >= 50 ? "text-yellow-600" : "text-red-500"
                    }`}>
                      {analysis.fitScore ?? "—"} <span className="text-sm font-medium text-gray-400">/ 100</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Confidence</p>
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
            canDraft={canDraft}
            canSend={canSend as boolean}
            onSend={sendLeadEmail}
            onGenerateSequence={generateOutreachSequence}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Details */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                  <span className="font-medium text-gray-900 truncate ml-4 text-right">{value || "—"}</span>
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
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5 group hover:shadow-xl hover:shadow-gray-100 dark:hover:shadow-none transition-all duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <Linkedin className="w-4 h-4 text-blue-500" /> Decision Makers
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
                lead.company.contacts.map((c: any) => (
                  <div key={c.id} className="p-5 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 group/item hover:bg-black dark:hover:bg-white transition-all cursor-default">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white group-hover/item:text-white dark:group-hover/item:text-black transition-colors">{c.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 group-hover/item:text-gray-300 dark:group-hover/item:text-gray-600 transition-colors">
                          {c.roleTitle || "Executive"}
                        </p>
                      </div>
                      <div className="flex gap-2">
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
                      {log.newValue && (
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">{log.newValue}</p>
                      )}
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
