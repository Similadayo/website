import { db } from "@/lib/db"
import { SendHorizontal, CheckCircle2, BrainCircuit } from "lucide-react"
import Link from "next/link"
import { generateOutreachDraft, markOutreachSent } from "./actions"
import { OutreachDraftCard } from "@/components/admin/OutreachDraftCard"

export default async function OutreachPage() {
  const outreachLeads = await db.lead.findMany({
    where: { stage: { in: ["approved", "outreach_ready", "contacted"] } },
    orderBy: { createdAt: "desc" },
    include: {
      company: true,
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
                </div>
                <form action={async () => {
                  "use server"
                  await generateOutreachDraft(lead.id)
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
      {draftReady.length > 0 && (
        <section>
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-black shadow-sm" />
             Pending Human Approval ({draftReady.length})
          </h2>
          <div className="space-y-8">
            {draftReady.map((lead: any) => (
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
