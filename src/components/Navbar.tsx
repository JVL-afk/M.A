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
    <nav className="bg-orange-700 shadow-lg sticky top-0 z-50">
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
                  ? 'bg-orange-800 text-white'
                  : 'text-orange-100 hover:bg-orange-600 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/pricing')
                  ? 'bg-orange-800 text-white'
                  : 'text-orange-100 hover:bg-orange-600 hover:text-white'
              }`}
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/docs')
                  ? 'bg-orange-800 text-white'
                  : 'text-orange-100 hover:bg-orange-600 hover:text-white'
              }`}
            >
              Documentation
            </Link>
            <Link
              href="/login"
              className="text-orange-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-white text-orange-700 hover:bg-orange-50 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-orange-100 hover:text-white p-2 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-orange-600">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-orange-700">
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-orange-800 text-white'
                    : 'text-orange-100 hover:bg-orange-600 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/pricing')
                    ? 'bg-orange-800 text-white'
                    : 'text-orange-100 hover:bg-orange-600 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/docs')
                    ? 'bg-orange-800 text-white'
                    : 'text-orange-100 hover:bg-orange-600 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Documentation
              </Link>
              <Link
                href="/login"
                className="block text-orange-100 hover:text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block bg-white text-orange-700 hover:bg-orange-50 px-3 py-2 rounded-md text-base font-medium transition-colors shadow-sm mx-3 mt-2 text-center"
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
