// ADVANCED ANALYTICS SYSTEM FOR PRO USERS
// This creates a comprehensive analytics dashboard with advanced metrics

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Analytics data fetching function
async function getAdvancedAnalyticsData() {
  const token = cookies().get('auth-token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) return null;

    const userPlan = user.plan || 'basic';

    // Basic analytics (available to all users)
    const basicAnalytics = await db.collection('analytics').aggregate([
      { $match: { userId: new ObjectId(decoded.userId) } },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] } },
          totalConversions: { $sum: { $cond: [{ $eq: ["$eventType", "conversion"] }, 1, 0] } },
          totalRevenue: { $sum: { $ifNull: ["$data.revenue", 0] } },
        },
      },
    ]).next();

    const totalWebsites = await db.collection('generated_websites').countDocuments({ 
      userId: new ObjectId(decoded.userId) 
    });

    const conversionRate = (basicAnalytics?.totalClicks > 0)
      ? ((basicAnalytics.totalConversions / basicAnalytics.totalClicks) * 100).toFixed(2)
      : '0.00';

    let advancedData = null;

    // Advanced analytics (Pro+ only)
    if (userPlan === 'pro' || userPlan === 'enterprise') {
      // Daily performance data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyStats = await db.collection('analytics').aggregate([
        { 
          $match: { 
            userId: new ObjectId(decoded.userId),
            timestamp: { $gte: thirtyDaysAgo }
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
              day: { $dayOfMonth: "$timestamp" }
            },
            clicks: { $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] } },
            conversions: { $sum: { $cond: [{ $eq: ["$eventType", "conversion"] }, 1, 0] } },
            revenue: { $sum: { $ifNull: ["$data.revenue", 0] } }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
      ]).toArray();

      // Top performing websites
      const topWebsites = await db.collection('analytics').aggregate([
        { $match: { userId: new ObjectId(decoded.userId) } },
        {
          $group: {
            _id: "$websiteId",
            clicks: { $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] } },
            conversions: { $sum: { $cond: [{ $eq: ["$eventType", "conversion"] }, 1, 0] } },
            revenue: { $sum: { $ifNull: ["$data.revenue", 0] } }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ]).toArray();

      // Traffic sources analysis
      const trafficSources = await db.collection('analytics').aggregate([
        { $match: { userId: new ObjectId(decoded.userId) } },
        {
          $group: {
            _id: "$data.source",
            clicks: { $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] } },
            conversions: { $sum: { $cond: [{ $eq: ["$eventType", "conversion"] }, 1, 0] } }
          }
        },
        { $sort: { clicks: -1 } }
      ]).toArray();

      // Device/Browser analytics
      const deviceStats = await db.collection('analytics').aggregate([
        { $match: { userId: new ObjectId(decoded.userId) } },
        {
          $group: {
            _id: "$data.device",
            clicks: { $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] } },
            conversions: { $sum: { $cond: [{ $eq: ["$eventType", "conversion"] }, 1, 0] } }
          }
        },
        { $sort: { clicks: -1 } }
      ]).toArray();

      // Geographic data
      const geoStats = await db.collection('analytics').aggregate([
        { $match: { userId: new ObjectId(decoded.userId) } },
        {
          $group: {
            _id: "$data.country",
            clicks: { $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] } },
            conversions: { $sum: { $cond: [{ $eq: ["$eventType", "conversion"] }, 1, 0] } }
          }
        },
        { $sort: { clicks: -1 } },
        { $limit: 10 }
      ]).toArray();

      advancedData = {
        dailyStats,
        topWebsites,
        trafficSources,
        deviceStats,
        geoStats
      };
    }

    return {
      user,
      userPlan,
      basicStats: {
        totalWebsites,
        totalClicks: basicAnalytics?.totalClicks || 0,
        totalConversions: basicAnalytics?.totalConversions || 0,
        totalRevenue: basicAnalytics?.totalRevenue || 0,
        conversionRate,
      },
      advancedData
    };
  } catch (error) {
    console.error("Failed to fetch analytics data:", error);
    return null;
  }
}

