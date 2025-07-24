import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const client = new MongoClient(uri)

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const userEmail = decoded.email

    // Connect to MongoDB
    await client.connect()
    const db = client.db('affilify')
    
    // Get user data
    const user = await db.collection('users').findOne({ email: userEmail })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's websites
    const websites = await db.collection('websites').find({ 
      userId: user._id.toString() 
    }).toArray()

    // Calculate statistics
    const totalWebsites = websites.length
    const activeSites = websites.filter(site => site.status === 'active').length

    // Format websites for response
    const formattedWebsites = websites.map(site => ({
      id: site._id.toString(),
      name: site.websiteTitle || site.title || 'Untitled Website',
      status: site.status || 'active',
      url: site.url || `https://affilify.eu/generated/${site.generatedId}`,
      createdAt: site.createdAt,
      niche: site.niche,
      template: site.template,
      affiliateLink: site.affiliateLink
    }))

    return NextResponse.json({
      success: true,
      data: {
        userName: user.name || user.email.split('@')[0],
        userCreatedAt: user.createdAt,
        userLastActive: new Date().toISOString(),
        totalWebsites,
        activeSites,
        websites: formattedWebsites
      }
    })

  } catch (error: any) {
    console.error('Error fetching user websites:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
