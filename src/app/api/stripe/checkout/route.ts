// FIXED STRIPE CHECKOUT ROUTE - src/app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

// Plan configurations
const PLANS = {
  pro: {
    name: 'Pro Plan',
    price: 2900, // $29.00 in cents
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    features: [
      '25 AI-Generated Websites',
      '3 Premium Templates',
      'Advanced Analytics',
      'Priority Support',
      'Custom Domains'
    ],
    limits: {
      websites: 25,
      templates: 3,
      analytics: true,
      support: 'priority'
    }
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 9900, // $99.00 in cents
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
    features: [
      'Unlimited AI-Generated Websites',
      '5 Premium Templates',
      'Advanced Analytics & Reports',
      'API Access',
      'White-label Options',
      'Dedicated Support',
      'Custom Integrations'
    ],
    limits: {
      websites: 999,
      templates: 5,
      analytics: true,
      api: true,
      whiteLabel: true,
      support: 'dedicated'
    }
  }
};

// Verify user authentication
async function verifyUser(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    
    return user;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// Create checkout session
export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await verifyUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { plan, successUrl, cancelUrl } = await request.json();

    // Validate plan
    if (!PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const selectedPlan = PLANS[plan as keyof typeof PLANS];

    // Check if user already has this plan or higher
    if (user.plan === plan || (user.plan === 'enterprise' && plan === 'pro')) {
      return NextResponse.json(
        { error: 'You already have this plan or a higher plan' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
          affilify_user: 'true'
        }
      });
      
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      const { db } = await connectToDatabase();
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { stripeCustomerId: customerId } }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
              description: `AFFILIFY ${selectedPlan.name} - ${selectedPlan.features.join(', ')}`,
              images: ['https://affilify.eu/logo.png'], // Add your logo URL
            },
            unit_amount: selectedPlan.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?upgrade=success&plan=${plan}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?upgrade=cancelled`,
      metadata: {
        userId: user._id.toString(),
        plan: plan,
        userEmail: user.email
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          plan: plan,
          affilify_subscription: 'true'
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    });

    // Log checkout session creation
    const { db } = await connectToDatabase();
    await db.collection('checkout_sessions').insertOne({
      sessionId: session.id,
      userId: user._id,
      plan: plan,
      amount: selectedPlan.price,
      status: 'pending',
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        message: 'Unable to process payment. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

