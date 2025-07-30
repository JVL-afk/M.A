// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // For now, return success without database operations
    // You can add database integration later when mongoose is installed
    const userResponse = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase(),
      plan: 'free',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      message: 'User registration endpoint ready',
      user: userResponse,
      note: 'Database integration pending - install mongoose and configure MongoDB'
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    )
  }
}

