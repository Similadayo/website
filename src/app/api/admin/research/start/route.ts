import { auth } from "@/auth"
import { db } from "@/lib/db"
import { createResearchSessionJob } from "@/lib/research/runner"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  const role = (session.user as any).role as string
  const assignment =
    role === "super_admin"
      ? null
      : await db.assignment.findFirst({
          where: { userId: session.user.id, status: "active" },
        })

  if (role !== "super_admin") {
    if (!assignment || (!assignment.niche && !assignment.region)) {
      return Response.json({ error: "no_assignment" }, { status: 400 })
    }
  }

  if (!process.env.SERPER_API_KEY && !process.env.OPENAI_API_KEY) {
    return Response.json({ error: "no_search_key" }, { status: 400 })
  }

  const region = assignment?.region ?? ""
  const niche = assignment?.niche ?? assignment?.region ?? ""

  if (!niche && !region) {
    return Response.json({ error: "no_assignment" }, { status: 400 })
  }

  const researchSession = await createResearchSessionJob({
    userId: session.user.id,
    region,
    niche,
  })

  return Response.json({ sessionId: researchSession.id })
}
