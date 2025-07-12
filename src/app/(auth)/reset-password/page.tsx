'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    code: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: formData.code,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setMessage('Password reset successfully! You can now log in with your new password.')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setMessage(data.error || 'Invalid or expired reset code')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen">
        <Navbar />
        
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Password Reset Successful!
            </h1>
            <p className="text-gray-300 mb-6">
              Your password has been updated successfully. You will be redirected to the login page in a few seconds.
            </p>
            <Link 
              href="/login"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold btn-hover inline-block"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Reset Your Password
          </h1>
          
          {email && (
            <div className="bg-blue-500/20 p-3 rounded-lg mb-6">
              <p className="text-blue-200 text-sm">
                Resetting password for: {email}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white mb-2">6-Digit Reset Code</label>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-red-500 focus:outline-none text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.replace(/\D/g, '')})}
              />
              <p className="text-sm text-gray-400 mt-1">
                Enter the 6-digit code sent to your email
              </p>
            </div>
            
            <div>
              <label className="block text-white mb-2">New Password</label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-red-500 focus:outline-none"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-white mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-red-500 focus:outline-none"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg ${success ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                {message}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || formData.code.length !== 6}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold btn-hover disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Reset Password 🔐'}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-gray-300 mb-2">
              Didn't receive the code?
            </p>
            <Link href="/forgot-password" className="text-red-400 hover:text-red-300">
              Request New Code
            </Link>
          </div>
          
          <p className="text-center text-gray-300 mt-4">
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
