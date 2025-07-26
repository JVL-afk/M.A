import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')
    const period = searchParams.get('period') || '30d'

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      )
    }

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db('affilify')

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    // Fetch real analytics data from database
    const analyticsEvents = await db.collection('analytics_events').find({
      websiteId,
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    }).toArray()

    // Process real data into analytics summary
    const analyticsData = processAnalyticsData(analyticsEvents, period)

    return NextResponse.json({
      success: true,
      data: analyticsData,
      period,
      websiteId,
      dataSource: 'real', // Indicates this is real data, not mock
      eventsCount: analyticsEvents.length
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { websiteId, event, data, userAgent, ip } = body

    if (!websiteId || !event) {
      return NextResponse.json(
        { error: 'Website ID and event are required' },
        { status: 400 }
      )
    }

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db('affilify')

    // Store real analytics event
    const analyticsEvent = {
      websiteId,
      event,
      data: data || {},
      timestamp: new Date(),
      userAgent: userAgent || request.headers.get('user-agent'),
      ip: ip || request.headers.get('x-forwarded-for') || 'unknown',
      sessionId: data?.sessionId || generateSessionId(),
      userId: data?.userId || null,
      referrer: data?.referrer || null,
      page: data?.page || '/',
      device: parseUserAgent(userAgent || request.headers.get('user-agent')),
      location: data?.location || null
    }

    await db.collection('analytics_events').insertOne(analyticsEvent)

    // Update website summary statistics
    await updateWebsiteSummary(db, websiteId, event, analyticsEvent)

    return NextResponse.json({
      success: true,
      message: 'Analytics event recorded',
      eventId: analyticsEvent._id
    })
  } catch (error) {
    console.error('Error recording analytics:', error)
    return NextResponse.json(
      { error: 'Failed to record analytics' },
      { status: 500 }
    )
  }
}

// Process real analytics data into summary format
function processAnalyticsData(events: any[], period: string) {
  if (events.length === 0) {
    return getEmptyAnalyticsData(period)
  }

  // Calculate metrics from real events
  const pageViews = events.filter(e => e.event === 'page_view').length
  const uniqueVisitors = new Set(events.map(e => e.sessionId)).size
  const clickThroughs = events.filter(e => e.event === 'cta_click' || e.event === 'affiliate_click').length
  const conversions = events.filter(e => e.event === 'conversion').length
  const totalRevenue = events
    .filter(e => e.event === 'conversion' && e.data?.revenue)
    .reduce((sum, e) => sum + (e.data.revenue || 0), 0)

  // Generate daily data from real events
  const dailyData = generateDailyData(events, period)

  // Calculate top pages from real data
  const topPages = calculateTopPages(events)

  // Calculate top referrers from real data
  const topReferrers = calculateTopReferrers(events)

  // Calculate device breakdown from real data
  const deviceBreakdown = calculateDeviceBreakdown(events)

  // Calculate geographic data from real data
  const geographicData = calculateGeographicData(events)

  return {
    summary: {
      pageViews,
      uniqueVisitors,
      clickThroughs,
      conversions,
      revenue: Math.round(totalRevenue * 100) / 100,
      conversionRate: clickThroughs > 0 ? Math.round((conversions / clickThroughs) * 100 * 100) / 100 : 0,
      clickThroughRate: pageViews > 0 ? Math.round((clickThroughs / pageViews) * 100 * 100) / 100 : 0,
    },
    dailyData,
    topPages,
    topReferrers,
    deviceBreakdown,
    geographicData,
  }
}

// Generate empty analytics data structure when no events exist
function getEmptyAnalyticsData(period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const dailyData = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    dailyData.push({
      date: date.toISOString().split('T')[0],
      pageViews: 0,
      uniqueVisitors: 0,
      clickThroughs: 0,
      conversions: 0,
      revenue: 0,
    })
  }

  return {
    summary: {
      pageViews: 0,
      uniqueVisitors: 0,
      clickThroughs: 0,
      conversions: 0,
      revenue: 0,
      conversionRate: 0,
      clickThroughRate: 0,
    },
    dailyData,
    topPages: [],
    topReferrers: [],
    deviceBreakdown: {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    },
    geographicData: [],
  }
}

// Generate daily analytics data from real events
function generateDailyData(events: any[], period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const dailyData = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Filter events for this specific day
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.timestamp).toISOString().split('T')[0]
      return eventDate === dateStr
    })
    
    const pageViews = dayEvents.filter(e => e.event === 'page_view').length
    const uniqueVisitors = new Set(dayEvents.map(e => e.sessionId)).size
    const clickThroughs = dayEvents.filter(e => e.event === 'cta_click' || e.event === 'affiliate_click').length
    const conversions = dayEvents.filter(e => e.event === 'conversion').length
    const revenue = dayEvents
      .filter(e => e.event === 'conversion' && e.data?.revenue)
      .reduce((sum, e) => sum + (e.data.revenue || 0), 0)
    
    dailyData.push({
      date: dateStr,
      pageViews,
      uniqueVisitors,
      clickThroughs,
      conversions,
      revenue: Math.round(revenue * 100) / 100,
    })
  }
  
  return dailyData
}

