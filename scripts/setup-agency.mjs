import { createClient } from "@libsql/client"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import readline from "readline"
import { randomUUID } from "crypto"

dotenv.config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function setupAgency() {
  console.log("\n--- 🏁 BRANCR LABS: TACTICAL AGENCY PROVISIONING ---")
  console.log("This utility bootstraps your first Super Admin account.\n")

  // 1. Security Guard
  const token = await question("🔑 Enter Setup Security Token: ")
  if (token !== "brancr_init_2026") {
    console.error("❌ Unauthorized. Mission aborted.")
    process.exit(1)
  }

  // 2. Target Env
  const url = process.env.DATABASE_URL
  const authToken = process.env.AUTH_TOKEN
  console.log(`\n📡 Targeting Database: ${url}`)

  // 3. Admin Details
  const name = await question("👤 Admin Name (e.g. Master Operative): ") || "Master Operative"
  const email = await question("📧 Admin Email: ")
  const password = await question("🔐 Admin Password: ")

  if (!email || !password) {
    console.error("❌ Email and Password are required.")
    process.exit(1)
  }

  // 4. Secure Hashing
  console.log("\n⚒️  Encrypting credentials...")
  const passwordHash = await bcrypt.hash(password, 10)
  const id = `admin_${randomUUID().split("-")[0]}`

  // 5. Raw SQL Provisioning
  const client = createClient({ url, authToken })

  try {
    console.log(`🚀 Provisioning ${email} as Super Admin...`)
    
    // Check if table exists
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
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        senderEmail TEXT,
        webhookUrl TEXT,
        resendApiKey TEXT
      )
    `)

    // Upsert logic
    const res = await client.execute({
      sql: `INSERT INTO User (id, name, email, passwordHash, role, active) 
            VALUES (?, ?, ?, ?, 'super_admin', 1)
            ON CONFLICT(email) DO UPDATE SET 
            passwordHash = excluded.passwordHash,
            role = 'super_admin',
            active = 1`,
      args: [id, name, email, passwordHash]
    })

    console.log("\n✅ MISSION SUCCESS: Super Admin provisioned.")
    console.log(`📊 ID: ${id}`)
    console.log(`📧 Login: ${email}`)
    console.log("\n--- Proceed to /login to initialize the Command Center ---")
    
  } catch (err) {
    console.error("\n❌ CRITICAL FAILURE during provisioning:")
    console.error(err.message)
  } finally {
    rl.close()
  }
}

setupAgency()
