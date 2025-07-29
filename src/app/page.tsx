import Link from 'next/link'

// RESTORED AFFILIFY HOMEPAGE - Original Design with New Navbar & Text
// This restores the beautiful original homepage design while keeping the improved navbar and new text

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navbar - Updated with new design and About Me link */}
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">⚡</span>
                </div>
                <span className="text-white text-xl font-bold">AFFILIFY</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Pricing
                </Link>
                <Link href="/docs" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Documentation
                </Link>
                <Link href="/about-me" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  About Me
                </Link>
                <Link href="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Get Started
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-300 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Original Design with New Text */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          {/* Main Headline - Gaming-inspired but not overwhelming */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Experience Affiliate Marketing
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Like a Video Game
            </span>
          </h1>
          
          {/* Secondary Text - Professional with highlighted keywords */}
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Get everything from{' '}
            <span className="text-blue-400 font-semibold">AI insights</span> to{' '}
            <span className="text-green-400 font-semibold">AI-powered website generation</span>, to{' '}
            <span className="text-purple-400 font-semibold">geographic analysis</span>
          </p>

          {/* CTA Buttons - Original Style */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105">
              Start Building Now
            </Link>
            <Link href="/pricing" className="bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl border border-white/20 transition-all duration-200">
              See How It Works
            </Link>
          </div>
        </div>

        {/* Real Success Story Section - Original Design */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Real Success Story</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  See how AFFILIFY helped create a professional affiliate website that's already generating results
                </h3>
                <div className="text-gray-300 mb-4">
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">✓ Live</span>
                  <span className="ml-4 text-sm">Published Jun 20</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-bold text-white mb-2">FORZA Basketball Hoop</h4>
                <p className="text-gray-300 mb-4">Professional affiliate marketing website</p>
                <Link href="https://general-1750440900583-bdls9w.affilify.eu/" className="text-blue-400 hover:text-blue-300 underline">
                  View Live Website →
                </Link>
              </div>
              
              <p className="text-gray-300 text-center">
                This professional affiliate website was created using AFFILIFY's AI-powered platform. 
                From product analysis to content generation, everything was automated to create a high-converting landing page.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section - Original Design */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Everything You Need to Succeed</h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            From AI-powered content generation to professional deployment, AFFILIFY provides all the tools you need
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* AI-Powered Generation */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI-Powered Generation</h3>
              <p className="text-gray-300">
                Advanced AI analyzes your product and creates compelling, conversion-optimized content automatically.
              </p>
            </div>

            {/* Performance Analytics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Performance Analytics</h3>
              <p className="text-gray-300">
                Track your website's performance with detailed analytics and optimization recommendations.
              </p>
            </div>

            {/* One-Click Deployment */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">One-Click Deployment</h3>
              <p className="text-gray-300">
                Deploy your affiliate website instantly with our integrated hosting and domain management.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA Section - Original Design */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Your Affiliate Journey?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join Andrew and thousands of others who are building successful affiliate businesses with AFFILIFY.
          </p>
          <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105">
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  )
}

