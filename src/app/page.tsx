import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-700 to-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Build High-Converting
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">
                {" "}Affiliate Websites
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-orange-200 mb-8 leading-relaxed">
              Transform any product into a professional affiliate marketing website with AI-powered content generation and optimization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 text-lg"
              >
                Start Building Now
              </Link>
              <Link
                href="/features"
                className="bg-transparent border-2 border-orange-400 text-orange-400 px-8 py-4 rounded-lg font-semibold hover:bg-orange-400 hover:text-black transition-all duration-300 text-lg"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Real Success Story Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Real Success Story
            </h2>
            <p className="text-xl text-orange-200 max-w-3xl mx-auto">
              See how AFFILIFY helped create a professional affiliate website that's already generating results
            </p>
          </div>

          {/* Featured Website Showcase */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <div className="text-gray-400 text-sm ml-4">general-1750440900583-bdls9w.affilify.eu</div>
                    </div>
                    <div className="bg-gray-900 rounded p-4">
                      <div className="text-white font-bold text-lg mb-2">FORZA Basketball Hoop</div>
                      <div className="text-gray-300 text-sm mb-4">Professional affiliate marketing website</div>
                      <div className="flex items-center space-x-4">
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">✓ Live</span>
                        <span className="text-gray-400 text-xs">Published Jun 20</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Built with AFFILIFY</h3>
                    <p className="text-orange-200 mb-4">
                      This professional affiliate website was created using AFFILIFY's AI-powered platform. From product analysis to content generation, everything was automated to create a high-converting landing page.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-600/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">Live</div>
                      <div className="text-purple-200">Website Status</div>
                    </div>
                    <div className="bg-orange-600/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">Active</div>
                      <div className="text-orange-200">Deployment</div>
                    </div>
                  </div>

                  <Link
                    href="https://general-1750440900583-bdls9w.affilify.eu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-gradient-to-r from-purple-600 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-orange-700 transition-all duration-300"
                  >
                    View Live Website →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-orange-200 max-w-3xl mx-auto">
              From AI-powered content generation to professional deployment, AFFILIFY provides all the tools you need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-orange-500/20">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI-Powered Generation</h3>
              <p className="text-orange-200">
                Advanced AI analyzes your product and creates compelling, conversion-optimized content automatically.
              </p>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-orange-500/20">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Performance Analytics</h3>
              <p className="text-orange-200">
                Track your website's performance with detailed analytics and optimization recommendations.
              </p>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-orange-500/20">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-orange-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">One-Click Deployment</h3>
              <p className="text-orange-200">
                Deploy your affiliate website instantly with our integrated hosting and domain management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600/20 to-orange-600/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Affiliate Journey?
          </h2>
          <p className="text-xl text-orange-200 mb-8 max-w-2xl mx-auto">
            Join Andrew and thousands of others who are building successful affiliate businesses with AFFILIFY.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 text-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/about-me"
              className="bg-transparent border-2 border-orange-400 text-orange-400 px-8 py-4 rounded-lg font-semibold hover:bg-orange-400 hover:text-black transition-all duration-300 text-lg"
            >
              Read Andrew's Story
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
