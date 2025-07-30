import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { productUrl, niche, targetAudience, template } = await request.json();

    if (!productUrl) {
      return NextResponse.json(
        { error: 'Product URL is required' },
        { status: 400 }
      );
    }

    // Connect to database
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Check user's plan and website count
    const dbUser = await db.collection('users').findOne({ 
      _id: new ObjectId(user.userId) 
    });

    if (!dbUser) {
      await client.close();
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userPlan = dbUser.plan || 'basic';
    const planLimits = {
      basic: 3,
      pro: 10,
      enterprise: Infinity
    };

    const websiteCount = await db.collection('generated_websites').countDocuments({
      userId: new ObjectId(user.userId)
    });

    if (websiteCount >= planLimits[userPlan]) {
      await client.close();
      return NextResponse.json(
        { error: 'Website limit reached for your plan' },
        { status: 403 }
      );
    }

    // Fetch product information
    let productInfo = '';
    try {
      const response = await fetch(productUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      if (response.ok) {
        const html = await response.text();
        // Extract basic info from HTML
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
        
        productInfo = `
        Title: ${titleMatch ? titleMatch[1] : 'Product'}
        Description: ${descMatch ? descMatch[1] : 'Amazing product'}
        URL: ${productUrl}
        `;
      }
    } catch (error) {
      console.log('Could not fetch product info, using URL only');
      productInfo = `Product URL: ${productUrl}`;
    }

    // Generate website content with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Create a high-converting affiliate marketing website for this product:

${productInfo}

Niche: ${niche || 'Auto-detect from product'}
Target Audience: ${targetAudience || 'Auto-detect from product'}
Template Style: ${template}

Generate a complete HTML website with:
1. Compelling headline that grabs attention
2. Product benefits and features
3. Social proof and testimonials
4. Strong call-to-action buttons
5. Mobile-responsive design
6. SEO-optimized content
7. Conversion-focused layout

Make it professional, trustworthy, and designed to convert visitors into customers.
Use modern CSS with gradients, animations, and beautiful typography.
Include the affiliate link: ${productUrl}

Return only the complete HTML code, no explanations.`;

    const result = await model.generateContent(prompt);
    const websiteHtml = result.response.text();

    // Generate a unique website ID and URL
    const websiteId = new ObjectId();
    const websiteSlug = `site-${websiteId.toString().slice(-8)}`;
    const websiteUrl = `https://affilify.eu/sites/${websiteSlug}`;

    // Save website to database
    const websiteData = {
      _id: websiteId,
      userId: new ObjectId(user.userId ),
      productUrl,
      niche: niche || 'Auto-detected',
      targetAudience: targetAudience || 'Auto-detected',
      template,
      html: websiteHtml,
      slug: websiteSlug,
      url: websiteUrl,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      clicks: 0,
      conversions: 0
    };

    await db.collection('generated_websites').insertOne(websiteData);
    await client.close();

    return NextResponse.json({
      success: true,
      website: {
        id: websiteId.toString(),
        url: websiteUrl,
        slug: websiteSlug,
        productUrl,
        niche: websiteData.niche,
        targetAudience: websiteData.targetAudience,
        template,
        createdAt: websiteData.createdAt
      },
      message: 'Website created successfully!'
    });

  } catch (error) {
    console.error('Website generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate website',
        details: error.message
      },
      { status: 500 }
    );
  }
}

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
