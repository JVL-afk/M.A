import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { ObjectId } from 'mongodb'

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

    // Check user's plan - API keys only for Enterprise users
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.plan !== 'enterprise') {
      return NextResponse.json(
        { success: false, error: 'API keys are only available for Enterprise users' },
        { status: 403 }
      )
    }

    // Get user's API keys
    const apiKeys = await db.collection('api_keys').find(
      { userId: new ObjectId(decoded.userId) },
      { projection: { key: 0 } } // Don't return the actual key for security
    ).toArray()

    return NextResponse.json({
      success: true,
      apiKeys: apiKeys.map(key => ({
        id: key._id,
        name: key.name,
        lastUsed: key.lastUsed,
        createdAt: key.createdAt,
        isActive: key.isActive,
        usage: key.usage || 0
      }))
    })

  } catch (error) {
    console.error('Get API keys error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get API keys',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'API key name is required' },
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

    // Check user's plan - API keys only for Enterprise users
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.plan !== 'enterprise') {
      return NextResponse.json(
        { success: false, error: 'API keys are only available for Enterprise users' },
        { status: 403 }
      )
    }

    // Check if user already has maximum number of API keys
    const existingKeysCount = await db.collection('api_keys').countDocuments({
      userId: new ObjectId(decoded.userId),
      isActive: true
    })

    if (existingKeysCount >= 5) { // Limit to 5 API keys per user
      return NextResponse.json(
        { success: false, error: 'Maximum number of API keys reached (5)' },
        { status: 400 }
      )
    }

    // Generate API key
    const apiKey = `ak_${crypto.randomBytes(32).toString('hex')}`
    
    // Store API key in database
    const newApiKey = {
      userId: new ObjectId(decoded.userId),
      name: name.trim(),
      key: apiKey,
      createdAt: new Date(),
      lastUsed: null,
      isActive: true,
      usage: 0
    }

    const insertResult = await db.collection('api_keys').insertOne(newApiKey)

    return NextResponse.json({
      success: true,
      apiKey: {
        id: insertResult.insertedId,
        name: name.trim(),
        key: apiKey, // Only return the key once during creation
        createdAt: newApiKey.createdAt
      },
      message: 'API key created successfully. Please save it securely as it will not be shown again.'
    })

  } catch (error) {
    console.error('Create API key error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create API key',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: 'API key ID is required' },
        { status: 400 }
      )
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(keyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key ID format' },
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

    // Delete API key (soft delete by setting isActive to false)
    const updateResult = await db.collection('api_keys').updateOne(
      { 
        _id: new ObjectId(keyId),
        userId: new ObjectId(decoded.userId)
      },
      { 
        $set: { 
          isActive: false,
          deletedAt: new Date()
        }
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'API key not found or already deleted' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    })

  } catch (error) {
    console.error('Delete API key error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete API key',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
