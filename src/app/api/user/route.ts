import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db('affilify')

    // Get user information
    const user = await db.collection('users').findOne(
      { _id: decoded.userId },
      { projection: { password: 0, verificationCode: 0 } } // Exclude sensitive fields
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user statistics
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyStats = await Promise.all([
      db.collection('generated_websites').countDocuments({
        userId: decoded.userId,
        createdAt: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1)
        }
      }),
      db.collection('website_analyses').countDocuments({
        userId: decoded.userId,
        createdAt: {
          $gte: new Date(currentYear, currentMonth, 1),
          $lt: new Date(currentYear, currentMonth + 1, 1)
        }
      })
    ])

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan || 'basic',
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        totalWebsites: user.totalWebsites || 0,
        totalAnalyses: user.totalAnalyses || 0,
        totalRevenue: user.totalRevenue || 0,
        totalClicks: user.totalClicks || 0,
        monthlyStats: {
          websites: monthlyStats[0],
          analyses: monthlyStats[1]
        }
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get user information',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Validate input
    if (!name && !email) {
      return NextResponse.json(
        { success: false, error: 'At least one field (name or email) is required' },
        { status: 400 }
      )
    }

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db('affilify')

    const updateFields: any = { updatedAt: new Date() }
    
    if (name) {
      updateFields.name = name.trim()
    }
    
    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        )
      }

      // Check if email is already taken
      const existingUser = await db.collection('users').findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: decoded.userId }
      })
      
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email is already taken' },
          { status: 409 }
        )
      }

      updateFields.email = email.toLowerCase()
      updateFields.isVerified = false // Require re-verification for email changes
    }

    // Update user
    const updateResult = await db.collection('users').updateOne(
      { _id: decoded.userId },
      { $set: updateFields }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No changes made or user not found' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      emailVerificationRequired: !!email
    })

  } catch (error) {
    console.error('Update user error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update profile',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
