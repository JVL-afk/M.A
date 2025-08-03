import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
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
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get customer and subscription details
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        
        // Update user's subscription status
        await db.collection('users').updateOne(
          { stripeCustomerId: customerId },
          {
            $set: {
              stripeSubscriptionId: subscriptionId,
              plan: session.metadata?.plan || 'pro',
              subscriptionStatus: 'active',
              updatedAt: new Date()
            }
          }
        );
        
        // Log the payment
        await db.collection('payments').insertOne({
          userId: session.metadata?.userId,
          stripeSessionId: session.id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          amount: session.amount_total,
          currency: session.currency,
          plan: session.metadata?.plan || 'pro',
          status: 'completed',
          createdAt: new Date()
        });
        
        console.log('Checkout session completed:', session.id);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status
        await db.collection('users').updateOne(
          { stripeCustomerId: subscription.customer as string },
          {
            $set: {
              subscriptionStatus: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              updatedAt: new Date()
            }
          }
        );
        
        console.log('Subscription updated:', subscription.id);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Downgrade user to basic plan
        await db.collection('users').updateOne(
          { stripeCustomerId: subscription.customer as string },
          {
            $set: {
              plan: 'basic',
              subscriptionStatus: 'canceled',
              stripeSubscriptionId: null,
              updatedAt: new Date()
            }
          }
        );
        
        console.log('Subscription canceled:', subscription.id);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Log successful payment
        await db.collection('payments').insertOne({
          stripeInvoiceId: invoice.id,
          stripeCustomerId: invoice.customer as string,
          stripeSubscriptionId: invoice.subscription as string,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: 'completed',
          createdAt: new Date()
        });
        
        console.log('Payment succeeded:', invoice.id);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Update user's subscription status
        await db.collection('users').updateOne(
          { stripeCustomerId: invoice.customer as string },
          {
            $set: {
              subscriptionStatus: 'past_due',
              updatedAt: new Date()
            }
          }
        );
        
        // Log failed payment
        await db.collection('payments').insertOne({
          stripeInvoiceId: invoice.id,
          stripeCustomerId: invoice.customer as string,
          stripeSubscriptionId: invoice.subscription as string,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: 'failed',
          failureReason: 'payment_failed',
          createdAt: new Date()
        });
        
        console.log('Payment failed:', invoice.id);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
