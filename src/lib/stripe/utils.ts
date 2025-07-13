import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
})

export const STRIPE_PLANS = {
  basic: {
    monthly: {
      priceId: 'price_basic_monthly',
      amount: 2900, // $29.00
    },
    annual: {
      priceId: 'price_basic_annual',
      amount: 29000, // $290.00
    },
  },
  pro: {
    monthly: {
      priceId: 'price_pro_monthly',
      amount: 7900, // $79.00
    },
    annual: {
      priceId: 'price_pro_annual',
      amount: 79000, // $790.00
    },
  },
  enterprise: {
    monthly: {
      priceId: 'price_enterprise_monthly',
      amount: 19900, // $199.00
    },
    annual: {
      priceId: 'price_enterprise_annual',
      amount: 199000, // $1990.00
    },
  },
}

export const PLAN_FEATURES = {
  basic: [
    '5 websites per month',
    'Basic templates',
    'Standard support',
    'Basic analytics',
    'SSL certificates',
  ],
  pro: [
    '25 websites per month',
    'Premium templates',
    'Custom domains',
    'Advanced analytics',
    'Priority support',
    'A/B testing',
    'Custom CSS',
  ],
  enterprise: [
    'Unlimited websites',
    'All premium templates',
    'Custom domains',
    'Advanced analytics',
    'Priority support',
    'API access',
    'White-label solution',
    'Custom integrations',
    'Dedicated account manager',
  ],
}

export async function createCheckoutSession({
  priceId,
  customerId,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  priceId: string
  customerId?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer: customerId,
    metadata,
    subscription_data: {
      metadata,
    },
  })

  return session
}

export async function createCustomer({
  email,
  name,
  metadata = {},
}: {
  email: string
  name: string
  metadata?: Record<string, string>
}) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  })

  return customer
}

export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  return subscription
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId)
  return subscription
}

export async function updateSubscription({
  subscriptionId,
  priceId,
}: {
  subscriptionId: string
  priceId: string
}) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
  })

  return updatedSubscription
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

export function getPlanFromPriceId(priceId: string): { plan: string; cycle: string } | null {
  for (const [planName, planData] of Object.entries(STRIPE_PLANS)) {
    if (planData.monthly.priceId === priceId) {
      return { plan: planName, cycle: 'monthly' }
    }
    if (planData.annual.priceId === priceId) {
      return { plan: planName, cycle: 'annual' }
    }
  }
  return null
}
