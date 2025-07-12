import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-700 to-black">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-white mb-6">
              Choose Your Plan
            </h1>
            <p className="text-2xl text-orange-200 mb-8">
              Start your affiliate marketing journey with AFFILIFY
            </p>
            <div className="w-32 h-1 bg-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            
            {/* Basic Plan */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Basic</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">FREE</span>
                </div>
                <p className="text-gray-300 mb-6">Perfect for getting started</p>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    5 affiliate websites per month
                  </li>
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Basic templates
                  </li>
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Standard support
                  </li>
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Basic analytics
                  </li>
                </ul>
                
                <Link 
                  href="/checkout?plan=basic"
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 block text-center"
                >
                  Get Started Free
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/40 hover:border-purple-500/60 transition-all duration-300 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  🏆 MOST POPULAR
                </span>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">$29</span>
                  <span className="text-gray-300">/month</span>
                </div>
                <p className="text-gray-300 mb-6">For serious affiliate marketers</p>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited affiliate websites
                  </li>
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Premium templates
                  </li>
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority support
                  </li>
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Advanced analytics
                  </li>
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    AI chatbot integration
                  </li>
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Custom domains
                  </li>
                </ul>
                
                <Link 
                  href="/checkout?plan=pro"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 block text-center"
                >
                  Start Pro Plan
                </Link>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">$99</span>
                  <span className="text-gray-300">/month</span>
                </div>
                <p className="text-gray-300 mb-6">For agencies and teams</p>
                
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Everything in Pro
                  </li>
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Team collaboration
                  </li>
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    White-label solutions
                  </li>
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    API access
                  </li>
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Dedicated support
                  </li>
                  <li className="flex items-center text-gray-200">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Custom integrations
                  </li>
                </ul>
                
                <Link 
                  href="/checkout?plan=enterprise"
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-200 block text-center"
                >
                  Start Enterprise
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-orange-300 mb-3">Can I change plans anytime?</h3>
                <p className="text-gray-200">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-orange-300 mb-3">Is there a free trial?</h3>
                <p className="text-gray-200">Yes! All paid plans come with a 14-day free trial. No credit card required.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-orange-300 mb-3">What payment methods do you accept?</h3>
                <p className="text-gray-200">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-orange-300 mb-3">Do you offer refunds?</h3>
                <p className="text-gray-200">Yes! We offer a 30-day money-back guarantee on all paid plans.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
