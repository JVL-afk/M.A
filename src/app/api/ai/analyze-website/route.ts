import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import clientPromise from '../../../../../lib/mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MongoClient } from 'mongodb'; // Import MongoClient for typing

export async function POST(request: NextRequest) {
  try {
// @ts-ignore
    const client: MongoClient = await clientPromise;

    const { websiteUrl } = await request.json();
    const userEmail = request.headers.get('x-user-email') || 'demo@user.com';

    if (!websiteUrl) {
      return NextResponse.json({
        success: false,
        error: 'Website URL is required for analysis',
      }, { status: 400 });
    }

    console.log(`AI Website Analysis Request for ${userEmail} | URL: ${websiteUrl}`);

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct a detailed prompt for website analysis
    const prompt = `Analyze the following website URL: ${websiteUrl}. Provide a comprehensive analysis focusing on:\n    1. Overall summary and main topic.\n    2. SEO recommendations (meta descriptions, alt tags, internal/external links, keywords).\n    3. Content quality, readability, and relevance to potential affiliate niches.\n    4. Identify opportunities for new content, keyword targeting, and affiliate product integration.\n    5. Suggestions for affiliate programs in complementary niches.\n\n    Provide the analysis in a structured JSON format with the following keys:\n    {\n      "summary": "Overall summary of the website and its main topic.",\n      "seoRecommendations": [\n        "Recommendation 1",\n        "Recommendation 2"\n      ],\n      "contentOpportunities": [\n        "Opportunity 1",\n        "Opportunity 2"\n      ],\n      "affiliateSuggestions": [\n        "Suggestion 1",\n        "Suggestion 2"\n      ]\n    }\n\n    Ensure the analysis is insightful, actionable, and professionally written.`;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const generatedAnalysis = aiResponse.text();

    // Attempt to parse the generated analysis as JSON
    let analysisResult;
    try {
      analysisResult = JSON.parse(generatedAnalysis);
    } catch (parseError) {
      console.error('Failed to parse AI generated analysis as JSON:', parseError);
      // Fallback to plain text if JSON parsing fails
      analysisResult = { rawText: generatedAnalysis };
    }

    return NextResponse.json({
      success: true,
      message: 'Website analyzed successfully!',
      analysis: analysisResult,
    });
  } catch (error) {
    console.error('AI website analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during AI analysis',
    }, { status: 500 });
  }
}
