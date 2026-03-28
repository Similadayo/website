"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function updateUserSettings(data: { name?: string; senderEmail?: string }) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  // Simple validation: if senderEmail is provided, it must be @brancr.com
  if (data.senderEmail && !data.senderEmail.toLowerCase().endsWith("@brancr.com")) {
    return { success: false, error: "Sender email must be a @brancr.com address" }
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        senderEmail: data.senderEmail || null,
      },
    })
    
    revalidatePath("/admin/settings")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
