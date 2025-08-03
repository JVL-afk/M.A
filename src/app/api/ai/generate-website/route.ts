// CORRECTED AI GENERATION SYSTEM - FIXED IMPORT PATHS
// Replace: src/app/api/ai/generate-website/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '../../../../../lib/mongodb';
import jwt from 'jsonwebtoken';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface WebsiteGenerationRequest {
  productUrl: string;
  affiliateLink: string;
  niche?: string;
  customPrompt?: string;
  template?: 'modern' | 'professional' | 'vibrant';
  colorScheme?: string;
}

interface GeneratedWebsite {
  id: string;
  title: string;
  description: string;
  content: string;
  slug: string;
  productUrl: string;
  affiliateLink: string;
  userId: string;
  createdAt: Date;
  analytics: {
    views: number;
    clicks: number;
    conversions: number;
  };
  metadata: {
    keywords: string[];
    template: string;
    aiGenerated: boolean;
  };
}

// PLAN LIMITS
const PLAN_LIMITS = {
  basic: { websites: 3, aiGenerations: 5 },
  pro: { websites: 50, aiGenerations: 100 },
  enterprise: { websites: -1, aiGenerations: -1 }, // Unlimited
};

export async function POST(request: NextRequest) {
  try {
    // 1. VERIFY AUTHENTICATION
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    let userId: string;
    let userPlan: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
        userId: string; 
        plan: string; 
      };
      userId = decoded.userId;
      userPlan = decoded.plan || 'basic';
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid authentication token',
        code: 'INVALID_TOKEN' 
      }, { status: 401 });
    }

    // 2. PARSE REQUEST
    const { 
      productUrl, 
      affiliateLink, 
      niche, 
      customPrompt, 
      template = 'modern',
      colorScheme 
    }: WebsiteGenerationRequest = await request.json();

    if (!productUrl || !affiliateLink) {
      return NextResponse.json({ 
        error: 'Product URL and affiliate link are required',
        code: 'MISSING_REQUIRED_FIELDS' 
      }, { status: 400 });
    }

    // 3. CONNECT TO DATABASE
    const { db } = await connectToDatabase();

    // 4. CHECK USER PLAN AND LIMITS
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    const currentPlan = user.subscription?.planType || 'basic';
    const limits = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS];

    // Check website count limit
    if (limits.websites !== -1) {
      const websiteCount = await db.collection('websites').countDocuments({ userId });
      if (websiteCount >= limits.websites) {
        return NextResponse.json({ 
          error: 'Website limit reached for your plan',
          code: 'LIMIT_REACHED',
          currentCount: websiteCount,
          limit: limits.websites,
          plan: currentPlan
        }, { status: 403 });
      }
    }

    // Check AI generation limit (monthly)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    if (limits.aiGenerations !== -1) {
      const monthlyGenerations = await db.collection('ai_generations').countDocuments({
        userId,
        createdAt: { $gte: startOfMonth }
      });

      if (monthlyGenerations >= limits.aiGenerations) {
        return NextResponse.json({ 
          error: 'Monthly AI generation limit reached',
          code: 'AI_LIMIT_REACHED',
          currentCount: monthlyGenerations,
          limit: limits.aiGenerations,
          plan: currentPlan
        }, { status: 403 });
      }
    }

    // 5. ANALYZE PRODUCT URL (Extract product info)
    let productInfo = '';
    try {
      // Simple URL analysis - in production, you might want to scrape the page
      const urlParts = productUrl.split('/');
      const productName = urlParts[urlParts.length - 1]
        .replace(/[-_]/g, ' ')
        .replace(/\.(html|php|aspx?)$/i, '')
        .replace(/\?.*$/, '');
      
      productInfo = `Product: ${productName}`;
    } catch (error) {
      productInfo = 'Product from provided URL';
    }

    // 6. GENERATE CONTENT WITH GEMINI AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Create a high-converting affiliate marketing website for the following product:

Product URL: ${productUrl}
Affiliate Link: ${affiliateLink}
${niche ? `Niche: ${niche}` : ''}
${customPrompt ? `Additional Requirements: ${customPrompt}` : ''}
Template Style: ${template}
${colorScheme ? `Color Scheme: ${colorScheme}` : ''}

Please provide a JSON response with this exact structure:
{
  "title": "Compelling SEO-optimized title (max 60 characters)",
  "description": "Meta description for SEO (150-160 characters)",
  "content": "Complete HTML content for a high-converting landing page",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "slug": "url-friendly-slug"
}

Requirements for the HTML content:
1. Create a complete, responsive HTML page with inline CSS
2. Include compelling hero section with strong value proposition
3. Add product features and benefits sections
4. Include social proof (testimonials, reviews)
5. Multiple call-to-action buttons using the affiliate link
6. Mobile-responsive design
7. Fast loading and SEO optimized
8. Use persuasive copywriting techniques
9. Include urgency and scarcity elements
10. Professional design matching the ${template} template style

