import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Mail, Calendar, User, Building2, ExternalLink, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Pagination } from "@/components/admin/Pagination"

export default async function OutreachHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 15

  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [messages, totalMessages] = await Promise.all([
    db.outreachMessage.findMany({
      where: { sentAt: { not: null } },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: { sentAt: "desc" },
      include: {
        thread: {
          include: {
            lead: { include: { company: true } },
            contact: true
          }
        }
      }
    }),
    db.outreachMessage.count({ where: { sentAt: { not: null } } })
  ])

  return (
    <div className="space-y-8 animate-fadein pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
          <Mail className="w-8 h-8 text-black" />
          Sent History
        </h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">Track all communications sent across the agency.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative group">
        {/* Mobile Scroll Hint */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none lg:hidden z-10 opaitcy-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="overflow-x-auto">
          <div className="min-w-full md:min-w-[1000px]">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100 font-black tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Mission Recipient</th>
                  <th className="px-8 py-6 hidden md:table-cell">Communication Subject</th>
                  <th className="px-8 py-6">Target Account</th>
                  <th className="px-8 py-6 text-right hidden lg:table-cell">Transmission Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center text-gray-400">
                      <Mail className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                      <p className="font-black text-gray-900 uppercase tracking-widest text-sm text-center">No Communications Logged</p>
                      <p className="text-xs text-center mt-1">Activity will populate here once outreaches are transmitted.</p>
                    </td>
                  </tr>
                ) : (
                  messages.map((msg) => {
                    const lead = msg.thread.lead
                    const contact = msg.thread.contact
                    return (
                      <tr key={msg.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-gray-200 uppercase">
                              {contact?.name?.[0] || lead.company.name[0]}
                            </div>
                            <div>
                              <div className="font-black text-gray-900 group-hover:text-black transition-colors text-base tracking-tight">{contact?.name || "Target Executive"}</div>
                              <div className="text-[10px] text-gray-400 font-black uppercase tracking-tight mt-0.5">{contact?.email || lead.company.domain}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 hidden md:table-cell">
                          <div className="max-w-xs truncate font-bold text-gray-600 group-hover:text-gray-900 transition-colors" title={msg.subject || ""}>
                            {msg.subject || "(No Subject Transmitted)"}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 font-black text-gray-900 uppercase text-[11px] tracking-widest">
                            <Building2 className="w-4 h-4 text-gray-300" />
                            {lead.company.name}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right hidden lg:table-cell">
                          <div className="text-gray-400 font-black text-[10px] uppercase tracking-widest">
                            {msg.sentAt ? new Date(msg.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Pagination 
        totalItems={totalMessages} 
        pageSize={pageSize} 
        currentPage={currentPage}
      />
    </div>
  )
}
