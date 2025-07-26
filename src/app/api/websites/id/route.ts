import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../../lib/mongodb';
import { Collection, MongoClient, ObjectId } from 'mongodb';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

interface GeneratedWebsite {
  _id: ObjectId;
  content: string;
  createdAt: Date;
  websiteConfig: {
    niche?: string;
    product?: string;
    audience?: string;
    features?: string[];
    callToAction?: string;
  };
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Safely extract params with fallback
    const params = context?.params;
    if (!params || !params.id) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid website ID format' }, { status: 400 });
    }

    // Connect to database
    const client = await connectToDatabase();
    const db = client.db('affilify');
    const websitesCollection: Collection<GeneratedWebsite> = db.collection<GeneratedWebsite>('generated_websites');

    const website = await websitesCollection.findOne({ _id: new ObjectId(id) });

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, website });
  } catch (error) {
    console.error('Error fetching website:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Safely extract params with fallback
    const params = context?.params;
    if (!params || !params.id) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid website ID format' }, { status: 400 });
    }

    const body = await request.json();
    const { content, websiteConfig } = body;

    // Connect to database
    const client = await connectToDatabase();
    const db = client.db('affilify');
    const websitesCollection: Collection<GeneratedWebsite> = db.collection<GeneratedWebsite>('generated_websites');

    const updateData: any = {
      updatedAt: new Date()
    };

    if (content) updateData.content = content;
    if (websiteConfig) updateData.websiteConfig = websiteConfig;

    const result = await websitesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Website updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating website:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Safely extract params with fallback
    const params = context?.params;
    if (!params || !params.id) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid website ID format' }, { status: 400 });
    }

    // Connect to database
    const client = await connectToDatabase();
    const db = client.db('affilify');
    const websitesCollection: Collection<GeneratedWebsite> = db.collection<GeneratedWebsite>('generated_websites');

    const result = await websitesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Website deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting website:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
