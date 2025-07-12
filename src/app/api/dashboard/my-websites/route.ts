import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import clientPromise from '../../../../../lib/mongodb'; // Adjust path if necessary

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Get userId from query param

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

// @ts-ignore
    const client = await clientPromise;
    const db = client.db('affilify'); // Use your database name
    const websitesCollection = db.collection('generatedWebsites');

    // Fetch websites for the specific user, sorted by creation date
    const userWebsites = await websitesCollection.find({ userId })
                                                .sort({ createdAt: -1 }) // Newest first
                                                .toArray();

    return NextResponse.json({
      success: true,
      websites: userWebsites,
    });
  } catch (error: any) {
    console.error('Error fetching user websites:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error fetching websites' },
      { status: 500 }
    );
  }
}
