import { runAIFitAnalysis } from "@/lib/ai/analyzer"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { leadId, companySummaryText } = await req.json()
    if (!leadId || !companySummaryText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const analysis = await runAIFitAnalysis(leadId, companySummaryText)
    
    return NextResponse.json({ success: true, analysis })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
