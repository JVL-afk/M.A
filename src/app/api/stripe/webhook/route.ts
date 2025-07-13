import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(updatedSubscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(deletedSubscription)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(failedInvoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id)
  
  const { userId, planName } = session.metadata || {}
  
  if (userId && planName) {
    // Update user's subscription in database
    console.log(`User ${userId} subscribed to ${planName}`)
    
    await updateUserSubscription(userId, {
      planName,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })

    // Send welcome/payment success email
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: planName === 'basic' ? 'welcome' : 'payment_success',
          to: session.customer_email,
          data: {
            name: session.customer_details?.name || 'there',
            planName: planName,
            amount: session.amount_total ? (session.amount_total / 100).toFixed(2) : '0',
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
          }
        })
      })

      const emailResult = await emailResponse.json()
      console.log('Email sent:', emailResult)
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)
  
  const { userId, planName } = subscription.metadata || {}
  
  if (userId) {
    await updateUserSubscription(userId, {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      planName
    })
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  
  const { userId } = subscription.metadata || {}
  
  if (userId) {
    await updateUserSubscription(userId, {
      status: subscription.status,
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
    })
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  const { userId } = subscription.metadata || {}
  
  if (userId) {
    await updateUserSubscription(userId, {
      status: 'canceled',
      planName: 'basic'
    })

    // Send cancellation email
    try {
      const customer = await stripe.customers.retrieve(subscription.customer as string)
      if (customer && !customer.deleted && customer.email) {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'subscription_canceled',
            to: customer.email,
            data: {
              name: customer.name || 'there',
              planName: subscription.metadata?.planName || 'Pro',
              endDate: new Date((subscription as any).current_period_end * 1000).toLocaleDateString()
            }
          })
        })
      }
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError)
    }
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id)
  
  // Send payment confirmation email for recurring payments
  try {
    if (invoice.customer_email && (invoice as any).subscription) {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'payment_success',
          to: invoice.customer_email,
          data: {
            name: invoice.customer_name || 'there',
            planName: 'Pro', // You might want to get this from subscription metadata
            amount: invoice.amount_paid ? (invoice.amount_paid / 100).toFixed(2) : '0',
            nextBillingDate: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString() : 'N/A'
          }
        })
      })
    }
  } catch (emailError) {
    console.error('Failed to send payment success email:', emailError)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id)
  
  // You could send a payment failure email here
  // Handle dunning management
}

// Mock database function - replace with your actual database logic
async function updateUserSubscription(userId: string, subscriptionData: any) {
  console.log('Updating user subscription:', userId, subscriptionData)
  
  // This is where you'd update your database
  // Example with a hypothetical database:
  /*
  await database.users.update(userId, {
    subscription: {
      ...subscriptionData,
      updatedAt: new Date()
    }
  })
  */
}
