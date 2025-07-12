import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import clientPromise from '../../../../../lib/mongodb';
import { Collection, MongoClient, ObjectId } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface User {
  _id: ObjectId;
  plan: string;
  generationsUsed: number;
  analysesUsed: number;
}

export async function POST(request: NextRequest) {
  try {
// @ts-ignore
    const client: MongoClient = await clientPromise;
    const db = client.db('affilify');
    const usersCollection: Collection<User> = db.collection<User>('users');

    const { userId, websiteConfig } = await request.json();

    if (!userId || !websiteConfig) {
      return NextResponse.json({ error: 'Missing userId or websiteConfig' }, { status: 400 });
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ error: 'User not found', success: false }, { status: 404 });
    }

    const plan = user.plan || 'free';
    const generationsUsed = user.generationsUsed || 0;

    let generationLimit = 0;
    if (plan === 'free') {
      generationLimit = 3;
    } else if (plan === 'pro') {
      generationLimit = 10;
    } else if (plan === 'enterprise') {
      generationLimit = Infinity;
    }

    if (generationsUsed >= generationLimit) {
      return NextResponse.json({ error: 'Generation limit reached for your plan', success: false }, { status: 403 });
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using gemini-1.5-flash

    // Construct a detailed prompt for website content generation
    const prompt = `Generate personalized website content based on the following configuration:\n    Niche: ${websiteConfig.niche || 'general'}\n    Product/Service: ${websiteConfig.product || 'various'}\n    Target Audience: ${websiteConfig.audience || 'general'}\n    Key Features/Benefits: ${websiteConfig.features ? websiteConfig.features.join(', ') : 'N/A'}\n    Call to Action: ${websiteConfig.callToAction || 'Learn More'}\n\n    Provide the content in a structured JSON format, including sections like 'hero', 'about', 'services', 'testimonials', 'contact'. Each section should have a title and detailed body text. Ensure the content is engaging and relevant to the specified configuration.`;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const generatedContent = aiResponse.text();

    // In a real application, you would then use this generatedContent to build the actual website.
    // For now, we'll return it as part of the response.
    const generatedWebsiteUrl = `https://affilify.ai/websites/${new Date( ).getTime()}`;

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { generationsUsed: 1 } }
    );

    return NextResponse.json({ success: true, websiteUrl: generatedWebsiteUrl, generatedContent: generatedContent });
  } catch (error) {
    console.error('Error generating website:', error);
    return NextResponse.json({ error: 'Internal Server Error', success: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'GET request to generate website' });
}

export async function PUT() {
  return NextResponse.json({ message: 'PUT request to generate website' });
}

export async function DELETE() {
  return NextResponse.json({ message: 'DELETE request to generate website' });
}
