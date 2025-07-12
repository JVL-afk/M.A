import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')
    const period = searchParams.get('period') || '30d'
    const userId = 'user_id' // Get from auth middleware

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      )
    }

    // TODO: Fetch real analytics data from database
    const analyticsData = generateMockAnalytics(period)

    return NextResponse.json({
      success: true,
      data: analyticsData,
      period,
      websiteId,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

function generateMockAnalytics(period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  
  // Generate mock data
  const pageViews = Math.floor(Math.random() * 10000) + 1000
  const uniqueVisitors = Math.floor(pageViews * 0.7)
  const clickThroughs = Math.floor(pageViews * 0.05)
  const conversions = Math.floor(clickThroughs * 0.1)
  const revenue = conversions * (Math.random() * 50 + 10)

  // Generate daily data
  const dailyData = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    dailyData.push({
      date: date.toISOString().split('T')[0],
      pageViews: Math.floor(Math.random() * (pageViews / days * 2)),
      uniqueVisitors: Math.floor(Math.random() * (uniqueVisitors / days * 2)),
      clickThroughs: Math.floor(Math.random() * (clickThroughs / days * 2)),
      conversions: Math.floor(Math.random() * (conversions / days * 2)),
      revenue: Math.random() * (revenue / days * 2),
    })
  }

  return {
    summary: {
      pageViews,
      uniqueVisitors,
      clickThroughs,
      conversions,
      revenue: Math.round(revenue * 100) / 100,
      conversionRate: Math.round((conversions / clickThroughs) * 100 * 100) / 100,
      clickThroughRate: Math.round((clickThroughs / pageViews) * 100 * 100) / 100,
    },
    dailyData,
    topPages: [
      { path: '/', views: Math.floor(pageViews * 0.4), title: 'Home Page' },
      { path: '/products', views: Math.floor(pageViews * 0.3), title: 'Products' },
      { path: '/reviews', views: Math.floor(pageViews * 0.2), title: 'Reviews' },
      { path: '/about', views: Math.floor(pageViews * 0.1), title: 'About' },
    ],
    topReferrers: [
      { source: 'google.com', visits: Math.floor(uniqueVisitors * 0.4), type: 'search' },
      { source: 'facebook.com', visits: Math.floor(uniqueVisitors * 0.2), type: 'social' },
      { source: 'direct', visits: Math.floor(uniqueVisitors * 0.2), type: 'direct' },
      { source: 'youtube.com', visits: Math.floor(uniqueVisitors * 0.1), type: 'social' },
      { source: 'twitter.com', visits: Math.floor(uniqueVisitors * 0.1), type: 'social' },
    ],
    deviceBreakdown: {
      desktop: Math.round(Math.random() * 40 + 40), // 40-80%
      mobile: Math.round(Math.random() * 40 + 15), // 15-55%
      tablet: Math.round(Math.random() * 15 + 5), // 5-20%
    },
    geographicData: [
      { country: 'United States', visits: Math.floor(uniqueVisitors * 0.4) },
      { country: 'United Kingdom', visits: Math.floor(uniqueVisitors * 0.15) },
      { country: 'Canada', visits: Math.floor(uniqueVisitors * 0.1) },
      { country: 'Australia', visits: Math.floor(uniqueVisitors * 0.08) },
      { country: 'Germany', visits: Math.floor(uniqueVisitors * 0.07) },
    ],
  }
}
