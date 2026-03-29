import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import dotenv from "dotenv"

dotenv.config()

const url = process.env.DATABASE_URL
const authToken = process.env.AUTH_TOKEN

const adapter = new PrismaLibSql({ url, authToken })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log(`\n--- Production DB Diagnostic ---`)
  console.log(`Connecting to: ${url}`)
  
  try {
    const count = await prisma.user.count()
    console.log(`\nSuccess! User count: ${count}`)
  } catch (err) {
    console.error(`\nFAILED to connect:`)
    console.error(err)
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
