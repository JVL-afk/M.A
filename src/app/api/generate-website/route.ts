import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { affiliateLink, productName } = await request.json();

    if (!affiliateLink || !productName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Affiliate link and product name are required.' 
      }, { status: 400 });
    }

    // Verify user authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Check user's plan and usage limits
    const user = await db.collection('users').findOne({ _id: decoded.userId });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Check usage limits based on plan
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthlyWebsites = await db.collection('generated_websites').countDocuments({
      userId: decoded.userId,
      createdAt: { $gte: new Date(currentMonth + '-01') }
    });

    const planLimits = {
      free: 3,
      pro: 50,
      enterprise: 500
    };

    if (monthlyWebsites >= planLimits[user.plan as keyof typeof planLimits]) {
      return NextResponse.json({ 
        success: false, 
        error: 'Monthly website generation limit reached. Please upgrade your plan.' 
      }, { status: 429 });
    }

    // REAL AI PROCESSING using Gemini API
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a professional affiliate website for the product "${productName}" with affiliate link "${affiliateLink}". 
            
            Generate a complete website structure with:
            1. Compelling headline and subheadline
            2. Product benefits and features
            3. Customer testimonials (realistic but fictional)
            4. Call-to-action buttons
            5. FAQ section
            6. Professional color scheme
            7. Mobile-responsive design
            
            Return the response as a JSON object with the following structure:
            {
              "title": "Website title",
              "description": "Meta description",
              "headline": "Main headline",
              "subheadline": "Supporting text",
              "features": ["feature1", "feature2", "feature3"],
              "testimonials": [{"name": "Customer Name", "text": "Testimonial text", "rating": 5}],
              "faq": [{"question": "Question", "answer": "Answer"}],
              "colorScheme": {"primary": "#color", "secondary": "#color", "accent": "#color"},
              "ctaText": "Call to action text"
            }`
          }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      throw new Error('Failed to generate website content with AI');
    }

    const geminiData = await geminiResponse.json();
    const aiContent = JSON.parse(geminiData.candidates[0].content.parts[0].text);

    // Generate website using real AI analysis
    const websiteData = {
      title: aiContent.title,
      description: aiContent.description,
      url: `https://affilify-${Date.now()}.netlify.app`,
      niche: productName,
      targetAudience: 'Tech-savvy consumers aged 25-45',
      keyFeatures: aiContent.features,
      testimonials: aiContent.testimonials,
      faq: aiContent.faq,
      colorScheme: aiContent.colorScheme,
      ctaText: aiContent.ctaText,
      affiliateLink: affiliateLink,
      estimatedRevenue: '$500-2000/month',
      completionTime: '2-3 minutes'
    };

    // Save generated website to database
    const websiteRecord = {
      userId: decoded.userId,
      affiliateLink: affiliateLink,
      productName: productName,
      websiteData: websiteData,
      generationStages: [
        'Analyzing product and market',
        'Generating compelling content',
        'Optimizing for conversions',
        'Finalizing design and layout'
      ],
      isPublished: false,
      customDomain: null,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertResult = await db.collection('generated_websites').insertOne(websiteRecord);

    // Update user's usage statistics
    await db.collection('users').updateOne(
      { _id: decoded.userId },
      { 
        $inc: { totalWebsites: 1 },
        $set: { lastWebsiteGeneratedAt: new Date() }
      }
    );

    // Track analytics for billing and usage
    await db.collection('user_analytics').insertOne({
      userId: decoded.userId,
      action: 'website_generation',
      websiteId: insertResult.insertedId,
      productName: productName,
      timestamp: new Date(),
      plan: user.plan
    });

    // Simulate real-time generation stages
    const stages = [
      'Analyzing product and target market...',
      'Generating compelling headlines and content...',
      'Optimizing for search engines and conversions...',
      'Finalizing design and responsive layout...',
      'Website generation complete!'
    ];

    return NextResponse.json({
      success: true,
      websiteId: insertResult.insertedId,
      websiteData: websiteData,
      stages: stages,
      usage: {
        current: monthlyWebsites + 1,
        limit: planLimits[user.plan as keyof typeof planLimits],
        plan: user.plan
      }
    });

  } catch (error: any) {
    console.error('Website generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate website: ' + error.message },
      { status: 500 }
    );
  }
}
