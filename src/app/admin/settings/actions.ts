"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

import bcrypt from "bcryptjs"

export async function updateUserSettings(data: { 
  name?: string; 
  senderEmail?: string;
  webhookUrl?: string;
  resendApiKey?: string;
}) {
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
        senderEmail: data.senderEmail || undefined,
        webhookUrl: data.webhookUrl || undefined,
        resendApiKey: data.resendApiKey || undefined,
      },
    })
    
    revalidatePath("/admin/settings")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updatePassword(data: { current: string; new: string }) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user || !user.passwordHash) {
    return { success: false, error: "Account initialization required" }
  }

  const isCurrentValid = await bcrypt.compare(data.current, user.passwordHash)
  if (!isCurrentValid) {
    return { success: false, error: "Current clearance password invalid" }
  }

  const newHash = await bcrypt.hash(data.new, 10)
  
  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash }
  })

  return { success: true }
}
