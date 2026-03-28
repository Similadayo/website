"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function upsertAssignment(
  userId: string,
  region: string,
  niche: string
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  await db.assignment.deleteMany({ where: { userId } })

  if (region.trim() || niche.trim()) {
    await db.assignment.create({
      data: { userId, region: region.trim(), niche: niche.trim(), status: "active" },
    })
  }

  revalidatePath("/admin/users")
  revalidatePath("/admin/research")
}

export async function createUser(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const name  = (formData.get("name")  as string)?.trim()
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const role  = (formData.get("role")  as string)?.trim() || "researcher"

  if (!name || !email) redirect("/admin/users?error=missing_fields")

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) redirect("/admin/users?error=email_taken")

  // Create user — no password set (they log in via OAuth or admin sets one later)
  await db.user.create({
    data: { name, email, role, active: true },
  })

  revalidatePath("/admin/users")
}

export async function toggleUserActive(userId: string, active: boolean): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  await db.user.update({
    where: { id: userId },
    data:  { active },
  })

  revalidatePath("/admin/users")
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  await db.user.update({
    where: { id: userId },
    data:  { role },
  })

  revalidatePath("/admin/users")
}
