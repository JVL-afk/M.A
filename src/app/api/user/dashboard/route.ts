import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import clientPromise from '../../../../../lib/mongodb';
import { Collection, MongoClient, ObjectId } from 'mongodb';

// Define an interface for the Website object
interface Website {
  id: string;
  clicks: number;
  // Add other properties of your website object if they exist
}

// Define an interface for the UserData object
interface UserData {
  analytics: {
    last30Days: {
      clicks: number;
    };
  };
  websites: Website[];
  // Add other properties of your user data if they exist
}

export async function POST(request: NextRequest) {
  try {
// @ts-ignore
    const client: MongoClient = await clientPromise;
    const db = client.db('affilify');
    const usersCollection: Collection<UserData> = db.collection<UserData>('users');

    const data = await request.json();
    const userId = data.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const userData = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!userData) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }

    // Ensure analytics and last30Days exist
    if (!userData.analytics || !userData.analytics.last30Days) {
      userData.analytics = { last30Days: { clicks: 0 } };
    }

    // Increment total clicks for the last 30 days
    userData.analytics.last30Days.clicks += 1;

    // Find the specific website and track daily clicks
    const website = userData.websites.find((w: Website) => w.id === data.websiteId);

    if (website) {
      website.clicks += 1;
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: userData }
    );

    return NextResponse.json({ success: true, message: 'Click tracked successfully' });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ error: 'Internal Server Error', success: false }, { status: 500 });
  }
}
