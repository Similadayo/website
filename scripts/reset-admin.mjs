import { createClient } from "@libsql/client"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

const url = process.env.DATABASE_URL
const authToken = process.env.AUTH_TOKEN

if (!url) {
  console.error("Error: DATABASE_URL is not set in .env")
  process.exit(1)
}

const client = createClient({ url, authToken })

async function main() {
  const email = "admin@brancr.com"
  const password = "admin"
  const saltRounds = 10

  console.log(`\n--- Production Database Init (Raw SQL) ---`)
  console.log(`Target: ${url}`)
  
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const now = new Date().toISOString()
  const id = `admin_${Math.random().toString(36).slice(2, 7)}`

  // 1. Create table if missing (Defensive)
  console.log("Ensuring 'User' table exists...")
  await client.execute(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      emailVerified DATETIME,
      image TEXT,
      passwordHash TEXT,
      role TEXT NOT NULL DEFAULT 'researcher',
      active BOOLEAN NOT NULL DEFAULT 1,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 2. Upsert Admin
  console.log(`Upserting ${email}...`)
  
  // Try update first
  const updateRes = await client.execute({
    sql: "UPDATE User SET passwordHash = ?, role = 'super_admin', active = 1 WHERE email = ?",
    args: [passwordHash, email]
  })

  if (updateRes.rowsAffected === 0) {
    console.log("Creating new admin record...")
    await client.execute({
      sql: "INSERT INTO User (id, email, passwordHash, name, role, active, createdAt) VALUES (?, ?, ?, 'Super Admin', 'super_admin', 1, ?)",
      args: [id, email, passwordHash, now]
    })
  } else {
    console.log("Updated existing admin record.")
  }

  console.log(`\nSUCCESS: Administrator ${email} is configured.`)
}

main()
  .catch(e => {
    console.error("\nSTALEMATE: SQL Init failed.")
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    // client close
  })
