import { NextRequest, NextResponse } from 'next/server'
import { generateApiKey, hashApiKey } from '@/lib/auth/utils'

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from auth middleware
    const userId = 'user_id'
    
    // TODO: Fetch user's API keys from database
    const apiKeys = [
      {
        id: '1',
        name: 'Production API Key',
        keyPreview: 'ak_live_****',
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        isActive: true,
      }
    ]

    return NextResponse.json({
      success: true,
      data: apiKeys,
    })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      )
    }

    // Generate new API key
    const apiKey = generateApiKey()
    const hashedKey = hashApiKey(apiKey)

    // TODO: Save to database
    const newApiKeyRecord = {
      id: Date.now().toString(),
      name,
      keyHash: hashedKey,
      keyPreview: `${apiKey.substring(0, 12)}****`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      isActive: true,
    }

    return NextResponse.json({
      success: true,
      data: {
        ...newApiKeyRecord,
        key: apiKey, // Only return the full key once
      },
    })
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Failed to create API key' },
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
        { error: 'API key ID is required' },
        { status: 400 }
      )
    }

    // TODO: Delete from database
    console.log('Deleting API key:', keyId)

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    )
  }
}
