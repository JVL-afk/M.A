import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key');
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Direct MongoDB connection
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Get user
    const dbUser = await db.collection('users').findOne({ 
      _id: new ObjectId(user.userId) 
    });

    await client.close();

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentPlan = dbUser.plan || 'basic';

    // Plan features
    const planFeatures = {
      basic: {
        price: 'FREE',
        websites: 3,
        analytics: true,
        discordAccess: false,
        features: [
          '3 affiliate websites',
          'AI-powered content generation',
          'Page speed analysis',
          'Basic analytics'
        ]
      },
      pro: {
        price: '$29/month',
        websites: 10,
        analytics: true,
        discordAccess: true,
        features: [
          '10 affiliate websites',
          'Premium templates',
          'Discord community access',
          'Revenue competitions'
        ]
      },
      enterprise: {
        price: '$99/month',
        websites: 'unlimited',
        analytics: true,
        discordAccess: true,
        features: [
          'Unlimited websites',
          'API access',
          'VIP Discord access',
          'Clan leadership'
        ]
      }
    };

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser._id.toString(),
        email: dbUser.email,
        plan: currentPlan
      },
      features: planFeatures[currentPlan] || planFeatures.basic,
      hasAccess: {
        aiAnalysis: true,
        websiteGeneration: true,
        analytics: true,
        discordAccess: currentPlan !== 'basic'
      }
    });

  } catch (error) {
    console.error('Plan check error:', error);
    return NextResponse.json(
      { error: 'Failed to check plan' },
      { status: 500 }
    );
  }
}

