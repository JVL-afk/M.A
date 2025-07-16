import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';

// Initialize Stripe with the correct API version that TypeScript expects
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia', // Updated to the expected API version
});

export async function POST(request: NextRequest) {
  try {
    // --- 1. Get User Authentication ---
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key-for-development') as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token.' },
        { status: 401 }
      );
    }

    // --- 2. Get Request Data ---
    const { planType } = await request.json();

    if (!planType || !['pro', 'enterprise'].includes(planType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan type. Must be "pro" or "enterprise".' },
        { status: 400 }
      );
    }

    // --- 3. Connect to Database ---
    const client = await connectToDatabase();
    const db = client.db('affilify');
    const usersCollection = db.collection('users');

    // Get user details
    const user = await usersCollection.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    // --- 4. Define Plan Pricing ---
    const planPricing = {
      pro: {
        priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
        amount: 2900, // $29.00 in cents
        name: 'Pro Plan',
      },
      enterprise: {
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
        amount: 9900, // $99.00 in cents
        name: 'Enterprise Plan',
      },
    };

    const selectedPlan = planPricing[planType as keyof typeof planPricing];

    // --- 5. Create Stripe Checkout Session ---
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `AFFILIFY ${selectedPlan.name}`,
              description: `Monthly subscription to AFFILIFY ${selectedPlan.name}`,
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?payment=success&plan=${planType}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pricing?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        userId: userId.toString( ),
        planType: planType,
        userEmail: user.email,
      },
    });

    // --- 6. Log Payment Attempt ---
    await db.collection('payment_attempts').insertOne({
      userId: userId,
      userEmail: user.email,
      planType: planType,
      sessionId: session.id,
      amount: selectedPlan.amount,
      status: 'pending',
      createdAt: new Date(),
    });

    // --- 7. Return Checkout URL ---
    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('STRIPE_CHECKOUT_ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session.', details: errorMessage },
      { status: 500 }
    );
  }
}

// Handle Stripe webhook events (for subscription updates)
export async function PUT(request: NextRequest) {
  try {
    const { sessionId, status, planType } = await request.json();

    if (!sessionId || !status) {
      return NextResponse.json(
        { success: false, error: 'Session ID and status are required.' },
        { status: 400 }
      );
    }

    // --- Connect to Database ---
    const client = await connectToDatabase();
    const db = client.db('affilify');

    // Update payment attempt status
    await db.collection('payment_attempts').updateOne(
      { sessionId: sessionId },
      { 
        $set: { 
          status: status,
          updatedAt: new Date(),
        }
      }
    );

    // If payment was successful, update user plan
    if (status === 'completed' && planType) {
      await db.collection('users').updateOne(
        { email: { $exists: true } }, // Find user by session metadata
        { 
          $set: { 
            plan: planType,
            updatedAt: new Date(),
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully.',
    });

  } catch (error) {
    console.error('STRIPE_WEBHOOK_ERROR:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook.' },
      { status: 500 }
    );
  }
}
