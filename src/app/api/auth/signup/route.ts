import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, confirmPassword } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
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

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check password confirmation
    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db('affilify')

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Create user object
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      plan: 'basic',
      isVerified: false,
      verificationCode: verificationCode,
      verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActiveAt: new Date(),
      totalWebsites: 0,
      totalAnalyses: 0,
      totalRevenue: 0,
      totalClicks: 0
    }

    // Insert user into database
    const insertResult = await db.collection('users').insertOne(newUser)

    // Generate JWT token for immediate login (optional)
    const token = jwt.sign(
      { 
        userId: insertResult.insertedId,
        email: newUser.email,
        plan: newUser.plan
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // In a real implementation, you would send verification email here
    // For now, we'll just log the verification code
    console.log(`Verification code for ${email}: ${verificationCode}`)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email for verification code.',
      user: {
        id: insertResult.insertedId,
        email: newUser.email,
        name: newUser.name,
        plan: newUser.plan,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt
      },
      verificationRequired: true
    })

    // Set HTTP-only cookie (optional - for immediate login)
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error('Signup error:', error)
    
    // Proper error type handling for TypeScript
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Account creation failed',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST to create account.' },
    { status: 405 }
  )
}
