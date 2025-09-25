import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

// Simple in-memory user store
const users = new Map<string, { id: string; email: string; name: string; password: string }>()

// Session cookie name
const SESSION_COOKIE_NAME = 'app_session'

export async function createSession(userId: string, email: string, name: string) {
  const sessionData = {
    userId,
    email,
    name,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  }
  const encryptedSession = Buffer.from(JSON.stringify(sessionData)).toString('base64')
  cookies().set(SESSION_COOKIE_NAME, encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

export async function getSession() {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value
  if (!sessionCookie) {
    return null
  }
  try {
    const decryptedSession = JSON.parse(Buffer.from(sessionCookie, 'base64').toString('utf8'))
    if (decryptedSession.expires < Date.now()) {
      await destroySession()
      return null
    }
    return { user: { id: decryptedSession.userId, email: decryptedSession.email, name: decryptedSession.name } }
  } catch (error) {
    console.error("Failed to decrypt session:", error)
    await destroySession()
    return null
  }
}

export async function destroySession() {
  cookies().delete(SESSION_COOKIE_NAME)
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
  })
  
  // Create session immediately after user creation
  await createSession(userId, email, name)
  
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

export function getAllUsers() {
  return Array.from(users.values())
}
