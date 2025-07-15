import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { LogoutButton } from './LogoutButton'; // We'll create this small client component

// --- 1. Secure Server-Side Data Fetching ---
async function getDashboardData() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    // No token, definitely not logged in.
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key-for-development') as { userId: string };
    if (!decoded.userId) return null;

    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    // Fetch user and analytics data in parallel for speed
    const [user, analytics] = await Promise.all([
      db.collection('users').findOne({ _id: new ObjectId(decoded.userId) }, { projection: { password: 0 } }),
      db.collection('analytics').aggregate([
        { $match: { userId: new ObjectId(decoded.userId) } },
        { $group: {
            _id: "$userId",
            totalClicks: { $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] } },
            totalConversions: { $sum: { $cond: [{ $eq: ["$eventType", "conversion"] }, 1, 0] } },
            totalRevenue: { $sum: "$data.revenue" }
        }}
      ]).next()
    ]);

    if (!user) return null;

    const totalWebsiteGenerations = await db.collection('generated_websites').countDocuments({ userId: user._id });

    // Combine all data into a single object
    const conversionRate = analytics?.totalClicks > 0 ? ((analytics.totalConversions / analytics.totalClicks) * 100).toFixed(2) : '0.00';

    return {
      user,
      stats: {
        totalWebsiteGenerations,
        totalClicks: analytics?.totalClicks || 0,
        totalRevenue: analytics?.totalRevenue || 0,
        totalConversions: analytics?.totalConversions || 0,
        conversionRate: conversionRate,
      }
    };

  } catch (error) {
    console.error('Dashboard data fetching error:', error);
    return null;
  }
}


// --- 2. The Merged Dashboard Page Component ---
export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect('/login');
  }

  const { user, stats } = data;
  const userFirstName = user.name.split(' ')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-orange-600 to-black text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm p-4 border-b border-orange-500/20">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">AFFILIFY</h1>
          <div className="flex items-center space-x-4">
            <span className="text-orange-200">Welcome, {userFirstName}!</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-8">
        <h2 className="text-4xl font-bold mb-2">Welcome back, {userFirstName}! 👋</h2>
        <p className="text-orange-200 text-lg mb-8">You have {stats.totalWebsiteGenerations} websites generating ${stats.totalRevenue.toFixed(2)} in revenue!</p>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 flex flex-col justify-between">
            <h3 className="text-purple-300 text-lg font-semibold mb-2">Total Websites</h3>
            <p className="text-4xl font-bold text-white">{stats.totalWebsiteGenerations}</p>
            <p className="text-sm text-orange-200">0 active</p>
          </div>
          <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 flex flex-col justify-between">
            <h3 className="text-purple-300 text-lg font-semibold mb-2">Total Clicks</h3>
            <p className="text-4xl font-bold text-white">{stats.totalClicks}</p>
            <p className="text-sm text-orange-200">0 this week</p>
          </div>
          <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 flex flex-col justify-between">
            <h3 className="text-purple-300 text-lg font-semibold mb-2">Revenue</h3>
            <p className="text-4xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-orange-200">$0.00 this week</p>
          </div>
          <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 flex flex-col justify-between">
            <h3 className="text-purple-300 text-lg font-semibold mb-2">Conversion Rate</h3>
            <p className="text-4xl font-bold text-white">{stats.conversionRate}%</p>
            <p className="text-sm text-orange-200">{stats.totalConversions} conversions</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link href="/dashboard/create-website" className="bg-orange-600 hover:bg-orange-700 rounded-xl p-6 transition-all duration-200 block">
                <h4 className="text-xl font-semibold text-white">Create Website</h4>
                <p className="text-orange-200">Generate a new affiliate website with AI</p>
            </Link>
            <Link href="/dashboard/analyze-website" className="bg-purple-600 hover:bg-purple-700 rounded-xl p-6 transition-all duration-200 block">
                <h4 className="text-xl font-semibold text-white">Analyze Website</h4>
                <p className="text-purple-200">Get AI insights on any website</p>
            </Link>
            <Link href="/dashboard/my-websites" className="bg-green-600 hover:bg-green-700 rounded-xl p-6 transition-all duration-200 block">
                <h4 className="text-xl font-semibold text-white">My Websites</h4>
                <p className="text-green-200">View and manage your affiliate sites</p>
            </Link>
        </div>

        {/* Account Info */}
        <h3 className="text-2xl font-bold mb-4">Account Info</h3>
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-purple-300 font-semibold">Email</p>
            <p className="text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-purple-300 font-semibold">Member Since</p>
            <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-purple-300 font-semibold">Last Active</p>
            <p className="text-white">{new Date(user.lastLoginAt).toLocaleString()}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

