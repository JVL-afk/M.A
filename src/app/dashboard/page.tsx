import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// This is the new function to get data directly on the server.
async function getDashboardData() {
  // 1. Get the token from the cookies.
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  // If no token, redirect to login. This is a failsafe.
  if (!token) {
    return null;
  }

  try {
    // 2. Verify the token.
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key-for-development') as { userId: string };
    if (!decoded.userId) {
      return null;
    }

    // 3. Fetch user data directly from the database.
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } } // Don't send the password hash
    );

    if (!user) {
      return null;
    }

    // 4. Fetch user's websites (or other stats)
    const websites = await db.collection('generated_websites').find({ userId: user._id }).limit(10).toArray();

    // Return all the data the dashboard needs.
    return { user, websites };

  } catch (error) {
    console.error('Dashboard data fetching error:', error);
    // If token is invalid or any other error occurs, return null.
    return null;
  }
}


// This is the main Dashboard Page component.
// It is now an 'async' component, which makes it a Server Component.
export default async function DashboardPage() {
  const data = await getDashboardData();

  // If data fetching failed (e.g., bad token), redirect to login.
  if (!data) {
    redirect('/login');
  }

  const { user, websites } = data;

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome back, {user.name}!</h1>
      <p className="text-lg text-gray-400 mb-8">Here's a summary of your affiliate empire.</p>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium">Total Websites</h3>
          <p className="text-3xl font-semibold">{websites.length}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium">Plan</h3>
          <p className="text-3xl font-semibold capitalize">{user.plan}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium">Member Since</h3>
          <p className="text-3xl font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Recent Websites Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Recent Websites</h2>
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {websites.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {websites.map((site) => (
                <li key={site._id.toString()} className="p-4 flex justify-between items-center hover:bg-gray-700 transition-colors">
                  <div>
                    <p className="font-semibold">{site.name || 'Untitled Website'}</p>
                    <a href={`https://${site.subdomain}.affilify.eu`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">
                      {`https://${site.subdomain}.affilify.eu`}
                    </a>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(site.createdAt ).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-10 text-center">
              <p className="text-gray-400">You haven't created any websites yet.</p>
              <a href="/dashboard/create-website" className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                Create Your First Website
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
