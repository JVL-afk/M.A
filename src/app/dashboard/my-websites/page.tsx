'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyWebsitesPage() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
      fetchMyWebsites(storedEmail);
    } else {
      router.push('/login'); // Redirect if not logged in
    }
  }, [router]);

  const fetchMyWebsites = async (email: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/dashboard/my-websites?userId=${email}`);
      const data = await response.json();
      if (data.success) {
        setWebsites(data.websites);
      } else {
        setError(data.error || 'Failed to fetch websites.');
      }
    } catch (err) {
      setError('An error occurred while fetching websites.');
    } finally {
      setLoading(false);
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

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">My Generated Websites 🌐</h1>
        <p className="text-orange-200 text-lg mb-8 text-center">
          View and manage all the affiliate websites you've generated with AI.
        </p>

        {loading ? (
          <p className="text-center text-orange-200">Loading your websites...</p>
        ) : error ? (
          <p className="text-center text-red-400">Error: {error}</p>
        ) : websites.length === 0 ? (
          <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-purple-500/20 text-center">
            <p className="text-orange-200 text-xl mb-4">No websites generated yet!</p>
            <Link href="/dashboard/create-website" className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200">
              Generate Your First Website
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website: any) => (
              <div key={website._id} className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{website.productName || 'Unnamed Product'}</h3>
                  <p className="text-orange-200 text-sm mb-4">Generated: {new Date(website.createdAt).toLocaleDateString()}</p>
                  <p className="text-gray-300 text-sm mb-4 truncate">Original Link: {website.affiliateLink}</p>
                </div>
                <div className="mt-4 flex space-x-3">
                  <a
                    href={website.generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center font-semibold transition-colors duration-200"
                  >
                    View Website
                  </a>
                  {/* Add more actions like Edit, Delete, Analytics if needed */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
