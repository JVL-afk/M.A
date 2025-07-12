import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Check user's plan - API keys only for Enterprise users
    const user = await db.collection('users').findOne({ _id: decoded.userId });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (user.plan !== 'enterprise') {
      return NextResponse.json({ 
        success: false, 
        error: 'API key generation is only available for Enterprise plan users. Please upgrade your plan.' 
      }, { status: 403 });
    }

    // Generate a new API key
    const apiKey = 'affilify_' + crypto.randomBytes(32).toString('hex');

    // Update user with new API key
    await db.collection('users').updateOne(
      { _id: decoded.userId },
      { 
        $set: { 
          apiKey: apiKey,
          apiKeyGeneratedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    // Track API key generation
    await db.collection('user_analytics').insertOne({
      userId: decoded.userId,
      action: 'api_key_generation',
      timestamp: new Date(),
      plan: user.plan
    });

    return NextResponse.json({
      success: true,
      apiKey: apiKey,
      message: 'API key generated successfully. Keep this key secure and do not share it.'
    });

  } catch (error: any) {
    console.error('API key generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate API key: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get user's current API key
    const user = await db.collection('users').findOne({ _id: decoded.userId });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (user.plan !== 'enterprise') {
      return NextResponse.json({ 
        success: false, 
        error: 'API key access is only available for Enterprise plan users.' 
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      hasApiKey: !!user.apiKey,
      apiKey: user.apiKey ? user.apiKey.substring(0, 20) + '...' : null, // Masked for security
      generatedAt: user.apiKeyGeneratedAt
    });

  } catch (error: any) {
    console.error('API key retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve API key: ' + error.message },
      { status: 500 }
    );
  }
}
