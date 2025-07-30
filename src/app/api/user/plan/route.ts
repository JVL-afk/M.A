import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';

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
    // Verify authentication
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get user's current plan
    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentPlan = dbUser.plan || 'basic';

    // Define plan features
    const planFeatures = {
      basic: {
        websites: 5,
        templates: 'basic',
        analytics: false,
        apiAccess: false,
        support: 'email',
        customDomains: false
      },
      pro: {
        websites: 25,
        templates: 'premium',
        analytics: true,
        apiAccess: false,
        support: 'priority',
        customDomains: true
      },
      enterprise: {
        websites: 'unlimited',
        templates: 'all',
        analytics: true,
        apiAccess: true,
        support: 'dedicated',
        customDomains: true
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
        aiAnalysis: true, // All plans get AI analysis
        websiteGeneration: true, // All plans get website generation
        analytics: currentPlan !== 'basic',
        apiAccess: currentPlan === 'enterprise',
        customDomains: currentPlan !== 'basic',
        prioritySupport: currentPlan !== 'basic'
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
