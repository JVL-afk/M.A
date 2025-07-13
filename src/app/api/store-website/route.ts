import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { websiteId, websiteData, deploymentUrl } = await request.json()

    if (!websiteId || !websiteData) {
      return NextResponse.json(
        { success: false, error: 'Website ID and data are required' },
        { status: 400 }
      )
    }

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

    // Check if user exists
    const user = await db.collection('users').findOne({ _id: decoded.userId })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if website exists and belongs to user
    const existingWebsite = await db.collection('generated_websites').findOne({
      id: websiteId,
      userId: decoded.userId
    })

    if (existingWebsite) {
      // Update existing website
      const updateResult = await db.collection('generated_websites').updateOne(
        { id: websiteId, userId: decoded.userId },
        {
          $set: {
            ...websiteData,
            deploymentUrl: deploymentUrl || null,
            status: deploymentUrl ? 'deployed' : 'stored',
            updatedAt: new Date(),
            lastModifiedBy: decoded.userId
          }
        }
      )

      if (updateResult.modifiedCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Failed to update website' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Website updated successfully',
        websiteId: websiteId,
        status: deploymentUrl ? 'deployed' : 'stored',
        deploymentUrl: deploymentUrl || null
      })

    } else {
      // Create new website entry
      const websiteEntry = {
        id: websiteId,
        userId: decoded.userId,
        ...websiteData,
        deploymentUrl: deploymentUrl || null,
        status: deploymentUrl ? 'deployed' : 'stored',
        analytics: {
          views: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        plan: user.plan || 'basic'
      }

      const insertResult = await db.collection('generated_websites').insertOne(websiteEntry)

      // Update user's total websites count
      await db.collection('users').updateOne(
        { _id: decoded.userId },
        { 
          $inc: { totalWebsites: 1 },
          $set: { lastWebsiteCreatedAt: new Date() }
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Website stored successfully',
        websiteId: websiteId,
        databaseId: insertResult.insertedId,
        status: deploymentUrl ? 'deployed' : 'stored',
        deploymentUrl: deploymentUrl || null
      })
    }

  } catch (error) {
    console.error('Store website error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to store website',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

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

    // Get user's websites
    const websites = await db.collection('generated_websites').find({
      userId: decoded.userId
    }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      websites: websites.map(website => ({
        id: website.id,
        databaseId: website._id,
        title: website.content?.title || website.productName,
        productName: website.productName,
        affiliateLink: website.affiliateLink,
        status: website.status,
        deploymentUrl: website.deploymentUrl,
        analytics: website.analytics || { views: 0, clicks: 0, conversions: 0, revenue: 0 },
        createdAt: website.createdAt,
        updatedAt: website.updatedAt
      }))
    })

  } catch (error) {
    console.error('Get websites error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve websites',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

