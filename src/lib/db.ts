import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function normalizeDatabaseUrl(url: string) {
  return url.replace(".aws-us-west-2", "")
}

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL
  const authToken = process.env.AUTH_TOKEN

  if (!rawUrl) {
    throw new Error("DATABASE_URL is not defined in environment.")
  }

  const url = normalizeDatabaseUrl(rawUrl)
  const adapter = new PrismaLibSql({ url, authToken })

  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
