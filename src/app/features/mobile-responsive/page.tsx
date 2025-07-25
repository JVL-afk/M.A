'use client'

import Link from 'next/link';
import Navbar from '../../../components/Navbar';

export default function MobileResponsive() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <Link href="/features" className="text-gray-400 hover:text-white">Features</Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-white">Mobile Responsive</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">📱</div>
            <h1 className="text-5xl font-bold gradient-text mb-6">Mobile Responsive</h1>
            <p className="text-xl text-gray-200">
              All generated websites are fully responsive and optimized for mobile devices and tablets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">📱 Mobile-First Design</h3>
              <p className="text-gray-300">
                Every website is designed with mobile users in mind first. Perfect layouts that look 
                amazing and convert well on smartphones and tablets.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">👆 Touch-Friendly Interface</h3>
              <p className="text-gray-300">
                Buttons, links, and interactive elements are optimized for touch navigation. Easy 
                tapping and swiping for the best mobile user experience.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">⚡ Fast Mobile Loading</h3>
              <p className="text-gray-300">
                Optimized images, compressed code, and efficient loading ensure your websites load 
                lightning-fast on mobile networks and devices.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🔄 Adaptive Layouts</h3>
              <p className="text-gray-300">
                Content automatically adapts to different screen sizes. From phones to tablets to 
                desktops, your website looks perfect everywhere.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Mobile Optimization</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">📱</div>
                <h3 className="text-lg font-bold text-white mb-2">Responsive Design</h3>
                <p className="text-gray-300">Automatically adjusts to any screen size</p>
              </div>
              
              <div className="text-center">
                <div className="bg-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">⚡</div>
                <h3 className="text-lg font-bold text-white mb-2">Fast Loading</h3>
                <p className="text-gray-300">Optimized for mobile network speeds</p>
              </div>
              
              <div className="text-center">
                <div className="bg-pink-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">👆</div>
                <h3 className="text-lg font-bold text-white mb-2">Touch Optimized</h3>
                <p className="text-gray-300">Perfect for finger navigation</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Mobile Features</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Responsive grid layouts that adapt to screen size',
                'Touch-friendly buttons and navigation menus',
                'Optimized images for faster mobile loading',
                'Mobile-specific affiliate link placement',
                'Swipe gestures for product galleries',
                'Mobile-optimized forms and checkout',
                'Accelerated Mobile Pages (AMP) support',
                'Progressive Web App (PWA) capabilities',
                'Mobile SEO optimization',
                'Cross-device synchronization'
              ].map((feature, index) => (
                <div key={index} className="flex items-center text-gray-200">
                  <span className="text-green-400 mr-3">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-lg p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4">Mobile-First Affiliate Success</h2>
              <p className="text-gray-200 mb-6">
                Capture mobile traffic and convert mobile visitors into affiliate commissions
              </p>
              <Link 
                href="/signup" 
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg text-xl font-semibold btn-hover inline-block"
              >
                Go Mobile Now 📱
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
