'use client'

import Link from 'next/link';
import Navbar from '../../../components/Navbar';

export default function AffiliateLinkManagement() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <Link href="/features" className="text-gray-400 hover:text-white">Features</Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-white">Affiliate Link Management</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🔗</div>
            <h1 className="text-5xl font-bold gradient-text mb-6">Affiliate Link Management</h1>
            <p className="text-xl text-gray-200">
              Automatically insert and manage affiliate links with click tracking and commission monitoring.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🤖 Auto-Insertion</h3>
              <p className="text-gray-300">
                Our AI automatically places affiliate links in optimal positions throughout your content. 
                No manual work - just maximum click-through rates and conversions.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">📊 Click Tracking</h3>
              <p className="text-gray-300">
                Track every click on your affiliate links in real-time. See which products and pages 
                generate the most clicks and optimize accordingly.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">💰 Commission Monitoring</h3>
              <p className="text-gray-300">
                Monitor your affiliate commissions across all networks and programs. Get detailed 
                reports on your earnings and performance metrics.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🔄 Link Rotation</h3>
              <p className="text-gray-300">
                Automatically rotate between different affiliate programs and products. Maximize 
                your earnings by testing which offers convert best.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Link Management Process</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-lg font-bold text-white mb-2">Add Links</h3>
                <p className="text-gray-300">Import your affiliate links and programs</p>
              </div>
              
              <div className="text-center">
                <div className="bg-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-lg font-bold text-white mb-2">AI Placement</h3>
                <p className="text-gray-300">AI finds optimal positions for maximum clicks</p>
              </div>
              
              <div className="text-center">
                <div className="bg-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-lg font-bold text-white mb-2">Track Performance</h3>
                <p className="text-gray-300">Monitor clicks and conversions in real-time</p>
              </div>
              
              <div className="text-center">
                <div className="bg-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
                <h3 className="text-lg font-bold text-white mb-2">Optimize</h3>
                <p className="text-gray-300">Improve placement based on performance data</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Management Features</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Automatic affiliate link insertion',
                'Real-time click tracking and analytics',
                'Commission monitoring across networks',
                'Link rotation and A/B testing',
                'Broken link detection and alerts',
                'Cloaking and URL shortening',
                'Geographic link targeting',
                'Device-specific link optimization',
                'Conversion attribution tracking',
                'Bulk link management tools'
              ].map((feature, index) => (
                <div key={index} className="flex items-center text-gray-200">
                  <span className="text-green-400 mr-3">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-teal-600/20 to-cyan-600/20 rounded-lg p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4">Maximize Your Link Performance</h2>
              <p className="text-gray-200 mb-6">
                Let AI handle your affiliate links while you focus on growing your business
              </p>
              <Link 
                href="/signup" 
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg text-xl font-semibold btn-hover inline-block"
              >
                Manage Links Now 🔗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
