// ENTERPRISE WEBSITES API ROUTE
// File: src/app/api/enterprise/websites/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Retrieve all websites for the Enterprise user
export async function GET(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    // Verify user is Enterprise
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user || user.plan !== 'enterprise') {
      return NextResponse.json({ error: 'Enterprise plan required' }, { status: 403 });
    }

    // Get all websites for this user
    const websites = await db.collection('generated_websites').find({
      userId: user._id
    }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      websites: websites.map(site => ({
        id: site._id,
        name: site.name,
        subdomain: site.subdomain,
        affiliateLink: site.affiliateLink,
        templateId: site.templateId,
        createdAt: site.createdAt,
        isActive: site.isActive
      }))
    });

  } catch (error) {
    console.error('Enterprise websites API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new website programmatically
export async function POST(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    // Verify user is Enterprise
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user || user.plan !== 'enterprise') {
      return NextResponse.json({ error: 'Enterprise plan required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, affiliateLink, productName, templateId = 'simple' } = body;

    // Validate required fields
    if (!name || !affiliateLink) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, affiliateLink' 
      }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(affiliateLink);
    } catch {
      return NextResponse.json({ error: 'Invalid affiliate link URL' }, { status: 400 });
    }

    // Generate website content
    const websiteContent = generateWebsiteContent(templateId, productName || 'Product', affiliateLink);
    const subdomain = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

    // Create website
    const newWebsite = {
      userId: user._id,
      name,
      productName: productName || null,
      affiliateLink,
      subdomain,
      templateId,
      content: websiteContent,
      createdAt: new Date(),
      isActive: true
    };

    const result = await db.collection('generated_websites').insertOne(newWebsite);

    return NextResponse.json({
      success: true,
      website: {
        id: result.insertedId,
        name,
        subdomain,
        affiliateLink,
        templateId,
        createdAt: newWebsite.createdAt
      }
    });

  } catch (error) {
    console.error('Enterprise website creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate website content
function generateWebsiteContent(templateId: string, productName: string, affiliateLink: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${productName} - Get Yours Today</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hero { text-align: center; padding: 80px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 20px; font-weight: bold; }
        .hero p { font-size: 1.3rem; margin-bottom: 40px; opacity: 0.9; }
        .cta-button { display: inline-block; background: #ff6b6b; color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1.1rem; transition: all 0.3s; }
        .cta-button:hover { background: #ff5252; transform: translateY(-2px); }
        .features { padding: 80px 0; background: #f8f9fa; }
        .features h2 { text-align: center; margin-bottom: 60px; font-size: 2.5rem; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
        .feature { text-align: center; padding: 40px 20px; background: white; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
        .feature h3 { margin-bottom: 20px; color: #667eea; }
        @media (max-width: 768px) { .hero h1 { font-size: 2.5rem; } }
    </style>
</head>
<body>
    <div class="hero">
        <div class="container">
            <h1>${productName}</h1>
            <p>Discover the perfect solution that will transform your life</p>
            <a href="${affiliateLink}" class="cta-button">Get Started Now</a>
        </div>
    </div>
    
    <div class="features">
        <div class="container">
            <h2>Why Choose ${productName}?</h2>
            <div class="feature-grid">
                <div class="feature">
                    <h3>Premium Quality</h3>
                    <p>Experience unmatched quality that exceeds expectations.</p>
                </div>
                <div class="feature">
                    <h3>Exceptional Value</h3>
                    <p>Get the most bang for your buck with incredible features.</p>
                </div>
                <div class="feature">
                    <h3>24/7 Support</h3>
                    <p>Round-the-clock support ensures you're never left hanging.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}