Make it conversion-focused and professional. The affiliate link should be used in multiple strategic locations.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    // 7. PARSE AI RESPONSE
    let websiteData: any;
    try {
      // Extract JSON from AI response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        websiteData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      // Fallback: Create structured data from AI text
      const fallbackSlug = productUrl.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'product';
      
      websiteData = {
        title: `Amazing ${productInfo} - Limited Time Offer!`,
        description: `Discover the incredible benefits of this amazing product. Get yours today with our exclusive offer!`,
        content: createFallbackHTML(productInfo, affiliateLink, template),
        keywords: ['affiliate', 'product', 'offer', 'deal', 'review'],
        slug: fallbackSlug
      };
    }

    // 8. GENERATE UNIQUE SLUG
    const baseSlug = websiteData.slug || 'website';
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await db.collection('websites').findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 9. SAVE TO DATABASE
    const websiteDocument: GeneratedWebsite = {
      id: '', // Will be set by MongoDB
      title: websiteData.title,
      description: websiteData.description,
      content: websiteData.content,
      slug: uniqueSlug,
      productUrl,
      affiliateLink,
      userId,
      createdAt: new Date(),
      analytics: {
        views: 0,
        clicks: 0,
        conversions: 0
      },
      metadata: {
        keywords: websiteData.keywords || [],
        template,
        aiGenerated: true
      }
    };

    const websiteResult = await db.collection('websites').insertOne(websiteDocument);
    
    // 10. LOG AI GENERATION
    await db.collection('ai_generations').insertOne({
      userId,
      websiteId: websiteResult.insertedId,
      prompt: prompt.substring(0, 500), // Store truncated prompt
      tokensUsed: aiText.length, // Approximate
      createdAt: new Date(),
      plan: currentPlan
    });

    // 11. UPDATE USER STATS
    await db.collection('users').updateOne(
      { _id: userId },
      { 
        $inc: { 
          'stats.websitesGenerated': 1,
          'stats.aiGenerationsUsed': 1
        },
        $set: { 'stats.lastGeneratedAt': new Date() }
      }
    );

    return NextResponse.json({
      success: true,
      website: {
        id: websiteResult.insertedId,
        title: websiteData.title,
        slug: uniqueSlug,
        url: `/websites/${uniqueSlug}`,
        createdAt: new Date(),
        analytics: {
          views: 0,
          clicks: 0,
          conversions: 0
        }
      },
      usage: {
        plan: currentPlan,
        websitesUsed: await db.collection('websites').countDocuments({ userId }) + 1,
        websiteLimit: limits.websites === -1 ? 'Unlimited' : limits.websites,
        aiGenerationsThisMonth: await db.collection('ai_generations').countDocuments({
          userId,
          createdAt: { $gte: startOfMonth }
        }) + 1,
        aiGenerationLimit: limits.aiGenerations === -1 ? 'Unlimited' : limits.aiGenerations
      }
    });

  } catch (error: any) {
    console.error('AI Generation Error:', error);

    // Log error
    try {
      const { db } = await connectToDatabase();
      await db.collection('error_logs').insertOne({
        error: error.message,
        stack: error.stack,
        endpoint: '/api/ai/generate-website',
        timestamp: new Date(),
        type: 'ai_generation_error',
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json({
      error: 'Failed to generate website',
      code: 'GENERATION_FAILED',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

// GET endpoint to retrieve user's websites
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { db } = await connectToDatabase();

    const websites = await db.collection('websites')
      .find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      websites: websites.map(site => ({
        id: site._id,
        title: site.title,
        slug: site.slug,
        url: `/websites/${site.slug}`,
        createdAt: site.createdAt,
        analytics: site.analytics,
        metadata: site.metadata
      }))
    });

  } catch (error: any) {
    console.error('Get Websites Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch websites',
      details: error.message
    }, { status: 500 });
  }
}

// Fallback HTML generator
function createFallbackHTML(productInfo: string, affiliateLink: string, template: string): string {
  const colors = {
    modern: { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' },
    professional: { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6' },
    vibrant: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
  };

  const selectedColors = colors[template as keyof typeof colors] || colors.modern;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Amazing ${productInfo} - Limited Time Offer!</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hero { background: linear-gradient(135deg, ${selectedColors.primary} 0%, ${selectedColors.secondary} 100%); color: white; padding: 6rem 0; text-align: center; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; font-weight: 700; }
        .hero p { font-size: 1.3rem; margin-bottom: 2rem; opacity: 0.9; }
        .cta-button { display: inline-block; padding: 15px 40px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 1.1rem; transition: all 0.3s ease; }
        .cta-button:hover { background: #ff5252; transform: translateY(-2px); }
        .features { padding: 6rem 0; background: #f8f9fa; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .feature { text-align: center; padding: 2rem; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .feature h3 { font-size: 1.5rem; margin-bottom: 1rem; color: ${selectedColors.primary}; }
        @media (max-width: 768px) { .hero h1 { font-size: 2.5rem; } .features-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>Transform Your Life Today!</h1>
            <p>Discover the incredible benefits of ${productInfo}. Limited time exclusive offer!</p>
            <a href="${affiliateLink}" class="cta-button">Get Yours Now - Limited Time!</a>
        </div>
    </section>
    
    <section class="features">
        <div class="container">
            <div class="features-grid">
                <div class="feature">
                    <h3>Premium Quality</h3>
                    <p>Experience the difference with premium quality that exceeds expectations.</p>
                </div>
                <div class="feature">
                    <h3>Fast Results</h3>
                    <p>See incredible results in just days, not weeks or months.</p>
                </div>
                <div class="feature">
                    <h3>Money-Back Guarantee</h3>
                    <p>100% satisfaction guaranteed or your money back, no questions asked.</p>
                </div>
            </div>
            <div style="text-align: center; margin-top: 3rem;">
                <a href="${affiliateLink}" class="cta-button">Order Now - Don't Miss Out!</a>
            </div>
        </div>
    </section>
</body>
</html>`;
}

