"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

export async function upsertAssignment(
  userId: string,
  formData: FormData
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const region = (formData.get("region") as string | null)?.trim() ?? ""
  const niche = (formData.get("niche") as string | null)?.trim() ?? ""

  await db.assignment.deleteMany({ where: { userId } })

  if (region || niche) {
    await db.assignment.create({
      data: {
        userId,
        region: region || null,
        niche: niche || null,
        status: "active",
      },
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

  // Initialize with secure default password: Brancr2024!
  const defaultPasswordHash = await bcrypt.hash("Brancr2024!", 10)

  await db.user.create({
    data: { name, email, role, passwordHash: defaultPasswordHash, active: true },
  })

  revalidatePath("/admin/users")
}

export async function deleteUser(userId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id || (session.user as any).role !== "super_admin") redirect("/login")

  // Cleanup assignments first
  await db.assignment.deleteMany({ where: { userId } })
  
  await db.user.delete({
    where: { id: userId },
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
