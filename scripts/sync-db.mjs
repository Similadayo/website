import { createClient } from "@libsql/client"
import dotenv from "dotenv"

dotenv.config()

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.AUTH_TOKEN,
})

async function addColumn(sql, duplicateMessage) {
  try {
    await client.execute(sql)
    console.log(duplicateMessage.replace("already exists", "added"))
  } catch (error) {
    const message = error?.message ?? String(error)
    if (message.includes("duplicate column name")) {
      console.log(duplicateMessage)
      return
    }
    throw error
  }
}

async function main() {
  console.log("--- Database Sync ---")

  await addColumn(
    "ALTER TABLE OutreachMessage ADD COLUMN stepNumber INTEGER NOT NULL DEFAULT 1",
    "OutreachMessage.stepNumber already exists"
  )

  await addColumn(
    "ALTER TABLE OutreachMessage ADD COLUMN delayDays INTEGER NOT NULL DEFAULT 0",
    "OutreachMessage.delayDays already exists"
  )

  await addColumn(
    "ALTER TABLE User ADD COLUMN senderEmail TEXT",
    "User.senderEmail already exists"
  )

  await addColumn(
    "ALTER TABLE User ADD COLUMN webhookUrl TEXT",
    "User.webhookUrl already exists"
  )

  await addColumn(
    "ALTER TABLE User ADD COLUMN resendApiKey TEXT",
    "User.resendApiKey already exists"
  )

  console.log("Schema sync complete")
}

main().catch((error) => {
  console.error("Schema sync failed:")
  console.error(error)
  process.exit(1)
})
