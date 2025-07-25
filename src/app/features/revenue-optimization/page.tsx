'use client'

import Link from 'next/link';
import Navbar from '../../../components/Navbar';

export default function RevenueOptimization() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <Link href="/features" className="text-gray-400 hover:text-white">Features</Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-white">Revenue Optimization</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">💰</div>
            <h1 className="text-5xl font-bold gradient-text mb-6">Revenue Optimization</h1>
            <p className="text-xl text-gray-200">
              Maximize your affiliate commissions with AI-powered optimization suggestions and A/B testing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🧪 A/B Testing</h3>
              <p className="text-gray-300">
                Automatically test different versions of your pages, headlines, and call-to-action buttons. 
                Our AI identifies the highest-converting variations.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Smart Recommendations</h3>
              <p className="text-gray-300">
                Get AI-powered suggestions for improving conversion rates. From button colors to content 
                placement, optimize every element for maximum revenue.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">📊 Performance Tracking</h3>
              <p className="text-gray-300">
                Monitor your revenue optimization efforts with detailed analytics. See which changes 
                increase your affiliate commissions and by how much.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">⚡ Auto-Optimization</h3>
              <p className="text-gray-300">
                Let our AI continuously optimize your websites for maximum revenue. Automatic adjustments 
                based on performance data and user behavior.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Optimization Areas</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">🔗</div>
                <h3 className="text-lg font-bold text-white mb-2">Link Placement</h3>
                <p className="text-gray-300">Optimize affiliate link positions for maximum clicks</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">📝</div>
                <h3 className="text-lg font-bold text-white mb-2">Content Strategy</h3>
                <p className="text-gray-300">Improve content for better engagement and conversions</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">🎨</div>
                <h3 className="text-lg font-bold text-white mb-2">Design Elements</h3>
                <p className="text-gray-300">Test colors, layouts, and visual elements</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Revenue Boosting Features</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Automatic A/B testing of page elements',
                'AI-powered conversion rate optimization',
                'Smart affiliate link positioning',
                'Revenue tracking and analytics',
                'Performance-based recommendations',
                'Multi-variant testing capabilities',
                'Conversion funnel optimization',
                'User behavior analysis',
                'Revenue attribution tracking',
                'Automated optimization rules'
              ].map((feature, index) => (
                <div key={index} className="flex items-center text-gray-200">
                  <span className="text-green-400 mr-3">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-green-600/20 to-yellow-600/20 rounded-lg p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4">Maximize Your Affiliate Revenue</h2>
              <p className="text-gray-200 mb-6">
                Start optimizing your websites for higher conversions and bigger commissions
              </p>
              <Link 
                href="/signup" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-xl font-semibold btn-hover inline-block"
              >
                Boost Revenue Now 💰
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
