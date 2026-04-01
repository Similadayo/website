import { DashboardContainer } from "@/components/admin/DashboardContainer"
import { getCachedAuth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCachedAuth()
  
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <DashboardContainer>
      {children}
    </DashboardContainer>
  )
}
