// FIXED WEBSITE DISPLAY PAGE - src/app/websites/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ExternalLink, BarChart3, Eye, MousePointer } from 'lucide-react';

interface Website {
  id: string;
  slug: string;
  title: string;
  description: string;
  html: string;
  productUrl: string;
  template: string;
  createdAt: string;
  views: number;
  clicks: number;
  isActive: boolean;
  productInfo: {
    title: string;
    description: string;
    price: string;
    domain: string;
    image?: string;
  };
}

interface Analytics {
  views: number;
  clicks: number;
  conversionRate: number;
  lastViewed: string;
}

export default function WebsitePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [website, setWebsite] = useState<Website | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchWebsite();
      trackView();
    }
  }, [slug]);

  const fetchWebsite = async () => {
    try {
      const response = await fetch(`/api/websites/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load website');
      }

      setWebsite(data.website);
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`/api/analytics/track-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const trackClick = async () => {
    try {
      await fetch(`/api/analytics/track-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  const handleProductClick = () => {
    trackClick();
    window.open(website?.productUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your website...</p>
        </div>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Website Not Found</h1>
            <p className="text-red-200">{error || 'The requested website could not be found.'}</p>
          </div>
          <a 
            href="/dashboard" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Analytics Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {website.title}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Live
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Quick Stats */}
              <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{analytics?.views || 0} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MousePointer className="w-4 h-4" />
                  <span>{analytics?.clicks || 0} clicks</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>{analytics?.conversionRate.toFixed(1) || 0}% CTR</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </button>
                
                <button
                  onClick={handleProductClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && analytics && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <Eye className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Views</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.views}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <MousePointer className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Clicks</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.clicks}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Click Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.conversionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">$</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Est. Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${((analytics.clicks * 25) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Website Content */}
      <div className="flex-1">
        <iframe
          srcDoc={website.html}
          className="w-full h-screen border-0"
          title={website.title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          style={{ minHeight: 'calc(100vh - 64px)' }}
        />
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <button
          onClick={handleProductClick}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors"
        >
          <ExternalLink className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

