'use client' // ✅ CRITICAL FIX: Added client directive for interactivity

import { useRouter } from 'next/navigation' // ✅ CRITICAL FIX: Added router for navigation

// UPDATED PRICING PAGE WITH FUNCTIONAL BUTTONS
// Replace your existing pricing page with this corrected version
export default function PricingPage() {
  const router = useRouter() // ✅ CRITICAL FIX: Initialize router

  // ✅ CRITICAL FIX: Added click handlers for all pricing buttons
  const handlePlanSelection = (plan: string) => {
    router.push(`/checkout?plan=${plan}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <nav className="flex items-center justify-between p-6">
        <h2 className="text-2xl font-bold text-white">AFFILIFY</h2>
        <div className="flex space-x-6">
          <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
          <a href="/features" className="text-gray-300 hover:text-white transition-colors">Features</a>
          <a href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
          <a href="/login" className="text-gray-300 hover:text-white transition-colors">Login</a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Start free, scale as you grow
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
            <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
            <div className="text-4xl font-bold text-white mb-4">
              FREE
            </div>
            <p className="text-gray-300 mb-6">Perfect for getting started</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                3 affiliate websites per month
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Basic templates
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Standard support
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Basic analytics
              </li>
            </ul>

            {/* ✅ CRITICAL FIX: Added onClick handler */}
            <button 
              onClick={() => handlePlanSelection('basic')}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 relative">
            {/* Most Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                🏆 MOST POPULAR
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <div className="text-4xl font-bold text-white mb-4">
              $29<span className="text-lg text-gray-300">/month</span>
            </div>
            <p className="text-gray-300 mb-6">For serious affiliate marketers</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                10 affiliate websites per month
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Premium templates
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Priority support
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Advanced analytics
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                AI chatbot integration
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Custom domains
              </li>
            </ul>

            {/* ✅ CRITICAL FIX: Added onClick handler */}
            <button 
              onClick={() => handlePlanSelection('pro')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Start Pro Plan
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
            <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
            <div className="text-4xl font-bold text-white mb-4">
              $99<span className="text-lg text-gray-300">/month</span>
            </div>
            <p className="text-gray-300 mb-6">For agencies and teams</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Unlimited affiliate websites
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Everything in Pro
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Team collaboration
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                White-label solutions
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                API access
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Dedicated support
              </li>
              <li className="flex items-center text-gray-300">
                <span className="text-green-400 mr-3">✓</span>
                Custom integrations
              </li>
            </ul>

            {/* ✅ CRITICAL FIX: Added onClick handler */}
            <button 
              onClick={() => handlePlanSelection('enterprise')}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Start Enterprise
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-white mb-3">What counts as a website?</h4>
              <p className="text-gray-300">
                Each unique affiliate website you generate counts toward your monthly limit. You can edit and update existing websites without using additional credits.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-white mb-3">Can I upgrade anytime?</h4>
              <p className="text-gray-300">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and you'll be charged prorated amounts.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-white mb-3">What happens if I exceed my limit?</h4>
              <p className="text-gray-300">
                You'll be prompted to upgrade your plan. Your existing websites will continue to work normally, but you won't be able to create new ones until you upgrade.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-white mb-3">Is there a free trial?</h4>
              <p className="text-gray-300">
                The Basic plan is completely free forever! You can create up to 3 websites per month with no time limit or credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
