import { NextRequest, NextResponse } from 'next/server'

// Mock database for user websites - replace with your actual database logic
const userWebsites = new Map()

// Initialize some mock data for demonstration
if (!userWebsites.has('demo@user.com')) {
  userWebsites.set('demo@user.com', {
    userName: 'Demo User',
    userCreatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    userLastActive: new Date().toISOString(),
    websites: [
      { id: 'site1', name: 'My First Affiliate Site', status: 'active' },
      { id: 'site2', name: 'Product Review Blog', status: 'active' },
      { id: 'site3', name: 'Niche Store', status: 'inactive' },
    ]
  })
}

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email') || 'demo@user.com'
    const userData = userWebsites.get(userEmail)

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User data not found' },
        { status: 404 }
      )
    }

    const totalWebsites = userData.websites.length
    const activeSites = userData.websites.filter((site: any) => site.status === 'active').length

    return NextResponse.json({
      success: true,
      data: {
        userName: userData.userName,
        userCreatedAt: userData.userCreatedAt,
        userLastActive: userData.userLastActive,
        totalWebsites,
        activeSites,
        websites: userData.websites
      }
    })

  } catch (error: any) {
    console.error('Error fetching user websites:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
