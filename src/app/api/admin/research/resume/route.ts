import { auth } from "@/auth"
import { db } from "@/lib/db"
import { resumeResearchTasks } from "@/lib/research/runner"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ resumed: 0 }, { status: 401 })
  }

  const isSuperAdmin = (session.user as any).role === "super_admin"
  const sessions = await db.researchSession.findMany({
    where: isSuperAdmin
      ? { status: { in: ["pending", "running", "failed"] } }
      : {
          userId: session.user.id,
          status: { in: ["pending", "running", "failed"] },
        },
    select: { id: true },
    take: 25,
  })

  const sessionIds = sessions.map((entry) => entry.id)
  await resumeResearchTasks(sessionIds)

  return Response.json({ resumed: sessionIds.length })
}
