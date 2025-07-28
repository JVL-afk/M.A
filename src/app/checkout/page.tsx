'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar' // ✅ CRITICAL FIX: Added missing Navbar import

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Complete Your Purchase
            </h1>
            <p className="text-xl text-gray-300">
              You're one step away from supercharging your affiliate marketing!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Details */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedPlan.name}
              </h2>
              <div className="text-4xl font-bold text-white mb-4">
                ${selectedPlan.price}
                <span className="text-lg text-gray-300">/{selectedPlan.interval}</span>
              </div>
              <p className="text-gray-300 mb-6">{selectedPlan.description}</p>

              <h3 className="text-lg font-semibold text-white mb-4">What's included:</h3>
              <ul className="space-y-3">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Checkout Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Payment Details</h2>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-300">
                  <span className="mr-2">🔒</span>
                  Secure payment powered by Stripe
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="mr-2">✅</span>
                  30-day money-back guarantee
                </div>
                <div className="flex items-center text-gray-300">
                  <span className="mr-2">🚀</span>
                  Instant access after payment
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : `Subscribe to ${selectedPlan.name}`}
              </button>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl mb-2">🔒</div>
                  <h3 className="font-semibold text-white text-sm">Secure Payment</h3>
                  <p className="text-gray-400 text-xs">256-bit SSL encryption</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">💰</div>
                  <h3 className="font-semibold text-white text-sm">Money Back Guarantee</h3>
                  <p className="text-gray-400 text-xs">30-day full refund</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <h3 className="font-semibold text-white text-sm">Instant Access</h3>
                  <p className="text-gray-400 text-xs">Start creating immediately</p>
                </div>
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
