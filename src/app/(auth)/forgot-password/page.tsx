'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [codeSent, setCodeSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setCodeSent(true)
        setMessage('Reset code sent to your email! Check your inbox.')
      } else {
        setMessage(data.error || 'Something went wrong')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Reset Password
          </h1>
          
          {!codeSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-red-500 focus:outline-none"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg ${message.includes('sent') ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                  {message}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold btn-hover disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Code 📧'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-xl font-bold text-white mb-4">Check Your Email</h2>
              <p className="text-gray-300 mb-6">
                We've sent a 6-digit reset code to {email}
              </p>
              <Link 
                href="/reset-password"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold btn-hover inline-block"
              >
                Enter Reset Code
              </Link>
            </div>
          )}
          
          <p className="text-center text-gray-300 mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-red-400 hover:text-red-300">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
