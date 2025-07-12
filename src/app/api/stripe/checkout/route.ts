import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { priceId, planName, userId, userEmail } = await request.json()

    // Define your pricing plans
    const plans = {
      basic: {
        priceId: 'price_basic_free', // This would be your actual Stripe price ID
        amount: 0,
        name: 'Basic Plan',
        features: ['5 affiliate websites per month', 'Basic templates', 'Standard support']
      },
      pro: {
        priceId: 'price_pro_monthly', // Your actual Stripe price ID for $29/month
        amount: 2900, // $29.00 in cents
        name: 'Pro Plan',
        features: ['Unlimited affiliate websites', 'Premium templates', 'Priority support', 'Advanced analytics']
      },
      enterprise: {
        priceId: 'price_enterprise_monthly', // Your actual Stripe price ID for $99/month
        amount: 9900, // $99.00 in cents
        name: 'Enterprise Plan',
        features: ['Everything in Pro', 'Team collaboration', 'White-label solutions', 'API access', 'Dedicated support']
      }
    }

    // Handle free plan separately
    if (planName === 'basic') {
      return NextResponse.json({
        success: true,
        message: 'Free plan activated successfully',
        planName: 'Basic Plan',
        amount: 0
      })
    }

    // Create Stripe checkout session for paid plans
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [
        {
          price: plans[planName as keyof typeof plans].priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        planName: planName,
        planDisplayName: plans[planName as keyof typeof plans].name
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planName: planName
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_creation: 'always',
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      planName: plans[planName as keyof typeof plans].name,
      amount: plans[planName as keyof typeof plans].amount
    })

  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create checkout session',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Handle GET requests for plan information
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const planName = searchParams.get('plan')

  const plans = {
    basic: {
      name: 'Basic Plan',
      price: 0,
      interval: 'month',
      features: [
        '5 affiliate websites per month',
        'Basic templates',
        'Standard support',
        'Basic analytics'
      ]
    },
    pro: {
      name: 'Pro Plan',
      price: 29,
      interval: 'month',
      features: [
        'Unlimited affiliate websites',
        'Premium templates',
        'Priority support',
        'Advanced analytics',
        'AI chatbot integration',
        'Custom domains'
      ]
    },
    enterprise: {
      name: 'Enterprise Plan',
      price: 99,
      interval: 'month',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'White-label solutions',
        'API access',
        'Dedicated support',
        'Custom integrations',
        'Advanced reporting'
      ]
    }
  }

  if (planName && plans[planName as keyof typeof plans]) {
    return NextResponse.json({
      success: true,
      plan: plans[planName as keyof typeof plans]
    })
  }

  return NextResponse.json({
    success: true,
    plans: plans
  })
}
