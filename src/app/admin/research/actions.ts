"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getResearchStartContext() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "unauthorized" as const }
  }

  const role = (session.user as any).role as string
  const assignment =
    role === "super_admin"
      ? null
      : await db.assignment.findFirst({
          where: { userId: session.user.id, status: "active" },
        })

  return {
    assignment,
    role,
    userId: session.user.id,
  }
}

export async function deleteResearchSession(sessionId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const role = (session.user as any).role
  if (role !== "super_admin") {
    redirect("/admin/research")
  }

  await db.researchSession.delete({
    where: { id: sessionId },
  })

  revalidatePath("/admin/research")
}
