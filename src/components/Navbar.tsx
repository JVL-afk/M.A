// app/pricing/page.tsx - FIXED VERSION
// This removes authentication requirements and improves user flow

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handlePlanSelection = async (planId: string, planName: string) => {
    setIsLoading(planId);
    
    // For free plan, redirect to signup
    if (planId === 'basic') {
      router.push('/signup?plan=basic');
      return;
    }

    // For paid plans, redirect to signup with plan parameter
    // The signup process will handle payment after account creation
    router.push(`/signup?plan=${planId}`);
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '3 affiliate websites per month',
        'Basic templates',
        'Standard support',
        'Basic analytics',
        'SSL certificates',
        'Mobile responsive'
      ],
      buttonText: 'Get Started Free',
      buttonClass: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For serious affiliate marketers',
      features: [
        '10 affiliate websites per month',
        'Premium templates',
        'Priority support',
        'Advanced analytics',
        'AI chatbot integration',
        'Custom domains',
        'A/B testing tools',
        'Email marketing integration'
      ],
      buttonText: 'Start Pro Plan',
      buttonClass: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      description: 'For agencies and power users',
      features: [
        'Unlimited affiliate websites',
        'Everything in Pro',
        'Team collaboration',
        'White-label solutions',
        'API access',
        'Dedicated support',
        'Custom integrations',
        'Advanced reporting'
      ],
      buttonText: 'Start Enterprise',
      buttonClass: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              AFFILIFY
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/pricing" className="text-white font-medium">
                Pricing
              </Link>
              <Link href="/docs" className="text-gray-300 hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">Success Plan</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free, scale as you grow. Every plan includes our powerful AI website generator and comprehensive analytics.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border ${
                plan.popular ? 'border-orange-500/50 ring-2 ring-orange-500/20' : 'border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-300">{plan.period}</span>
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanSelection(plan.id, plan.name)}
                disabled={isLoading === plan.id}
                className={`w-full ${plan.buttonClass} text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading === plan.id ? 'Loading...' : plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">What counts as a website?</h3>
              <p className="text-gray-300">
                Each unique affiliate website you generate counts toward your monthly limit. You can edit and 
                update existing websites without using additional credits.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">Can I upgrade anytime?</h3>
              <p className="text-gray-300">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and 
                you'll be charged prorated amounts.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">What happens if I exceed my limit?</h3>
              <p className="text-gray-300">
                You'll be prompted to upgrade your plan. Your existing websites will continue to work normally, 
                but you won't be able to create new ones until you upgrade.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">Is there a free trial?</h3>
              <p className="text-gray-300">
                The Basic plan is completely free forever! You can create up to 3 websites per month with no 
                time limit or credit card required.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="text-center mt-16">
          <div className="flex justify-center items-center space-x-8 mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">Secure Payment</span>
            </div>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">30-Day Money-Back Guarantee</span>
            </div>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">Cancel Anytime</span>
            </div>
          </div>
          
          <p className="text-gray-400">
            Join thousands of successful affiliate marketers who trust AFFILIFY to grow their business.
          </p>
        </div>
      </div>
    </div>
  );
}
