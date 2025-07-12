import { NextRequest, NextResponse } from 'next/server'

// Mock database - replace with your actual database
const users = new Map()
const verificationCodes = new Map()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = users.get(email)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email' },
        { status: 400 }
      )
    }

    if (user.verified) {
      return NextResponse.json(
        { success: false, error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const codeExpiry = new Date(Date.now() + 600000) // 10 minutes from now

    // Store new verification code
    verificationCodes.set(email, {
      code: verificationCode,
      expiry: codeExpiry
    })

    // Send verification email
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'email_verification',
        to: email,
        data: {
          name: user.name,
          verificationCode: verificationCode
        }
      })
    })

    const emailResult = await emailResponse.json()

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'New verification code sent to your email'
    })

  } catch (error: any) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
