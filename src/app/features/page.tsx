import Link from 'next/link'
import Navbar from '../../components/Navbar'

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-black animate-color-transition">
      <Navbar />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            AFFILIFY Features
          </h1>
          <p className="text-2xl text-orange-200 mb-8">
            Everything you need to dominate affiliate marketing
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* AI Website Generation */}
          <div className="dashboard-card">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">AI Website Generation</h3>
            </div>
            <ul className="space-y-3 text-orange-200">
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Paste any affiliate link and get a professional website in seconds</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>AI-powered content generation with product descriptions</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Automatic SEO optimization for better rankings</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Mobile-responsive designs that convert</span>
              </li>
            </ul>
          </div>

          {/* Smart Analytics */}
          <div className="dashboard-card">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Smart Analytics</h3>
            </div>
            <ul className="space-y-3 text-orange-200">
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Real-time traffic and conversion tracking</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Revenue analytics with detailed breakdowns</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Competitor website analysis and insights</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>AI recommendations for optimization</span>
              </li>
            </ul>
          </div>

          {/* Dashboard Management */}
          <div className="dashboard-card">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎛️</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Powerful Dashboard</h3>
            </div>
            <ul className="space-y-3 text-orange-200">
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Manage all your websites from one place</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Track performance across multiple sites</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Quick website creation and editing tools</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Archive and organize your analyses</span>
              </li>
            </ul>
          </div>

          {/* Enterprise API */}
          <div className="dashboard-card">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Enterprise API</h3>
            </div>
            <ul className="space-y-3 text-orange-200">
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Integrate AFFILIFY into your existing workflow</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Bulk website generation capabilities</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Custom branding and white-label options</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-3">✓</span>
                <span>Priority support and dedicated account manager</span>
              </li>
            </ul>
          </div>
        </div>

        {/* How It Works */}
        <div className="dashboard-card mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">How AFFILIFY Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Paste Your Link</h4>
              <p className="text-orange-200">Simply paste any affiliate link into our AI chatbot</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">AI Creates Website</h4>
              <p className="text-orange-200">Our AI generates a professional website in seconds</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Start Earning</h4>
              <p className="text-orange-200">Deploy your website and watch the commissions roll in</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-orange-200 mb-8">Join thousands of successful affiliate marketers using AFFILIFY</p>
          <Link href="/signup">
            <button className="bg-gradient-to-r from-red-600 to-red-800 text-white text-2xl font-bold px-12 py-4 rounded-full shadow-2xl hover:from-red-700 hover:to-red-900 transform hover:scale-110 transition-all duration-300">
              SIGN UP NOW
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
