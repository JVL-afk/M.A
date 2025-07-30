import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/mongodb';

// Initialize Gemini AI with proper error handling
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Authentication verification with enhanced security
function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key');
    return decoded as any;
  } catch (error) {
    console.error('Authentication verification failed:', error);
    return null;
  }
}

// Enhanced product information extraction
async function extractProductInfo(url: string): Promise<{
  title: string;
  description: string;
  price: string;
  features: string[];
  category: string;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Enhanced extraction with multiple fallback strategies
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) || 
                      html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i) ||
                     html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
    const priceMatch = html.match(/\$[\d,]+\.?\d*/g);
    
    // Extract features from various HTML structures
    const featureMatches = html.match(/<li[^>]*>([^<]+)<\/li>/gi) || [];
    const features = featureMatches
      .map(match => match.replace(/<[^>]*>/g, '').trim())
      .filter(feature => feature.length > 10 && feature.length < 100)
      .slice(0, 5);
    
    // Category detection based on keywords
    const categoryKeywords = {
      'fitness': ['fitness', 'workout', 'exercise', 'gym', 'health'],
      'technology': ['tech', 'software', 'app', 'digital', 'computer'],
      'beauty': ['beauty', 'skincare', 'makeup', 'cosmetic'],
      'home': ['home', 'kitchen', 'furniture', 'decor'],
      'fashion': ['fashion', 'clothing', 'apparel', 'style']
    };
    
    let category = 'general';
    const htmlLower = html.toLowerCase();
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => htmlLower.includes(keyword))) {
        category = cat;
        break;
      }
    }
    
    return {
      title: titleMatch ? titleMatch[1].trim() : 'Amazing Product',
      description: descMatch ? descMatch[1].trim() : 'Discover this incredible product',
      price: priceMatch ? priceMatch[0] : 'Great Value',
      features,
      category
    };
  } catch (error) {
    console.error('Product extraction failed:', error);
    return {
      title: 'Premium Product',
      description: 'High-quality product with excellent features',
      price: 'Competitive Price',
      features: ['High Quality', 'Great Value', 'Customer Satisfaction'],
      category: 'general'
    };
  }
}

// AI-powered website generation with Gemini
async function generateWebsiteWithAI(productInfo: any, affiliateUrl: string, template: string, niche?: string, targetAudience?: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Create a high-converting affiliate marketing website for this product:

PRODUCT INFORMATION:
- Title: ${productInfo.title}
- Description: ${productInfo.description}
- Price: ${productInfo.price}
- Features: ${productInfo.features.join(', ')}
- Category: ${productInfo.category}
- Affiliate URL: ${affiliateUrl}

CUSTOMIZATION:
- Niche: ${niche || 'Auto-detect from product'}
- Target Audience: ${targetAudience || 'Auto-detect from product'}
- Template Style: ${template}

REQUIREMENTS:
1. Create a complete, responsive HTML page with embedded CSS
2. Include compelling headline that grabs attention
3. Add product benefits and features section
4. Include social proof and testimonials (realistic but not fake)
5. Create strong call-to-action buttons linking to affiliate URL
6. Add trust signals and guarantees
7. Optimize for mobile devices
8. Include proper SEO meta tags
9. Use modern, professional design
10. Focus on conversion optimization

DESIGN GUIDELINES:
- Use orange/red gradient color scheme (#FF6B35 to #F7931E)
- Modern, clean typography
- Professional layout with good whitespace
- Mobile-first responsive design
- Fast-loading optimized code
- Accessibility compliant

Return only the complete HTML code with embedded CSS. No explanations or markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const websiteHtml = response.text();
    
    if (!websiteHtml || websiteHtml.length < 1000) {
      throw new Error('Generated content too short or empty');
    }
    
    return websiteHtml;
  } catch (error) {
    console.error('AI generation failed:', error);
    throw new Error(`AI website generation failed: ${error.message}`);
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

    const { productUrl, niche, targetAudience, template, customization } = await request.json();

    // Validate required fields
    if (!productUrl) {
      return NextResponse.json(
        { error: 'Product URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(productUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Connect to database with proper error handling
    const { db, client } = await connectToDatabase();

    try {
      // Check user's plan and website count
      const dbUser = await db.collection('users').findOne({ 
        _id: user.userId 
      });

      if (!dbUser) {
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
        userId: user.userId
      });

      if (websiteCount >= planLimits[userPlan]) {
        return NextResponse.json(
          { 
            error: 'Website limit reached for your plan',
            current: websiteCount,
            limit: planLimits[userPlan],
            plan: userPlan
          },
          { status: 403 }
        );
      }

      // Extract product information
      const productInfo = await extractProductInfo(productUrl);

      // Generate website with AI
      const websiteHtml = await generateWebsiteWithAI(
        productInfo, 
        productUrl, 
        template || 'modern',
        niche,
        targetAudience
      );

      // Generate unique website identifier
      const websiteId = new Date().getTime().toString(36) + Math.random().toString(36).substr(2);
      const websiteSlug = `${productInfo.category}-${websiteId}`;
      const websiteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/websites/${websiteSlug}`;

      // Save website to database
      const websiteData = {
        _id: websiteId,
        userId: user.userId,
        productUrl,
        productInfo,
        niche: niche || productInfo.category,
        targetAudience: targetAudience || 'General audience',
        template: template || 'modern',
        customization: customization || {},
        html: websiteHtml,
        slug: websiteSlug,
        url: websiteUrl,
        status: 'active',
        analytics: {
          views: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0
        },
        seo: {
          title: productInfo.title,
          description: productInfo.description,
          keywords: productInfo.features.join(', ')
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        plan: userPlan
      };

      const insertResult = await db.collection('generated_websites').insertOne(websiteData);

      // Update user's usage statistics
      await db.collection('users').updateOne(
        { _id: user.userId },
        { 
          $inc: { totalWebsites: 1 },
          $set: { lastWebsiteGeneratedAt: new Date() }
        }
      );

      return NextResponse.json({
        success: true,
        website: {
          id: websiteId,
          url: websiteUrl,
          slug: websiteSlug,
          productUrl,
          productInfo,
          niche: websiteData.niche,
          targetAudience: websiteData.targetAudience,
          template,
          createdAt: websiteData.createdAt
        },
        message: 'Website generated successfully with AI!',
        usage: {
          used: websiteCount + 1,
          limit: planLimits[userPlan],
          plan: userPlan
        }
      });

    } finally {
      await client.close();
    }

  } catch (error) {
    console.error('Website generation error:', error);
    
    // Determine error type and provide appropriate response
    if (error.message.includes('AI generation failed')) {
      return NextResponse.json(
        { 
          error: 'AI service temporarily unavailable',
          details: 'Please try again in a few moments',
          retryable: true
        },
        { status: 503 }
      );
    }
    
    if (error.message.includes('Database')) {
      return NextResponse.json(
        { 
          error: 'Database service unavailable',
          details: 'Please try again later',
          retryable: true
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate website',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        retryable: false
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
