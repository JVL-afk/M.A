'use client'

import Link from 'next/link';
import Navbar from '../../../components/Navbar';

export default function ProfessionalTemplates() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="mb-8">
          <Link href="/features" className="text-gray-400 hover:text-white">Features</Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-white">Professional Templates</span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🎨</div>
            <h1 className="text-5xl font-bold gradient-text mb-6">Professional Templates</h1>
            <p className="text-xl text-gray-200">
              Choose from hundreds of professionally designed templates optimized for affiliate marketing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🎯 Conversion-Focused</h3>
              <p className="text-gray-300">
                Every template is designed with one goal: maximum conversions. Proven layouts that 
                guide visitors to click your affiliate links and make purchases.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🏢 Industry-Specific</h3>
              <p className="text-gray-300">
                Templates tailored for every niche - tech, fitness, beauty, finance, and more. 
                Each design speaks directly to your target audience.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">✨ Designer Quality</h3>
              <p className="text-gray-300">
                Created by professional web designers and conversion experts. Beautiful, modern 
                designs that build trust and credibility with your visitors.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🔄 Regular Updates</h3>
              <p className="text-gray-300">
                New templates added monthly. Stay ahead of design trends and always have fresh, 
                modern layouts for your affiliate websites.
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Template Categories</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">💻</div>
                <h3 className="text-lg font-bold text-white mb-2">Tech</h3>
                <p className="text-gray-300">Gadgets, software, electronics</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">💪</div>
                <h3 className="text-lg font-bold text-white mb-2">Fitness</h3>
                <p className="text-gray-300">Health, wellness, supplements</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">💄</div>
                <h3 className="text-lg font-bold text-white mb-2">Beauty</h3>
                <p className="text-gray-300">Cosmetics, skincare, fashion</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">🏠</div>
                <h3 className="text-lg font-bold text-white mb-2">Home</h3>
                <p className="text-gray-300">Decor, appliances, furniture</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Template Features</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {[
                '100+ professionally designed templates',
                'Industry-specific layouts and styling',
                'Conversion-optimized design elements',
                'Mobile-responsive across all devices',
                'SEO-friendly structure and markup',
                'Fast-loading optimized code',
                'Easy customization options',
                'Regular template updates',
                'A/B tested layouts for maximum conversions',
                'Brand customization capabilities'
              ].map((feature, index) => (
                <div key={index} className="flex items-center text-gray-200">
                  <span className="text-green-400 mr-3">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4">Professional Design, Maximum Conversions</h2>
              <p className="text-gray-200 mb-6">
                Choose from our library of conversion-optimized templates
              </p>
              <Link 
                href="/signup" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-xl font-semibold btn-hover inline-block"
              >
                Browse Templates 🎨
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
