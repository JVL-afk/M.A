// COMPLETE AI WEBSITE GENERATION API - src/app/api/generate-website/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Website templates based on user plan
const TEMPLATES = {
  basic: ['simple-landing'],
  pro: ['simple-landing', 'product-showcase', 'comparison-table'],
  enterprise: ['simple-landing', 'product-showcase', 'comparison-table', 'advanced-sales', 'multi-product']
};

// Plan limits
const PLAN_LIMITS = {
  basic: { websites: 3, templates: 1 },
  pro: { websites: 25, templates: 3 },
  enterprise: { websites: 999, templates: 5 }
};

interface UserData {
  _id: ObjectId;
  email: string;
  plan: string;
  websiteCount: number;
}

// Extract product information from URL
async function analyzeProductURL(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = await response.text();
    
    // Extract basic information using regex patterns
    const titleMatch = html.match(/<title[^>]*>([^<]+)</title>/i);
    const descriptionMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
    const imageMatch = html.match(/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
    const priceMatch = html.match(/\$[\d,]+\.?\d*/g);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : 'Product',
      description: descriptionMatch ? descriptionMatch[1].trim() : 'Amazing product with great features',
      image: imageMatch ? imageMatch[1] : null,
      price: priceMatch ? priceMatch[0] : '$99.99',
      domain: new URL(url).hostname
    };
  } catch (error) {
    console.error('Error analyzing URL:', error);
    return {
      title: 'Amazing Product',
      description: 'Discover this incredible product with outstanding features and benefits',
      image: null,
      price: '$99.99',
      domain: 'example.com'
    };
  }
}

// Generate website content using Gemini AI
async function generateWebsiteContent(productInfo: any, template: string, customization: any) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
Create a high-converting affiliate marketing website for the following product:

Product Information:
- Title: ${productInfo.title}
- Description: ${productInfo.description}
- Price: ${productInfo.price}
- Domain: ${productInfo.domain}

Template Style: ${template}
Customization: ${JSON.stringify(customization)}

Generate a complete HTML website with the following requirements:

1. STRUCTURE:
   - Professional landing page layout
   - Clear value proposition
   - Product benefits section
   - Social proof/testimonials
   - Strong call-to-action buttons
   - Mobile-responsive design

2. CONTENT:
   - Compelling headline that grabs attention
   - 3-5 key product benefits
   - Emotional triggers and urgency
   - Trust signals and guarantees
   - Clear pricing and offer details

3. DESIGN:
   - Modern, clean aesthetic
   - Professional color scheme
   - Proper typography hierarchy
   - Optimized for conversions
   - Fast-loading CSS

4. SEO OPTIMIZATION:
   - Proper meta tags
   - Structured data
   - Optimized headings
   - Alt text for images

Return ONLY the complete HTML code with embedded CSS and JavaScript. Make it production-ready and conversion-optimized.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI Error:', error);
    
    // Fallback template if AI fails
    return generateFallbackWebsite(productInfo, template);
  }
}

