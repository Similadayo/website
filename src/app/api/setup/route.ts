import { createClient } from "@libsql/client"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function GET() {
  const url = process.env.DATABASE_URL
  const authToken = process.env.AUTH_TOKEN

  if (!url) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 })
  }

  const client = createClient({ url, authToken })

  try {
    const email = "admin@brancr.com"
    const password = "admin"
    const passwordHash = await bcrypt.hash(password, 10)
    const now = new Date().toISOString()
    const id = `admin_${Math.random().toString(36).slice(2, 7)}`

    // 1. Ensure User table exists
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
    const updateRes = await client.execute({
      sql: "UPDATE User SET passwordHash = ?, role = 'super_admin', active = 1 WHERE email = ?",
      args: [passwordHash, email]
    })

    let created = false
    if (updateRes.rowsAffected === 0) {
      await client.execute({
        sql: "INSERT INTO User (id, email, passwordHash, name, role, active, createdAt) VALUES (?, ?, ?, 'Super Admin', 'super_admin', 1, ?)",
        args: [id, email, passwordHash, now]
      })
      created = true
    }

    return NextResponse.json({ 
      success: true, 
      message: created ? "Admin account created successfully" : "Admin account reset successfully",
      email: email,
      password: "admin (default)"
    })
  } catch (err: any) {
    process.stderr.write(err.message)
    return NextResponse.json({ 
      success: false, 
      error: err.message,
      stack: err.stack 
    }, { status: 500 })
  }
}
