import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import jwt from 'jsonwebtoken'

// Define the plan type for better type safety
type PlanType = 'basic' | 'pro' | 'enterprise'

export async function POST(request: NextRequest) {
  try {
    const { prompt, type, context } = await request.json()

    if (!prompt || !type) {
      return NextResponse.json(
        { success: false, error: 'Prompt and type are required' },
        { status: 400 }
      )
    }

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db('affilify')

    // Get user information
    const user = await db.collection('users').findOne({ _id: decoded.userId })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check AI usage limits based on plan
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyAIRequests = await db.collection('ai_requests').countDocuments({
      userId: decoded.userId,
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    })

    // Define AI limits based on plan with proper typing
    const aiLimits: Record<PlanType, number> = {
      basic: 50,
      pro: 500,
      enterprise: -1 // unlimited
    }

    // Safely cast user plan with fallback
    const userPlan: PlanType = (user.plan as PlanType) || 'basic'
    const limit = aiLimits[userPlan]

    if (limit !== -1 && monthlyAIRequests >= limit) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Monthly AI request limit reached',
          limit: limit,
          used: monthlyAIRequests
        },
        { status: 429 }
      )
    }

    // Process AI request based on type
    let aiResponse = ''
    
    switch (type) {
      case 'content_generation':
        aiResponse = await generateContent(prompt, context)
        break
      case 'seo_optimization':
        aiResponse = await generateSEOContent(prompt, context)
        break
      case 'product_description':
        aiResponse = await generateProductDescription(prompt, context)
        break
      case 'website_copy':
        aiResponse = await generateWebsiteCopy(prompt, context)
        break
      default:
        aiResponse = await generateGenericResponse(prompt, context)
    }

    // Store AI request in database
    const aiRequest = {
      userId: decoded.userId,
      prompt: prompt,
      type: type,
      context: context || null,
      response: aiResponse,
      createdAt: new Date(),
      plan: userPlan
    }

    const insertResult = await db.collection('ai_requests').insertOne(aiRequest)

    // Update user's AI usage statistics
    await db.collection('users').updateOne(
      { _id: decoded.userId },
      { 
        $inc: { totalAIRequests: 1 },
        $set: { lastAIRequestAt: new Date() }
      }
    )

    return NextResponse.json({
      success: true,
      requestId: insertResult.insertedId,
      response: aiResponse,
      type: type,
      usage: {
        used: monthlyAIRequests + 1,
        limit: limit,
        plan: userPlan
      },
      message: 'AI request processed successfully'
    })

  } catch (error) {
    console.error('AI request error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process AI request',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

// Helper functions for different AI response types
async function generateContent(prompt: string, context: any): Promise<string> {
  const systemPrompt = `You are an expert content creator specializing in affiliate marketing. Generate high-quality, engaging content that converts visitors into customers.`
  
  const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}\n\nContext: ${JSON.stringify(context)}\n\nGenerate compelling content that is optimized for affiliate marketing conversions.`
  
  return await callGeminiAPI(fullPrompt)
}

async function generateSEOContent(prompt: string, context: any): Promise<string> {
  const systemPrompt = `You are an SEO expert specializing in affiliate marketing. Generate SEO-optimized content that ranks well in search engines and converts visitors.`
  
  const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}\n\nContext: ${JSON.stringify(context)}\n\nGenerate SEO-optimized content including keywords, meta descriptions, and search-friendly copy.`
  
  return await callGeminiAPI(fullPrompt)
}

async function generateProductDescription(prompt: string, context: any): Promise<string> {
  const systemPrompt = `You are a conversion copywriter specializing in product descriptions for affiliate marketing. Create compelling descriptions that highlight benefits and drive sales.`
  
  const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}\n\nContext: ${JSON.stringify(context)}\n\nGenerate a compelling product description that focuses on benefits, addresses pain points, and includes a strong call-to-action.`
  
  return await callGeminiAPI(fullPrompt)
}

async function generateWebsiteCopy(prompt: string, context: any): Promise<string> {
  const systemPrompt = `You are a website copywriter specializing in affiliate marketing landing pages. Create high-converting copy that guides visitors toward taking action.`
  
  const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}\n\nContext: ${JSON.stringify(context)}\n\nGenerate website copy including headlines, subheadings, body text, and call-to-action elements optimized for conversions.`
  
  return await callGeminiAPI(fullPrompt)
}

async function generateGenericResponse(prompt: string, context: any): Promise<string> {
  const systemPrompt = `You are an AI assistant specializing in affiliate marketing and online business. Provide helpful, actionable advice and content.`
  
  const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}\n\nContext: ${JSON.stringify(context)}\n\nProvide a helpful response that addresses the user's request with actionable advice.`
  
  return await callGeminiAPI(fullPrompt)
}

async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + process.env.GOOGLE_AI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text
    } else {
      throw new Error('Invalid response format from Gemini API')
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    throw new Error('Failed to generate AI content')
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST to make AI requests.' },
    { status: 405 }
  )
}

