import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import clientPromise from '../../../../../lib/mongodb';
import { Collection, MongoClient, ObjectId } from 'mongodb';

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
  { params }: { params: { id: string } }
) {
  try {
// @ts-ignore
    const mongoClientPromise = clientPromise as Promise<MongoClient>;
    const client: MongoClient = await mongoClientPromise;
    const db = client.db('affilify');
    const websitesCollection: Collection<GeneratedWebsite> = db.collection<GeneratedWebsite>('generated_websites');

    const { id } = params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid website ID' }, { status: 400 });
    }

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
