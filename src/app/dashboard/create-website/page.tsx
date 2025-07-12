'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Create a client-only component to handle localStorage
const ClientOnlyCreateWebsite = dynamic(() => Promise.resolve(CreateWebsiteClient), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-700 to-black flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
})

function CreateWebsiteClient() {
  const [affiliateLink, setAffiliateLink] = useState('')
  const [productName, setProductName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
    
    // Safe localStorage access only after client-side hydration
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('userEmail')
      if (storedEmail) {
        setUserEmail(storedEmail)
      } else {
        // Check if user is authenticated via other means
        // For now, we'll allow the form to be shown
        setUserEmail('demo@example.com') // Fallback for demo
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setResult(null)

    if (!affiliateLink) {
      setError('Please enter an affiliate link.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          affiliateLink: affiliateLink,
          productName: productName || 'Product',
          userEmail: userEmail || 'demo@example.com'
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.website)
        setError('')
      } else {
        setError(data.error || 'Failed to generate website')
      }
    } catch (err: any) {
      setError('Error: ' + (err.message || 'Network error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleStoreWebsite = async () => {
    if (!result) {
      alert('No website generated.')
      return
    }

    setIsLoading(true)

    try {
      const storeResponse = await fetch('/api/store-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: userEmail || 'demo@example.com',
          website: result,
        }),
      })

      const storeData = await storeResponse.json()

      if (storeData.success) {
        alert('Website stored successfully!')
        if (typeof window !== 'undefined') {
          router.push('/dashboard/my-websites')
        }
      } else {
        alert('Failed to store website: ' + (storeData.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error storing website: ' + (err.message || 'Network error'))
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-700 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
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
                  <p className="text-orange-100 bg-white/5 p-3 rounded">{result.title || 'Generated Website'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description:</h3>
                  <p className="text-orange-100 bg-white/5 p-3 rounded">{result.description || 'AI-generated description'}</p>
                </div>

                {result.sections && result.sections.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Content Sections:</h3>
                    <div className="space-y-2">
                      {result.sections.map((section: any, index: number) => (
                        <div key={index} className="bg-white/5 p-3 rounded">
                          <h4 className="font-semibold text-white">{section.title || `Section ${index + 1}`}</h4>
                          <p className="text-orange-100 text-sm">{section.content || 'Generated content'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Affiliate Link:</h3>
                  <a 
                    href={result.affiliateLink || affiliateLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 bg-white/5 p-3 rounded block break-all"
                  >
                    {result.affiliateLink || affiliateLink}
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

export default function CreateWebsite() {
  return <ClientOnlyCreateWebsite />
}
