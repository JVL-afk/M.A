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

    // Define plan features - BASIC IS NOW FREE!
    const planFeatures = {
      basic: {
        price: 'FREE',
        websites: 3,
        templates: 'basic',
        analytics: true, // Now included in free plan!
        aiAnalysis: true,
        pageSpeedAnalysis: true,
        apiAccess: false,
        support: 'community',
        customDomains: false,
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
        features: [
          '10 affiliate websites',
          'Premium templates',
          'Advanced analytics',
          'Custom domains',
          'Priority support',
          'Advanced SEO tools',
          'A/B testing',
          'Conversion tracking'
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
        features: [
          'Unlimited websites',
          'All premium templates',
          'Full analytics suite',
          'API access',
          'Dedicated support',
          'White-label options',
          'Advanced integrations',
          'Custom development'
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
        aiAnalysis: true, // All plans get AI analysis
        websiteGeneration: true, // All plans get website generation
        pageSpeedAnalysis: true, // All plans get page speed analysis
        analytics: true, // Now all plans get analytics!
        apiAccess: currentPlan === 'enterprise',
        customDomains: currentPlan !== 'basic',
        prioritySupport: currentPlan !== 'basic',
        unlimitedWebsites: currentPlan === 'enterprise'
      },
      planLimits: {
        websites: currentPlan === 'enterprise' ? 999999 : 
                 currentPlan === 'pro' ? 25 : 5,
        monthlyAnalytics: currentPlan === 'enterprise' ? 999999 :
                         currentPlan === 'pro' ? 10000 : 1000
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

