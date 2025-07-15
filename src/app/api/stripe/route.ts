import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { Stripe } from 'stripe';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Use a specific, stable API version
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    if (!decoded.userId) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // 2. Get the plan from the request body
    const { plan, priceId } = await request.json();
    if (!plan || !priceId) {
      return NextResponse.json({ success: false, error: 'Plan and Price ID are required' }, { status: 400 });
    }

    // 3. Get user from database to pass to Stripe
    const client = await connectToDatabase();
    const db = client.db('affilify');
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 4. Create a real Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard?payment_success=true`,
      cancel_url: `${appUrl}/pricing?payment_canceled=true`,
      customer_email: user.email, // Pre-fill the customer's email
      metadata: {
        userId: user._id.toString( ), // Pass the user ID to the webhook
        plan: plan,
      },
    });

    if (!session.url) {
        return NextResponse.json({ success: false, error: 'Failed to create Stripe session.' }, { status: 500 });
    }

    // 5. Return the session URL for redirection
    return NextResponse.json({ success: true, url: session.url });

  } catch (error) {
    console.error('Stripe session creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
