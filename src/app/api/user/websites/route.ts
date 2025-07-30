import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

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
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Get user's websites
    const websites = await db.collection('generated_websites')
      .find({ userId: new ObjectId(user.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();

    // Format websites for response
    const formattedWebsites = websites.map(website => ({
      id: website._id.toString(),
      productUrl: website.productUrl,
      niche: website.niche,
      targetAudience: website.targetAudience,
      template: website.template,
      url: website.url,
      slug: website.slug,
      status: website.status,
      views: website.views || 0,
      clicks: website.clicks || 0,
      conversions: website.conversions || 0,
      createdAt: website.createdAt,
      updatedAt: website.updatedAt
    }));

    return NextResponse.json({
      success: true,
      websites: formattedWebsites,
      count: formattedWebsites.length
    });

  } catch (error) {
    console.error('Fetch websites error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch websites' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('id');

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Delete website (only if it belongs to the user)
    const result = await db.collection('generated_websites').deleteOne({
      _id: new ObjectId(websiteId),
      userId: new ObjectId(user.userId)
    });

    await client.close();

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Website not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Website deleted successfully'
    });

  } catch (error) {
    console.error('Delete website error:', error);
    return NextResponse.json(
      { error: 'Failed to delete website' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

