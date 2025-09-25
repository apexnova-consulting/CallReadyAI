import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

// Simple in-memory user store
const users = new Map()

// Simple session management (using URL params for now to avoid cookie issues)
export async function createSession(userId: string, email: string, name: string) {
  // For now, we'll redirect with session data in URL
  // This is not secure for production but works for testing
  const sessionData = {
    userId,
    email,
    name,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  }
  
  return sessionData
}

export async function getSession() {
  // For now, return null to simplify testing
  // We'll implement proper session management later
  return null
}

export async function destroySession() {
  // For now, just return
  return
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

// User management functions
export async function createUser(email: string, password: string, name: string) {
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

export function getUser(email: string) {
  return users.get(email)
}

export async function validateUser(email: string, password: string) {
  const user = users.get(email)
  if (!user) {
    return null
  }
  
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return null
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name
  }
}
