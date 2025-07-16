import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialize Stripe with the correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia', // Updated to the expected API version
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    // --- 1. Get the raw body and signature ---
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('WEBHOOK_ERROR: No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    // --- 2. Verify the webhook signature ---
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('WEBHOOK_SIGNATURE_ERROR:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // --- 3. Connect to Database ---
    const client = await connectToDatabase();
    const db = client.db('affilify');

    // --- 4. Handle Different Event Types ---
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('WEBHOOK: Checkout session completed:', session.id);

        // Extract metadata
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;
        const userEmail = session.metadata?.userEmail;

        if (!userId || !planType || !userEmail) {
          console.error('WEBHOOK_ERROR: Missing metadata in session:', session.id);
          break;
        }

        // --- Update User Plan ---
        try {
          const result = await db.collection('users').updateOne(
            { email: userEmail },
            { 
              $set: { 
                plan: planType,
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
                updatedAt: new Date(),
              }
            }
          );

          if (result.matchedCount === 0) {
            console.error('WEBHOOK_ERROR: User not found for email:', userEmail);
          } else {
            console.log('WEBHOOK_SUCCESS: Updated user plan:', userEmail, 'to', planType);
          }
        } catch (dbError) {
          console.error('WEBHOOK_DB_ERROR:', dbError);
        }

        // --- Update Payment Attempt Status ---
        try {
          await db.collection('payment_attempts').updateOne(
            { sessionId: session.id },
            { 
              $set: { 
                status: 'completed',
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
                completedAt: new Date(),
                updatedAt: new Date(),
              }
            }
          );
        } catch (dbError) {
          console.error('WEBHOOK_PAYMENT_UPDATE_ERROR:', dbError);
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('WEBHOOK: Checkout session expired:', session.id);

        // Update payment attempt status to expired
        try {
          await db.collection('payment_attempts').updateOne(
            { sessionId: session.id },
            { 
              $set: { 
                status: 'expired',
                updatedAt: new Date(),
              }
            }
          );
        } catch (dbError) {
          console.error('WEBHOOK_EXPIRED_UPDATE_ERROR:', dbError);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('WEBHOOK: Subscription updated:', subscription.id);

        // Handle subscription changes (upgrades, downgrades, etc.)
        try {
          await db.collection('users').updateOne(
            { stripeSubscriptionId: subscription.id },
            { 
              $set: { 
                subscriptionStatus: subscription.status,
                updatedAt: new Date(),
              }
            }
          );
        } catch (dbError) {
          console.error('WEBHOOK_SUBSCRIPTION_UPDATE_ERROR:', dbError);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('WEBHOOK: Subscription cancelled:', subscription.id);

        // Downgrade user to basic plan
        try {
          await db.collection('users').updateOne(
            { stripeSubscriptionId: subscription.id },
            { 
              $set: { 
                plan: 'basic',
                subscriptionStatus: 'cancelled',
                stripeSubscriptionId: null,
                updatedAt: new Date(),
              }
            }
          );
        } catch (dbError) {
          console.error('WEBHOOK_CANCELLATION_ERROR:', dbError);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        console.log('WEBHOOK: Payment failed for subscription:', invoice.subscription);

        // Handle failed payment (could send email, update status, etc.)
        try {
          await db.collection('users').updateOne(
            { stripeSubscriptionId: invoice.subscription },
            { 
              $set: { 
                subscriptionStatus: 'past_due',
                updatedAt: new Date(),
              }
            }
          );
        } catch (dbError) {
          console.error('WEBHOOK_PAYMENT_FAILED_ERROR:', dbError);
        }

        break;
      }

      default:
        console.log('WEBHOOK: Unhandled event type:', event.type);
    }

    // --- 5. Return Success Response ---
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('WEBHOOK_GENERAL_ERROR:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

