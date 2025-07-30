import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { websiteId, type, url } = await request.json();
    
    if (!websiteId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { db, client } = await connectToDatabase();
    
    try {
      // Record the analytics event
      const analyticsEvent = {
        websiteId,
        type,
        url,
        timestamp: new Date(),
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      };
      
      await db.collection('analytics_events').insertOne(analyticsEvent);
      
      // Update website analytics counters
      const updateField = type === 'affiliate_click' ? 'analytics.clicks' : 'analytics.views';
      await db.collection('generated_websites').updateOne(
        { _id: websiteId },
        { 
          $inc: { [updateField]: 1 },
          $set: { 'analytics.lastActivity': new Date() }
        }
      );
      
      return NextResponse.json({ success: true });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}
