import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, website } = body

    // Validate required fields
    if (!userEmail || !website) {
      return NextResponse.json(
        { success: false, error: 'User email and website data are required' },
        { status: 400 }
      )
    }

    // For now, we'll simulate storing the website
    // In a real implementation, you would save to MongoDB
    const storedWebsite = {
      ...website,
      id: website.id || Date.now().toString(),
      userEmail: userEmail,
      storedAt: new Date().toISOString(),
      status: 'stored'
    }

    // Simulate database storage
    console.log('Storing website:', storedWebsite)

    // In a real implementation:
    // const db = await getDatabase()
    // const result = await db.collection('websites').insertOne(storedWebsite)

    return NextResponse.json({
      success: true,
      websiteId: storedWebsite.id,
      message: 'Website stored successfully'
    })

  } catch (error) {
    console.error('Error storing website:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to store website. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed. Use POST to store websites.' 
    },
    { status: 405 }
  )
}
