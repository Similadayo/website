import { createClient } from "@libsql/client"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function GET() {
  const rawUrl = process.env.DATABASE_URL
  const authToken = process.env.AUTH_TOKEN

  if (!rawUrl) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 })
  }

  // Try both protocols to bypass environment-specific handshake issues
  const urlsToTry = [
    rawUrl,
    rawUrl.startsWith("libsql://") ? rawUrl.replace("libsql://", "https://") : rawUrl,
  ]

  const results = []

  for (const url of urlsToTry) {
    const client = createClient({ url, authToken })
    try {
      console.log(`Trying connection to: ${url}`)
      // Simple probe
      await client.execute("SELECT 1")
      
      const email = "admin@brancr.com"
      const password = "admin"
      const passwordHash = await bcrypt.hash(password, 10)
      const now = new Date().toISOString()
      const id = `admin_${Math.random().toString(36).slice(2, 7)}`

      // Ensure User table exists
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

      // Upsert Admin
      const updateRes = await client.execute({
        sql: "UPDATE User SET passwordHash = ?, role = 'super_admin', active = 1 WHERE email = ?",
        args: [passwordHash, email]
      })

      if (updateRes.rowsAffected === 0) {
        await client.execute({
          sql: "INSERT INTO User (id, email, passwordHash, name, role, active, createdAt) VALUES (?, ?, ?, 'Super Admin', 'super_admin', 1, ?)",
          args: [id, email, passwordHash, now]
        })
      }

      return NextResponse.json({ 
        success: true, 
        using_url: url,
        message: "Admin account initialized successfully"
      })
    } catch (err: any) {
      results.push({ url, status: "failed", error: err.message })
    }
  }

  return NextResponse.json({ 
    success: false, 
    diagnostics: results,
    hint: "Check if the AUTH_TOKEN in Vercel matches exactly (no spaces) and that the DB is active in Turso."
  }, { status: 500 })
}
