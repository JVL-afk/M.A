import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

export interface User {
  id: string
  email: string
  name: string
  plan: 'basic' | 'pro' | 'enterprise'
  subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'past_due'
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      plan: decoded.plan,
      subscriptionStatus: decoded.subscriptionStatus,
    }
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check cookies
  const token = request.cookies.get('auth-token')?.value
  return token || null
}

export function getUserFromRequest(request: NextRequest): User | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  
  return verifyToken(token)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function generateApiKey(): string {
  const prefix = 'ak_live_'
  const randomPart = Array.from({ length: 32 }, () => 
    Math.random().toString(36).charAt(0)
  ).join('')
  
  return prefix + randomPart
}

export function hashApiKey(apiKey: string): string {
  return bcrypt.hashSync(apiKey, 10)
}

export function verifyApiKey(apiKey: string, hashedKey: string): boolean {
  return bcrypt.compareSync(apiKey, hashedKey)
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Add user to request context
    ;(request as any).user = user
    
    return handler(request, ...args)
  }
}

export function requirePlan(requiredPlan: 'basic' | 'pro' | 'enterprise') {
  const planHierarchy = { basic: 1, pro: 2, enterprise: 3 }
  
  return (handler: Function) => {
    return async (request: NextRequest, ...args: any[]) => {
      const user = getUserFromRequest(request)
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      if (planHierarchy[user.plan] < planHierarchy[requiredPlan]) {
        return new Response(
          JSON.stringify({ 
            error: `${requiredPlan} plan required`,
            currentPlan: user.plan,
            requiredPlan 
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }

      ;(request as any).user = user
      
      return handler(request, ...args)
    }
  }
}
