import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-black animate-color-transition">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-2xl text-orange-200 mb-8">
            Start free, scale as you grow
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Basic Plan */}
          <div className="dashboard-card text-center relative">
            <h3 className="text-3xl font-bold text-white mb-4">Basic</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-orange-400">$0</span>
              <span className="text-orange-200">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">3 websites per month</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Basic AI website generation</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Standard templates</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Basic analytics</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Community support</span>
              </li>
            </ul>
            <Link href="/signup">
              <button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300">
                Get Started Free
              </button>
            </Link>
          </div>

          {/* Pro Plan - Most Popular */}
          <div className="dashboard-card text-center relative border-2 border-orange-400">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-orange-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Pro</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-orange-400">$29</span>
              <span className="text-orange-200">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">10 websites</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Advanced AI generation</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Premium templates</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Advanced analytics & insights</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Website analysis tool</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Priority support</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Custom domains</span>
              </li>
            </ul>
            <Link href="/signup">
              <button className="w-full bg-gradient-to-r from-orange-600 to-orange-800 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-700 hover:to-orange-900 transition-all duration-300 transform hover:scale-105">
                Start Pro Trial
              </button>
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="dashboard-card text-center relative">
            <h3 className="text-3xl font-bold text-white mb-4">Enterprise</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-orange-400">$99</span>
              <span className="text-orange-200">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Everything in Pro</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">API access</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">White-label solutions</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Unlimited website generation</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Custom integrations</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">Dedicated account manager</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span className="text-orange-200">24/7 phone support</span>
              </li>
            </ul>
            <Link href="/signup">
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300">
                Contact Sales
              </button>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="dashboard-card mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-bold text-white mb-3">Can I change plans anytime?</h4>
              <p className="text-orange-200">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-3">Do you offer refunds?</h4>
              <p className="text-orange-200">We offer a 30-day money-back guarantee on all paid plans. No questions asked.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-3">What payment methods do you accept?</h4>
              <p className="text-orange-200">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-3">Is there a setup fee?</h4>
              <p className="text-orange-200">No setup fees ever. What you see is what you pay. Start building immediately after signup.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Affiliate Marketing?</h2>
          <p className="text-xl text-orange-200 mb-8">Join thousands of successful marketers already using AFFILIFY</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <button className="bg-gradient-to-r from-red-600 to-red-800 text-white text-xl font-bold px-8 py-4 rounded-full shadow-2xl hover:from-red-700 hover:to-red-900 transform hover:scale-110 transition-all duration-300">
                SIGN UP NOW
              </button>
            </Link>
            <Link href="/features">
              <button className="bg-transparent border-2 border-white text-white text-xl font-bold px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300">
                View Features
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
