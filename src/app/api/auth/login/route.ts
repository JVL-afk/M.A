import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db('affilify')

    // Find user by email
    const user = await db.collection('users').findOne({ email })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please verify your email before logging in',
          needsVerification: true,
          email: email
        },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        plan: user.plan || 'basic'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLoginAt: new Date(),
          lastActiveAt: new Date()
        }
      }
    )

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan || 'basic',
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLoginAt: new Date()
      }
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    
    // Proper error type handling for TypeScript
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Login failed',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST to login.' },
    { status: 405 }
  )
}
