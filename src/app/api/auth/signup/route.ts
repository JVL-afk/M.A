import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    // Log the incoming request for debugging
    console.log('=== SIGNUP REQUEST DEBUG ===')
    console.log('Request method:', request.method)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    // Parse request body
    let requestBody
    try {
      requestBody = await request.json()
      console.log('Request body received:', requestBody)
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Extract fields with multiple possible names to handle frontend variations
    const name = requestBody.name || requestBody.fullName || requestBody.firstName
    const email = requestBody.email || requestBody.emailAddress
    const password = requestBody.password
    const confirmPassword = requestBody.confirmPassword

    console.log('Extracted fields:', { 
      name: name ? 'present' : 'missing', 
      email: email ? 'present' : 'missing', 
      password: password ? 'present' : 'missing',
      confirmPassword: confirmPassword ? 'present' : 'missing'
    })

    // Validate required fields
    if (!name || !email || !password) {
      console.log('Validation failed - missing fields:', {
        name: !name ? 'MISSING' : 'OK',
        email: !email ? 'MISSING' : 'OK',
        password: !password ? 'MISSING' : 'OK'
      })
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name, email, and password are required',
          debug: {
            receivedFields: Object.keys(requestBody),
            missingFields: [
              !name && 'name',
              !email && 'email', 
              !password && 'password'
            ].filter(Boolean)
          }
        },
        { status: 400 }
      )
    }

    // Validate password confirmation if provided
    if (confirmPassword && password !== confirmPassword) {
      console.log('Password confirmation mismatch')
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email)
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('Password too short:', password.length)
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate name length
    if (name.trim().length < 2) {
      console.log('Name too short:', name.trim().length)
      return NextResponse.json(
        { success: false, error: 'Name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    console.log('All validations passed, connecting to database...')

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db('affilify')

    console.log('Database connected, checking for existing user...')

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    })
    
    if (existingUser) {
      console.log('User already exists with email:', email.toLowerCase())
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    console.log('No existing user found, hashing password...')

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    console.log('Password hashed, creating user object...')

    // Create user object
    const newUser = {
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      plan: 'basic',
      isVerified: false,
      createdAt: new Date(),
      lastLogin: null,
      websitesCreated: 0,
      apiUsage: 0,
      stripeCustomerId: null
    }

    console.log('Inserting user into database...')

    // Insert user into database
    const insertResult = await db.collection('users').insertOne(newUser)
    
    if (!insertResult.insertedId) {
      console.error('Failed to insert user into database')
      return NextResponse.json(
        { success: false, error: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    console.log('User created successfully with ID:', insertResult.insertedId)

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: insertResult.insertedId.toString(),
        email: email.toLowerCase(),
        plan: 'basic'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    console.log('JWT token generated, creating response...')

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: insertResult.insertedId,
        name: name.trim(),
        email: email.toLowerCase(),
        plan: 'basic',
        isVerified: false
      }
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    console.log('=== SIGNUP SUCCESS ===')
    return response

  } catch (error) {
    console.error('=== SIGNUP ERROR ===')
    console.error('Error details:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create account. Please try again.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
