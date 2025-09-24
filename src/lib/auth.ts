import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./db"
import bcrypt from "bcryptjs"

// Create providers array conditionally
const providers = []

// Add Google provider if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// Always add credentials provider
providers.push(
  Credentials({
    async authorize(credentials) {
      try {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        // Compare hashed password
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      } catch (error) {
        console.error("Auth error:", error)
        return null
      }
    },
  })
)

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      try {
        if (user) {
          token.id = user.id
          token.email = user.email
          token.name = user.name
        }
        
        // Handle Google OAuth
        if (account?.provider === "google") {
          const existingUser = await db.user.findUnique({
            where: { email: token.email! },
          })
          
          if (!existingUser) {
            // Create user if doesn't exist
            const newUser = await db.user.create({
              data: {
                email: token.email!,
                name: token.name!,
                image: token.picture,
              },
            })
            
            // Create default subscription
            await db.subscription.create({
              data: {
                userId: newUser.id,
                plan: "free",
                status: "active",
                briefsLimit: 5,
                briefsUsed: 0,
              },
            })
            
            token.id = newUser.id
          } else {
            token.id = existingUser.id
          }
        }
        
        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (token) {
          session.user.id = token.id as string
          session.user.email = token.email as string
          session.user.name = token.name as string
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    },
  },
})