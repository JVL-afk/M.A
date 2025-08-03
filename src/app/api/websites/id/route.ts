import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { authenticateRequest } from '../../../../lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const websiteId = params.id;
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get website details
    const website = await db.collection('websites').findOne({
      _id: websiteId
    });
    
    if (!website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }
    
    // Get analytics data
    const analytics = await db.collection('analytics').findOne({
      websiteId: websiteId
    });
    
    // Track view if this is a public access
    const isPublicView = !request.headers.get('authorization') && 
                        !request.cookies.get('auth-token');
    
    if (isPublicView) {
      // Increment view count
      await db.collection('analytics').updateOne(
        { websiteId: websiteId },
        { 
          $inc: { totalViews: 1 },
          $set: { lastViewed: new Date() }
        },
        { upsert: true }
      );
      
      // Log the view
      await db.collection('view_logs').insertOne({
        websiteId: websiteId,
        timestamp: new Date(),
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        ip: request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown'
      });
    }
    
    return NextResponse.json({
      success: true,
      website: {
        _id: website._id,
        name: website.name,
        description: website.description,
        niche: website.niche,
        affiliateLinks: website.affiliateLinks,
        template: website.template,
        content: website.content,
        status: website.status,
        createdAt: website.createdAt,
        updatedAt: website.updatedAt
      },
      analytics: {
        views: analytics?.totalViews || 0,
        clicks: analytics?.totalClicks || 0,
        conversions: analytics?.totalConversions || 0,
        revenue: analytics?.totalRevenue || 0,
        lastViewed: analytics?.lastViewed
      }
    });
    
  } catch (error) {
    console.error('Get website error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch website' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const user = await authenticateRequest(request);
    const websiteId = params.id;
    
    // Parse request body
    const body = await request.json();
    const { name, description, affiliateLinks, template, content, status } = body;
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Check if user owns this website
    const website = await db.collection('websites').findOne({
      _id: websiteId,
      userId: user.userId
    });
    
    if (!website) {
      return NextResponse.json(
        { error: 'Website not found or access denied' },
        { status: 404 }
      );
    }
    
    // Prepare update object
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (affiliateLinks) updateData.affiliateLinks = affiliateLinks;
    if (template) updateData.template = template;
    if (content) updateData.content = content;
    if (status) updateData.status = status;
    
    // Update website
    const result = await db.collection('websites').updateOne(
      { _id: websiteId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update website' },
        { status: 500 }
      );
    }
    
    // Log the update
    await db.collection('audit_logs').insertOne({
      userId: user.userId,
      action: 'website_updated',
      details: {
        websiteId,
        updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt')
      },
      timestamp: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Website updated successfully'
    });
    
  } catch (error) {
    console.error('Update website error:', error);
    
    if (error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update website' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const user = await authenticateRequest(request);
    const websiteId = params.id;
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Check if user owns this website
    const website = await db.collection('websites').findOne({
      _id: websiteId,
      userId: user.userId
    });
    
    if (!website) {
      return NextResponse.json(
        { error: 'Website not found or access denied' },
        { status: 404 }
      );
    }
    
    // Delete website and related data
    await Promise.all([
      db.collection('websites').deleteOne({ _id: websiteId }),
      db.collection('analytics').deleteOne({ websiteId: websiteId }),
      db.collection('view_logs').deleteMany({ websiteId: websiteId })
    ]);
    
    // Log the deletion
    await db.collection('audit_logs').insertOne({
      userId: user.userId,
      action: 'website_deleted',
      details: {
        websiteId,
        websiteName: website.name
      },
      timestamp: new Date()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Website deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete website error:', error);
    
    if (error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete website' },
      { status: 500 }
    );
  }
}

