import { db } from "./db"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

async function resetPassword() {
  const email = "admin@brancr.com"
  const newPassword = "admin123"
  
  console.log(`📡 Initiating Tactical Password Reset for ${email}...`)
  
  try {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(newPassword, salt)
    
    const user = await db.user.update({
      where: { email },
      data: { passwordHash: hash }
    })
    
    console.log("✅ Mission Success: Password has been reset.")
    console.log(`🔐 Credentials:`)
    console.log(`   Email: ${email}`)
    console.log(`   New Password: ${newPassword}`)
    console.log("\n⚠️  Please log in and update your password immediately.")
  } catch (err: any) {
    console.error("❌ Mission Failure:", err.message)
  }
}

resetPassword().then(() => process.exit())
