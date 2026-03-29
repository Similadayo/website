import { createClient } from "@libsql/client"
import dotenv from "dotenv"

dotenv.config()

async function syncDatabase() {
  console.log("📡 Initiating Tactical Database Synchronization...")
  
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.AUTH_TOKEN,
  })

  try {
    console.log("⚒️ Altering 'OutreachMessage' table...")
    
    // Add stepNumber if not exists
    try {
      await client.execute("ALTER TABLE OutreachMessage ADD COLUMN stepNumber INTEGER NOT NULL DEFAULT 1")
      console.log("✅ Added stepNumber column.")
    } catch (e: any) {
      if (e.message.includes("duplicate column name")) {
        console.log("ℹ️ stepNumber column already exists.")
      } else {
        throw e
      }
    }

    // Add delayDays if not exists
    try {
      await client.execute("ALTER TABLE OutreachMessage ADD COLUMN delayDays INTEGER NOT NULL DEFAULT 0")
      console.log("✅ Added delayDays column.")
    } catch (e: any) {
      if (e.message.includes("duplicate column name")) {
        console.log("ℹ️ delayDays column already exists.")
      } else {
        throw e
      }
    }

    // Add User integration fields
    try {
      await client.execute("ALTER TABLE User ADD COLUMN senderEmail TEXT")
      await client.execute("ALTER TABLE User ADD COLUMN webhookUrl TEXT")
      await client.execute("ALTER TABLE User ADD COLUMN resendApiKey TEXT")
      console.log("✅ Added User integration fields.")
    } catch (e: any) {
      console.log("ℹ️ User fields likely already exist.")
    }

    console.log("🎯 Synchronization Complete. Mission systems stabilized.")
  } catch (err) {
    console.error("❌ Mission Failure during sync:", err)
  }
}

syncDatabase()
