'use client'

import Link from 'next/link';
import Navbar from '../../../components/Navbar';

export default function SEOOptimization() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <Link href="/features" className="text-gray-400 hover:text-white">Features</Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-white">SEO Optimization</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">📈</div>
            <h1 className="text-5xl font-bold gradient-text mb-6">SEO Optimization</h1>
            <p className="text-xl text-gray-200">
              Built-in SEO tools to help your websites rank higher in search engines and drive organic traffic.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Keyword Optimization</h3>
              <p className="text-gray-300">
                AI automatically optimizes your content for high-value keywords in your niche. 
                Target the right terms to rank higher and attract more organic traffic.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">📝 Meta Tag Generation</h3>
              <p className="text-gray-300">
                Perfect meta titles, descriptions, and tags generated automatically. Optimized 
                for click-through rates and search engine visibility.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🔗 Internal Linking</h3>
              <p className="text-gray-300">
                Smart internal linking structure that helps search engines understand your content 
                and improves your website's authority and rankings.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">⚡ Speed Optimization</h3>
              <p className="text-gray-300">
                Fast-loading websites that Google loves. Optimized images, compressed code, 
                and efficient loading for better search engine rankings.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">SEO Features</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">🔍</div>
                <h3 className="text-lg font-bold text-white mb-2">Keyword Research</h3>
                <p className="text-gray-300">AI finds the best keywords for your niche</p>
              </div>
              
              <div className="text-center">
                <div className="bg-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">📊</div>
                <h3 className="text-lg font-bold text-white mb-2">Content Optimization</h3>
                <p className="text-gray-300">Perfect content structure for search engines</p>
              </div>
              
              <div className="text-center">
                <div className="bg-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">📈</div>
                <h3 className="text-lg font-bold text-white mb-2">Rank Tracking</h3>
                <p className="text-gray-300">Monitor your search engine rankings</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">SEO Tools Included</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Automatic keyword research and optimization',
                'Meta title and description generation',
                'Schema markup implementation',
                'XML sitemap creation and submission',
                'Internal linking optimization',
                'Image alt text and optimization',
                'Page speed optimization',
                'Mobile SEO optimization',
                'Search engine ranking tracking',
                'SEO performance analytics'
              ].map((feature, index) => (
                <div key={index} className="flex items-center text-gray-200">
                  <span className="text-green-400 mr-3">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 rounded-lg p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4">Dominate Search Engine Rankings</h2>
              <p className="text-gray-200 mb-6">
                Get more organic traffic and higher search engine visibility
              </p>
              <Link 
                href="/signup" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg text-xl font-semibold btn-hover inline-block"
              >
                Boost SEO Now 📈
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
