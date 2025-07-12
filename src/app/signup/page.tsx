'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() { // Renamed component to SignupPage
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }), // Pass fullName if your backend signup expects it
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('userEmail', email); // Store email on successful signup
        router.push('/dashboard'); // Redirect to the dashboard page
      } else {
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-orange-600 to-black">
      <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl shadow-lg max-w-md w-full border border-orange-500/20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Join AFFILIFY</h2>
        <p className="text-orange-200 mb-8 text-center">Start your affiliate marketing journey today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-orange-200 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              placeholder="Andrei Miroiu"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-orange-200 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-orange-200 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-orange-200 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
          >
            {loading ? 'Signing Up...' : 'Create Account & Enter Dashboard'}
          </button>
        </form>

        <p className="text-center text-orange-200 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
