import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { authenticateRequest } from '../../../../lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await authenticateRequest(request);
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get user's websites
    const websites = await db.collection('websites').find({ 
      userId: user.userId 
    }).sort({ createdAt: -1 }).toArray();
    
    // Get analytics for each website
    const websitesWithAnalytics = await Promise.all(
      websites.map(async (website) => {
        const analytics = await db.collection('analytics').findOne({
          websiteId: website._id.toString()
        });
        
        return {
          ...website,
          views: analytics?.totalViews || 0,
          clicks: analytics?.totalClicks || 0,
          conversions: analytics?.totalConversions || 0,
          revenue: analytics?.totalRevenue || 0
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      websites: websitesWithAnalytics
    });
    
  } catch (error) {
    console.error('Dashboard websites error:', error);
    
    if (error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch websites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const user = await authenticateRequest(request);
    
    // Parse request body
    const body = await request.json();
    const { name, description, niche, affiliateLinks, template } = body;
    
    // Validate required fields
    if (!name || !niche || !affiliateLinks || !Array.isArray(affiliateLinks)) {
      return NextResponse.json(
        { error: 'Missing required fields: name, niche, affiliateLinks' },
        { status: 400 }
      );
    }
    
    // Check plan limits
    const { db } = await connectToDatabase();
    const existingWebsites = await db.collection('websites').countDocuments({
      userId: user.userId
    });
    
    const planLimits = {
      basic: 5,
      pro: 25,
      enterprise: Infinity
    };
    
    const userLimit = planLimits[user.plan] || planLimits.basic;
    
    if (existingWebsites >= userLimit) {
      return NextResponse.json(
        { error: `Plan limit reached. ${user.plan} plan allows ${userLimit} websites.` },
        { status: 403 }
      );
    }
    
    // Create new website
    const website = {
      userId: user.userId,
      name,
      description: description || '',
      niche,
      affiliateLinks,
      template: template || 'modern',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('websites').insertOne(website);
    
    // Initialize analytics
    await db.collection('analytics').insertOne({
      websiteId: result.insertedId.toString(),
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
      createdAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      website: {
        ...website,
        _id: result.insertedId
      }
    });
    
  } catch (error) {
    console.error('Create website error:', error);
    
    if (error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create website' },
      { status: 500 }
    );
  }
}
