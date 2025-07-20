import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { withErrorHandler, ErrorFactory, ValidationHelper } from '../../../lib/error-handler';
import { rateLimit, userRateLimiter } from '../../../lib/rate-limit';
import { authenticateRequest } from '../../../lib/auth-middleware';
import { EnvironmentConfig } from '../../../lib/environment';

// Google AI configuration
const GOOGLE_AI_API_KEY = EnvironmentConfig.googleAI.apiKey;
const GOOGLE_AI_MODEL = EnvironmentConfig.googleAI.model;

// Website analysis function using Google AI
async function analyzeWebsiteWithAI(url: string, userId: string): Promise<any> {
  try {
    // Validate URL format
    ValidationHelper.validateUrl(url, 'website URL');
    
    // Fetch website content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AFFILIFY Website Analyzer 1.0'
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.ok) {
      throw ErrorFactory.externalAPI('website', `Failed to fetch website: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract basic information
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    const keywordsMatch = html.match(/<meta[^>]*name="keywords"[^>]*content="([^"]*)"[^>]*>/i);
    
    const websiteInfo = {
      url,
      title: titleMatch ? titleMatch[1].trim() : 'No title found',
      description: descriptionMatch ? descriptionMatch[1].trim() : 'No description found',
      keywords: keywordsMatch ? keywordsMatch[1].trim() : 'No keywords found',
      contentLength: html.length,
      analyzedAt: new Date().toISOString()
    };
    
    // Prepare content for AI analysis (limit to prevent token overflow)
    const contentForAI = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 5000); // Limit to 5000 characters
    
    // Call Google AI API for analysis
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_AI_MODEL}:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this website content and provide insights for affiliate marketing opportunities. 
            
Website URL: ${url}
Website Title: ${websiteInfo.title}
Website Description: ${websiteInfo.description}
Content: ${contentForAI}

Please provide:
1. Niche identification
2. Target audience analysis
3. Potential affiliate products/services
4. Content strategy recommendations
5. SEO opportunities
6. Monetization potential (score 1-10)

Format the response as JSON with these fields: niche, targetAudience, affiliateOpportunities, contentStrategy, seoOpportunities, monetizationScore, summary.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });
    
    if (!aiResponse.ok) {
      throw ErrorFactory.externalAPI('google-ai', `AI analysis failed: ${aiResponse.status}`);
    }
    
    const aiData = await aiResponse.json();
    const aiText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) {
      throw ErrorFactory.externalAPI('google-ai', 'No analysis content received from AI');
    }
    
    // Try to parse AI response as JSON, fallback to text analysis
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(aiText);
    } catch {
      // If JSON parsing fails, create structured response from text
      aiAnalysis = {
        niche: 'General',
        targetAudience: 'General audience',
        affiliateOpportunities: ['Various products and services'],
        contentStrategy: ['Create valuable content', 'Build audience trust'],
        seoOpportunities: ['Improve meta tags', 'Add relevant keywords'],
        monetizationScore: 5,
        summary: aiText.substring(0, 500) + '...'
      };
    }
    
    return {
      ...websiteInfo,
      analysis: aiAnalysis,
      success: true
    };
    
  } catch (error) {
    console.error('Website analysis error:', error);
    throw error;
  }
}

// Main route handler
async function handleAnalyzeWebsite(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const rateLimitResult = await rateLimit(request, 'aiGeneration');
  if (!rateLimitResult.success) {
    throw ErrorFactory.rateLimit('AI analysis rate limit exceeded. Please try again later.');
  }
  
  // Authenticate user
  const authResult = await authenticateRequest(request);
  if (!authResult.success || !authResult.user) {
    throw ErrorFactory.authentication('Authentication required for website analysis');
  }
  
  const user = authResult.user;
  const body = await request.json();
  
  // Validate request body
  ValidationHelper.validateRequired(body.url, 'url');
  
  const { url } = body;
  
  // Check user-specific rate limits based on subscription
  const subscriptionLimits = EnvironmentConfig.subscriptionLimits[user.subscription.plan];
  const userLimitResult = await userRateLimiter.checkUserLimit(
    user.id,
    'ai_analysis',
    subscriptionLimits.aiRequests
  );
  
  if (!userLimitResult.allowed) {
    throw ErrorFactory.rateLimit(
      `Daily AI analysis limit reached for ${user.subscription.plan} plan. Upgrade for more analyses.`
    );
  }
  
  try {
    const { db } = await connectToDatabase();
    
    // Check if website was recently analyzed (cache for 1 hour)
    const recentAnalysis = await db.collection('website_analyses').findOne({
      url: url,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // 1 hour ago
    });
    
    if (recentAnalysis) {
      // Return cached analysis
      return NextResponse.json({
        success: true,
        data: recentAnalysis.analysis,
        cached: true,
        remaining: userLimitResult.remaining
      });
    }
    
    // Perform AI analysis
    const analysisResult = await analyzeWebsiteWithAI(url, user.id);
    
    // Save analysis to database
    const analysisRecord = {
      userId: user.id,
      url: url,
      analysis: analysisResult,
      userPlan: user.subscription.plan,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('website_analyses').insertOne(analysisRecord);
    
    // Update user usage statistics
    await db.collection('users').updateOne(
      { _id: user.id },
      { 
        $inc: { 'usage.aiRequestsThisMonth': 1 },
        $set: { 
          'usage.lastActiveAt': new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    // Log API usage for analytics
    await db.collection('api_usage').insertOne({
      userId: user.id,
      endpoint: '/api/analyze-website',
      method: 'POST',
      userPlan: user.subscription.plan,
      success: true,
      responseTime: Date.now() - Date.now(), // This would be calculated properly
      createdAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      data: analysisResult,
      cached: false,
      remaining: userLimitResult.remaining - 1
    });
    
  } catch (error) {
    // Log failed API usage
    try {
      const { db } = await connectToDatabase();
      await db.collection('api_usage').insertOne({
        userId: user.id,
        endpoint: '/api/analyze-website',
        method: 'POST',
        userPlan: user.subscription.plan,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date()
      });
    } catch (logError) {
      console.error('Failed to log API usage:', logError);
    }
    
    throw error;
  }
}

// Export POST handler with error handling
export const POST = withErrorHandler(handleAnalyzeWebsite);
