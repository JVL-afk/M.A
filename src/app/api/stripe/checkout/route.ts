import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Plan configurations - BASIC IS NOW FREE!
const PLANS = {
  basic: {
    priceId: null, // No payment needed for basic
    name: 'Basic Plan',
    amount: 0, // FREE!
  },
  pro: {
    priceId: 'price_1RdShtEu2csRkzAfNi4ll41S', // Replace with your actual Stripe price ID
    name: 'Pro Plan',
    amount: 2900, // $29.00
  },
  enterprise: {
    priceId: 'price_1RdSjJEu2csRkzAfLNny3pXd', // Replace with your actual Stripe price ID  
    name: 'Enterprise Plan',
    amount: 9900, // $99.00
  },
};

function verifyAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret-key');
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { plan } = await request.json();

    // Validate plan
    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json(
        { 
          error: 'Invalid plan selected',
          availablePlans: Object.keys(PLANS)
        },
        { status: 400 }
      );
    }

    const selectedPlan = PLANS[plan as keyof typeof PLANS];

    // Handle free basic plan
    if (plan === 'basic') {
      // For basic plan, just update user's plan in database
      // No payment required!
      return NextResponse.json({
        success: true,
        plan: selectedPlan,
        message: 'Basic plan activated - no payment required!',
        redirect: '/dashboard?plan=basic&activated=true'
      });
    }

    // For paid plans (Pro and Enterprise), create Stripe checkout
    if (!selectedPlan.priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this plan' },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL || 'https://affilify.eu'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'https://affilify.eu'}/pricing?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.userId,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          userId: user.userId,
          plan: plan,
        },
      },
      allow_promotion_codes: true,
    } );

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      plan: selectedPlan
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { 
        error: 'Checkout session creation failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
