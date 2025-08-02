// FIXED Stripe Payment System
// File: src/app/api/stripe/checkout/route.ts
// This provides complete Stripe checkout functionality

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '../../../lib/mongodb';
import jwt from 'jsonwebtoken';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: 'Pro Plan',
    price: 2900, // $29.00 in cents
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    name: 'Enterprise Plan',
    price: 9900, // $99.00 in cents
  },
};

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let userId: string;
    let userEmail: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
      userId = decoded.userId;
      userEmail = decoded.email;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse request body
    const { planType } = await request.json();

    if (!planType || !PLANS[planType as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    const plan = PLANS[planType as keyof typeof PLANS];

    // Connect to database
    const { db } = await connectToDatabase();

    // Get user details
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
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
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planType: planType,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    // Save checkout session to database
    await db.collection('checkout_sessions').insertOne({
      sessionId: session.id,
      userId: userId,
      planType: planType,
      status: 'pending',
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({
      error: 'Failed to create checkout session',
      details: error.message,
    }, { status: 500 });
  }
}

// Handle successful payment verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Connect to database
      const { db } = await connectToDatabase();

      // Update user's subscription status
      await db.collection('users').updateOne(
        { _id: session.metadata?.userId },
        {
          $set: {
            subscription: {
              status: 'active',
              planType: session.metadata?.planType,
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              updatedAt: new Date(),
            },
          },
        }
      );

      // Update checkout session status
      await db.collection('checkout_sessions').updateOne(
        { sessionId: sessionId },
        {
          $set: {
            status: 'completed',
            completedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Payment successful',
        subscription: {
          status: 'active',
          planType: session.metadata?.planType,
        },
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Payment not completed',
    });

  } catch (error) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json({
      error: 'Failed to verify payment',
      details: error.message,
    }, { status: 500 });
  }
}

