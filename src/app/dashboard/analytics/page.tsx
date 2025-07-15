import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Link from 'next/link';

async function getAnalyticsData() {
  const token = cookies().get('auth-token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    const analyticsData = await db.collection('analytics').aggregate([
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

    const totalWebsites = await db.collection('generated_websites').countDocuments({ userId: new ObjectId(decoded.userId) });

    const conversionRate = (analyticsData?.totalClicks > 0)
      ? ((analyticsData.totalConversions / analyticsData.totalClicks) * 100).toFixed(2)
      : '0.00';

    return {
      totalWebsites,
      totalClicks: analyticsData?.totalClicks || 0,
      totalConversions: analyticsData?.totalConversions || 0,
      totalRevenue: analyticsData?.totalRevenue || 0,
      conversionRate,
    };
  } catch (error) {
    console.error("Failed to fetch analytics data:", error);
    return null;
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  if (!data) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
        <Link href="/dashboard" className="text-purple-300 hover:text-orange-200">&larr; Back to Main Dashboard</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
          <h3 className="text-lg font-semibold text-purple-300">Total Websites</h3>
          <p className="text-4xl font-bold">{data.totalWebsites}</p>
        </div>
        <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
          <h3 className="text-lg font-semibold text-purple-300">Total Clicks (All Time)</h3>
          <p className="text-4xl font-bold">{data.totalClicks}</p>
        </div>
        <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
          <h3 className="text-lg font-semibold text-purple-300">Total Revenue (All Time)</h3>
          <p className="text-4xl font-bold">${data.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
          <h3 className="text-lg font-semibold text-purple-300">Conversion Rate</h3>
          <p className="text-4xl font-bold">{data.conversionRate}%</p>
        </div>
      </div>
      <div className="mt-10 text-center text-gray-400">
        <p>More detailed charts and daily performance data coming soon!</p>
      </div>
    </div>
  );
}
