"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { normalizeDomain, validateUrl } from "@/lib/validators"
import { logActivity } from "@/lib/activity-log"

export async function createCompany(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const name        = (formData.get("name")        as string)?.trim()
  const websiteUrl  = (formData.get("websiteUrl")  as string)?.trim()
  const niche       = (formData.get("niche")       as string)?.trim() || null
  const location    = (formData.get("location")    as string)?.trim() || null
  const linkedinUrl = (formData.get("linkedinUrl") as string)?.trim() || null
  const summary     = (formData.get("summary")     as string)?.trim() || null

  if (!name) redirect("/admin/companies/new?error=name_required")

  // Validate and normalise URL
  let domain: string | null = null
  if (websiteUrl) {
    const urlError = validateUrl(websiteUrl)
    if (urlError) redirect("/admin/companies/new?error=invalid_url")
    domain = normalizeDomain(websiteUrl)
  }

  // ── Duplicate detection ──────────────────────────────────────────────────
  if (domain) {
    const existing = await db.company.findFirst({
      where: { domain },
      include: { leads: { orderBy: { createdAt: "desc" }, take: 1 } },
    })
    if (existing) {
      // Redirect to the existing lead/company rather than silently duplicating
      const existingLeadId = existing.leads[0]?.id
      if (existingLeadId) {
        redirect(`/admin/leads/${existingLeadId}?notice=duplicate`)
      } else {
        redirect(`/admin/companies?notice=duplicate&name=${encodeURIComponent(existing.name)}`)
      }
    }
  }

  // ── Create company + lead ────────────────────────────────────────────────
  const company = await db.company.create({
    data: {
      name,
      websiteUrl: websiteUrl || null,
      domain,
      niche,
      location,
      linkedinUrl,
      summary,
      createdById: session.user.id,
    },
  })

  const lead = await db.lead.create({
    data: {
      companyId: company.id,
      stage:     "new",
      ownerId:   session.user.id,
    },
  })

  await logActivity({
    entity:   "lead",
    entityId: lead.id,
    actorId:  session.user.id,
    action:   "COMPANY_CREATED",
    metadata: { companyName: name, domain, websiteUrl },
  })

  revalidatePath("/admin/companies")
  revalidatePath("/admin/leads")

  redirect(`/admin/leads/${lead.id}`)
}
