import { db } from "@/lib/db"
import { SendHorizontal, CheckCircle2, BrainCircuit } from "lucide-react"
import Link from "next/link"
import { generateOutreachSequence, markOutreachSent } from "./actions"
import { OutreachDraftCard } from "@/components/admin/OutreachDraftCard"
import { getAccessScope } from "@/lib/auth/scope"
import { formatOutreachRecommendation, getLeadContactStrategy, requiresManualContactReview } from "@/lib/contacts/priority"

export default async function OutreachPage() {
  const scope = await getAccessScope()
  const outreachLeads = await db.lead.findMany({
    where: {
      AND: [
        scope.leadsFilter,
        { stage: { in: ["approved", "outreach_ready", "contacted"] } },
      ],
    },
    orderBy: { createdAt: "desc" },
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
        include: { messages: { take: 1 } },
        orderBy: { id: "desc" },
        take: 1,
      },
    },
  })

  const noDraftLeads   = outreachLeads.filter((l: any) => l.threads.length === 0 && l.stage === "approved")
  const draftReady     = outreachLeads.filter((l: any) => l.threads.length > 0 && l.stage !== "contacted")
  const sendReadyDrafts = draftReady.filter((lead: any) => !requiresManualContactReview(getLeadContactStrategy(lead.company.contacts || []).recommendation))
  const reviewRequiredDrafts = draftReady.filter((lead: any) => requiresManualContactReview(getLeadContactStrategy(lead.company.contacts || []).recommendation))
  const contacted      = outreachLeads.filter((l: any) => l.stage === "contacted")

  return (
    <div className="space-y-12 animate-fadein pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
          <SendHorizontal className="w-8 h-8 text-black" /> 
          Outreach Queue
        </h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">Generate, review, and track outreach for approved leads.</p>
      </div>

      {/* Awaiting draft */}
      {noDraftLeads.length > 0 && (
        <section>
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-black shadow-sm" />
             Awaiting AI Drafting ({noDraftLeads.length})
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {noDraftLeads.map((lead: any) => (
              <div key={lead.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
                <div className="flex-1">
                  <h3 className="font-extrabold text-2xl text-gray-900 tracking-tight">{lead.company.name}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1.5">{lead.company.niche ?? "Target Account"}</p>
                  <ContactStrategyLine lead={lead} />
                  {scope.isSuperAdmin && (
                    <OwnershipBadge lead={lead} currentUserId={scope.userId} />
                  )}
                </div>
                <form action={async () => {
                  "use server"
                  await generateOutreachSequence(lead.id)
                }} className="w-full sm:w-auto">
                  <button type="submit"
                    className="w-full sm:w-auto bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-gray-200">
                    <BrainCircuit className="w-4 h-4" /> Initialize Draft
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Draft ready */}
      {sendReadyDrafts.length > 0 && (
        <section>
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-black shadow-sm" />
             Send-Ready Drafts ({sendReadyDrafts.length})
          </h2>
          <div className="space-y-8">
            {sendReadyDrafts.map((lead: any) => (
              <OutreachDraftCard 
                key={lead.id} 
                lead={lead} 
                message={lead.threads[0]?.messages[0]} 
              />
            ))}
          </div>
        </section>
      )}

      {reviewRequiredDrafts.length > 0 && (
        <section>
          <h2 className="text-[11px] font-black text-amber-700 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" />
             Needs Contact Review ({reviewRequiredDrafts.length})
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            These drafts exist, but the contact path is still weak or indirect. Review the lead, improve the contact route, or use a deliberate test-send override from the lead detail page.
          </p>
          <div className="space-y-8">
            {reviewRequiredDrafts.map((lead: any) => (
              <OutreachDraftCard 
                key={lead.id} 
                lead={lead} 
                message={lead.threads[0]?.messages[0]} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Contacted */}
      {contacted.length > 0 && (
        <section>
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm" />
             Mission Completed ({contacted.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 opacity-70 hover:opacity-100 transition-opacity">
            {contacted.map((lead: any) => (
              <div key={lead.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-all hover:bg-gray-50/30">
                <div className="flex-1">
                  <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">{lead.company.name}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1.5">{lead.company.niche ?? "Target Account"}</p>
                  <ContactStrategyLine lead={lead} />
                  {scope.isSuperAdmin && (
                    <OwnershipBadge lead={lead} currentUserId={scope.userId} />
                  )}
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-[10px] bg-green-50 text-green-700 font-black px-4 py-2 rounded-xl border border-green-100 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Transmitted
                  </span>
                  <Link href={`/admin/leads/${lead.id}`}
                    className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-[0.2em] transition-all transform hover:translate-x-1">
                    History →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {outreachLeads.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-gray-100 rounded-[3rem] bg-white shadow-sm">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-gray-100" />
          <h3 className="font-black text-gray-900 uppercase tracking-[0.2em] text-lg">System Standby</h3>
          <p className="text-xs text-gray-400 mt-2 font-medium italic">Approve target accounts from the pipeline to initialize the Outreach Engine.</p>
          <Link href="/admin/leads"
            className="mt-10 inline-block text-[10px] font-black text-white bg-black px-10 py-5 rounded-3xl uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95">
            Open Pipeline →
          </Link>
        </div>
      )}
    </div>
  )
}

function ContactStrategyLine({ lead }: { lead: any }) {
  const strategy = getLeadContactStrategy(lead.company.contacts || [])

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
          strategy.coverageStatus === "high"
            ? "bg-green-50 text-green-700 border border-green-100"
            : strategy.coverageStatus === "medium"
              ? "bg-blue-50 text-blue-700 border border-blue-100"
              : strategy.coverageStatus === "low"
                ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                : "bg-gray-50 text-gray-500 border border-gray-100"
        }`}>
          {strategy.coverageStatus} contact coverage
        </span>
        <span className="inline-flex items-center rounded-lg border border-gray-100 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
          {formatOutreachRecommendation(strategy.recommendation)}
        </span>
      </div>
      <p className="text-xs text-gray-500">
        {strategy.bestContact
          ? `Best contact: ${strategy.bestContact.name || strategy.bestContact.email || "Unnamed contact"}`
          : "Best contact: manual review needed"}
        {strategy.fallbackContact?.email ? ` • Fallback: ${strategy.fallbackContact.email}` : ""}
      </p>
    </div>
  )
}

function OwnershipBadge({ lead, currentUserId }: { lead: any; currentUserId: string }) {
  const ownerName = lead.owner?.name || lead.owner?.email || "Unassigned"
  const creatorName = lead.company.createdBy?.name || lead.company.createdBy?.email || "Unknown"
  const isMine = lead.ownerId === currentUserId || lead.company.createdById === currentUserId

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold">
      <span className={`inline-flex items-center rounded-lg px-2 py-1 uppercase tracking-widest border ${
        isMine
          ? "border-black bg-black text-white"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }`}>
        {isMine ? "My Lead" : "Other Member"}
      </span>
      <span className="text-slate-400 normal-case tracking-normal">
        Owner: {ownerName}
      </span>
      <span className="text-slate-300">•</span>
      <span className="text-slate-400 normal-case tracking-normal">
        Created by: {creatorName}
      </span>
    </div>
  )
}