// Fallback website generation if AI fails
function generateFallbackWebsite(productInfo: any, template: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${productInfo.title} - Get Yours Today!</title>
    <meta name="description" content="${productInfo.description}">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 0; text-align: center; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 20px; font-weight: bold; }
        .hero p { font-size: 1.3rem; margin-bottom: 30px; opacity: 0.9; }
        .cta-button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-size: 1.2rem; font-weight: bold; transition: all 0.3s; }
        .cta-button:hover { background: #ff5252; transform: translateY(-2px); }
        .features { padding: 80px 0; background: #f8f9fa; }
        .features h2 { text-align: center; font-size: 2.5rem; margin-bottom: 50px; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
        .feature { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center; }
        .feature h3 { font-size: 1.5rem; margin-bottom: 15px; color: #667eea; }
        .price-section { padding: 80px 0; text-align: center; }
        .price { font-size: 3rem; color: #ff6b6b; font-weight: bold; margin: 20px 0; }
        .footer { background: #333; color: white; padding: 40px 0; text-align: center; }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .hero p { font-size: 1.1rem; }
            .feature-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>Get ${productInfo.title} Today!</h1>
            <p>${productInfo.description}</p>
            <a href="#order" class="cta-button">Get Yours Now - ${productInfo.price}</a>
        </div>
    </section>

    <section class="features">
        <div class="container">
            <h2>Why Choose ${productInfo.title}?</h2>
            <div class="feature-grid">
                <div class="feature">
                    <h3>🚀 Premium Quality</h3>
                    <p>Experience the highest quality standards with every purchase. We guarantee satisfaction.</p>
                </div>
                <div class="feature">
                    <h3>⚡ Fast Delivery</h3>
                    <p>Get your order delivered quickly with our expedited shipping options.</p>
                </div>
                <div class="feature">
                    <h3>🛡️ Money-Back Guarantee</h3>
                    <p>Not satisfied? Get your money back within 30 days, no questions asked.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="price-section" id="order">
        <div class="container">
            <h2>Special Limited Time Offer</h2>
            <div class="price">${productInfo.price}</div>
            <p>Don't miss out on this incredible deal!</p>
            <a href="${productInfo.domain}" class="cta-button" target="_blank">Order Now</a>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 ${productInfo.title}. All rights reserved. | Powered by AFFILIFY</p>
        </div>
    </footer>

    <script>
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Add click tracking
        document.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('click', function() {
                // Track conversion
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'conversion', {
                        'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
                        'value': ${productInfo.price.replace('$', '')},
                        'currency': 'USD'
                    });
                }
            });
        });
    </script>
</body>
</html>`;
}

// Verify user authentication and get user data
async function verifyUser(request: NextRequest): Promise<UserData | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    return user as UserData;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// Main API route handler
export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await verifyUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request data
    const { productUrl, template = 'simple-landing', customization = {} } = await request.json();

    if (!productUrl) {
      return NextResponse.json(
        { error: 'Product URL is required' },
        { status: 400 }
      );
    }

    // Check user plan limits
    const userPlan = user.plan || 'basic';
    const limits = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS];
    const currentWebsiteCount = user.websiteCount || 0;

    if (currentWebsiteCount >= limits.websites) {
      return NextResponse.json(
        { 
          error: 'Website limit reached',
          message: `Your ${userPlan} plan allows ${limits.websites} websites. Upgrade to create more.`,
          upgradeRequired: true
        },
        { status: 403 }
      );
    }

    // Validate template access
    const availableTemplates = TEMPLATES[userPlan as keyof typeof TEMPLATES];
    if (!availableTemplates.includes(template)) {
      return NextResponse.json(
        { 
          error: 'Template not available',
          message: `Template '${template}' requires a higher plan.`,
          upgradeRequired: true
        },
        { status: 403 }
      );
    }

    // Analyze product URL
    console.log('Analyzing product URL:', productUrl);
    const productInfo = await analyzeProductURL(productUrl);

    // Generate website content using AI
    console.log('Generating website content...');
    const websiteHTML = await generateWebsiteContent(productInfo, template, customization);

    // Generate unique slug for the website
    const slug = `${productInfo.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

    // Save website to database
    const { db } = await connectToDatabase();
    const websiteData = {
      _id: new ObjectId(),
      userId: user._id,
      slug,
      title: productInfo.title,
      description: productInfo.description,
      productUrl,
      template,
      customization,
      html: websiteHTML,
      productInfo,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      clicks: 0,
      isActive: true
    };

    await db.collection('websites').insertOne(websiteData);

    // Update user website count
    await db.collection('users').updateOne(
      { _id: user._id },
      { $inc: { websiteCount: 1 } }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      website: {
        id: websiteData._id.toString(),
        slug,
        title: productInfo.title,
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/websites/${slug}`,
        previewUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/preview/${slug}`
      },
      message: 'Website generated successfully!'
    });

  } catch (error) {
    console.error('Website generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate website',
        message: 'An error occurred while generating your website. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
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
