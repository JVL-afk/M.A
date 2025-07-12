'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match!')
      return
    }
    
    if (!formData.agreeToTerms) {
      setMessage('Please agree to the terms and conditions!')
      return
    }

    setIsLoading(true)
    setMessage('')

    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false)
      setMessage('Account created successfully! Please check your email for verification.')
      // Redirect to dashboard after successful signup
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    }, 2000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Join AFFILIFY</h1>
            <p className="text-orange-200">Start your affiliate marketing journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Confirm your password"
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 mr-3"
                required
              />
              <label className="text-white text-sm">
                I agree to the{' '}
                <Link href="/terms" className="text-orange-300 hover:text-orange-200 underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-orange-300 hover:text-orange-200 underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {message && (
              <div className={message.includes('successfully') ? 'success-message' : 'error-message'}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`form-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner w-5 h-5 mr-3"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-orange-200">
              Already have an account?{' '}
              <Link href="/login" className="text-white font-semibold hover:text-orange-300">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Social Signup Options */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white border-opacity-30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-orange-200">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-white border-opacity-30 rounded-md shadow-sm bg-white bg-opacity-10 text-sm font-medium text-white hover:bg-opacity-20 transition-all duration-300">
                <span>Google</span>
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-white border-opacity-30 rounded-md shadow-sm bg-white bg-opacity-10 text-sm font-medium text-white hover:bg-opacity-20 transition-all duration-300">
                <span>GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
