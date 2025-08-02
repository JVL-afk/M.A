// Stripe Webhook Handler
// File: src/app/api/stripe/webhook/route.ts
// This handles Stripe webhook events for subscription management

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '../../../lib/mongodb';

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
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
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
                  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  updatedAt: new Date(),
                },
              },
            }
          );

          console.log('Subscription activated for user:', session.metadata?.userId);
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        
        // Find user by Stripe subscription ID
        const userToUpdate = await db.collection('users').findOne({
          'subscription.stripeSubscriptionId': updatedSubscription.id,
        });

        if (userToUpdate) {
          await db.collection('users').updateOne(
            { _id: userToUpdate._id },
            {
              $set: {
                'subscription.status': updatedSubscription.status,
                'subscription.currentPeriodEnd': new Date(updatedSubscription.current_period_end * 1000),
                'subscription.updatedAt': new Date(),
              },
            }
          );

          console.log('Subscription updated for user:', userToUpdate._id);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        
        // Find user by Stripe subscription ID
        const userToCancel = await db.collection('users').findOne({
          'subscription.stripeSubscriptionId': deletedSubscription.id,
        });

        if (userToCancel) {
          await db.collection('users').updateOne(
            { _id: userToCancel._id },
            {
              $set: {
                'subscription.status': 'canceled',
                'subscription.canceledAt': new Date(),
                'subscription.updatedAt': new Date(),
              },
            }
          );

          console.log('Subscription canceled for user:', userToCancel._id);
        }
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          // Find user by Stripe subscription ID
          const userWithInvoice = await db.collection('users').findOne({
            'subscription.stripeSubscriptionId': invoice.subscription,
          });

          if (userWithInvoice) {
            // Update subscription period end
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            
            await db.collection('users').updateOne(
              { _id: userWithInvoice._id },
              {
                $set: {
                  'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
                  'subscription.updatedAt': new Date(),
                },
              }
            );

            // Log the payment
            await db.collection('payments').insertOne({
              userId: userWithInvoice._id,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'succeeded',
              createdAt: new Date(),
            });

            console.log('Payment succeeded for user:', userWithInvoice._id);
          }
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        
        if (failedInvoice.subscription) {
          // Find user by Stripe subscription ID
          const userWithFailedPayment = await db.collection('users').findOne({
            'subscription.stripeSubscriptionId': failedInvoice.subscription,
          });

          if (userWithFailedPayment) {
            // Log the failed payment
            await db.collection('payments').insertOne({
              userId: userWithFailedPayment._id,
              stripeInvoiceId: failedInvoice.id,
              amount: failedInvoice.amount_due,
              currency: failedInvoice.currency,
              status: 'failed',
              createdAt: new Date(),
            });

            // Optionally update subscription status
            await db.collection('users').updateOne(
              { _id: userWithFailedPayment._id },
              {
                $set: {
                  'subscription.lastPaymentFailed': true,
                  'subscription.updatedAt': new Date(),
                },
              }
            );

            console.log('Payment failed for user:', userWithFailedPayment._id);
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({
      error: 'Webhook handler failed',
      details: error.message,
    }, { status: 500 });
  }
}

