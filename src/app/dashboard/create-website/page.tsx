'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateWebsite() {
  const [affiliateLink, setAffiliateLink] = useState('')
  const [productName, setProductName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()

  // Safe localStorage access
  const getFromStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  }

  const setToStorage = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
    }
  }

  // Fetch user email on component mount
  useEffect(() => {
    const storedEmail = getFromStorage('userEmail')
    if (storedEmail) {
      setUserEmail(storedEmail)
    } else {
      router.push('/login') // Redirect if not logged in
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setResult(null) // Clear previous result

    if (!userEmail) {
      setError('User not logged in. Please log in to generate websites.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail, // Pass user email in header
        },
        body: JSON.stringify({
          affiliateLink: affiliateLink,
          productName: productName, // Pass product name
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.website) // Store the website object from the response
        alert('Website generated successfully! Now click "Store Website" to save it.')
      } else {
        setError(data.error || 'Failed to generate website')
      }
    } catch (err: any) {
      setError('Error: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStoreWebsite = async () => {
    if (!result || !userEmail) {
      alert('No website generated or user not logged in.')
      return
    }

    setIsLoading(true) // Use isLoading for this too, or add a separate state

    try {
      const storeResponse = await fetch('/api/store-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: userEmail,
          website: result,
        }),
      })

      const storeData = await storeResponse.json()

      if (storeData.success) {
        alert('Website stored successfully!')
        // Optionally redirect to my-websites page
        router.push('/dashboard/my-websites')
      } else {
        alert('Failed to store website: ' + storeData.error)
      }
    } catch (err: any) {
      alert('Error storing website: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-700 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Create AI-Powered Affiliate Website
            </h1>
            <p className="text-xl text-orange-200">
              Generate a professional affiliate website in seconds using AI
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-lg font-semibold mb-2">
                  Affiliate Link *
                </label>
                <input
                  type="url"
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  placeholder="https://example.com/affiliate-link"
                  required
                />
                <p className="text-orange-200 text-sm mt-2">
                  Enter the affiliate link you want to promote
                </p>
              </div>

              <div>
                <label className="block text-white text-lg font-semibold mb-2">
                  Product Name (Optional)
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  placeholder="e.g., iPhone 15 Pro, Nike Air Max, etc."
                />
                <p className="text-orange-200 text-sm mt-2">
                  Specify the product name for better AI generation (optional)
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 text-red-200 p-4 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold text-lg btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating Website...' : 'Generate Website with AI'}
              </button>
            </form>
          </div>

          {/* Result */}
          {result && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Generated Website</h2>
                <button
                  onClick={handleStoreWebsite}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold btn-hover disabled:opacity-50"
                >
                  {isLoading ? 'Storing...' : 'Store Website'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Title:</h3>
                  <p className="text-orange-100 bg-white/5 p-3 rounded">{result.title}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description:</h3>
                  <p className="text-orange-100 bg-white/5 p-3 rounded">{result.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Content Sections:</h3>
                  <div className="space-y-2">
                    {result.sections?.map((section: any, index: number) => (
                      <div key={index} className="bg-white/5 p-3 rounded">
                        <h4 className="font-semibold text-white">{section.title}</h4>
                        <p className="text-orange-100 text-sm">{section.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Affiliate Link:</h3>
                  <a 
                    href={result.affiliateLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 bg-white/5 p-3 rounded block break-all"
                  >
                    {result.affiliateLink}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="text-center mt-8">
            <Link 
              href="/dashboard" 
              className="text-orange-300 hover:text-orange-200 font-semibold"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
