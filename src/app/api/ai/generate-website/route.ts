// FIXED AI Generation API Route
// File: src/app/api/ai/generate-website/route.ts
// This provides production-ready AI website generation using Google Gemini

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '../../../lib/mongodb';
import jwt from 'jsonwebtoken';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface WebsiteData {
  title: string;
  description: string;
  content: string;
  productUrl: string;
  affiliateLink: string;
  slug: string;
  userId: string;
  createdAt: Date;
  analytics: {
    views: number;
    clicks: number;
    conversions: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse request body
    const { productUrl, affiliateLink, customPrompt } = await request.json();

    if (!productUrl || !affiliateLink) {
      return NextResponse.json({ 
        error: 'Product URL and affiliate link are required' 
      }, { status: 400 });
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Generate website content using Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Create a high-converting affiliate marketing website for the following product:
Product URL: ${productUrl}
Affiliate Link: ${affiliateLink}
${customPrompt ? `Additional requirements: ${customPrompt}` : ''}

Please provide a JSON response with the following structure:
{
  "title": "Compelling product title",
  "description": "SEO-optimized meta description (150-160 characters)",
  "content": "Complete HTML content for the landing page including hero section, features, benefits, testimonials, and strong call-to-action buttons",
  "keywords": ["relevant", "seo", "keywords"],
  "slug": "url-friendly-slug"
}

Requirements:
- Create compelling, conversion-focused copy
- Include multiple call-to-action buttons with the affiliate link
- Use persuasive marketing language
- Include social proof elements
- Make it mobile-responsive
- Focus on benefits over features
- Create urgency and scarcity
- Include trust signals
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse AI response
    let websiteData: any;
    try {
      // Extract JSON from AI response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        websiteData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      // Fallback: create structured data from AI text
      websiteData = {
        title: `Amazing ${productUrl.split('/').pop()} - Limited Time Offer!`,
        description: `Discover the incredible benefits of this amazing product. Get yours today with our exclusive offer!`,
        content: `
          <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div class="container mx-auto px-4 py-8">
              <div class="text-center mb-12">
                <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Transform Your Life Today!
                </h1>
                <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  ${text.substring(0, 200)}...
                </p>
                <a href="${affiliateLink}" class="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition duration-300 transform hover:scale-105">
                  Get Yours Now - Limited Time!
                </a>
              </div>
              
              <div class="grid md:grid-cols-3 gap-8 mb-12">
                <div class="bg-white p-6 rounded-lg shadow-lg">
                  <h3 class="text-2xl font-bold mb-4">Amazing Quality</h3>
                  <p class="text-gray-600">Experience the difference with premium quality that exceeds expectations.</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-lg">
                  <h3 class="text-2xl font-bold mb-4">Fast Results</h3>
                  <p class="text-gray-600">See incredible results in just days, not weeks or months.</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-lg">
                  <h3 class="text-2xl font-bold mb-4">Money-Back Guarantee</h3>
                  <p class="text-gray-600">100% satisfaction guaranteed or your money back, no questions asked.</p>
                </div>
              </div>
              
              <div class="text-center">
                <a href="${affiliateLink}" class="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition duration-300 transform hover:scale-105">
                  Order Now - Don't Miss Out!
                </a>
              </div>
            </div>
          </div>
        `,
        keywords: ['affiliate', 'product', 'offer', 'deal'],
        slug: productUrl.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'product'
      };
    }

    // Generate unique slug
    const baseSlug = websiteData.slug || 'website';
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await db.collection('websites').findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Prepare website document
    const websiteDocument: WebsiteData = {
      title: websiteData.title,
      description: websiteData.description,
      content: websiteData.content,
      productUrl,
      affiliateLink,
      slug: uniqueSlug,
      userId,
      createdAt: new Date(),
      analytics: {
        views: 0,
        clicks: 0,
        conversions: 0
      }
    };

    // Save to database
    const result_db = await db.collection('websites').insertOne(websiteDocument);

    return NextResponse.json({
      success: true,
      website: {
        id: result_db.insertedId,
        slug: uniqueSlug,
        title: websiteData.title,
        url: `/websites/${uniqueSlug}`
      }
    });

  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({
      error: 'Failed to generate website',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Get user's websites
    const websites = await db.collection('websites')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      websites: websites.map(site => ({
        id: site._id,
        title: site.title,
        slug: site.slug,
        createdAt: site.createdAt,
        analytics: site.analytics,
        url: `/websites/${site.slug}`
      }))
    });

  } catch (error) {
    console.error('Get Websites Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch websites',
      details: error.message
    }, { status: 500 });
  }
}
