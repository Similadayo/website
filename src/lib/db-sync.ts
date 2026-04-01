import { createClient } from "@libsql/client"
import dotenv from "dotenv"

dotenv.config()

async function syncDatabase() {
  const rawUrl = process.env.DATABASE_URL
  if (!rawUrl) {
    throw new Error("DATABASE_URL is not configured.")
  }

  const client = createClient({
    url: rawUrl.replace(".aws-us-west-2", ""),
    authToken: process.env.AUTH_TOKEN,
  })

  const statements = [
    "ALTER TABLE OutreachMessage ADD COLUMN stepNumber INTEGER NOT NULL DEFAULT 1",
    "ALTER TABLE OutreachMessage ADD COLUMN delayDays INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE User ADD COLUMN senderEmail TEXT",
    "ALTER TABLE User ADD COLUMN webhookUrl TEXT",
    "ALTER TABLE User ADD COLUMN resendApiKey TEXT",
    "ALTER TABLE OutreachThread ADD COLUMN lastInboundAt DATETIME",
    "ALTER TABLE OutreachThread ADD COLUMN unreadCount INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE OutreachMessage ADD COLUMN direction TEXT NOT NULL DEFAULT 'outbound'",
    "ALTER TABLE OutreachMessage ADD COLUMN messageType TEXT NOT NULL DEFAULT 'sequence'",
    "ALTER TABLE OutreachMessage ADD COLUMN fromEmail TEXT",
    "ALTER TABLE OutreachMessage ADD COLUMN toEmail TEXT",
    "ALTER TABLE OutreachMessage ADD COLUMN replyToEmail TEXT",
    "ALTER TABLE OutreachMessage ADD COLUMN receivedAt DATETIME",
    "ALTER TABLE OutreachMessage ADD COLUMN providerThreadId TEXT",
    "ALTER TABLE OutreachMessage ADD COLUMN inReplyTo TEXT",
    "ALTER TABLE OutreachMessage ADD COLUMN rawHeaders TEXT",
  ]

  for (const statement of statements) {
    try {
      await client.execute(statement)
      console.log(`Applied: ${statement}`)
    } catch (error: any) {
      if (String(error?.message || "").includes("duplicate column name")) {
        console.log(`Skipped existing column for: ${statement}`)
        continue
      }

      throw error
    }
  }

  console.log("Database sync complete.")
}

syncDatabase().catch((error) => {
  console.error("Database sync failed:", error)
})
