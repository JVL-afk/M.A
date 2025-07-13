import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { url, websiteId } = await request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Website URL is required' },
        { status: 400 }
      )
    }

    // Verify user authentication
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

    // Check user's plan and usage limits
    const user = await db.collection('users').findOne({ _id: decoded.userId })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has reached their analysis limit
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyAnalyses = await db.collection('website_analyses').countDocuments({
      userId: decoded.userId,
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    })

    // Define limits based on plan
    const planLimits = {
      basic: 10,
      pro: 50,
      enterprise: -1 // unlimited
    }

    const userPlan = user.plan || 'basic'
    const limit = planLimits[userPlan] || planLimits.basic

    if (limit !== -1 && monthlyAnalyses >= limit) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Monthly analysis limit reached',
          limit: limit,
          used: monthlyAnalyses
        },
        { status: 429 }
      )
    }

    // Perform website analysis (mock implementation)
    // In a real implementation, you would:
    // 1. Fetch the website content
    // 2. Analyze SEO factors
    // 3. Check performance metrics
    // 4. Identify affiliate opportunities
    
    const analysisResult = {
      url: url,
      websiteId: websiteId || null,
      analysis: {
        seo: {
          title: 'Good',
          metaDescription: 'Needs improvement',
          headings: 'Good',
          score: 75
        },
        performance: {
          loadTime: '2.3s',
          mobileOptimized: true,
          score: 85
        },
        content: {
          wordCount: 1250,
          readability: 'Good',
          affiliateOpportunities: [
            'Product reviews section',
            'Comparison tables',
            'Call-to-action buttons'
          ]
        },
        recommendations: [
          'Add meta descriptions to improve SEO',
          'Optimize images for faster loading',
          'Include more affiliate links in product sections',
          'Add customer testimonials'
        ]
      },
      userId: decoded.userId,
      createdAt: new Date(),
      plan: userPlan
    }

    // Save analysis to database
    const insertResult = await db.collection('website_analyses').insertOne(analysisResult)

    // Update user's usage statistics
    await db.collection('users').updateOne(
      { _id: decoded.userId },
      { 
        $inc: { totalAnalyses: 1 },
        $set: { lastAnalysisAt: new Date() }
      }
    )

    return NextResponse.json({
      success: true,
      analysisId: insertResult.insertedId,
      analysis: analysisResult.analysis,
      usage: {
        used: monthlyAnalyses + 1,
        limit: limit,
        plan: userPlan
      },
      message: 'Website analysis completed successfully'
    })

  } catch (error) {
    console.error('Website analysis error:', error)
    
    // Proper error type handling for TypeScript
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze website',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST to analyze websites.' },
    { status: 405 }
  )
}
