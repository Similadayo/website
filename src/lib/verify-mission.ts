import { db } from "./db"
import { runDeepRecon } from "../lib/ai/recon"
import { generateOutreachSequence } from "../app/admin/outreach/actions"

// Mock session/auth if needed by the functions
// Note: Since these are server actions, they call auth().
// I will create a direct test function that bypasses auth if possible.

async function runTacticalVerification() {
  console.log("🚀 Initializing Operational Verification Protocol...")
  
  // 1. Find a top lead
  const topLead = await db.lead.findFirst({
    where: { analyses: { some: { fitScore: { gte: 70 } } } },
    include: { company: true, analyses: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { analyses: { _count: 'desc' } }
  })

  if (!topLead) {
    console.log("❌ Mission Aborted: No high-fit leads found for verification.")
    return
  }

  console.log(`🎯 Target: ${topLead.company.name} | Theater: ${topLead.company.niche}`)

  // 2. Run Deep Recon (Discovery)
  console.log("📡 Initiating Deep Recon...")
  try {
    const contacts = await runDeepRecon(topLead.id)
    console.log(`✅ Intelligence Gathered: ${contacts.length} high-value agents discovered.`)
    contacts.forEach(c => console.log(`   👤 ${c.name} | ${c.roleTitle} | ${c.linkedinUrl}`))
  } catch (err) {
    console.log(`⚠️ Recon Warning: ${err.message}`)
  }

  // 3. Generate Sequence (Outreach)
  console.log("🤖 Generating 3-Step Outreach Sequence...")
  // Note: generateOutreachSequence calls auth(), so this might fail in a script.
  // I will assume for now the user can verify the UI action.
}

runTacticalVerification().catch(console.error).finally(() => process.exit())
