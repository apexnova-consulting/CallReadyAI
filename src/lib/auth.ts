import bcrypt from 'bcryptjs'

// Simple in-memory user store
const users = new Map()

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

export function getAllUsers() {
  return Array.from(users.values())
}
