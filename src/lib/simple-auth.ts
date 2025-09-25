import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

// Simple in-memory user store
const users = new Map()

// Simple session management
export async function createSession(userId: string, email: string, name: string) {
  const cookieStore = await cookies()
  const sessionData = {
    userId,
    email,
    name,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  }
  
  cookieStore.set('session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })
}

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return null
    }
    
    const sessionData = JSON.parse(sessionCookie.value)
    
    // Check if session is expired
    if (Date.now() > sessionData.expires) {
      return null
    }
    
    return sessionData
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
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
