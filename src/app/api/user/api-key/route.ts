import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { requireEnterprise } from '../../../../lib/auth-middleware';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Require Enterprise plan for API access
    const user = await requireEnterprise(request);
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get user's API keys
    const apiKeys = await db.collection('api_keys').find({ 
      userId: user.userId,
      isActive: true 
    }).sort({ createdAt: -1 }).toArray();
    
    // Remove sensitive key data from response
    const safeApiKeys = apiKeys.map(key => ({
      _id: key._id,
      name: key.name,
      keyPreview: `ak_${key.key.substring(0, 8)}...`,
      permissions: key.permissions,
      rateLimit: key.rateLimit,
      lastUsed: key.lastUsed,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt
    }));
    
    return NextResponse.json({
      success: true,
      apiKeys: safeApiKeys
    });
    
  } catch (error) {
    console.error('Get API keys error:', error);
    
    if (error.message.includes('Enterprise plan required')) {
      return NextResponse.json(
        { error: 'Enterprise plan required for API access' },
        { status: 403 }
      );
    }
    
    if (error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require Enterprise plan for API access
    const user = await requireEnterprise(request);
    
    // Parse request body
    const body = await request.json();
    const { name, permissions, rateLimit, expiresIn } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Check if user has reached API key limit
    const existingKeys = await db.collection('api_keys').countDocuments({
      userId: user.userId,
      isActive: true
    });
    
    if (existingKeys >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 API keys allowed per user' },
        { status: 400 }
      );
    }
    
    // Generate secure API key
    const keyId = crypto.randomBytes(8).toString('hex');
    const keySecret = crypto.randomBytes(32).toString('hex');
    const apiKey = `ak_${keyId}_${keySecret}`;
    
    // Calculate expiration date
    let expiresAt = null;
    if (expiresIn) {
      const expirationMs = {
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        '1y': 365 * 24 * 60 * 60 * 1000
      }[expiresIn];
      
      if (expirationMs) {
        expiresAt = new Date(Date.now() + expirationMs);
      }
    }
    
    // Create API key record
    const apiKeyRecord = {
      userId: user.userId,
      name,
      key: apiKey,
      permissions: permissions || ['read'],
      rateLimit: rateLimit || 1000,
      isActive: true,
      lastUsed: null,
      createdAt: new Date(),
      expiresAt
    };
    
    const result = await db.collection('api_keys').insertOne(apiKeyRecord);
    
    // Log API key creation
    await db.collection('audit_logs').insertOne({
      userId: user.userId,
      action: 'api_key_created',
      details: {
        keyId: result.insertedId,
        keyName: name,
        permissions
      },
      timestamp: new Date()
    });
    
    return NextResponse.json({
      success: true,
      apiKey: {
        _id: result.insertedId,
        name,
        key: apiKey, // Only show full key on creation
        keyPreview: `ak_${keyId}...`,
        permissions: apiKeyRecord.permissions,
        rateLimit: apiKeyRecord.rateLimit,
        createdAt: apiKeyRecord.createdAt,
        expiresAt: apiKeyRecord.expiresAt
      },
      warning: 'Store this API key securely. It will not be shown again.'
    });
    
  } catch (error) {
    console.error('Create API key error:', error);
    
    if (error.message.includes('Enterprise plan required')) {
      return NextResponse.json(
        { error: 'Enterprise plan required for API access' },
        { status: 403 }
      );
    }
    
    if (error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require Enterprise plan for API access
    const user = await requireEnterprise(request);
    
    // Get API key ID from query params
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId');
    
    if (!keyId) {
      return NextResponse.json(
        { error: 'API key ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Deactivate the API key (soft delete)
    const result = await db.collection('api_keys').updateOne(
      { 
        _id: keyId,
        userId: user.userId 
      },
      {
        $set: {
          isActive: false,
          deactivatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }
    
    // Log API key deletion
    await db.collection('audit_logs').insertOne({
      userId: user.userId,
      action: 'api_key_deleted',
      details: {
        keyId
      },
      timestamp: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: 'API key deactivated successfully'
    });
    
  } catch (error) {
    console.error('Delete API key error:', error);
    
    if (error.message.includes('Enterprise plan required')) {
      return NextResponse.json(
        { error: 'Enterprise plan required for API access' },
        { status: 403 }
      );
    }
    
    if (error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
