import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Stripe } from 'stripe';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, plan } = session.metadata!;

    if (!userId || !plan) {
      return NextResponse.json({ error: 'Webhook Error: Missing metadata' }, { status: 400 });
    }

    try {
      const client = await connectToDatabase();
      const db = client.db('affilify');

      // Update the user's plan in your database
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { plan: plan, updatedAt: new Date() } }
      );

      console.log(`✅ Successfully updated user ${userId} to plan ${plan}`);

    } catch (dbError) {
      console.error('Database error during webhook processing:', dbError);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  }
  
  // Handle other events if needed, e.g., subscription cancellations
  // if (event.type === 'customer.subscription.deleted') { ... }

  return NextResponse.json({ received: true });
}
