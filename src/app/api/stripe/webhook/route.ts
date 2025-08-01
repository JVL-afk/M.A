// FIXED STRIPE WEBHOOK HANDLER - src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, db);
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription, db);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(updatedSubscription, db);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(deletedSubscription, db);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice, db);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(failedInvoice, db);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle successful checkout completion
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, db: any) {
  try {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (!userId || !plan) {
      console.error('Missing metadata in checkout session');
      return;
    }

    // Update user plan and subscription info
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          plan: plan,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          planUpgradedAt: new Date(),
          isActive: true
        }
      }
    );

    // Update checkout session status
    await db.collection('checkout_sessions').updateOne(
      { sessionId: session.id },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          subscriptionId: session.subscription
        }
      }
    );

    // Log successful upgrade
    await db.collection('plan_upgrades').insertOne({
      userId: new ObjectId(userId),
      fromPlan: 'basic', // Could be retrieved from user's previous plan
      toPlan: plan,
      amount: session.amount_total,
      stripeSessionId: session.id,
      stripeSubscriptionId: session.subscription,
      createdAt: new Date()
    });

    console.log(`User ${userId} successfully upgraded to ${plan} plan`);

  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription: Stripe.Subscription, db: any) {
  try {
    const userId = subscription.metadata?.userId;
    const plan = subscription.metadata?.plan;

    if (!userId || !plan) return;

    await db.collection('subscriptions').insertOne({
      userId: new ObjectId(userId),
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      plan: plan,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      createdAt: new Date()
    });

  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription, db: any) {
  try {
    await db.collection('subscriptions').updateOne(
      { stripeSubscriptionId: subscription.id },
      {
        $set: {
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date()
        }
      }
    );

    // Update user status if subscription is cancelled or past due
    if (subscription.status === 'canceled' || subscription.status === 'past_due') {
      const userId = subscription.metadata?.userId;
      if (userId) {
        await db.collection('users').updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              plan: 'basic',
              isActive: subscription.status !== 'canceled',
              planDowngradedAt: new Date()
            }
          }
        );
      }
    }

  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription, db: any) {
  try {
    const userId = subscription.metadata?.userId;
    
    if (userId) {
      // Downgrade user to basic plan
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            plan: 'basic',
            isActive: false,
            planDowngradedAt: new Date(),
            stripeSubscriptionId: null
          }
        }
      );
    }

    // Update subscription record
    await db.collection('subscriptions').updateOne(
      { stripeSubscriptionId: subscription.id },
      {
        $set: {
          status: 'canceled',
          canceledAt: new Date()
        }
      }
    );

  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: Stripe.Invoice, db: any) {
  try {
    await db.collection('payments').insertOne({
      stripeInvoiceId: invoice.id,
      stripeCustomerId: invoice.customer,
      stripeSubscriptionId: invoice.subscription,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
      createdAt: new Date()
    });

  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice, db: any) {
  try {
    await db.collection('payments').insertOne({
      stripeInvoiceId: invoice.id,
      stripeCustomerId: invoice.customer,
      stripeSubscriptionId: invoice.subscription,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      failedAt: new Date(),
      createdAt: new Date()
    });

    // Optionally notify user of failed payment
    // You could send an email or create a notification here

  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}


