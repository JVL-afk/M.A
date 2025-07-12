import { NextRequest, NextResponse } from 'next/server'

// Mock database - replace with your actual database
const users = new Map()
const verificationCodes = new Map()

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and verification code are required' },
        { status: 400 }
      )
    }

    // Check if verification code exists and is valid
    const storedCodeData = verificationCodes.get(email)
    
    if (!storedCodeData) {
      return NextResponse.json(
        { success: false, error: 'No verification code found for this email' },
        { status: 400 }
      )
    }

    if (new Date() > storedCodeData.expiry) {
      verificationCodes.delete(email)
      return NextResponse.json(
        { success: false, error: 'Verification code has expired' },
        { status: 400 }
      )
    }

    if (storedCodeData.code !== code) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Mark user as verified
    await verifyUser(email)

    // Remove the used verification code
    verificationCodes.delete(email)

    // Send welcome email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'welcome',
          to: email,
          data: {
            name: await getUserName(email),
            planName: 'Basic'
          }
        })
      })
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the verification if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    })

  } catch (error: any) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock database functions - replace with your actual database logic
async function verifyUser(email: string): Promise<void> {
  // Replace with actual database update
  const user = users.get(email)
  if (user) {
    user.verified = true
    user.verifiedAt = new Date()
    users.set(email, user)
  }
}

async function getUserName(email: string): Promise<string> {
  // Replace with actual database query
  const user = users.get(email)
  return user?.name || 'there'
}

