import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { action, websiteId, websiteUrl, productName, clicks, conversions, revenue, metadata } = await request.json();

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
    }

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
    
    // Get user information
    const user = await db.collection('users').findOne({ _id: decoded.userId });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Create analytics record
    const analyticsRecord = {
      userId: decoded.userId,
      action: action,
      websiteId: websiteId || null,
      websiteUrl: websiteUrl || null,
      productName: productName || null,
      clicks: clicks || 0,
      conversions: conversions || 0,
      revenue: revenue || 0,
      timestamp: new Date(),
      plan: user.plan,
      metadata: metadata || {}
    };

    // Insert analytics record
    const insertResult = await db.collection('user_analytics').insertOne(analyticsRecord);

    // Update user's total statistics if this is a significant action
    const updateFields: any = {};
    
    if (clicks && clicks > 0) {
      updateFields.totalClicks = (user.totalClicks || 0) + clicks;
    }
    
    if (revenue && revenue > 0) {
      updateFields.totalRevenue = (user.totalRevenue || 0) + revenue;
    }

    if (Object.keys(updateFields).length > 0) {
      updateFields.updatedAt = new Date();
      await db.collection('users').updateOne(
        { _id: decoded.userId },
        { $set: updateFields }
      );
    }

    // Update website-specific statistics if websiteId is provided
    if (websiteId) {
      const websiteUpdateFields: any = {};
      
      if (clicks && clicks > 0) {
        websiteUpdateFields.$inc = { clicks: clicks };
      }
      
      if (conversions && conversions > 0) {
        websiteUpdateFields.$inc = { ...websiteUpdateFields.$inc, conversions: conversions };
      }
      
      if (revenue && revenue > 0) {
        websiteUpdateFields.$inc = { ...websiteUpdateFields.$inc, revenue: revenue };
      }

      if (Object.keys(websiteUpdateFields).length > 0) {
        websiteUpdateFields.$set = { updatedAt: new Date() };
        
        await db.collection('generated_websites').updateOne(
          { _id: websiteId, userId: decoded.userId },
          websiteUpdateFields
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics tracked successfully',
      recordId: insertResult.insertedId
    });

  } catch (error: any) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track analytics: ' + error.message },
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

    // Get query parameters
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const action = url.searchParams.get('action');

    // Connect to database
    const { db } = await connectToDatabase();

    // Build query
    const query: any = {
      userId: decoded.userId,
      timestamp: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    };

    if (action) {
      query.action = action;
    }

    // Get analytics data
    const analyticsData = await db.collection('user_analytics')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(1000)
      .toArray();

    // Aggregate data by day
    const dailyStats = analyticsData.reduce((acc: any, record: any) => {
      const date = record.timestamp.toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          actions: 0
        };
      }
      
      acc[date].clicks += record.clicks || 0;
      acc[date].conversions += record.conversions || 0;
      acc[date].revenue += record.revenue || 0;
      acc[date].actions += 1;
      
      return acc;
    }, {});

    const dailyStatsArray = Object.values(dailyStats).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      success: true,
      data: {
        totalRecords: analyticsData.length,
        dailyStats: dailyStatsArray,
        recentActions: analyticsData.slice(0, 50)
      }
    });

  } catch (error: any) {
    console.error('Analytics retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analytics: ' + error.message },
      { status: 500 }
    );
  }
}
