// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/database/connection'
import User from '@/lib/database/models/User'

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

    // Connect to database
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      plan: 'free',
      createdAt: new Date(),
      isActive: true,
    })

    await newUser.save()

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id,
        email: newUser.email,
        plan: newUser.plan 
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '7d' }
    )

    // Return success response (excluding password)
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      plan: newUser.plan,
      createdAt: newUser.createdAt,
    }

    return NextResponse.json({
      message: 'User registered successfully',
      user: userResponse,
      token,
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
