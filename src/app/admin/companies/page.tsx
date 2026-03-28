import { db } from "@/lib/db"
import { Building2, Plus, ExternalLink, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { Pagination } from "@/components/admin/Pagination"
import { getAccessScope } from "@/lib/auth/scope"

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
    ...(q ? {
      OR: [
        { name: { contains: q } },
        { domain: { contains: q } },
        { niche: { contains: q } }
      ]
    } : {})
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
        _count: {
          select: { leads: true }
        }
      }
    }),
    db.company.count({ where })
  ])

  const toggleOrder = order === "asc" ? "desc" : "asc"

  return (
    <div className="space-y-8 animate-fadein pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-black" />
            Companies
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Manage and discover target accounts across your pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/companies/new"
            className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
        {/* Mobile Scroll Hint */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none lg:hidden z-10 opaitcy-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="p-8 border-b border-gray-100 flex gap-4 bg-gray-50/50">
          <form className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              name="q"
              defaultValue={q}
              type="text" 
              placeholder="Search by company, niche, or domain..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all shadow-sm placeholder:text-gray-300"
            />
            {sort && <input type="hidden" name="sort" value={sort} />}
            {order && <input type="hidden" name="order" value={order} />}
          </form>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-full md:min-w-[1000px]">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100 font-black tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5">
                    <Link 
                      href={`/admin/companies?sort=name&order=${sort === "name" ? toggleOrder : "asc"}${q ? `&q=${q}` : ""}`}
                      className="flex items-center gap-1 hover:text-black transition-colors"
                    >
                      Company
                      {sort === "name" ? (order === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </Link>
                  </th>
                  <th className="px-8 py-5 hidden md:table-cell">
                    <Link 
                      href={`/admin/companies?sort=niche&order=${sort === "niche" ? toggleOrder : "asc"}${q ? `&q=${q}` : ""}`}
                      className="flex items-center gap-1 hover:text-black transition-colors justify-center"
                    >
                      Industry Niche
                      {sort === "niche" ? (order === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </Link>
                  </th>
                  <th className="px-8 py-5 text-center font-black">Total Leads</th>
                  <th className="px-8 py-5 hidden lg:table-cell">
                    <Link 
                      href={`/admin/companies?sort=created&order=${sort === "created" ? toggleOrder : "desc"}${q ? `&q=${q}` : ""}`}
                      className="flex items-center gap-1 hover:text-black transition-colors justify-end"
                    >
                      {sort === "created" ? (order === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      Discovery Date
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {companies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center text-gray-400">
                      <Building2 className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                      <p className="font-black text-gray-900 uppercase tracking-widest text-sm text-center">No Companies Cataloged</p>
                      <p className="text-xs text-center mt-1">Start a research session to discover target accounts.</p>
                    </td>
                  </tr>
                ) : (
                  companies.map((company: any) => (
                    <tr key={company.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-black text-gray-900 group-hover:text-black transition-colors text-base">{company.name}</div>
                        {company.websiteUrl && (
                          <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-400 hover:text-black flex items-center gap-1 mt-1 font-black uppercase tracking-tight transition-colors">
                            {company.domain || new URL(company.websiteUrl).hostname}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                      <td className="px-8 py-6 text-center hidden md:table-cell">
                        {company.niche ? (
                          <span className="bg-gray-50 text-gray-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100">
                            {company.niche}
                          </span>
                        ) : (
                          <span className="text-gray-300 italic font-medium">Pending...</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-center text-gray-900 font-black text-lg">
                         {company._count.leads < 10 ? `0${company._count.leads}` : company._count.leads}
                      </td>
                      <td className="px-8 py-6 text-right text-gray-400 font-black text-[10px] uppercase tracking-widest hidden lg:table-cell">
                        {new Date(company.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Pagination 
        totalItems={totalItems} 
        pageSize={pageSize} 
        currentPage={currentPage}
      />
    </div>
  )
}
