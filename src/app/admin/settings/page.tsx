import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { SettingsForm } from "@/components/admin/SettingsForm"
import { Settings as SettingsIcon } from "lucide-react"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) redirect("/login")

  return (
    <div className="space-y-8 py-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-gray-900" />
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
      </div>

      <div className="max-w-4xl">
        <SettingsForm user={{
          name: user.name,
          email: user.email,
          senderEmail: user.senderEmail,
          resendApiKey: user.resendApiKey ?? null,
          role: user.role
        }} />
      </div>
    </div>
  )
}
