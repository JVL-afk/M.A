import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import jwt from 'jsonwebtoken'

// Define the plan type for better type safety
type PlanType = 'basic' | 'pro' | 'enterprise'

export async function GET(request: NextRequest) {
  try {
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
    const user = await db.collection('users').findOne(
      { _id: decoded.userId },
      { projection: { password: 0, verificationCode: 0 } }
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get current month data
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthStart = new Date(currentYear, currentMonth, 1)
    const monthEnd = new Date(currentYear, currentMonth + 1, 1)

    // Get user's websites and analytics
    const [websites, analyses, analytics] = await Promise.all([
      db.collection('generated_websites').find({
        userId: decoded.userId
      }).sort({ createdAt: -1 }).limit(10).toArray(),

      db.collection('website_analyses').find({
        userId: decoded.userId
      }).sort({ createdAt: -1 }).limit(5).toArray(),

      db.collection('user_analytics').find({
        userId: decoded.userId,
        timestamp: { $gte: monthStart, $lt: monthEnd }
      }).toArray()
    ])

    // Calculate monthly statistics
    const monthlyWebsites = await db.collection('generated_websites').countDocuments({
      userId: decoded.userId,
      createdAt: { $gte: monthStart, $lt: monthEnd }
    })

    const monthlyAnalyses = await db.collection('website_analyses').countDocuments({
      userId: decoded.userId,
      createdAt: { $gte: monthStart, $lt: monthEnd }
    })

    // Calculate usage limits based on plan
    const planLimits: Record<PlanType, { websites: number; analyses: number }> = {
      basic: { websites: 5, analyses: 10 },
      pro: { websites: 25, analyses: 50 },
      enterprise: { websites: -1, analyses: -1 } // unlimited
    }

    const userPlan: PlanType = (user.plan as PlanType) || 'basic'
    const limits = planLimits[userPlan]

    // Calculate total analytics
    const totalClicks = analytics.reduce((sum, record) => sum + (record.clicks || 0), 0)
    const totalRevenue = analytics.reduce((sum, record) => sum + (record.revenue || 0), 0)

    // Recent activity
    const recentActivity = [
      ...websites.slice(0, 3).map(website => ({
        type: 'website_created',
        title: `Created website: ${website.productName}`,
        timestamp: website.createdAt,
        data: { websiteId: website.id }
      })),
      ...analyses.slice(0, 2).map(analysis => ({
        type: 'website_analyzed',
        title: `Analyzed: ${analysis.url}`,
        timestamp: analysis.createdAt,
        data: { analysisId: analysis._id }
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)

    return NextResponse.json({
      success: true,
      dashboard: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: userPlan,
          isVerified: user.isVerified,
          memberSince: user.createdAt
        },
        statistics: {
          totalWebsites: user.totalWebsites || 0,
          totalAnalyses: user.totalAnalyses || 0,
          totalClicks: user.totalClicks || totalClicks,
          totalRevenue: user.totalRevenue || totalRevenue,
          monthlyWebsites: monthlyWebsites,
          monthlyAnalyses: monthlyAnalyses
        },
        usage: {
          websites: {
            used: monthlyWebsites,
            limit: limits.websites,
            percentage: limits.websites === -1 ? 0 : Math.round((monthlyWebsites / limits.websites) * 100)
          },
          analyses: {
            used: monthlyAnalyses,
            limit: limits.analyses,
            percentage: limits.analyses === -1 ? 0 : Math.round((monthlyAnalyses / limits.analyses) * 100)
          }
        },
        recentWebsites: websites.map(website => ({
          id: website.id,
          title: website.content?.title || website.productName,
          productName: website.productName,
          status: website.status,
          createdAt: website.createdAt,
          analytics: website.analytics || { views: 0, clicks: 0, conversions: 0, revenue: 0 }
        })),
        recentAnalyses: analyses.map(analysis => ({
          id: analysis._id,
          url: analysis.url,
          score: analysis.analysis?.seo?.score || 0,
          createdAt: analysis.createdAt
        })),
        recentActivity: recentActivity
      }
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load dashboard',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use GET to fetch dashboard data.' },
    { status: 405 }
  )
}

