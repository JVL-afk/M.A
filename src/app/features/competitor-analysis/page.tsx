'use client'

import Link from 'next/link';
import Navbar from '../../../components/Navbar';

export default function CompetitorAnalysis() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <Link href="/features" className="text-gray-400 hover:text-white">Features</Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-white">Competitor Analysis</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🔍</div>
            <h1 className="text-5xl font-bold gradient-text mb-6">Competitor Analysis</h1>
            <p className="text-xl text-gray-200">
              Analyze competitor websites to discover their strategies and find profitable opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🕵️ Deep Website Analysis</h3>
              <p className="text-gray-300">
                Our AI scans competitor websites to reveal their affiliate strategies, product placements, 
                and conversion tactics. Know exactly what's working in your niche.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">💡 Strategy Insights</h3>
              <p className="text-gray-300">
                Discover the marketing angles, content strategies, and affiliate programs your competitors 
                use. Get actionable insights to outperform them.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">📈 Performance Benchmarks</h3>
              <p className="text-gray-300">
                Compare your website performance against competitors. See traffic estimates, engagement 
                metrics, and identify areas for improvement.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Opportunity Detection</h3>
              <p className="text-gray-300">
                Find gaps in competitor strategies and untapped opportunities. Discover profitable 
                keywords and products they're missing.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Analysis Process</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-lg font-bold text-white mb-2">Enter URL</h3>
                <p className="text-gray-300">Submit competitor website for analysis</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-lg font-bold text-white mb-2">AI Scanning</h3>
                <p className="text-gray-300">Our AI analyzes content and strategies</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-lg font-bold text-white mb-2">Generate Report</h3>
                <p className="text-gray-300">Comprehensive analysis report created</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
                <h3 className="text-lg font-bold text-white mb-2">Take Action</h3>
                <p className="text-gray-300">Implement insights to outperform</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">What We Analyze</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Affiliate link placement and strategies',
                'Content structure and marketing angles',
                'Product recommendations and reviews',
                'SEO keywords and ranking factors',
                'Social media integration and engagement',
                'Email capture and lead generation',
                'Website design and user experience',
                'Traffic sources and marketing channels',
                'Conversion optimization techniques',
                'Monetization methods and revenue streams'
              ].map((feature, index) => (
                <div key={index} className="flex items-center text-gray-200">
                  <span className="text-green-400 mr-3">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4">Outsmart Your Competition</h2>
              <p className="text-gray-200 mb-6">
                Get the competitive intelligence you need to dominate your niche
              </p>
              <Link 
                href="/signup" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-xl font-semibold btn-hover inline-block"
              >
                Start Analyzing 🔍
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
