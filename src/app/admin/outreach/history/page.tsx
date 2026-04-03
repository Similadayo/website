import Link from "next/link"
import { db } from "@/lib/db"
import { getAccessScope } from "@/lib/auth/scope"
import { Pagination } from "@/components/admin/Pagination"
import { Activity, Inbox, Mail, Send } from "lucide-react"

type HistoryView = "all" | "sent" | "received"

function getDirectionWhere(view: HistoryView) {
  switch (view) {
    case "sent":
      return { direction: "outbound", sentAt: { not: null } }
    case "received":
      return { direction: "inbound", receivedAt: { not: null } }
    default:
      return {
        OR: [
          { direction: "outbound", sentAt: { not: null } },
          { direction: "inbound", receivedAt: { not: null } },
        ],
      }
  }
}

function getInboundMatchLabel(rawHeaders?: string | null) {
  if (!rawHeaders) return null

  try {
    const parsed = JSON.parse(rawHeaders) as Record<string, string>
    const matchSource = parsed["x-brancr-match-source"]

    if (matchSource === "reply_alias") return "Reply alias"
    if (matchSource === "message_headers") return "Reply headers"
    if (matchSource === "sender_fallback") return "Sender fallback"
  } catch {}

  return null
}

export default async function OutreachHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; view?: string }>
}) {
  const { page, view } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 12
  const activeView: HistoryView = view === "sent" || view === "received" ? view : "all"
  const scope = await getAccessScope()

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
    <div className="space-y-6">
      <section className="admin-card p-6 sm:p-8">
        <p className="admin-eyebrow">Activity</p>
        <h1 className="admin-section-title mt-3 max-w-3xl">Watch every sent message and every reply in one clean feed.</h1>
        <p className="admin-section-copy mt-4 max-w-2xl">
          Use this as the operational timeline for outbound communication, inbound responses, and thread handoffs.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {([
            { key: "all", label: "All mail", icon: Mail },
            { key: "sent", label: "Sent", icon: Send },
            { key: "received", label: "Received", icon: Inbox },
          ] as const).map((item) => {
            const active = activeView === item.key
            const href = item.key === "all" ? "/admin/outreach/history" : `/admin/outreach/history?view=${item.key}`

            return (
              <Link key={item.key} href={href} className={`admin-pill ${active ? "admin-pill-accent" : "admin-pill-neutral"}`}>
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        {messages.length === 0 ? (
          <div className="admin-card p-6">
            <p className="text-xl font-semibold text-[color:var(--admin-ink)]">No mail activity yet.</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">
              Sent messages and inbound replies will appear here as threads start moving.
            </p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const lead = msg.thread.lead
            const contact = msg.thread.contact
            const inbound = msg.direction === "inbound"

            return (
              <Link key={msg.id} href={`/admin/leads/${lead.id}`} className="admin-card block min-w-0 p-5 sm:p-6">
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${
                        inbound ? "bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]" : "bg-[color:var(--admin-success-soft)] text-[color:var(--admin-success)]"
                      }`}
                    >
                      {inbound ? <Inbox className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <p className="truncate text-lg font-semibold tracking-tight text-[color:var(--admin-ink)]">{lead.company.name}</p>
                        <span className={`admin-pill shrink-0 ${inbound ? "admin-pill-accent" : "admin-pill-success"}`}>
                          {inbound ? "Received" : "Sent"}
                        </span>
                        {inbound && getInboundMatchLabel(msg.rawHeaders) && (
                          <span className="admin-pill admin-pill-neutral">{getInboundMatchLabel(msg.rawHeaders)}</span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--admin-muted)]">
                        {inbound
                          ? `${msg.fromEmail || contact?.name || "Unknown sender"} -> ${msg.toEmail || "Brancr inbox"}`
                          : `${msg.fromEmail || "Brancr sender"} -> ${msg.toEmail || contact?.name || "Recipient"}`}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[color:var(--admin-muted)]">
                    {new Date(msg.receivedAt || msg.sentAt || msg.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="mt-4 min-w-0 rounded-[22px] bg-[color:var(--admin-card-strong)] p-4">
                  <p className="truncate text-sm font-semibold text-[color:var(--admin-ink)]">{msg.subject || "(No subject)"}</p>
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-[color:var(--admin-soft-text)]">{msg.body}</p>
                </div>

                <div className="mt-4 flex min-w-0 items-center gap-2 text-sm text-[color:var(--admin-soft-text)]">
                  <Activity className="h-4 w-4 shrink-0 text-[color:var(--admin-muted)]" />
                  <span className="truncate">Owner: {lead.owner?.name || lead.owner?.email || "Unassigned"}</span>
                </div>
              </Link>
            )
          })
        )}
      </section>

      <Pagination totalItems={totalMessages} pageSize={pageSize} currentPage={currentPage} />
    </div>
  )
}
