'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import Link from 'next/link'; // Import Link for navigation

export default function CreateWebsite() {
  const [affiliateLink, setAffiliateLink] = useState('');
  const [productName, setProductName] = useState(''); // Add state for product name
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // Store the full result from generation
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState(''); // To get user email for saving
  const router = useRouter();

  // Fetch user email on component mount
  useState(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
    } else {
      router.push('/login'); // Redirect if not logged in
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null); // Clear previous result

    if (!userEmail) {
      setError('User not logged in. Please log in to generate websites.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/ai/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail, // Pass user email in header
        },
        body: JSON.stringify({
          affiliateLink: affiliateLink,
          productName: productName, // Pass product name
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.website); // Store the website object from the response
        alert('Website generated successfully! Now click "Store Website" to save it.');
      } else {
        setError(data.error || 'Failed to generate website');
      }
    } catch (err: any) {
      setError('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreWebsite = async () => {
    if (!result || !userEmail) {
      alert('No website generated or user not logged in.');
      return;
    }

    setIsLoading(true); // Use isLoading for this too, or add a separate state
    setError('');

    try {
      // This call is now redundant if generate-website already saves to DB.
      // However, for debugging, we can simulate a direct save.
      // In a production app, the generate-website API would handle the saving.
      // For now, let's just re-confirm the data is structured correctly for saving.

      // The saving logic is now primarily in /api/ai/generate-website/route.ts
      // If the website was successfully generated, it should have been saved.
      // This button will primarily serve to confirm the data is there.

      // To explicitly test the saving part, we could create a separate API endpoint
      // like /api/websites/save, but for now, let's assume generate-website is the source.

      // Let's re-fetch the 'My Websites' list to see if it appeared.
      alert('Attempting to verify if website was stored. Check "My Websites" page.');
      router.push('/dashboard/my-websites'); // Redirect to check
    } catch (err: any) {
      setError('Error storing website: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-orange-600 to-black text-white">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-orange-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              AFFILIFY
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-orange-200 hover:text-white">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Create a New Website</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20">
          <div>
            <label htmlFor="affiliateLink" className="block text-sm font-medium text-orange-200 mb-2">
              Affiliate Link
            </label>
            <input
              type="url"
              id="affiliateLink"
              value={affiliateLink}
              onChange={(e) => setAffiliateLink(e.target.value)}
              placeholder="https://www.amazon.com/product-link"
              className="w-full p-3 bg-black/50 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              required
            />
          </div>
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-orange-200 mb-2">
              Product Name (Optional, for better AI generation )
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., 'Ergonomic Office Chair'"
              className="w-full p-3 bg-black/50 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-all duration-200"
          >
            {isLoading ? 'Generating Website...' : 'Generate Website'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 bg-green-500/20 border border-green-500/50 text-green-200 rounded-lg space-y-4">
            <h3 className="font-bold text-xl">Website Generated Successfully!</h3>
            <p>URL: <a href={result.url} target="_blank" className="text-blue-400 underline hover:text-blue-300">{result.url}</a></p>
            <p>Title: {result.title}</p>
            <p>Description: {result.description}</p>
            <button
              onClick={handleStoreWebsite}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-all duration-200"
            >
              Check My Websites Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
