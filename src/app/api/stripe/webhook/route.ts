import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialize Stripe with the correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia', // Use the correct API version
});

// Get webhook secret from environment variable
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
    const db = client.db;

    // --- 4. Handle Different Event Types ---
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('WEBHOOK: Payment succeeded for session:', session.id);
        
        // Get user ID from metadata
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;
        
        if (!userId || !planType) {
          console.error('WEBHOOK_ERROR: Missing userId or planType in session metadata');
          break;
        }
        
        try {
          // Update payment attempt status
          await db.collection('payment_attempts').updateOne(
            { sessionId: session.id },
            { 
              $set: { 
                status: 'completed',
                updatedAt: new Date(),
              }
            }
          );
          
          // Update user plan
          await db.collection('users').updateOne(
            { _id: userId },
            { 
              $set: { 
                plan: planType,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                subscriptionStatus: 'active',
                updatedAt: new Date(),
              }
            }
          );
          
          console.log(`WEBHOOK: User ${userId} upgraded to ${planType} plan`);
        } catch (dbError) {
          console.error('WEBHOOK_DB_ERROR:', dbError);
        }
        
        break;
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('WEBHOOK: Payment session expired:', session.id);
        
        try {
          // Update payment attempt status
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
          console.error('WEBHOOK_EXPIRATION_ERROR:', dbError);
        }
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log('WEBHOOK: Subscription updated:', subscription.id);
        
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
