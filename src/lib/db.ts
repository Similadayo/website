import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:dev.db"
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter })
}

// Force re-creation if schema changed (dev only)
if (process.env.NODE_ENV !== "production") {
  delete globalForPrisma.prisma
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
