// ENTERPRISE ANALYTICS API ROUTE
// File: src/app/api/enterprise/analytics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Retrieve analytics data for Enterprise user
export async function GET(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    // Verify user is Enterprise
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user || user.plan !== 'enterprise') {
      return NextResponse.json({ error: 'Enterprise plan required' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const websiteId = searchParams.get('websiteId');

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    // Build analytics query
    const analyticsQuery: any = { userId: user._id };
    if (Object.keys(dateFilter).length > 0) {
      analyticsQuery.createdAt = dateFilter;
    }
    if (websiteId) {
      analyticsQuery.websiteId = new ObjectId(websiteId);
    }

    // Get analytics data
    const analytics = await db.collection('analytics_events').find(analyticsQuery).toArray();

    // Process analytics data
    const totalClicks = analytics.filter(event => event.type === 'click').length;
    const totalConversions = analytics.filter(event => event.type === 'conversion').length;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Group by date for daily analytics
    const dailyAnalytics = analytics.reduce((acc: any, event) => {
      const date = event.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { clicks: 0, conversions: 0, revenue: 0 };
      }
      if (event.type === 'click') acc[date].clicks++;
      if (event.type === 'conversion') {
        acc[date].conversions++;
        acc[date].revenue += event.revenue || 0;
      }
      return acc;
    }, {});

    // Group by traffic source
    const trafficSources = analytics.reduce((acc: any, event) => {
      const source = event.source || 'direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // Group by device type
    const deviceTypes = analytics.reduce((acc: any, event) => {
      const device = event.device || 'desktop';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    // Group by country
    const countries = analytics.reduce((acc: any, event) => {
      const country = event.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    // Get top performing websites
    const websitePerformance = await db.collection('analytics_events').aggregate([
      { $match: { userId: user._id, type: 'conversion' } },
      { $group: {
        _id: '$websiteId',
        totalRevenue: { $sum: '$revenue' },
        totalConversions: { $sum: 1 }
      }},
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]).toArray();

    return NextResponse.json({
      success: true,
      analytics: {
        summary: {
          totalClicks,
          totalConversions,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          totalRevenue: analytics
            .filter(event => event.type === 'conversion')
            .reduce((sum, event) => sum + (event.revenue || 0), 0)
        },
        dailyAnalytics,
        trafficSources,
        deviceTypes,
        countries,
        topWebsites: websitePerformance
      }
    });

  } catch (error) {
    console.error('Enterprise analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Track analytics event
export async function POST(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    // Verify user is Enterprise
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user || user.plan !== 'enterprise') {
      return NextResponse.json({ error: 'Enterprise plan required' }, { status: 403 });
    }

    const body = await request.json();
    const { websiteId, type, revenue, source, device, country } = body;

    // Validate required fields
    if (!websiteId || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields: websiteId, type' 
      }, { status: 400 });
    }

    // Create analytics event
    const analyticsEvent = {
      userId: user._id,
      websiteId: new ObjectId(websiteId),
      type, // 'click' or 'conversion'
      revenue: revenue || 0,
      source: source || 'direct',
      device: device || 'desktop',
      country: country || 'Unknown',
      createdAt: new Date()
    };

    await db.collection('analytics_events').insertOne(analyticsEvent);

    return NextResponse.json({
      success: true,
      message: 'Analytics event tracked successfully'
    });

  } catch (error) {
    console.error('Enterprise analytics tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
