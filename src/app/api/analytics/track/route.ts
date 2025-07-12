import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { action, websiteId, websiteUrl, productName, clicks, conversions, revenue, metadata } = await request.json()

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 })
    }

    // Verify user authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db('affilify')

    // Get user information
    const user = await db.collection('users').findOne({ _id: decoded.userId })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Create analytics record
    const analyticsRecord = {
      userId: decoded.userId,
      action: action,
      websiteId: websiteId || null,
      websiteUrl: websiteUrl || null,
      productName: productName || null,
      clicks: clicks || 0,
      conversions: conversions || 0,
      revenue: revenue || 0,
      timestamp: new Date(),
      plan: user.plan,
      metadata: metadata || {}
    }

    // Insert analytics record
    const insertResult = await db.collection('user_analytics').insertOne(analyticsRecord)

    // Update user's total statistics if this is a significant action
    const updateFields: any = {}

    if (clicks && clicks > 0) {
      updateFields.totalClicks = (user.totalClicks || 0) + clicks
    }

    if (revenue && revenue > 0) {
      updateFields.totalRevenue = (user.totalRevenue || 0) + revenue
    }

    if (Object.keys(updateFields).length > 0) {
      updateFields.updatedAt = new Date()
      await db.collection('users').updateOne(
        { _id: decoded.userId },
        { $set: updateFields }
      )
    }

    return NextResponse.json({
      success: true,
      analyticsId: insertResult.insertedId,
      message: 'Analytics tracked successfully'
    })

  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track analytics',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST to track analytics.' },
    { status: 405 }
  )
}

