import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, messages } = await request.json()

    // Mock AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock website generation based on user input
    const websiteData = {
      title: `${message} Affiliate Hub`,
      description: `Professional affiliate website for ${message} products`,
      url: `https://affilify-${Date.now()}.netlify.app`,
      niche: message,
      targetAudience: 'Tech-savvy consumers aged 25-45',
      keyFeatures: [
        'Product comparison tables',
        'Detailed reviews and ratings',
        'Affiliate link integration',
        'Mobile-responsive design',
        'SEO optimized content'
      ],
      estimatedRevenue: '$500-2000/month',
      completionTime: '2-3 minutes'
    }

    // Simulate different conversation stages
    const messageCount = messages.length
    let response = ''
    let completed = false

    if (messageCount <= 2) {
      response = `Great choice! I'm analyzing the ${message} niche. This is a profitable market with high conversion potential. What specific products or brands would you like to focus on?`
    } else if (messageCount <= 4) {
      response = `Perfect! I'm now generating your ${message} affiliate website with the latest AI technology. This includes product comparisons, reviews, and optimized affiliate links. What's your target audience?`
    } else {
      response = `🎉 Your ${message} affiliate website is ready! I've created a professional site with product reviews, comparison tables, and optimized affiliate links. The site is deployed and ready to start generating revenue!`
      completed = true
    }

    return NextResponse.json({
      response,
      completed,
      result: completed ? websiteData : null
    })
  } catch (error) {
    console.error('Website generation error:', error)
    return NextResponse.json({ error: 'Failed to generate website' }, { status: 500 })
  }
}
