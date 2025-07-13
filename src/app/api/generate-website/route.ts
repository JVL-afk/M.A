import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../lib/mongodb'
import jwt from 'jsonwebtoken'

// Define the plan type for better type safety
type PlanType = 'basic' | 'pro' | 'enterprise'

export async function POST(request: NextRequest) {
  try {
    const { affiliateLink, productName, niche, template, customization } = await request.json()

    if (!affiliateLink) {
      return NextResponse.json(
        { success: false, error: 'Affiliate link is required' },
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

    // Check if user has reached their website generation limit
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyWebsites = await db.collection('generated_websites').countDocuments({
      userId: decoded.userId,
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    })

    // Define limits based on plan with proper typing
    const planLimits: Record<PlanType, number> = {
      basic: 5,
      pro: 25,
      enterprise: -1 // unlimited
    }

    // Ensure userPlan is a valid PlanType
    const userPlan: PlanType = (user.plan as PlanType) || 'basic'
    const limit = planLimits[userPlan]

    if (limit !== -1 && monthlyWebsites >= limit) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Monthly website generation limit reached',
          limit: limit,
          used: monthlyWebsites
        },
        { status: 429 }
      )
    }

    // Generate website (mock implementation)
    // In a real implementation, you would:
    // 1. Use AI to analyze the affiliate link
    // 2. Extract product information
    // 3. Generate SEO-optimized content
    // 4. Create HTML/CSS based on template
    // 5. Deploy to hosting platform

    const websiteData = {
      id: `website_${Date.now()}`,
      userId: decoded.userId,
      affiliateLink: affiliateLink,
      productName: productName || 'Amazing Product',
      niche: niche || 'general',
      template: template || 'modern',
      customization: customization || {},
      content: {
        title: `${productName || 'Amazing Product'} - Best Deals & Reviews`,
        description: `Discover the best deals and comprehensive reviews for ${productName || 'this amazing product'}. Get exclusive discounts and make informed purchasing decisions.`,
        sections: [
          {
            id: 'hero',
            type: 'hero',
            title: `Get the Best ${productName || 'Product'} Deals`,
            subtitle: 'Exclusive discounts and honest reviews',
            cta: 'Shop Now',
            ctaLink: affiliateLink
          },
          {
            id: 'features',
            type: 'features',
            title: 'Why Choose This Product?',
            items: [
              'High-quality materials and construction',
              'Excellent customer reviews and ratings',
              'Competitive pricing with exclusive discounts',
              'Fast shipping and reliable customer service'
            ]
          },
          {
            id: 'reviews',
            type: 'reviews',
            title: 'Customer Reviews',
            reviews: [
              {
                name: 'Sarah M.',
                rating: 5,
                comment: 'Absolutely love this product! Exceeded my expectations.'
              },
              {
                name: 'John D.',
                rating: 4,
                comment: 'Great value for money. Would definitely recommend.'
              }
            ]
          },
          {
            id: 'cta',
            type: 'cta',
            title: 'Ready to Get Started?',
            subtitle: 'Don\'t miss out on this exclusive offer!',
            buttonText: 'Get Your Discount Now',
            buttonLink: affiliateLink
          }
        ]
      },
      seo: {
        metaTitle: `${productName || 'Amazing Product'} - Best Deals & Reviews`,
        metaDescription: `Find the best deals on ${productName || 'amazing products'}. Read honest reviews and get exclusive discounts.`,
        keywords: [productName, niche, 'deals', 'reviews', 'discount'].filter(Boolean)
      },
      analytics: {
        views: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0
      },
      status: 'generated',
      createdAt: new Date(),
      updatedAt: new Date(),
      plan: userPlan
    }

    // Save website to database
    const insertResult = await db.collection('generated_websites').insertOne(websiteData)

    // Update user's usage statistics
    await db.collection('users').updateOne(
      { _id: decoded.userId },
      { 
        $inc: { totalWebsites: 1 },
        $set: { lastWebsiteGeneratedAt: new Date() }
      }
    )

    return NextResponse.json({
      success: true,
      websiteId: insertResult.insertedId,
      website: {
        id: websiteData.id,
        title: websiteData.content.title,
        description: websiteData.content.description,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/websites/${websiteData.id}`,
        status: websiteData.status,
        createdAt: websiteData.createdAt
      },
      usage: {
        used: monthlyWebsites + 1,
        limit: limit,
        plan: userPlan
      },
      message: 'Website generated successfully'
    })

  } catch (error) {
    console.error('Website generation error:', error)
    
    // Proper error type handling for TypeScript
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate website',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST to generate websites.' },
    { status: 405 }
  )
}
