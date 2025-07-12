'use client'

import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function LightningFast() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <Link href="/features" className="text-gray-400 hover:text-white">Features</Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-white">Lightning Fast</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">⚡</div>
            <h1 className="text-5xl font-bold gradient-text mb-6">Lightning Fast</h1>
            <p className="text-xl text-gray-200">
              Generate websites in under 3 minutes with our optimized AI algorithms and cloud infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🚀 3-Minute Generation</h3>
              <p className="text-gray-300">
                From idea to live website in under 3 minutes. Our AI works at lightning speed to create 
                professional affiliate websites faster than any competitor.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">☁️ Cloud Infrastructure</h3>
              <p className="text-gray-300">
                Powered by enterprise-grade cloud servers worldwide. Instant deployment and global 
                content delivery for maximum speed and reliability.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🔄 Instant Updates</h3>
              <p className="text-gray-300">
                Make changes to your websites and see them live instantly. No waiting, no delays - 
                your updates go live in seconds, not minutes.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">📈 Optimized Performance</h3>
              <p className="text-gray-300">
                Every website is automatically optimized for speed. Compressed images, minified code, 
                and CDN delivery ensure lightning-fast loading times.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Speed Advantages</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-yellow-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">⚡</div>
                <h3 className="text-lg font-bold text-white mb-2">Fast Generation</h3>
                <p className="text-gray-300">Websites created in under 3 minutes</p>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">🌐</div>
                <h3 className="text-lg font-bold text-white mb-2">Global CDN</h3>
                <p className="text-gray-300">Worldwide content delivery network</p>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">🔄</div>
                <h3 className="text-lg font-bold text-white mb-2">Instant Deploy</h3>
                <p className="text-gray-300">Live websites in seconds</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Performance Features</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Sub-3-minute website generation',
                'Global CDN for worldwide speed',
                'Automatic image optimization',
                'Code minification and compression',
                'Instant deployment to live servers',
                'Real-time preview during creation',
                'Lightning-fast page load times',
                'Optimized database queries',
                'Cached content delivery',
                '99.9% uptime guarantee'
              ].map((feature, index) => (
                <div key={index} className="flex items-center text-gray-200">
                  <span className="text-green-400 mr-3">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4">Speed Equals Success</h2>
              <p className="text-gray-200 mb-6">
                Fast websites convert better and rank higher in search engines
              </p>
              <Link 
                href="/signup" 
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-lg text-xl font-semibold btn-hover inline-block"
              >
                Get Speed Now ⚡
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
