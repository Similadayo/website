import { db } from "@/lib/db"
import { Mail, Inbox, Send, Building2, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Pagination } from "@/components/admin/Pagination"
import { getAccessScope } from "@/lib/auth/scope"

type HistoryView = "all" | "sent" | "received"

function getViewConfig(view: HistoryView) {
  switch (view) {
    case "sent":
      return {
        title: "Sent Mail",
        description: "Track outbound messages sent across the agency.",
      }
    case "received":
      return {
        title: "Received Mail",
        description: "Review inbound replies captured from outreach threads.",
      }
    default:
      return {
        title: "Mail History",
        description: "Track sent and received outreach activity in one place.",
      }
  }
}

function getDirectionWhere(view: HistoryView) {
  switch (view) {
    case "sent":
      return {
        direction: "outbound",
        sentAt: { not: null },
      }
    case "received":
      return {
        direction: "inbound",
        receivedAt: { not: null },
      }
    default:
      return {
        OR: [
          { direction: "outbound", sentAt: { not: null } },
          { direction: "inbound", receivedAt: { not: null } },
        ],
      }
  }
}

function formatTimestamp(value: Date | string | null | undefined) {
  if (!value) return "-"
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function OutreachHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; view?: string }>
}) {
  const { page, view } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 15
  const activeView: HistoryView =
    view === "sent" || view === "received" ? view : "all"
  const scope = await getAccessScope()
  const config = getViewConfig(activeView)

  const where = {
    AND: [
      getDirectionWhere(activeView),
      {
        thread: {
          lead: scope.leadsFilter,
        },
      },
    ],
  }

  const [messages, totalMessages] = await Promise.all([
    db.outreachMessage.findMany({
      where,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: [{ receivedAt: "desc" }, { sentAt: "desc" }, { createdAt: "desc" }],
      include: {
        thread: {
          include: {
            lead: {
              include: {
                company: true,
                owner: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            contact: true,
          },
        },
      },
    }),
    db.outreachMessage.count({ where }),
  ])

  return (
    <div className="space-y-8 animate-fadein pb-12">
      <div className="space-y-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-gray-900">
            <Mail className="h-8 w-8 text-black" />
            {config.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">{config.description}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {([
            { key: "all", label: "All Mail", icon: <Mail className="h-4 w-4" /> },
            { key: "sent", label: "Sent", icon: <Send className="h-4 w-4" /> },
            { key: "received", label: "Received", icon: <Inbox className="h-4 w-4" /> },
          ] as const).map((item) => {
            const isActive = activeView === item.key
            const href = item.key === "all" ? "/admin/outreach/history" : `/admin/outreach/history?view=${item.key}`

            return (
              <Link
                key={item.key}
                href={href}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                  isActive
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-black"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-full md:min-w-[1120px]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                <tr>
                  <th className="px-8 py-6">Direction</th>
                  <th className="px-8 py-6">Contact</th>
                  <th className="hidden px-8 py-6 md:table-cell">Subject</th>
                  <th className="px-8 py-6">Target Account</th>
                  <th className="hidden px-8 py-6 lg:table-cell">Timestamp</th>
                  <th className="px-8 py-6 text-right">Thread</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-24 text-center text-gray-400">
                      <Mail className="mx-auto mb-4 h-16 w-16 text-gray-100" />
                      <p className="text-sm font-black uppercase tracking-widest text-gray-900">
                        No Mail Logged
                      </p>
                      <p className="mt-1 text-xs">
                        Sent messages and received replies will appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  messages.map((msg: any) => {
                    const lead = msg.thread.lead
                    const contact = msg.thread.contact
                    const isInbound = msg.direction === "inbound"
                    const primaryName =
                      contact?.name ||
                      msg.fromEmail ||
                      msg.toEmail ||
                      "Unknown contact"
                    const primaryEmail =
                      (isInbound ? msg.fromEmail : msg.toEmail) ||
                      contact?.email ||
                      lead.company.domain ||
                      "No email"
                    const timestamp = isInbound ? msg.receivedAt : msg.sentAt

                    return (
                      <tr key={msg.id} className="group transition-colors hover:bg-gray-50/50">
                        <td className="px-8 py-6">
                          <span
                            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
                              isInbound
                                ? "border-blue-100 bg-blue-50 text-blue-700"
                                : "border-emerald-100 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {isInbound ? <Inbox className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                            {isInbound ? "Received" : "Sent"}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-[10px] font-black uppercase text-white shadow-lg shadow-gray-200">
                              {String(primaryName).trim()[0] || lead.company.name[0]}
                            </div>
                            <div>
                              <div className="text-base font-black tracking-tight text-gray-900 transition-colors group-hover:text-black">
                                {primaryName}
                              </div>
                              <div className="mt-0.5 text-[10px] font-black uppercase tracking-tight text-gray-400">
                                {primaryEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-8 py-6 md:table-cell">
                          <div
                            className="max-w-xs truncate font-bold text-gray-600 transition-colors group-hover:text-gray-900"
                            title={msg.subject || ""}
                          >
                            {msg.subject || (isInbound ? "(No Subject Received)" : "(No Subject Sent)")}
                          </div>
                          <div className="mt-2 max-w-md truncate text-xs text-gray-400">
                            {msg.body}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-900">
                            <Building2 className="h-4 w-4 text-gray-300" />
                            {lead.company.name}
                          </div>
                          <div className="mt-1 text-[10px] font-bold text-gray-400">
                            Owner: {lead.owner?.name || lead.owner?.email || "Unassigned"}
                          </div>
                        </td>
                        <td className="hidden px-8 py-6 lg:table-cell">
                          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {formatTimestamp(timestamp)}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-black"
                          >
                            Open thread
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
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

      <Pagination totalItems={totalMessages} pageSize={pageSize} currentPage={currentPage} />
    </div>
  )
}