// Calculate top pages from real events
function calculateTopPages(events: any[]) {
  const pageViews = events.filter(e => e.event === 'page_view')
  const pageCounts = {}
  
  pageViews.forEach(event => {
    const page = event.data?.page || event.page || '/'
    const title = event.data?.title || getPageTitle(page)
    const key = `${page}|${title}`
    
    if (!pageCounts[key]) {
      pageCounts[key] = { path: page, title, views: 0 }
    }
    pageCounts[key].views++
  })
  
  return Object.values(pageCounts)
    .sort((a: any, b: any) => b.views - a.views)
    .slice(0, 5)
}

// Calculate top referrers from real events
function calculateTopReferrers(events: any[]) {
  const referrerCounts = {}
  
  events.forEach(event => {
    if (event.referrer && event.referrer !== 'direct') {
      const source = extractDomain(event.referrer)
      const type = getReferrerType(source)
      const key = `${source}|${type}`
      
      if (!referrerCounts[key]) {
        referrerCounts[key] = { source, type, visits: 0 }
      }
      referrerCounts[key].visits++
    }
  })
  
  // Add direct traffic
  const directCount = events.filter(e => !e.referrer || e.referrer === 'direct').length
  if (directCount > 0) {
    referrerCounts['direct|direct'] = { source: 'direct', type: 'direct', visits: directCount }
  }
  
  return Object.values(referrerCounts)
    .sort((a: any, b: any) => b.visits - a.visits)
    .slice(0, 5)
}

// Calculate device breakdown from real events
function calculateDeviceBreakdown(events: any[]) {
  const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 }
  const uniqueSessions = new Set()
  
  events.forEach(event => {
    if (!uniqueSessions.has(event.sessionId)) {
      uniqueSessions.add(event.sessionId)
      const deviceType = event.device?.type || 'desktop'
      if (deviceCounts[deviceType] !== undefined) {
        deviceCounts[deviceType]++
      } else {
        deviceCounts.desktop++
      }
    }
  })
  
  const total = Object.values(deviceCounts).reduce((sum, count) => sum + count, 0)
  
  if (total === 0) {
    return { desktop: 0, mobile: 0, tablet: 0 }
  }
  
  return {
    desktop: Math.round((deviceCounts.desktop / total) * 100),
    mobile: Math.round((deviceCounts.mobile / total) * 100),
    tablet: Math.round((deviceCounts.tablet / total) * 100),
  }
}

// Calculate geographic data from real events
function calculateGeographicData(events: any[]) {
  const locationCounts = {}
  const uniqueSessions = new Set()
  
  events.forEach(event => {
    if (!uniqueSessions.has(event.sessionId) && event.location?.country) {
      uniqueSessions.add(event.sessionId)
      const country = event.location.country
      
      if (!locationCounts[country]) {
        locationCounts[country] = { country, visits: 0 }
      }
      locationCounts[country].visits++
    }
  })
  
  return Object.values(locationCounts)
    .sort((a: any, b: any) => b.visits - a.visits)
    .slice(0, 5)
}

// Helper functions
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function parseUserAgent(userAgent: string | null): { type: string; browser: string; os: string } {
  if (!userAgent) {
    return { type: 'desktop', browser: 'unknown', os: 'unknown' }
  }
  
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
  const isTablet = /iPad|Tablet/.test(userAgent)
  
  let type = 'desktop'
  if (isTablet) type = 'tablet'
  else if (isMobile) type = 'mobile'
  
  let browser = 'unknown'
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'
  
  let os = 'unknown'
  if (userAgent.includes('Windows')) os = 'Windows'
  else if (userAgent.includes('Mac')) os = 'macOS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iOS')) os = 'iOS'
  
  return { type, browser, os }
}

function getPageTitle(path: string): string {
  const titles = {
    '/': 'Home Page',
    '/products': 'Products',
    '/reviews': 'Reviews',
    '/about': 'About',
    '/contact': 'Contact',
  }
  return titles[path] || path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page'
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

function getReferrerType(domain: string): string {
  const searchEngines = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com']
  const socialMedia = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'tiktok.com']
  
  if (searchEngines.includes(domain)) return 'search'
  if (socialMedia.includes(domain)) return 'social'
  return 'referral'
}

async function updateWebsiteSummary(db: any, websiteId: string, event: string, eventData: any) {
  try {
    const update: any = {
      lastActivity: new Date()
    }
    
    switch (event) {
      case 'page_view':
        update['$inc'] = { 'analytics.views': 1 }
        break
      case 'cta_click':
      case 'affiliate_click':
        update['$inc'] = { 'analytics.clicks': 1 }
        break
      case 'conversion':
        update['$inc'] = { 
          'analytics.conversions': 1,
          'analytics.revenue': eventData.data?.revenue || 0
        }
        break
    }
    
    if (update['$inc']) {
      await db.collection('websites').updateOne(
        { _id: websiteId },
        update,
        { upsert: false }
      )
    }
  } catch (error) {
    console.error('Error updating website summary:', error)
  }
}
