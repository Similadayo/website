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
    <div className="space-y-6 py-2">
      <section className="admin-card p-6 sm:p-8">
        <p className="admin-eyebrow">Settings</p>
        <div className="mt-3 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[color:var(--admin-accent)] text-white">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="admin-section-title max-w-3xl">Tune identity, delivery setup, and security without leaving the product flow.</h1>
            <p className="admin-section-copy mt-4 max-w-2xl">
              Settings now follow the same product language as the rest of the admin experience, with cleaner hierarchy and better mobile readability.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl">
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
