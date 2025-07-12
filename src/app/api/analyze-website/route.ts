import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // Get the URL and userId from the request body sent by the frontend page
    const body = await request.json();
    const { url, userId } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: 'Website URL is required.' }, { status: 400 });
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
    const monthlyAnalyses = await db.collection('website_analyses').countDocuments({
      userId: decoded.userId,
      createdAt: { $gte: new Date(currentMonth + '-01') }
    });

    const planLimits = {
      free: 5,
      pro: 100,
      enterprise: 1000
    };

    if (monthlyAnalyses >= planLimits[user.plan as keyof typeof planLimits]) {
      return NextResponse.json({ 
        success: false, 
        error: 'Monthly analysis limit reached. Please upgrade your plan.' 
      }, { status: 429 });
    }

    // REAL AI ANALYSIS using Gemini API
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze the website "${url}" and provide a comprehensive analysis. 
            
            Return the response as a JSON object with the following structure:
            {
              "score": 85,
              "niche": "Specific niche category",
              "targetAudience": "Target audience description",
              "strengths": ["strength1", "strength2", "strength3"],
              "weaknesses": ["weakness1", "weakness2"],
              "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
              "competitorAnalysis": [{"url": "competitor1.com", "score": 80, "strengths": ["strength1"]}],
              "seoScore": 75,
              "performanceScore": 90,
              "conversionScore": 80
            }`
          }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      throw new Error('Failed to analyze website with AI');
    }

    const geminiData = await geminiResponse.json();
    const analysisData = JSON.parse(geminiData.candidates[0].content.parts[0].text);

    // Save analysis result to database
    const analysisRecord = {
      userId: decoded.userId,
      websiteUrl: url,
      analysisResult: analysisData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('website_analyses').insertOne(analysisRecord);

    // Update user's usage statistics
    await db.collection('users').updateOne(
      { _id: decoded.userId },
      { 
        $inc: { totalAnalyses: 1 },
        $set: { lastAnalysisAt: new Date() }
      }
    );

    // Track analytics for billing and usage
    await db.collection('user_analytics').insertOne({
      userId: decoded.userId,
      action: 'website_analysis',
      websiteUrl: url,
      timestamp: new Date(),
      plan: user.plan
    });

    return NextResponse.json({
      success: true,
      data: analysisData,
      usage: {
        current: monthlyAnalyses + 1,
        limit: planLimits[user.plan as keyof typeof planLimits],
        plan: user.plan
      }
    });

  } catch (error: any) {
    console.error('Error in /api/analyze-website route:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred. Please check the server logs.' },
      { status: 500 }
    );
  }
}
