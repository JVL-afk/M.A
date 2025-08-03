// CORRECTED STRIPE WEBHOOK HANDLER - FIXED IMPORT PATH
// Create: src/app/api/stripe/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '../../../../../lib/mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update user subscription
        if (session.metadata?.userId && session.metadata?.planType) {
          await db.collection('users').updateOne(
            { _id: session.metadata.userId },
            {
              $set: {
                'subscription.status': 'active',
                'subscription.planType': session.metadata.planType,
                'subscription.stripeCustomerId': session.customer,
                'subscription.stripeSubscriptionId': session.subscription,
                'subscription.currentPeriodStart': new Date(),
                'subscription.currentPeriodEnd': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                'subscription.updatedAt': new Date(),
              }
            }
          );

          // Log successful payment
          await db.collection('payment_logs').insertOne({
            userId: session.metadata.userId,
            action: 'payment_completed',
            sessionId: session.id,
            planType: session.metadata.planType,
            amount: session.amount_total,
            currency: session.currency,
            timestamp: new Date(),
          });
        }
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status
        if (subscription.metadata?.userId) {
          await db.collection('users').updateOne(
            { _id: subscription.metadata.userId },
            {
              $set: {
                'subscription.status': subscription.status,
                'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
                'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
                'subscription.updatedAt': new Date(),
              }
            }
          );
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        
        // Cancel subscription
        if (deletedSubscription.metadata?.userId) {
          await db.collection('users').updateOne(
            { _id: deletedSubscription.metadata.userId },
            {
              $set: {
                'subscription.status': 'canceled',
                'subscription.planType': 'basic',
                'subscription.canceledAt': new Date(),
                'subscription.updatedAt': new Date(),
              }
            }
          );
        }
        break;

      case 'invoice.payment_failed':
        const invoice = event.data.object as Stripe.Invoice;
        
        // Handle failed payment
        if (invoice.customer && typeof invoice.customer === 'string') {
          const user = await db.collection('users').findOne({
            'subscription.stripeCustomerId': invoice.customer
          });

          if (user) {
            await db.collection('users').updateOne(
              { _id: user._id },
              {
                $set: {
                  'subscription.status': 'past_due',
                  'subscription.updatedAt': new Date(),
                }
              }
            );

            // Log failed payment
            await db.collection('payment_logs').insertOne({
              userId: user._id,
              action: 'payment_failed',
              invoiceId: invoice.id,
              amount: invoice.amount_due,
              currency: invoice.currency,
              timestamp: new Date(),
            });
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);

    // Log error
    try {
      const { db } = await connectToDatabase();
      await db.collection('error_logs').insertOne({
        error: error.message,
        stack: error.stack,
        endpoint: '/api/stripe/webhook',
        timestamp: new Date(),
        type: 'webhook_error',
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// GET endpoint for webhook testing
export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
