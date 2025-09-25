import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"

// Simple in-memory user store (for demo purposes)
const users = new Map()

// Add Google provider if credentials are available
const providers = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// Simple credentials provider
providers.push(
  Credentials({
    async authorize(credentials) {
      try {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check if user exists in memory store
        const user = users.get(credentials.email)
        
        if (!user) {
          return null
        }

        // Compare password
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
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      
      // Handle Google OAuth
      if (account?.provider === "google") {
        // Create user in memory store if doesn't exist
        if (!users.has(token.email!)) {
          const userId = `user_${Date.now()}`
          users.set(token.email!, {
            id: userId,
            email: token.email!,
            name: token.name!,
            image: token.picture,
            password: null, // No password for OAuth users
            briefsUsed: 0,
            briefsLimit: 5,
            plan: "free"
          })
          token.id = userId
        } else {
          token.id = users.get(token.email!)?.id
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
})

// Export user management functions
export const createUser = async (email: string, password: string, name: string) => {
  const hashedPassword = await bcrypt.hash(password, 12)
  const userId = `user_${Date.now()}`
  
  users.set(email, {
    id: userId,
    email,
    name,
    password: hashedPassword,
    briefsUsed: 0,
    briefsLimit: 5,
    plan: "free"
  })
  
  return { id: userId, email, name }
}

export const getUser = (email: string) => {
  return users.get(email)
}

export const incrementBriefUsage = (userId: string) => {
  for (const [email, user] of users.entries()) {
    if (user.id === userId) {
      user.briefsUsed++
      return user
    }
  }
  return null
}