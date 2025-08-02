// ENTERPRISE API KEY GENERATION SYSTEM
// File: src/app/api/user/api-key/route.ts
// Only available to Enterprise plan customers

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate secure API key
function generateApiKey(): string {
  const prefix = 'aff_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}${randomBytes}`;
}

// Generate API secret for webhook verification
function generateApiSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    // 1. VERIFY AUTHENTICATION
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
        userId: string; 
        plan: string; 
      };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid authentication token',
        code: 'INVALID_TOKEN' 
      }, { status: 401 });
    }

    // 2. CONNECT TO DATABASE
    const { db } = await connectToDatabase();

    // 3. VERIFY ENTERPRISE PLAN
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    const userPlan = user.subscription?.planType || 'basic';
    if (userPlan !== 'enterprise') {
      return NextResponse.json({ 
        error: 'API key generation is only available for Enterprise plan customers',
        code: 'ENTERPRISE_REQUIRED',
        currentPlan: userPlan,
        upgradeUrl: '/pricing'
      }, { status: 403 });
    }

    // 4. PARSE REQUEST
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ 
        error: 'API key name is required',
        code: 'NAME_REQUIRED' 
      }, { status: 400 });
    }

    // 5. CHECK API KEY LIMIT (Enterprise gets 10 API keys)
    const existingKeys = await db.collection('api_keys').countDocuments({ 
      userId, 
      status: 'active' 
    });

    if (existingKeys >= 10) {
      return NextResponse.json({ 
        error: 'Maximum number of API keys reached (10)',
        code: 'LIMIT_REACHED',
        currentCount: existingKeys,
        limit: 10
      }, { status: 403 });
    }

    // 6. GENERATE API KEY AND SECRET
    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();

    // 7. SAVE TO DATABASE
    const apiKeyDocument = {
      userId,
      name: name.trim(),
      description: description?.trim() || '',
      apiKey,
      apiSecret,
      status: 'active',
      createdAt: new Date(),
      lastUsedAt: null,
      usageCount: 0,
      permissions: [
        'ai:generate-website',
        'websites:list',
        'websites:view',
        'analytics:view'
      ],
      rateLimit: {
        requestsPerMinute: 100,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      }
    };

    const result = await db.collection('api_keys').insertOne(apiKeyDocument);

    // 8. LOG API KEY CREATION
    await db.collection('api_key_logs').insertOne({
      userId,
      apiKeyId: result.insertedId,
      action: 'created',
      timestamp: new Date(),
      metadata: {
        name,
        description
      }
    });

    return NextResponse.json({
      success: true,
      apiKey: {
        id: result.insertedId,
        name,
        description,
        apiKey, // Only shown once during creation
        createdAt: new Date(),
        permissions: apiKeyDocument.permissions,
        rateLimit: apiKeyDocument.rateLimit
      },
      warning: 'Store this API key securely. It will not be shown again.',
      documentation: '/docs/api'
    });

  } catch (error: any) {
    console.error('API Key Generation Error:', error);

    // Log error
    try {
      const { db } = await connectToDatabase();
      await db.collection('error_logs').insertOne({
        error: error.message,
        stack: error.stack,
        endpoint: '/api/user/api-key',
        timestamp: new Date(),
        type: 'api_key_generation_error',
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json({
      error: 'Failed to generate API key',
      code: 'GENERATION_FAILED',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

// GET - List user's API keys
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { db } = await connectToDatabase();

    // Verify Enterprise plan
    const user = await db.collection('users').findOne({ _id: decoded.userId });
    const userPlan = user?.subscription?.planType || 'basic';
    
    if (userPlan !== 'enterprise') {
      return NextResponse.json({ 
        error: 'API keys are only available for Enterprise plan customers',
        currentPlan: userPlan 
      }, { status: 403 });
    }

    const apiKeys = await db.collection('api_keys')
      .find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      apiKeys: apiKeys.map(key => ({
        id: key._id,
        name: key.name,
        description: key.description,
        status: key.status,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt,
        usageCount: key.usageCount,
        permissions: key.permissions,
        rateLimit: key.rateLimit,
        // Never return the actual API key in list view
        apiKey: `${key.apiKey.substring(0, 12)}...`
      }))
    });

  } catch (error: any) {
    console.error('Get API Keys Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch API keys',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Revoke API key
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { searchParams } = new URL(request.url);
    const apiKeyId = searchParams.get('id');

    if (!apiKeyId) {
      return NextResponse.json({ error: 'API key ID required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Update API key status to revoked
    const result = await db.collection('api_keys').updateOne(
      { _id: apiKeyId, userId: decoded.userId },
      { 
        $set: { 
          status: 'revoked',
          revokedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Log revocation
    await db.collection('api_key_logs').insertOne({
      userId: decoded.userId,
      apiKeyId,
      action: 'revoked',
      timestamp: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully'
    });

  } catch (error: any) {
    console.error('Revoke API Key Error:', error);
    return NextResponse.json({
      error: 'Failed to revoke API key',
      details: error.message
    }, { status: 500 });
  }
}

