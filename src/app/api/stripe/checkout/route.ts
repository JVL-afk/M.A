// src/app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received checkout request:', body);

    // FLEXIBLE FIELD MAPPING - Accept multiple naming conventions
    const planId = body.planId || body.priceId || body.price_id;
    const planName = body.planName || body.plan || body.planType || body.name;
    const billingCycle = body.billingCycle || body.cycle || body.billing || body.interval || 'monthly';

    // COMPREHENSIVE VALIDATION
    if (!planId) {
      return NextResponse.json(
        { 
          error: 'Missing plan identifier', 
          details: 'Please provide planId, priceId, or price_id',
          receivedFields: Object.keys(body)
        },
        { status: 400 }
      );
    }

    if (!planName) {
      return NextResponse.json(
        { 
          error: 'Missing plan name', 
          details: 'Please provide planName, plan, planType, or name',
          receivedFields: Object.keys(body)
        },
        { status: 400 }
      );
    }

    // MAP PLAN NAMES TO STRIPE PRICE IDs (Update these with your actual Stripe Price IDs)
    const PRICE_MAPPING: Record<string, string> = {
      'basic': process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || 'price_basic_monthly_default',
      'pro': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly_default',
      'enterprise': process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly_default',
      // Support multiple naming conventions
      'Basic': process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || 'price_basic_monthly_default',
      'Pro': process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly_default',
      'Enterprise': process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly_default',
    };

    // Determine the correct Stripe Price ID
    const stripePriceId = PRICE_MAPPING[planName] || planId;

    // GET USER INFO (if authentication is implemented)
    let customerEmail = body.email || body.customerEmail || 'customer@example.com';
    
    // CREATE STRIPE CHECKOUT SESSION
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // For recurring payments
      customer_email: customerEmail,
      metadata: {
        planId: planId,
        planName: planName,
        billingCycle: billingCycle,
        userId: body.userId || 'anonymous',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log('Stripe session created successfully:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      success: true,
    });

  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.message,
        type: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}

// OPTIONAL: Handle GET requests for testing
export async function GET() {
  return NextResponse.json({
    message: 'Stripe Checkout API is running',
    timestamp: new Date().toISOString(),
    requiredFields: ['planId/priceId', 'planName/plan', 'billingCycle/cycle (optional)'],
    supportedPlans: ['basic', 'pro', 'enterprise']
  });
}

