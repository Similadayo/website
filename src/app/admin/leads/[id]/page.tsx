import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Building2, CheckCircle2, XCircle, BrainCircuit,
  ExternalLink, Activity, AlertCircle, Loader2, Mail, Phone, Linkedin,
  SendHorizontal
} from "lucide-react"
import { updateLeadStage, runLeadAIAnalysis, generateNewOutreachDraft, sendLeadEmail } from "./actions"
import { STAGE_LABELS } from "@/lib/stages"
import { OutreachSection } from "@/components/admin/OutreachSection"

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      company: { include: { contacts: true } },
      analyses:    { orderBy: { createdAt: "desc" }, take: 1 },
      threads: {
        include: {
          messages: { orderBy: { createdAt: "desc" }, take: 1 }
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
  const message    = thread?.messages[0]
  const contact    = lead.company.contacts.find((c: any) => c.email) || lead.company.contacts[0]

  const stageLabel = STAGE_LABELS[lead.stage as keyof typeof STAGE_LABELS] ?? lead.stage
  const canApprove = lead.stage === "pending_review"
  const canReject  = !["rejected", "closed_won", "closed_lost"].includes(lead.stage)
  const canAnalyze = ["new", "researching", "analyzed"].includes(lead.stage)
  const canDraft   = ["analyzed", "approved", "outreach_ready"].includes(lead.stage)
  const canSend    = message && !message.sentAt && contact?.email && ["outreach_ready", "approved", "analyzed"].includes(lead.stage)

  return (
    <div className="space-y-6 animate-fadein pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{lead.company.name}</h1>
            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold uppercase border border-blue-200">
              {stageLabel}
            </span>
          </div>
          {lead.company.websiteUrl && (
            <a href={lead.company.websiteUrl} target="_blank" rel="noopener noreferrer"
               className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-2">
              {lead.company.websiteUrl} <ExternalLink className="w-3.5 h-3.5" />
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
                className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </form>
          )}
          {canApprove && (
            <form action={async () => {
              "use server"
              await updateLeadStage(lead.id, "approved")
            }}>
              <button type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all">
                <CheckCircle2 className="w-4 h-4" /> Approve Lead
              </button>
            </form>
          )}
          {lead.stage === "analyzed" && (
            <form action={async () => {
              "use server"
              await updateLeadStage(lead.id, "pending_review")
            }}>
              <button type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all">
                Submit for Review
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
            message={message ? {
              id: message.id,
              subject: message.subject,
              body: message.body,
              sentAt: message.sentAt
            } : undefined as any}
            contactEmail={contact?.email ?? undefined}
            canDraft={canDraft}
            canSend={canSend as boolean}
            onSend={sendLeadEmail}
            onDraft={generateNewOutreachDraft}
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

          {/* Contacts */}
          {lead.company.contacts.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-500" /> Contacts ({lead.company.contacts.length})
              </h3>
              <div className="space-y-3">
                {lead.company.contacts.map((c: any) => (
                  <div key={c.id} className="text-sm space-y-1 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    {c.email && (
                      <a href={`mailto:${c.email}`}
                         className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                        <Mail className="w-3.5 h-3.5" /> {c.email}
                      </a>
                    )}
                    {c.name?.startsWith("Phone:") && (
                      <a href={`tel:${c.name.replace("Phone: ", "")}`}
                         className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {c.name.replace("Phone: ", "")}
                      </a>
                    )}
                    {c.roleTitle && (
                      <p className="text-xs text-gray-500">{c.roleTitle}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Log */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" /> Activity Log
            </h3>
            <div className="space-y-4">
              {lead.activityLogs.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No activity recorded.</p>
              ) : (
                lead.activityLogs.map(log => (
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
