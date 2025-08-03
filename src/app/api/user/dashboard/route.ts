import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { authenticateRequest } from '../../../../lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await authenticateRequest(request);
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get user's complete profile
    const userProfile = await db.collection('users').findOne(
      { _id: user.userId },
      { projection: { password: 0 } } // Exclude password
    );
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get user's websites count
    const websiteCount = await db.collection('websites').countDocuments({
      userId: user.userId
    });
    
    // Get user's total analytics
    const analyticsAgg = await db.collection('analytics').aggregate([
      {
        $lookup: {
          from: 'websites',
          localField: 'websiteId',
          foreignField: '_id',
          as: 'website'
        }
      },
      {
        $match: {
          'website.userId': user.userId
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$totalViews' },
          totalClicks: { $sum: '$totalClicks' },
          totalConversions: { $sum: '$totalConversions' },
          totalRevenue: { $sum: '$totalRevenue' }
        }
      }
    ]).toArray();
    
    const analytics = analyticsAgg[0] || {
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0
    };
    
    // Get recent activity
    const recentWebsites = await db.collection('websites').find({
      userId: user.userId
    }).sort({ updatedAt: -1 }).limit(5).toArray();
    
    // Get plan limits
    const planLimits = {
      basic: { websites: 5, apiCalls: 100 },
      pro: { websites: 25, apiCalls: 1000 },
      enterprise: { websites: Infinity, apiCalls: 10000 }
    };
    
    const userLimits = planLimits[userProfile.plan] || planLimits.basic;
    
    // Get current month's API usage (if applicable)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const apiUsage = await db.collection('api_usage').aggregate([
      {
        $match: {
          userId: user.userId,
          timestamp: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const currentApiUsage = apiUsage[0]?.totalCalls || 0;
    
    return NextResponse.json({
      success: true,
      user: {
        _id: userProfile._id,
        email: userProfile.email,
        fullName: userProfile.fullName,
        plan: userProfile.plan,
        subscriptionStatus: userProfile.subscriptionStatus,
        isVerified: userProfile.isVerified,
        createdAt: userProfile.createdAt,
        currentPeriodEnd: userProfile.currentPeriodEnd
      },
      stats: {
        websiteCount,
        ...analytics,
        conversionRate: analytics.totalClicks > 0 
          ? ((analytics.totalConversions / analytics.totalClicks) * 100).toFixed(2)
          : '0.00'
      },
      usage: {
        websites: {
          current: websiteCount,
          limit: userLimits.websites,
          percentage: userLimits.websites === Infinity 
            ? 0 
            : Math.round((websiteCount / userLimits.websites) * 100)
        },
        apiCalls: {
          current: currentApiUsage,
          limit: userLimits.apiCalls,
          percentage: Math.round((currentApiUsage / userLimits.apiCalls) * 100)
        }
      },
      recentActivity: recentWebsites.map(website => ({
        _id: website._id,
        name: website.name,
        status: website.status,
        updatedAt: website.updatedAt
      }))
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    
    if (error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await authenticateRequest(request);
    
    // Parse request body
    const body = await request.json();
    const { fullName, email, preferences } = body;
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Prepare update object
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (fullName) updateData.fullName = fullName;
    if (email) {
      // Check if email is already taken
      const existingUser = await db.collection('users').findOne({
        email,
        _id: { $ne: user.userId }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
      
      updateData.email = email;
      updateData.isVerified = false; // Require re-verification for new email
    }
    
    if (preferences) updateData.preferences = preferences;
    
    // Update user profile
    const result = await db.collection('users').updateOne(
      { _id: user.userId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Log profile update
    await db.collection('audit_logs').insertOne({
      userId: user.userId,
      action: 'profile_updated',
      details: {
        updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt')
      },
      timestamp: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
