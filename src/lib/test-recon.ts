import { db } from "./db"
import { runDeepRecon } from "../lib/ai/recon"

async function runLiveReconTest() {
  console.log("🚀 Initializing Live Recon Verification Protocol...")
  
  // Find lead with highest fit score
  const topLead = await db.lead.findFirst({
    where: { analyses: { some: { fitScore: { gte: 70 } } } },
    include: { company: true, analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { analyses: { _count: 'desc' } }
  })

  if (!topLead) {
    console.log("❌ Mission Aborted: No high-fit leads found for verification.")
    return
  }

  console.log(`🎯 Target Identified: ${topLead.company.name} (Fit Score: ${topLead.analyses[0].fitScore})`)
  console.log(`🌐 Industry Theater: ${topLead.company.niche}`)

  try {
    const contacts = await runDeepRecon(topLead.id)
    console.log(`✅ Intelligence Gathered: Discovered ${contacts.length} high-value targets.`)
    console.log("--- DISCOVERY REPORT ---")
    contacts.forEach(c => {
      console.log(`👤 ${c.name} | ${c.roleTitle} | ${c.linkedinUrl}`)
    })
    console.log("--- END REPORT ---")
  } catch (err: any) {
    console.log(`❌ Mission Failure: ${err.message}`)
  }
}

runLiveReconTest().catch(console.error).finally(() => process.exit())
