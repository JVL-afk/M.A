'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function CheckoutPage() {
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
        window.location.href = '/dashboard?plan=basic&success=true'
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
          userId: 'user_123', // Replace with actual user ID from auth
          userEmail: 'user@example.com' // Replace with actual user email
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
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
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedPlan.name}</h2>
                <p className="text-orange-200 mb-4">{selectedPlan.description}</p>
                <div className="flex items-center justify-center mb-6">
                  <span className="text-5xl font-bold text-white">
                    ${selectedPlan.price}
                  </span>
                  <span className="text-gray-300 ml-2">/{selectedPlan.interval}</span>
                </div>
                {plan === 'pro' && (
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold inline-block mb-4">
                    🏆 MOST POPULAR
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-8">
                <h3 className="text-white font-semibold mb-4">What's included:</h3>
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Security Badges */}
              <div className="border-t border-gray-600/30 pt-6">
                <div className="flex items-center justify-center space-x-4 text-gray-400 text-sm">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure Payment
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    30-Day Guarantee
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
              <h3 className="text-2xl font-bold text-white mb-6">Payment Details</h3>
              
              {error && (
                <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4 mb-6">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-black/20 rounded-lg p-4 mb-6">
                <h4 className="text-white font-semibold mb-3">Order Summary</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">{selectedPlan.name}</span>
                  <span className="text-white font-semibold">${selectedPlan.price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Tax</span>
                  <span className="text-white font-semibold">$0.00</span>
                </div>
                <div className="border-t border-gray-600/30 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-2xl font-bold text-white">${selectedPlan.price}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-4"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    {plan === 'basic' ? 'Get Started Free' : `Subscribe for $${selectedPlan.price}/month`}
                  </>
                )}
              </button>

              {/* Payment Methods */}
              <div className="text-center mb-4">
                <p className="text-gray-400 text-sm mb-2">Secure payment powered by Stripe</p>
                <div className="flex justify-center space-x-2">
                  <div className="bg-white rounded px-2 py-1">
                    <span className="text-xs font-semibold text-gray-800">VISA</span>
                  </div>
                  <div className="bg-white rounded px-2 py-1">
                    <span className="text-xs font-semibold text-gray-800">MC</span>
                  </div>
                  <div className="bg-white rounded px-2 py-1">
                    <span className="text-xs font-semibold text-gray-800">AMEX</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <p className="text-gray-400 text-xs text-center">
                By subscribing, you agree to our{' '}
                <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Pricing */}
          <div className="text-center mt-8">
            <Link 
              href="/pricing"
              className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
