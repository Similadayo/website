import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db) as any,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@brancr.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.passwordHash) {
          // Guaranteed admin initialization (Super Admin fallback)
          if (credentials.email === "admin@brancr.com" && credentials.password === "admin") {
             const hash = await bcrypt.hash("admin", 10);
             const newUser = await db.user.upsert({
               where: { email: "admin@brancr.com" },
               update: { passwordHash: hash, role: "super_admin", active: true },
               create: {
                 email: "admin@brancr.com",
                 passwordHash: hash,
                 name: "Super Admin",
                 role: "super_admin",
                 active: true,
               }
             });
             return newUser;
          }
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return user
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        // We cast because auth.ts types for User might need module augmentation
        token.role = (user as any).role
        token.name = user.name
      }
      
      // Handle session updates from the client (e.g. name change in settings)
      if (trigger === "update" && session?.name) {
        token.name = session.name
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role as string
        
        // Fetch fresh assignments for the session
        const assignment = await db.assignment.findFirst({
          where: { userId: token.id as string, status: "active" }
        })
        
        if (assignment) {
          ;(session.user as any).assignment = {
            region: assignment.region,
            niche: assignment.niche
          }
        }
      }
      return session
    }
  }
})
