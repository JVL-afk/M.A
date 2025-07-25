'use client'

import Link from 'next/link';
import Navbar from '../../../components/Navbar';

export default function SmartAnalytics() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <Link href="/features" className="text-gray-400 hover:text-white">Features</Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-white">Smart Analytics</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">📊</div>
            <h1 className="text-5xl font-bold gradient-text mb-6">Smart Analytics</h1>
            <p className="text-xl text-gray-200">
              Track clicks, conversions, and revenue with real-time analytics and detailed performance reports.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">📈 Real-Time Tracking</h3>
              <p className="text-gray-300">
                Monitor your website performance in real-time. See clicks, conversions, and revenue as they happen 
                with live dashboards and instant notifications.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">💰 Revenue Analytics</h3>
              <p className="text-gray-300">
                Track your affiliate commissions across all platforms. See which products and pages generate 
                the most revenue with detailed financial reports.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Conversion Optimization</h3>
              <p className="text-gray-300">
                Identify your best-performing content and optimize underperforming pages. AI-powered suggestions 
                help you increase conversion rates automatically.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">📱 Multi-Device Insights</h3>
              <p className="text-gray-300">
                See how your websites perform across desktop, mobile, and tablet devices. Optimize for each 
                platform to maximize your affiliate earnings.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Analytics Features</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">📊</div>
                <h3 className="text-lg font-bold text-white mb-2">Traffic Analysis</h3>
                <p className="text-gray-300">Detailed visitor behavior and traffic source analysis</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">💎</div>
                <h3 className="text-lg font-bold text-white mb-2">Conversion Tracking</h3>
                <p className="text-gray-300">Track every click and conversion with precision</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">📈</div>
                <h3 className="text-lg font-bold text-white mb-2">Performance Reports</h3>
                <p className="text-gray-300">Comprehensive reports with actionable insights</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">What You Can Track</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Real-time visitor count and behavior',
                'Click-through rates on affiliate links',
                'Conversion rates by product and page',
                'Revenue tracking across all affiliates',
                'Traffic sources and referral data',
                'Device and browser analytics',
                'Geographic visitor distribution',
                'Page load times and performance',
                'Search engine ranking positions',
                'Social media engagement metrics'
              ].map((feature, index) => (
                <div key={index} className="flex items-center text-gray-200">
                  <span className="text-green-400 mr-3">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 rounded-lg p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4">Start Tracking Your Success</h2>
              <p className="text-gray-200 mb-6">
                Get detailed insights into your affiliate marketing performance
              </p>
              <Link 
                href="/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-xl font-semibold btn-hover inline-block"
              >
                Start Analytics Now 📊
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
