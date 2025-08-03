// 🚀 FIXED AFFILIFY AI GENERATION API ROUTE
// File: src/app/api/ai/generate-website/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;
const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY!;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// MongoDB connection
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

// Verify JWT token
function verifyToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    throw new Error('No authentication token');
  }
  
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const decoded = verifyToken(request);
    const userId = decoded.userId;

    const { productUrl, productName, description, targetAudience } = await request.json();

    // Validation
    if (!productUrl || !productName) {
      return NextResponse.json(
        { error: 'Product URL and name are required' },
        { status: 400 }
      );
    }

    // Connect to database
    const client = await clientPromise;
    const db = client.db('affilify');
    const users = db.collection('users');
    const websites = db.collection('websites');

    // Get user and check limits
    const user = await users.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check website creation limits
    const websitesCreated = user.websitesCreated || 0;
    const websiteLimit = user.websiteLimit || 3;

    if (websiteLimit !== -1 && websitesCreated >= websiteLimit) {
      return NextResponse.json(
        { 
          error: 'Website limit reached',
          message: `You've reached your limit of ${websiteLimit} websites. Upgrade your plan to create more.`,
          upgradeRequired: true
        },
        { status: 403 }
      );
    }

    // Generate AI content using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    Create a high-converting affiliate marketing website for the following product:
    
    Product Name: ${productName}
    Product URL: ${productUrl}
    Description: ${description || 'N/A'}
    Target Audience: ${targetAudience || 'General audience'}
    
    Generate a complete HTML website with the following sections:
    1. Compelling headline that grabs attention
    2. Product benefits and features
    3. Social proof and testimonials
    4. Clear call-to-action buttons
    5. FAQ section
    6. Professional styling with CSS
    
    Make it conversion-optimized and mobile-responsive. Include proper affiliate link integration.
    Return only the complete HTML code with embedded CSS.
    `;

    const result = await model.generateContent(prompt);
    const generatedContent = result.response.text();

    // Create website slug
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Save website to database
    const website = {
      userId: userId,
      title: productName,
      slug: slug,
      productUrl: productUrl,
      description: description || '',
      targetAudience: targetAudience || 'General audience',
      htmlContent: generatedContent,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: true,
      views: 0,
      clicks: 0,
      conversions: 0,
      status: 'active'
    };

    const websiteResult = await websites.insertOne(website);

    // Update user's website count
    await users.updateOne(
      { _id: userId },
      { $inc: { websitesCreated: 1 } }
    );

    // Return success response
    return NextResponse.json({
      message: 'Website generated successfully',
      website: {
        id: websiteResult.insertedId,
        title: productName,
        slug: slug,
        url: `https://affilify.eu/websites/${slug}`,
        createdAt: website.createdAt
      },
      user: {
        websitesCreated: websitesCreated + 1,
        websiteLimit: websiteLimit
      }
    });

  } catch (error) {
    console.error('AI Generation error:', error);
    
    if (error.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate website' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
