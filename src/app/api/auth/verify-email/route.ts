import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { email, verificationCode } = await request.json()

    // Validate input
    if (!email || !verificationCode) {
      return NextResponse.json(
        { success: false, error: 'Email and verification code are required' },
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

    // Validate verification code format (6 digits)
    if (!/^\d{6}$/.test(verificationCode)) {
      return NextResponse.json(
        { success: false, error: 'Verification code must be 6 digits' },
        { status: 400 }
      )
    }

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db('affilify')

    // Find user by email
    const user = await db.collection('users').findOne({ email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        { success: true, message: 'Email is already verified' }
      )
    }

    // Check if verification code matches
    if (user.verificationCode !== verificationCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Check if verification code has expired
    if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Verification code has expired. Please request a new one.',
          expired: true
        },
        { status: 400 }
      )
    }

    // Update user as verified
    const updateResult = await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          isVerified: true,
          verifiedAt: new Date(),
          updatedAt: new Date()
        },
        $unset: {
          verificationCode: "",
          verificationCodeExpires: ""
        }
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to verify email' },
        { status: 500 }
      )
    }

    // Log verification event
    await db.collection('user_events').insertOne({
      userId: user._id,
      event: 'email_verified',
      timestamp: new Date(),
      metadata: {
        email: user.email,
        verificationMethod: 'code'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now access all features.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: true,
        verifiedAt: new Date()
      }
    })

  } catch (error) {
    console.error('Email verification error:', error)
    
    // Proper error type handling for TypeScript
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Email verification failed',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST to verify email.' },
    { status: 405 }
  )
}
