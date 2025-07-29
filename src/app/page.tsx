'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, TrendingUp, Target } from 'lucide-react'

const HeroSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Main Headline - Flashy and Modern */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse">
              Experience
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Affiliate Marketing
            </span>
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Like a Video Game
              </span>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            </span>
          </h1>
        </div>

        {/* Secondary Text - Professional */}
        <div className="mb-12">
          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 font-light leading-relaxed max-w-4xl mx-auto">
            Get everything from{' '}
            <span className="text-blue-400 font-medium">AI insights</span> to{' '}
            <span className="text-green-400 font-medium">AI-powered website generation</span>, to{' '}
            <span className="text-purple-400 font-medium">geographic analysis</span>
          </p>
        </div>

        {/* Gaming-Style Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 min-w-[120px]">
            <div className="text-2xl font-bold text-purple-400">Level Up</div>
            <div className="text-sm text-gray-400">Your Revenue</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 min-w-[120px]">
            <div className="text-2xl font-bold text-blue-400">Power Up</div>
            <div className="text-sm text-gray-400">With AI</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-4 min-w-[120px]">
            <div className="text-2xl font-bold text-green-400">Unlock</div>
            <div className="text-sm text-gray-400">New Markets</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/register"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
          >
            <span className="relative z-10 flex items-center">
              Start Your Quest
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          </Link>
          
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-300 bg-gray-800/50 border border-gray-600 rounded-full hover:bg-gray-700/50 hover:text-white transform hover:scale-105 transition-all duration-300"
          >
            View Power-Ups
          </Link>
        </div>

        {/* Feature Icons */}
        <div className="flex justify-center gap-8 opacity-70">
          <div className="flex flex-col items-center">
            <Zap className="h-8 w-8 text-yellow-400 mb-2" />
            <span className="text-sm text-gray-400">Lightning Fast</span>
          </div>
          <div className="flex flex-col items-center">
            <TrendingUp className="h-8 w-8 text-green-400 mb-2" />
            <span className="text-sm text-gray-400">High Performance</span>
          </div>
          <div className="flex flex-col items-center">
            <Target className="h-8 w-8 text-red-400 mb-2" />
            <span className="text-sm text-gray-400">Precision Targeting</span>
          </div>
        </div>

        {/* Floating Elements for Gaming Feel */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-purple-500 rounded-full animate-ping hidden lg:block"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-blue-500 rounded-full animate-bounce hidden lg:block"></div>
        <div className="absolute bottom-20 left-20 w-2 h-2 bg-green-500 rounded-full animate-pulse hidden lg:block"></div>
        <div className="absolute bottom-40 right-10 w-4 h-4 bg-yellow-500 rounded-full animate-ping hidden lg:block"></div>
      </div>
    </div>
  )
}

export default HeroSection
