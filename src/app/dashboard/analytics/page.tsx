'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BasicAnalytics {
  totalWebsites: number;
  totalClicks: number;
  totalRevenue: number;
  totalConversions: number;
}

interface AdvancedAnalytics {
  dailyPerformance: Array<{
    date: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  trafficSources: Array<{
    source: string;
    clicks: number;
    percentage: number;
  }>;
  topWebsites: Array<{
    id: string;
    name: string;
    clicks: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  geographicData: Array<{
    country: string;
    clicks: number;
    conversions: number;
  }>;
}

export default function AnalyticsPage() {
  const [basicAnalytics, setBasicAnalytics] = useState<BasicAnalytics | null>(null);
  const [userPlan, setUserPlan] = useState<string>('basic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      
      if (data.success) {
        setBasicAnalytics(data.basicAnalytics);
        setUserPlan(data.userPlan);
      } else {
        throw new Error(data.error || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Analytics</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAnalyticsData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe calculation with proper null checking
  const conversionRate = (basicAnalytics?.totalClicks && basicAnalytics.totalClicks > 0)
    ? ((basicAnalytics.totalConversions / basicAnalytics.totalClicks) * 100).toFixed(2)
    : '0.00';

  let advancedData: AdvancedAnalytics | null = null;

  // Mock advanced analytics data for Pro+ users
  if (userPlan === 'pro' || userPlan === 'enterprise') {
    advancedData = {
      dailyPerformance: [
        { date: '2024-01-15', clicks: 45, conversions: 3, revenue: 89.97 },
        { date: '2024-01-16', clicks: 52, conversions: 4, revenue: 119.96 },
        { date: '2024-01-17', clicks: 38, conversions: 2, revenue: 59.98 },
        { date: '2024-01-18', clicks: 61, conversions: 5, revenue: 149.95 },
        { date: '2024-01-19', clicks: 47, conversions: 3, revenue: 89.97 },
        { date: '2024-01-20', clicks: 55, conversions: 4, revenue: 119.96 },
        { date: '2024-01-21', clicks: 43, conversions: 3, revenue: 89.97 },
      ],
      trafficSources: [
        { source: 'Social Media', clicks: 156, percentage: 45.2 },
        { source: 'Search Engines', clicks: 98, percentage: 28.4 },
        { source: 'Direct Traffic', clicks: 67, percentage: 19.4 },
        { source: 'Email Marketing', clicks: 24, percentage: 7.0 },
      ],
      topWebsites: [
        { id: '1', name: 'Tech Gadgets Review', clicks: 89, conversions: 7, revenue: 209.93, conversionRate: 7.87 },
        { id: '2', name: 'Fitness Equipment Guide', clicks: 76, conversions: 5, revenue: 149.95, conversionRate: 6.58 },
        { id: '3', name: 'Home Decor Trends', clicks: 63, conversions: 4, revenue: 119.96, conversionRate: 6.35 },
        { id: '4', name: 'Travel Essentials', clicks: 45, conversions: 2, revenue: 59.98, conversionRate: 4.44 },
        { id: '5', name: 'Kitchen Appliances', clicks: 38, conversions: 2, revenue: 59.98, conversionRate: 5.26 },
      ],
      deviceBreakdown: {
        desktop: 58.3,
        mobile: 35.7,
        tablet: 6.0,
      },
      geographicData: [
        { country: 'United States', clicks: 142, conversions: 12 },
        { country: 'United Kingdom', clicks: 89, conversions: 7 },
        { country: 'Canada', clicks: 67, conversions: 5 },
        { country: 'Australia', clicks: 45, conversions: 3 },
        { country: 'Germany', clicks: 34, conversions: 2 },
        { country: 'France', clicks: 28, conversions: 2 },
        { country: 'Netherlands', clicks: 23, conversions: 1 },
        { country: 'Sweden', clicks: 19, conversions: 1 },
        { country: 'Norway', clicks: 15, conversions: 1 },
        { country: 'Denmark', clicks: 12, conversions: 1 },
      ],
    };
  }

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Track your affiliate marketing performance and optimize your results
          </p>
        </div>

        {/* Basic Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Websites</p>
                <p className="text-2xl font-bold text-gray-900">{basicAnalytics?.totalWebsites || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{basicAnalytics?.totalClicks || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${basicAnalytics?.totalRevenue?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics for Pro+ Users */}
        {userPlan === 'pro' || userPlan === 'enterprise' ? (
          advancedData && (
            <div className="space-y-8">
              {/* Daily Performance Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance (Last 7 Days)</h3>
                <div className="space-y-4">
                  {advancedData.dailyPerformance.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">{day.date}</span>
                      <div className="flex space-x-6 text-sm">
                        <span className="text-blue-600">{day.clicks} clicks</span>
                        <span className="text-green-600">{day.conversions} conversions</span>
                        <span className="text-yellow-600">${day.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
                <div className="space-y-3">
                  {advancedData.trafficSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{source.source}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12">{source.percentage}%</span>
                        <span className="text-sm font-medium text-gray-900 w-16">{source.clicks} clicks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performing Websites */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Websites</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Website</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Clicks</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Conversions</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Conv. Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advancedData.topWebsites.map((website, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">{website.name}</td>
                          <td className="py-3 px-4 text-gray-600">{website.clicks}</td>
                          <td className="py-3 px-4 text-gray-600">{website.conversions}</td>
                          <td className="py-3 px-4 text-gray-600">${website.revenue}</td>
                          <td className="py-3 px-4 text-gray-600">{website.conversionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Device Breakdown and Geographic Data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Breakdown */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Desktop</span>
                      <span className="text-gray-600">{advancedData.deviceBreakdown.desktop}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Mobile</span>
                      <span className="text-gray-600">{advancedData.deviceBreakdown.mobile}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Tablet</span>
                      <span className="text-gray-600">{advancedData.deviceBreakdown.tablet}%</span>
                    </div>
                  </div>
                </div>

                {/* Geographic Data */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Countries</h3>
                  <div className="space-y-2">
                    {advancedData.geographicData.map((country, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{country.country}</span>
                        <div className="flex space-x-3">
                          <span className="text-blue-600">{country.clicks} clicks</span>
                          <span className="text-green-600">{country.conversions} conv.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          /* Upgrade Prompt for Basic Users */
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Unlock Advanced Analytics</h3>
            <p className="text-blue-100 mb-6">
              Get detailed insights with daily performance charts, traffic source analysis, 
              device breakdowns, geographic data, and much more!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">📊 Daily Performance</h4>
                <p className="text-sm text-blue-100">Track clicks, conversions, and revenue day by day</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">🌍 Geographic Data</h4>
                <p className="text-sm text-blue-100">See where your traffic is coming from worldwide</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">📱 Device Insights</h4>
                <p className="text-sm text-blue-100">Understand your audience's device preferences</p>
              </div>
            </div>
            <button
              onClick={handleUpgrade}
              className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Upgrade to Pro - $29/month
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

