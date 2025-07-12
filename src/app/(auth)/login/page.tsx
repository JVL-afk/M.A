'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      setMessage('Login successful! Redirecting to dashboard...')
      // Redirect to dashboard after successful login
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)
    }, 2000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-orange-200">Sign in to your AFFILIFY account</p>
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
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                />
                <label className="text-white text-sm">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-orange-300 hover:text-orange-200 text-sm underline">
                Forgot your password?
              </Link>
            </div>

            {message && (
              <div className={message.includes('successful') ? 'success-message' : 'error-message'}>
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
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-orange-200">
              Don't have an account?{' '}
              <Link href="/signup" className="text-white font-semibold hover:text-orange-300">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Social Login Options */}
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
