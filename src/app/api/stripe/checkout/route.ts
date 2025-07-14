import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import Stripe from 'stripe'

// Initialize Stripe without specifying API version to avoid compatibility issues
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json()

    // Validate plan
    const validPlans = ['basic', 'pro', 'enterprise']
    if (!plan || !validPlans.includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication. Please log in again.' },
        { status: 401 }
      )
    }

    // Connect to database
    const client = await connectToDatabase()
    const db = client.db('affilify')

    // Get user details
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId) 
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Define plan pricing
    const planPricing = {
      basic: { price: 0, priceId: null },
      pro: { price: 2900, priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro' },
      enterprise: { price: 9900, priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise' }
    }

    const selectedPlan = planPricing[plan as keyof typeof planPricing]

    // Handle free plan
    if (plan === 'basic') {
      // Update user plan directly for free plan
      await db.collection('users').updateOne(
        { _id: new ObjectId(decoded.userId) },
        { $set: { plan: 'basic', updatedAt: new Date() } }
      )

      return NextResponse.json({
        success: true,
        message: 'Successfully upgraded to Basic plan!',
        plan: 'basic'
      })
    }

    // Create Stripe checkout session for paid plans
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `AFFILIFY ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
                description: `Monthly subscription to AFFILIFY ${plan} plan`
              },
              unit_amount: selectedPlan.price,
              recurring: {
                interval: 'month'
              }
            },
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success&plan=${plan}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?payment=cancelled`,
        customer_email: user.email,
        metadata: {
          userId: decoded.userId,
          plan: plan
        }
      })

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        url: session.url
      })

    } catch (stripeError) {
      console.error('Stripe error:', stripeError)
      
      const errorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment processing failed. Please try again.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Checkout error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Checkout failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}


