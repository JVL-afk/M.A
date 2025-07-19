import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth-middleware';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    // Get request body
    const { url } = await request.json();

    // Validate URL
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required.' },
        { status: 400 }
      );
    }

    try {
      new URL(url); // This will throw if URL is invalid
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format.' },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Get user info
    const userId = authResult.user.userId;
    const userInfo = await db.collection('users').findOne({ _id: userId });

    // Check user plan for rate limiting
    const userPlan = userInfo?.plan || 'basic';
    
    // Get analysis count for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const analysisCount = await db.collection('website_analyses').countDocuments({
      userId,
      createdAt: { $gte: today }
    });
    
    // Apply rate limits based on plan
    const limits = {
      basic: 5,
      pro: 50,
      enterprise: 500
    };
    
    const limit = limits[userPlan as keyof typeof limits] || limits.basic;
    
    if (analysisCount >= limit) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Daily analysis limit reached for your ${userPlan} plan. Upgrade for more analyses.` 
        },
        { status: 429 }
      );
    }

    // Perform website analysis
    // This is a simplified example - in a real app, you'd call an actual analysis service
    const analysisResults = await analyzeWebsite(url);
    
    // Save analysis to database
    const analysis = {
      userId,
      url,
      results: analysisResults,
      createdAt: new Date()
    };
    
    await db.collection('website_analyses').insertOne(analysis);

    // Return results
    return NextResponse.json({
      success: true,
      data: analysisResults
    });
  } catch (error) {
    console.error('WEBSITE_ANALYSIS_ERROR:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during website analysis.' },
      { status: 500 }
    );
  }
}

// Mock function for website analysis
// In a real app, this would call an actual analysis service
async function analyzeWebsite(url: string) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    performance: {
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      loadTime: (Math.random() * 2 + 0.5).toFixed(2), // 0.5-2.5s
      resourceCount: Math.floor(Math.random() * 50) + 20, // 20-70
      recommendations: [
        'Optimize images',
        'Enable text compression',
        'Reduce server response time'
      ]
    },
    accessibility: {
      score: Math.floor(Math.random() * 30) + 70, // 70-100
      issues: Math.floor(Math.random() * 10), // 0-10
      recommendations: [
        'Add alt text to images',
        'Improve color contrast',
        'Use proper heading structure'
      ]
    },
    seo: {
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      issues: Math.floor(Math.random() * 15), // 0-15
      recommendations: [
        'Add meta descriptions',
        'Fix broken links',
        'Improve mobile friendliness'
      ]
    },
    bestPractices: {
      score: Math.floor(Math.random() * 30) + 70, // 70-100
      issues: Math.floor(Math.random() * 8), // 0-8
      recommendations: [
        'Use HTTPS',
        'Add proper doctype',
        'Avoid deprecated APIs'
      ]
    }
  };
}
