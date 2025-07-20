import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '../../../../lib/mongodb';
import { withErrorHandler, ErrorFactory } from '../../../../lib/error-handler';
import { EnvironmentConfig } from '../../../../lib/environment';

// Initialize Stripe
const stripe = new Stripe(EnvironmentConfig.stripe.secretKey, {
  apiVersion: '2024-06-20',
  typescript: true,
});

const webhookSecret = EnvironmentConfig.stripe.webhookSecret;

// Handle subscription created
async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  const { db } = await connectToDatabase();
  
  const userId = subscription.metadata.userId;
  const plan = subscription.metadata.plan;
  
  if (!userId || !plan) {
    console.error('Missing metadata in subscription:', subscription.id);
    return;
  }
  
  // Create subscription record
  await db.collection('subscriptions').insertOne({
    userId,
    plan,
    status: subscription.status,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Update user subscription status
  await db.collection('users').updateOne(
    { _id: userId },
    {
      $set: {
        'subscription.plan': plan,
        'subscription.status': subscription.status,
        'subscription.stripeSubscriptionId': subscription.id,
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        updatedAt: new Date()
      }
    }
  );
  
  console.log(`Subscription created for user ${userId}: ${subscription.id}`);
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const { db } = await connectToDatabase();
  
  const userId = subscription.metadata.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata:', subscription.id);
    return;
  }
  
  // Update subscription record
  await db.collection('subscriptions').updateOne(
    { stripeSubscriptionId: subscription.id },
    {
      $set: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date()
      }
    }
  );
  
  // Update user subscription status
  await db.collection('users').updateOne(
    { _id: userId },
    {
      $set: {
        'subscription.status': subscription.status,
        'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
        'subscription.cancelAtPeriodEnd': subscription.cancel_at_period_end,
        updatedAt: new Date()
      }
    }
  );
  
  console.log(`Subscription updated for user ${userId}: ${subscription.id} - ${subscription.status}`);
}

// Handle subscription deleted/cancelled
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const { db } = await connectToDatabase();
  
  const userId = subscription.metadata.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata:', subscription.id);
    return;
  }
  
  // Update subscription record
  await db.collection('subscriptions').updateOne(
    { stripeSubscriptionId: subscription.id },
    {
      $set: {
        status: 'cancelled',
        canceledAt: new Date(),
        updatedAt: new Date()
      }
    }
  );
  
  // Downgrade user to free plan
  await db.collection('users').updateOne(
    { _id: userId },
    {
      $set: {
        'subscription.plan': 'free',
        'subscription.status': 'active',
        'subscription.stripeSubscriptionId': null,
        'subscription.currentPeriodEnd': null,
        'subscription.cancelAtPeriodEnd': false,
        updatedAt: new Date()
      }
    }
  );
  
  console.log(`Subscription cancelled for user ${userId}: ${subscription.id}`);
}

// Handle payment succeeded
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const { db } = await connectToDatabase();
  
  // Log successful payment
  await db.collection('payment_logs').insertOne({
    stripePaymentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'succeeded',
    customerId: paymentIntent.customer as string,
    metadata: paymentIntent.metadata,
    createdAt: new Date()
  });
  
  console.log(`Payment succeeded: ${paymentIntent.id} - ${paymentIntent.amount} ${paymentIntent.currency}`);
}

// Handle payment failed
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const { db } = await connectToDatabase();
  
  // Log failed payment
  await db.collection('payment_logs').insertOne({
    stripePaymentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'failed',
    customerId: paymentIntent.customer as string,
    metadata: paymentIntent.metadata,
    failureReason: paymentIntent.last_payment_error?.message,
    createdAt: new Date()
  });
  
  console.log(`Payment failed: ${paymentIntent.id} - ${paymentIntent.last_payment_error?.message}`);
}

// Handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const { db } = await connectToDatabase();
  
  // Log invoice payment
  await db.collection('payment_logs').insertOne({
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'paid',
    customerId: invoice.customer as string,
    subscriptionId: invoice.subscription as string,
    createdAt: new Date()
  });
  
  console.log(`Invoice payment succeeded: ${invoice.id} - ${invoice.amount_paid} ${invoice.currency}`);
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const { db } = await connectToDatabase();
  
  // Log failed invoice payment
  await db.collection('payment_logs').insertOne({
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: 'payment_failed',
    customerId: invoice.customer as string,
    subscriptionId: invoice.subscription as string,
    createdAt: new Date()
  });
  
  // If subscription exists, mark it as past_due
  if (invoice.subscription) {
    await db.collection('subscriptions').updateOne(
      { stripeSubscriptionId: invoice.subscription },
      {
        $set: {
          status: 'past_due',
          updatedAt: new Date()
        }
      }
    );
    
    // Update user subscription status
    const subscription = await db.collection('subscriptions').findOne({
      stripeSubscriptionId: invoice.subscription
    });
    
    if (subscription) {
      await db.collection('users').updateOne(
        { _id: subscription.userId },
        {
          $set: {
            'subscription.status': 'past_due',
            updatedAt: new Date()
          }
        }
      );
    }
  }
  
  console.log(`Invoice payment failed: ${invoice.id} - ${invoice.amount_due} ${invoice.currency}`);
}

// Main webhook handler
async function handleWebhook(request: NextRequest): Promise<NextResponse> {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    throw ErrorFactory.validation('Missing Stripe signature');
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw ErrorFactory.validation('Invalid webhook signature');
  }
  
  console.log(`Received webhook: ${event.type} - ${event.id}`);
  
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }
    
    // Log webhook processing
    const { db } = await connectToDatabase();
    await db.collection('webhook_logs').insertOne({
      eventId: event.id,
      eventType: event.type,
      processed: true,
      createdAt: new Date()
    });
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    
    // Log webhook error
    try {
      const { db } = await connectToDatabase();
      await db.collection('webhook_logs').insertOne({
        eventId: event.id,
        eventType: event.type,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date()
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }
    
    throw error;
  }
}

// Export POST handler with error handling
export const POST = withErrorHandler(handleWebhook);

