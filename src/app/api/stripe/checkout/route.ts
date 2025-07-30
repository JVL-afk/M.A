// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with your secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { planId, planName, billingCycle } = await request.json()

    // Validate required fields
    if (!planId || !planName || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, planName, billingCycle' },
        { status: 400 }
      )
    }

    // Define your price IDs based on plan and billing cycle
    const priceMap: { [key: string]: string } = {
      'basic-monthly': process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || '',
      'basic-yearly': process.env.STRIPE_BASIC_YEARLY_PRICE_ID || '',
      'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
      'pro-yearly': process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
      'enterprise-monthly': process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || '',
      'enterprise-yearly': process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || '',
    }

    const priceKey = `${planName.toLowerCase()}-${billingCycle}`
    const priceId = priceMap[priceKey]

    if (!priceId) {
      return NextResponse.json(
        { error: `Invalid plan configuration: ${priceKey}` },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        planId,
        planName,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          planId,
          planName,
          billingCycle,
        },
      },
      allow_promotion_codes: true, // Enable coupon codes
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

// GET method for retrieving session details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      session: {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
        subscription_id: session.subscription,
      }
    })

  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}


