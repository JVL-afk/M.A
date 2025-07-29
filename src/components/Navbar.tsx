'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Zap } from 'lucide-react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <nav className="bg-gray-800 shadow-lg sticky top-0 z-50" style={{ backgroundColor: '#1a202c' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">AFFILIFY</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              style={isActive('/') ? { backgroundColor: '#2d3748' } : {}}
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/pricing')
                  ? 'text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              style={isActive('/pricing') ? { backgroundColor: '#2d3748' } : {}}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/docs')
                  ? 'text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              style={isActive('/docs') ? { backgroundColor: '#2d3748' } : {}}
            >
              Documentation
            </Link>
            <Link
              href="/about-me"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/about-me')
                  ? 'text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              style={isActive('/about-me') ? { backgroundColor: '#2d3748' } : {}}
            >
              About Me
            </Link>
            <Link
              href="/login"
              className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1" style={{ backgroundColor: '#1a202c' }}>
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/')
                    ? 'text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                style={isActive('/') ? { backgroundColor: '#2d3748' } : {}}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/pricing')
                    ? 'text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                style={isActive('/pricing') ? { backgroundColor: '#2d3748' } : {}}
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/docs')
                    ? 'text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                style={isActive('/docs') ? { backgroundColor: '#2d3748' } : {}}
                onClick={() => setIsMenuOpen(false)}
              >
                Documentation
              </Link>
              <Link
                href="/about-me"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/about-me')
                    ? 'text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                style={isActive('/about-me') ? { backgroundColor: '#2d3748' } : {}}
                onClick={() => setIsMenuOpen(false)}
              >
                About Me
              </Link>
              <Link
                href="/login"
                className="block text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium transition-colors shadow-sm mx-3 mt-2 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
