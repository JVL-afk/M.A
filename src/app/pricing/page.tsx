// UPDATED PRICING PAGE WITH CORRECT WEBSITE LIMITS
// Replace your existing pricing page with this corrected version

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-orange-600 to-black text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm p-4 border-b border-orange-500/20">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">AFFILIFY</h1>
          <nav className="space-x-6">
            <a href="/" className="hover:text-orange-200">Home</a>
            <a href="/features" className="hover:text-orange-200">Features</a>
            <a href="/pricing" className="text-orange-200">Pricing</a>
            <a href="/login" className="hover:text-orange-200">Login</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-orange-200">Start free, scale as you grow</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Basic Plan */}
          <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-purple-500/20 relative">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Basic</h3>
              <div className="text-5xl font-bold mb-2">FREE</div>
              <p className="text-orange-200">Perfect for getting started</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>3 affiliate websites per month</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Basic templates</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Standard support</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Basic analytics</span>
              </li>
            </ul>
            
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Get Started Free
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-purple-500/20 relative">
            {/* Most Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                🏆 MOST POPULAR
              </span>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <div className="text-5xl font-bold mb-2">$29<span className="text-lg">/month</span></div>
              <p className="text-orange-200">For serious affiliate marketers</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>10 affiliate websites per month</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Premium templates</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Priority support</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>AI chatbot integration</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Custom domains</span>
              </li>
            </ul>
            
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Start Pro Plan
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-purple-500/20 relative">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="text-5xl font-bold mb-2">$99<span className="text-lg">/month</span></div>
              <p className="text-orange-200">For agencies and teams</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Unlimited affiliate websites</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Team collaboration</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>White-label solutions</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>API access</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Dedicated support</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                <span>Custom integrations</span>
              </li>
            </ul>
            
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Start Enterprise
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/20 p-6 rounded-lg">
              <h4 className="text-xl font-semibold mb-3">What counts as a website?</h4>
              <p className="text-gray-300">Each unique affiliate website you generate counts toward your monthly limit. You can edit and update existing websites without using additional credits.</p>
            </div>
            
            <div className="bg-black/20 p-6 rounded-lg">
              <h4 className="text-xl font-semibold mb-3">Can I upgrade anytime?</h4>
              <p className="text-gray-300">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and you'll be charged prorated amounts.</p>
            </div>
            
            <div className="bg-black/20 p-6 rounded-lg">
              <h4 className="text-xl font-semibold mb-3">What happens if I exceed my limit?</h4>
              <p className="text-gray-300">You'll be prompted to upgrade your plan. Your existing websites will continue to work normally, but you won't be able to create new ones until you upgrade.</p>
            </div>
            
            <div className="bg-black/20 p-6 rounded-lg">
              <h4 className="text-xl font-semibold mb-3">Is there a free trial?</h4>
              <p className="text-gray-300">The Basic plan is completely free forever! You can create up to 3 websites per month with no time limit or credit card required.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
