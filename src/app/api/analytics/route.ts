import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const client = new MongoClient(uri)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')
    const period = searchParams.get('period') || '30d'
    
    // Get JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await client.connect()
    const db = client.db('affilify')
    
    // Verify user owns this website
    const website = await db.collection('websites').findOne({ 
      _id: new ObjectId(websiteId),
      userId: decoded.userId || decoded.id
    })
    
    if (!website) {
      return NextResponse.json(
        { error: 'Website not found or access denied' },
        { status: 404 }
      )
    }

    // Calculate date range
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch real analytics data
    const analyticsData = await fetchRealAnalytics(db, websiteId, startDate, days)

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
  } finally {
    await client.close()
  }
}

async function fetchRealAnalytics(db: any, websiteId: string, startDate: Date, days: number) {
  // Fetch analytics events from database
  const events = await db.collection('analytics_events').find({
    websiteId: websiteId,
    timestamp: { $gte: startDate }
  }).toArray()

  // Calculate summary metrics
  const pageViews = events.filter(e => e.type === 'page_view').length
  const uniqueVisitors = new Set(events.map(e => e.visitorId)).size
  const clickThroughs = events.filter(e => e.type === 'affiliate_click').length
  const conversions = events.filter(e => e.type === 'conversion').length
  
  // Calculate revenue from conversions
  const revenue = events
    .filter(e => e.type === 'conversion')
    .reduce((sum, e) => sum + (e.revenue || 0), 0)

  // Generate daily data
  const dailyData = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))
    
    const dayEvents = events.filter(e => 
      e.timestamp >= dayStart && e.timestamp <= dayEnd
    )
    
    const dayPageViews = dayEvents.filter(e => e.type === 'page_view').length
    const dayUniqueVisitors = new Set(dayEvents.map(e => e.visitorId)).size
    const dayClickThroughs = dayEvents.filter(e => e.type === 'affiliate_click').length
    const dayConversions = dayEvents.filter(e => e.type === 'conversion').length
    const dayRevenue = dayEvents
      .filter(e => e.type === 'conversion')
      .reduce((sum, e) => sum + (e.revenue || 0), 0)
    
    dailyData.push({
      date: dayStart.toISOString().split('T')[0],
      pageViews: dayPageViews,
      uniqueVisitors: dayUniqueVisitors,
      clickThroughs: dayClickThroughs,
      conversions: dayConversions,
      revenue: Math.round(dayRevenue * 100) / 100,
    })
  }

  // Calculate top pages
  const pageViewEvents = events.filter(e => e.type === 'page_view')
  const pageStats = {}
  pageViewEvents.forEach(e => {
    const path = e.path || '/'
    pageStats[path] = (pageStats[path] || 0) + 1
  })
  
  const topPages = Object.entries(pageStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 4)
    .map(([path, views]) => ({
      path,
      views,
      title: getPageTitle(path)
    }))

  // Calculate top referrers
  const referrerStats = {}
  events.forEach(e => {
    if (e.referrer) {
      const domain = extractDomain(e.referrer)
      referrerStats[domain] = (referrerStats[domain] || 0) + 1
    }
  })
  
  const topReferrers = Object.entries(referrerStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([source, visits]) => ({
      source,
      visits,
      type: getReferrerType(source)
    }))

  // Calculate device breakdown
  const deviceStats = { desktop: 0, mobile: 0, tablet: 0 }
  events.forEach(e => {
    if (e.device) {
      deviceStats[e.device] = (deviceStats[e.device] || 0) + 1
    }
  })
  
  const totalDeviceEvents = Object.values(deviceStats).reduce((a, b) => a + b, 0)
  const deviceBreakdown = {
    desktop: totalDeviceEvents > 0 ? Math.round((deviceStats.desktop / totalDeviceEvents) * 100) : 0,
    mobile: totalDeviceEvents > 0 ? Math.round((deviceStats.mobile / totalDeviceEvents) * 100) : 0,
    tablet: totalDeviceEvents > 0 ? Math.round((deviceStats.tablet / totalDeviceEvents) * 100) : 0,
  }

  // Calculate geographic data
  const countryStats = {}
  events.forEach(e => {
    if (e.country) {
      countryStats[e.country] = (countryStats[e.country] || 0) + 1
    }
  })
  
  const geographicData = Object.entries(countryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([country, visits]) => ({ country, visits }))

  return {
    summary: {
      pageViews,
      uniqueVisitors,
      clickThroughs,
      conversions,
      revenue: Math.round(revenue * 100) / 100,
      conversionRate: clickThroughs > 0 ? Math.round((conversions / clickThroughs) * 100 * 100) / 100 : 0,
      clickThroughRate: pageViews > 0 ? Math.round((clickThroughs / pageViews) * 100 * 100) / 100 : 0,
    },
    dailyData,
    topPages: topPages.length > 0 ? topPages : [
      { path: '/', views: 0, title: 'Home Page' }
    ],
    topReferrers: topReferrers.length > 0 ? topReferrers : [
      { source: 'direct', visits: 0, type: 'direct' }
    ],
    deviceBreakdown,
    geographicData: geographicData.length > 0 ? geographicData : [
      { country: 'No data', visits: 0 }
    ],
  }
}

function getPageTitle(path: string): string {
  const titles = {
    '/': 'Home Page',
    '/products': 'Products',
    '/reviews': 'Reviews',
    '/about': 'About',
    '/contact': 'Contact'
  }
  return titles[path] || path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
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
  const socialMedia = ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'youtube.com', 'tiktok.com']
  
  if (searchEngines.includes(domain)) return 'search'
  if (socialMedia.includes(domain)) return 'social'
  if (domain === 'direct') return 'direct'
  return 'referral'
}

