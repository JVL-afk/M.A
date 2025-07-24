'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function CheckoutForm() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'pro'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const plans = {
    basic: {
      name: 'Basic Plan',
      price: 0,
      interval: 'month',
      description: 'Perfect for getting started',
      features: [
        '5 affiliate websites per month',
        'Basic templates',
        'Standard support',
        'Basic analytics'
      ]
    },
    pro: {
      name: 'Pro Plan',
      price: 29,
      interval: 'month',
      description: 'For serious affiliate marketers',
      features: [
        'Unlimited affiliate websites',
        'Premium templates',
        'Priority support',
        'Advanced analytics',
        'AI chatbot integration',
        'Custom domains'
      ]
    },
    enterprise: {
      name: 'Enterprise Plan',
      price: 99,
      interval: 'month',
      description: 'For agencies and teams',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'White-label solutions',
        'API access',
        'Dedicated support',
        'Custom integrations',
        'Advanced reporting'
      ]
    }
  }

  const selectedPlan = plans[plan as keyof typeof plans] || plans.pro

  const handleCheckout = async () => {
    setIsLoading(true)
    setError('')

    try {
      // For free plan, just redirect to dashboard
      if (plan === 'basic') {
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard?plan=basic&success=true'
        }
        return
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: `price_${plan}_monthly`,
          planName: plan,
          userId: 'user_123', // TODO: Get from authenticated user context
          userEmail: 'user@affilify.com' // TODO: Get from authenticated user context
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        if (typeof window !== 'undefined') {
          window.location.href = data.url
        }
      } else {
        setError(data.error || 'Failed to create checkout session')
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.')
      console.error('Checkout error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-700 to-black">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6">
              Complete Your Purchase
            </h1>
            <p className="text-xl text-orange-200">
              You're one step away from supercharging your affiliate marketing!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Details */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {selectedPlan.name}
              </h2>
              <div className="text-4xl font-bold text-white mb-2">
                ${selectedPlan.price}
                <span className="text-lg text-orange-200">/{selectedPlan.interval}</span>
              </div>
              <p className="text-orange-200 mb-6">{selectedPlan.description}</p>
              
              <h3 className="text-lg font-semibold text-white mb-4">What's included:</h3>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-orange-100">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Checkout Form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Payment Details</h2>
              
              {error && (
                <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="bg-blue-500/20 p-4 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    🔒 Secure payment powered by Stripe
                  </p>
                </div>

                <div className="bg-green-500/20 p-4 rounded-lg">
                  <p className="text-green-200 text-sm">
                    ✅ 30-day money-back guarantee
                  </p>
                </div>

                <div className="bg-orange-500/20 p-4 rounded-lg">
                  <p className="text-orange-200 text-sm">
                    🚀 Instant access after payment
                  </p>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold text-lg btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : `Subscribe to ${selectedPlan.name}`}
                </button>

                <div className="text-center">
                  <Link href="/pricing" className="text-orange-300 hover:text-orange-200">
                    ← Back to pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 p-6 rounded-lg">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="text-white font-semibold mb-2">Secure Payment</h3>
                <p className="text-orange-200 text-sm">256-bit SSL encryption</p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg">
                <div className="text-2xl mb-2">💰</div>
                <h3 className="text-white font-semibold mb-2">Money Back Guarantee</h3>
                <p className="text-orange-200 text-sm">30-day full refund</p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="text-white font-semibold mb-2">Instant Access</h3>
                <p className="text-orange-200 text-sm">Start creating immediately</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutForm />
    </Suspense>
  )
}

