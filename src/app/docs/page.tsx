import Link from 'next/link'
import { Book, Code, Zap, Globe, BarChart3, Key } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-white">
              AFFILIFY
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-white font-semibold">
                Docs
              </Link>
              <Link href="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Documentation
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              & Guides
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Everything you need to know to build successful affiliate websites with AFFILIFY
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Zap className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Quick Start</h3>
              <p className="text-gray-300 mb-4">
                Get up and running with your first affiliate website in under 5 minutes.
              </p>
              <Link href="#quick-start" className="text-purple-400 hover:text-purple-300 font-semibold">
                Read Guide →
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Code className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">API Reference</h3>
              <p className="text-gray-300 mb-4">
                Complete API documentation for Enterprise users and developers.
              </p>
              <Link href="#api-reference" className="text-purple-400 hover:text-purple-300 font-semibold">
                View API →
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Book className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Best Practices</h3>
              <p className="text-gray-300 mb-4">
                Learn proven strategies for maximizing your affiliate marketing success.
              </p>
              <Link href="#best-practices" className="text-purple-400 hover:text-purple-300 font-semibold">
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Documentation */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Quick Start Guide */}
          <div id="quick-start" className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Quick Start Guide</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">1. Create Your Account</h3>
                <p className="text-gray-300 mb-3">
                  Sign up for AFFILIFY and choose the plan that best fits your needs. All plans come with a 14-day free trial.
                </p>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <code className="text-purple-400">
                    Visit affilify.eu/signup → Choose Plan → Enter Details → Verify Email
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">2. Generate Your First Website</h3>
                <p className="text-gray-300 mb-3">
                  Use our AI-powered generator to create your first affiliate website in seconds.
                </p>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <code className="text-purple-400">
                    Dashboard → Create Website → Enter Product/Niche → Generate → Customize
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">3. Add Your Affiliate Links</h3>
                <p className="text-gray-300 mb-3">
                  Replace placeholder links with your actual affiliate URLs from your preferred networks.
                </p>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <code className="text-purple-400">
                    Edit Website → Replace Links → Test Links → Save Changes
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">4. Deploy & Share</h3>
                <p className="text-gray-300 mb-3">
                  Deploy your website to a custom domain and start driving traffic to earn commissions.
                </p>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <code className="text-purple-400">
                    Deploy → Connect Domain → Share URL → Track Performance
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* API Reference */}
          <div id="api-reference" className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">API Reference</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Authentication</h3>
                <p className="text-gray-300 mb-3">
                  All API requests require authentication using your API key (Enterprise plan only).
                </p>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <code className="text-purple-400">
                    curl -H "Authorization: Bearer YOUR_API_KEY" https://api.affilify.eu/v1/websites
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Create Website</h3>
                <p className="text-gray-300 mb-3">
                  Generate a new affiliate website programmatically.
                </p>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <code className="text-purple-400">
                    POST /v1/websites<br/>
                    {`{`}<br/>
                    &nbsp;&nbsp;"niche": "fitness",<br/>
                    &nbsp;&nbsp;"product": "protein powder",<br/>
                    &nbsp;&nbsp;"template": "modern"<br/>
                    {`}`}
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Get Analytics</h3>
                <p className="text-gray-300 mb-3">
                  Retrieve performance data for your websites.
                </p>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <code className="text-purple-400">
                    GET /v1/analytics/website/{`{id}`}?period=30d
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div id="best-practices" className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Best Practices</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Choose the Right Niche</h3>
                <p className="text-gray-300">
                  Focus on niches you're passionate about and that have proven demand. Research competition 
                  and commission rates before committing to a niche.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Optimize for SEO</h3>
                <p className="text-gray-300">
                  Use relevant keywords in your content, optimize meta descriptions, and ensure fast 
                  loading times. Our AI automatically includes SEO best practices.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Build Trust</h3>
                <p className="text-gray-300">
                  Include honest reviews, clear disclosures, and helpful content. Trust is crucial 
                  for converting visitors into customers.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Track Performance</h3>
                <p className="text-gray-300">
                  Monitor your analytics regularly to understand what's working. Use A/B testing 
                  to optimize conversion rates.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  How do I get my API key?
                </h3>
                <p className="text-gray-300">
                  API keys are available to Enterprise plan subscribers. You can generate your API key 
                  from the dashboard in your account settings.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Can I customize the generated websites?
                </h3>
                <p className="text-gray-300">
                  Yes! You can customize colors, fonts, content, and layout. Pro and Enterprise plans 
                  include advanced customization options.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  What affiliate networks are supported?
                </h3>
                <p className="text-gray-300">
                  AFFILIFY works with any affiliate network that provides standard affiliate links, 
                  including Amazon Associates, ClickBank, ShareASale, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 mb-4 md:mb-0">
              © 2025 AFFILIFY. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/docs" className="text-gray-300 hover:text-white transition-colors">
                Docs
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
