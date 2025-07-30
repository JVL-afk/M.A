import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/mongodb'; // Fixed path

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

    // Connect to database
    const { db } = await connectToDatabase();

    // Get user directly from MongoDB
    const dbUser = await db.collection('users').findOne({ 
      _id: new (require('mongodb')).ObjectId(user.userId) 
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentPlan = dbUser.plan || 'basic';

    // Plan features - BASIC IS FREE!
    const planFeatures = {
      basic: {
        price: 'FREE',
        websites: 3,
        templates: 'basic',
        analytics: true,
        aiAnalysis: true,
        pageSpeedAnalysis: true,
        apiAccess: false,
        support: 'community',
        customDomains: false,
        discordAccess: false, // Only paid plans get Discord
        features: [
          '3 affiliate websites',
          'AI-powered content generation',
          'Page speed analysis',
          'Basic analytics',
          'Community support',
          'AFFILIFY subdomain hosting'
        ]
      },
      pro: {
        price: '$29/month',
        websites: 10,
        templates: 'premium',
        analytics: true,
        aiAnalysis: true,
        pageSpeedAnalysis: true,
        apiAccess: false,
        support: 'priority',
        customDomains: true,
        discordAccess: true, // Discord access for paid users!
        features: [
          '10 affiliate websites',
          'Premium templates',
          'Advanced analytics',
          'Custom domains',
          'Priority support',
          'Discord community access',
          'Revenue competitions',
          'Advanced SEO tools'
        ]
      },
      enterprise: {
        price: '$99/month',
        websites: 'unlimited',
        templates: 'all',
        analytics: true,
        aiAnalysis: true,
        pageSpeedAnalysis: true,
        apiAccess: true,
        support: 'dedicated',
        customDomains: true,
        discordAccess: true,
        features: [
          'Unlimited websites',
          'All premium templates',
          'Full analytics suite',
          'API access',
          'Dedicated support',
          'VIP Discord access',
          'Clan leadership privileges',
          'White-label options'
        ]
      }
    };

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser._id.toString(),
        email: dbUser.email,
        plan: currentPlan,
        isVerified: dbUser.isVerified || false,
        createdAt: dbUser.createdAt,
        lastLoginAt: dbUser.lastLoginAt
      },
      features: planFeatures[currentPlan] || planFeatures.basic,
      hasAccess: {
        aiAnalysis: true,
        websiteGeneration: true,
        pageSpeedAnalysis: true,
        analytics: true,
        apiAccess: currentPlan === 'enterprise',
        customDomains: currentPlan !== 'basic',
        prioritySupport: currentPlan !== 'basic',
        discordAccess: currentPlan !== 'basic', // Key feature!
        unlimitedWebsites: currentPlan === 'enterprise'
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
