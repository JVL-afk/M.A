// WEBSITE API ROUTE - src/app/api/websites/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Website slug is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Find website by slug
    const website = await db.collection('websites').findOne({ 
      slug: slug,
      isActive: true 
    });

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }

    // Calculate analytics
    const analytics = {
      views: website.views || 0,
      clicks: website.clicks || 0,
      conversionRate: website.views > 0 ? ((website.clicks || 0) / website.views) * 100 : 0,
      lastViewed: website.lastViewedAt || website.createdAt
    };

    return NextResponse.json({
      success: true,
      website: {
        id: website._id.toString(),
        slug: website.slug,
        title: website.title,
        description: website.description,
        html: website.html,
        productUrl: website.productUrl,
        template: website.template,
        createdAt: website.createdAt,
        views: website.views || 0,
        clicks: website.clicks || 0,
        isActive: website.isActive,
        productInfo: website.productInfo
      },
      analytics
    });

  } catch (error) {
    console.error('Website fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch website',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