// Chart component for daily performance
function DailyPerformanceChart({ data }: { data: any[] }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  
  return (
    <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
      <h3 className="text-xl font-semibold mb-4">Daily Performance (Last 30 Days)</h3>
      <div className="h-64 flex items-end justify-between space-x-1">
        {data.slice(-30).map((day, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="bg-gradient-to-t from-orange-600 to-orange-400 w-full rounded-t"
              style={{ height: `${(day.revenue / maxRevenue) * 200}px` }}
              title={`${day._id.month}/${day._id.day}: $${day.revenue.toFixed(2)}`}
            ></div>
            <div className="text-xs text-gray-400 mt-1">
              {day._id.month}/{day._id.day}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Traffic sources component
function TrafficSourcesChart({ data }: { data: any[] }) {
  const total = data.reduce((sum, item) => sum + item.clicks, 0);
  
  return (
    <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
      <h3 className="text-xl font-semibold mb-4">Traffic Sources</h3>
      <div className="space-y-3">
        {data.slice(0, 5).map((source, index) => {
          const percentage = total > 0 ? ((source.clicks / total) * 100).toFixed(1) : '0';
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>{source._id || 'Direct'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-400">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Main analytics page component
export default async function AdvancedAnalyticsPage() {
  const data = await getAdvancedAnalyticsData();

  if (!data) {
    redirect('/login');
  }

  const { user, userPlan, basicStats, advancedData } = data;
  const isProUser = userPlan === 'pro' || userPlan === 'enterprise';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-orange-800 text-white">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
            <p className="text-orange-200 mt-2">
              {isProUser ? 'Advanced Analytics' : 'Basic Analytics'} • {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan
            </p>
          </div>
          <Link href="/dashboard" className="text-purple-300 hover:text-orange-200">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Basic Stats (Available to all users) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-300">Total Websites</h3>
            <p className="text-4xl font-bold">{basicStats.totalWebsites}</p>
          </div>
          <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-300">Total Clicks</h3>
            <p className="text-4xl font-bold">{basicStats.totalClicks}</p>
          </div>
          <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-300">Total Revenue</h3>
            <p className="text-4xl font-bold">${basicStats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-300">Conversion Rate</h3>
            <p className="text-4xl font-bold">{basicStats.conversionRate}%</p>
          </div>
        </div>

        {/* Advanced Analytics (Pro+ only) */}
        {isProUser && advancedData ? (
          <div className="space-y-8">
            {/* Daily Performance Chart */}
            {advancedData.dailyStats.length > 0 && (
              <DailyPerformanceChart data={advancedData.dailyStats} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Traffic Sources */}
              {advancedData.trafficSources.length > 0 && (
                <TrafficSourcesChart data={advancedData.trafficSources} />
              )}

              {/* Top Performing Websites */}
              <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-xl font-semibold mb-4">Top Performing Websites</h3>
                <div className="space-y-3">
                  {advancedData.topWebsites.slice(0, 5).map((website, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <div>
                        <p className="font-semibold">Website #{website._id}</p>
                        <p className="text-sm text-gray-400">{website.clicks} clicks • {website.conversions} conversions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">${website.revenue.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">
                          {website.clicks > 0 ? ((website.conversions / website.clicks) * 100).toFixed(1) : '0'}% CVR
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Device Stats */}
              <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-xl font-semibold mb-4">Device Breakdown</h3>
                <div className="space-y-3">
                  {advancedData.deviceStats.map((device, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{device._id || 'Unknown'}</span>
                      <div className="text-right">
                        <p className="font-semibold">{device.clicks} clicks</p>
                        <p className="text-sm text-gray-400">{device.conversions} conversions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Stats */}
              <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-xl font-semibold mb-4">Top Countries</h3>
                <div className="space-y-3">
                  {advancedData.geoStats.map((country, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{country._id || 'Unknown'}</span>
                      <div className="text-right">
                        <p className="font-semibold">{country.clicks} clicks</p>
                        <p className="text-sm text-gray-400">{country.conversions} conversions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Upgrade prompt for basic users */
          <div className="bg-gradient-to-r from-purple-600 to-orange-600 p-8 rounded-xl text-center">
            <h2 className="text-2xl font-bold mb-4">Unlock Advanced Analytics</h2>
            <p className="text-lg mb-6">
              Get detailed insights with daily performance charts, traffic source analysis, 
              device breakdowns, geographic data, and much more!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
              <div className="bg-black/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📊 Daily Performance</h4>
                <p className="text-sm">Track your revenue and conversions day by day</p>
              </div>
              <div className="bg-black/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🌍 Traffic Sources</h4>
                <p className="text-sm">See where your visitors are coming from</p>
              </div>
              <div className="bg-black/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📱 Device Analytics</h4>
                <p className="text-sm">Understand your audience's device preferences</p>
              </div>
            </div>
            <Link 
              href="/pricing" 
              className="inline-block bg-white text-purple-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
