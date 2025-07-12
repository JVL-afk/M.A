'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function VerifyEmailPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (code.length !== 6) {
      setError('Please enter a 6-digit verification code')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Email verified successfully! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(data.error || 'Invalid verification code')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('New verification code sent to your email')
      } else {
        setError(data.error || 'Failed to resend code')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-600 via-orange-700 to-black animate-pulse" 
           style={{
             animation: 'backgroundShift 6s ease-in-out infinite',
             background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 30%, #9a3412 60%, #000000 100%)'
           }}>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-orange-500/20">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Verify Your Email
                </h1>
                <p className="text-orange-200 mb-4">
                  We've sent a 6-digit code to your email
                </p>
                {email && (
                  <p className="text-purple-300 text-sm">
                    {email}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-orange-200 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className="text-orange-300 text-xs mt-1">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                {message && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                    <p className="text-green-200 text-sm">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <div className="text-center space-y-2">
                  <p className="text-orange-200 text-sm">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading}
                    className="text-purple-300 hover:text-purple-200 underline text-sm disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Code'}
                  </button>
                </div>

                <div className="text-center">
                  <Link 
                    href="/login"
                    className="text-orange-300 hover:text-orange-200 underline text-sm"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Background Animation Styles */}
      <style jsx>{`
        @keyframes backgroundShift {
          0% { background: linear-gradient(135deg, #ea580c 0%, #c2410c 30%, #9a3412 60%, #000000 100%); }
          33% { background: linear-gradient(135deg, #c2410c 0%, #9a3412 30%, #7c2d12 60%, #000000 100%); }
          66% { background: linear-gradient(135deg, #9a3412 0%, #7c2d12 30%, #451a03 60%, #000000 100%); }
          100% { background: linear-gradient(135deg, #ea580c 0%, #c2410c 30%, #9a3412 60%, #000000 100%); }
        }
      `}</style>
    </div>
  )
}
