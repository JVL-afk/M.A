// CORRECTED STRIPE PAYMENT SYSTEM - FIXED IMPORT PATHS
// Replace: src/app/api/stripe/checkout/route.ts
// Delete: src/app/api/stripe/create-checkout-session/route.ts (duplicate)

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '../../../../lib/mongodb';
import jwt from 'jsonwebtoken';

// Initialize Stripe with proper error handling
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Plan configuration with exact Stripe Price IDs
const PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_1234567890', // Replace with actual Price ID
    name: 'Pro Plan',
    price: 2900, // $29.00 in cents
    features: ['AI Website Generation', 'Analytics', 'Custom Domains'],
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_0987654321', // Replace with actual Price ID
    name: 'Enterprise Plan', 
    price: 9900, // $99.00 in cents
    features: ['Everything in Pro', 'API Access', 'Priority Support', 'White Label'],
  },
};

export async function POST(request: NextRequest) {
  try {
    // 1. VERIFY AUTHENTICATION
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    let userId: string;
    let userEmail: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
        userId: string; 
        email: string; 
      };
      userId = decoded.userId;
      userEmail = decoded.email;
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid authentication token',
        code: 'INVALID_TOKEN' 
      }, { status: 401 });
    }

    // 2. PARSE AND VALIDATE REQUEST
    const { planType } = await request.json();

    if (!planType || !PLANS[planType as keyof typeof PLANS]) {
      return NextResponse.json({ 
        error: 'Invalid plan type',
        code: 'INVALID_PLAN',
        availablePlans: Object.keys(PLANS)
      }, { status: 400 });
    }

    const plan = PLANS[planType as keyof typeof PLANS];

    // 3. CONNECT TO DATABASE
    const { db } = await connectToDatabase();

    // 4. GET USER DETAILS
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    // 5. CHECK IF USER ALREADY HAS ACTIVE SUBSCRIPTION
    if (user.subscription?.status === 'active' && user.subscription?.planType === planType) {
      return NextResponse.json({ 
        error: 'User already has this subscription',
        code: 'ALREADY_SUBSCRIBED',
        currentPlan: user.subscription.planType
      }, { status: 400 });
    }

    // 6. CREATE STRIPE CUSTOMER IF NEEDED
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await db.collection('users').updateOne(
        { _id: userId },
        { $set: { stripeCustomerId: customerId } }
      );
    }

    // 7. CREATE CHECKOUT SESSION
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        planType: planType,
        userEmail: userEmail,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planType: planType,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      automatic_tax: {
        enabled: true,
      },
    });

    // 8. SAVE CHECKOUT SESSION TO DATABASE
    await db.collection('checkout_sessions').insertOne({
      sessionId: session.id,
      userId: userId,
      planType: planType,
      amount: plan.price,
      currency: 'usd',
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // 9. LOG THE CHECKOUT ATTEMPT
    await db.collection('payment_logs').insertOne({
      userId: userId,
      action: 'checkout_created',
      sessionId: session.id,
      planType: planType,
      amount: plan.price,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      planType: planType,
      amount: plan.price,
    });

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);

    // Log error to database for debugging
    try {
      const { db } = await connectToDatabase();
      await db.collection('error_logs').insertOne({
        error: error.message,
        stack: error.stack,
        endpoint: '/api/stripe/checkout',
        timestamp: new Date(),
        type: 'stripe_checkout_error',
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json({
      error: 'Failed to create checkout session',
      code: 'CHECKOUT_FAILED',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    }, { status: 500 });
  }
}

// GET endpoint for testing and status checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      // Retrieve session status
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          status: session.status,
          payment_status: session.payment_status,
          customer: session.customer,
          subscription: session.subscription,
        },
      });
    }

    // Return API status
    return NextResponse.json({
      success: true,
      message: 'Stripe Checkout API is operational',
      timestamp: new Date().toISOString(),
      availablePlans: Object.keys(PLANS),
      environment: process.env.NODE_ENV,
    });

  } catch (error: any) {
    console.error('Stripe GET Error:', error);
    return NextResponse.json({
      error: 'Failed to process request',
      details: error.message,
    }, { status: 500 });
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}



