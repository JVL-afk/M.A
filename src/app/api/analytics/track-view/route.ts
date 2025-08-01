// VIEW TRACKING API ROUTE - src/app/api/analytics/track-view/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Website slug is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Update view count and last viewed timestamp
    const result = await db.collection('websites').updateOne(
      { slug: slug, isActive: true },
      { 
        $inc: { views: 1 },
        $set: { lastViewedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }

    // Log the view for analytics
    await db.collection('analytics').insertOne({
      type: 'view',
      slug: slug,
      timestamp: new Date(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      referer: request.headers.get('referer')
    });

    return NextResponse.json({
      success: true,
      message: 'View tracked successfully'
    });

  } catch (error) {
    console.error('View tracking error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to track view',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
