import Link from "next/link"
import { db } from "@/lib/db"
import { Pagination } from "@/components/admin/Pagination"
import { getAccessScope } from "@/lib/auth/scope"
import { hasLeadBeenReachedOutTo } from "@/lib/outreach/status"
import { ArrowUpDown, Building2, ExternalLink, Plus, Search } from "lucide-react"

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string; q?: string }>
}) {
  const { page, sort = "created", order = "desc", q } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10
  const scope = await getAccessScope()

  const where = {
    ...scope.companiesFilter,
    ...(q
      ? {
          OR: [{ name: { contains: q } }, { domain: { contains: q } }, { niche: { contains: q } }],
        }
      : {}),
  }

  const sortMap: Record<string, any> = {
    name: { name: order },
    created: { createdAt: order },
    niche: { niche: order },
  }

  const [companies, totalItems] = await Promise.all([
    db.company.findMany({
      where,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: sortMap[sort] || { createdAt: "desc" },
      include: {
        leads: {
          include: {
            threads: {
              include: {
                messages: {
                  where: { sentAt: { not: null } },
                  select: { sentAt: true },
                  take: 1,
                },
              },
              take: 1,
            },
          },
        },
        _count: { select: { leads: true } },
      },
    }),
    db.company.count({ where }),
  ])

  const queryFor = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const entries = { ...(q ? { q } : {}), sort, order, ...next }
    for (const [key, value] of Object.entries(entries)) {
      if (value) params.set(key, value)
    }
    const query = params.toString()
    return `/admin/companies${query ? `?${query}` : ""}`
  }

  return (
    <div className="space-y-6">
      <section className="admin-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="admin-eyebrow">Companies</p>
            <h1 className="admin-section-title mt-3 max-w-3xl">Keep the account universe clean, current, and easy to scan.</h1>
            <p className="admin-section-copy mt-4 max-w-2xl">
              This view is the source list for discovered accounts, with quick signals for niche, website quality, and outreach activity.
            </p>
          </div>
          <Link href="/admin/companies/new" className="inline-flex items-center gap-2 rounded-full bg-[color:var(--admin-accent)] px-5 py-3 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />
            Add company
          </Link>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
          <form className="flex items-center gap-3 rounded-full border border-[color:var(--admin-border)] bg-white px-4 py-3">
            <Search className="h-4 w-4 text-[color:var(--admin-muted)]" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search company, domain, or niche"
              className="w-full bg-transparent text-sm text-[color:var(--admin-ink)] outline-none placeholder:text-[color:var(--admin-muted)]"
            />
            <input type="hidden" name="sort" value={sort} />
            <input type="hidden" name="order" value={order} />
          </form>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "created", label: "Newest" },
              { key: "name", label: "Name" },
              { key: "niche", label: "Niche" },
            ].map((option) => (
              <Link key={option.key} href={queryFor({ sort: option.key, order: sort === option.key && order === "asc" ? "desc" : "asc" })} className="admin-pill admin-pill-neutral">
                <ArrowUpDown className="h-3.5 w-3.5" />
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {companies.length === 0 ? (
          <div className="admin-card p-6">
            <p className="text-xl font-semibold text-[color:var(--admin-ink)]">No companies in this view.</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--admin-soft-text)]">Run discovery or add a company manually to start building the account list.</p>
          </div>
        ) : (
          companies.map((company: any) => (
            <div key={company.id} className="admin-card p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold tracking-tight text-[color:var(--admin-ink)]">{company.name}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--admin-muted)]">
                    {company.niche || "Unclassified account"}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--admin-card-strong)] text-[color:var(--admin-ink)]">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 rounded-[22px] bg-[color:var(--admin-card-strong)] p-4">
                <p className="text-sm font-semibold text-[color:var(--admin-ink)]">{company.domain || company.websiteUrl || "No website stored"}</p>
                {company.websiteUrl && (
                  <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--admin-accent)]">
                    Visit website
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="admin-pill admin-pill-neutral">{company._count.leads} leads</span>
                {company.leads.some((lead: any) => hasLeadBeenReachedOutTo(lead)) && <span className="admin-pill admin-pill-success">Reached out</span>}
                <span className="admin-pill admin-pill-neutral">
                  Added {new Date(company.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          ))
        )}
      </section>

      <Pagination totalItems={totalItems} pageSize={pageSize} currentPage={currentPage} />
    </div>
  )
}
