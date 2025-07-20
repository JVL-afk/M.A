import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

interface Website {
  _id: ObjectId;
  name: string;
  subdomain: string;
  createdAt: Date;
}

async function getWebsitesData(): Promise<{ websites: Website[] } | null> {
  const token = cookies().get('auth-token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    const websites = await db.collection('generated_websites')
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ createdAt: -1 }) // Sort by most recent
      .toArray();

    // Convert to plain objects to avoid serialization issues
    const plainWebsites = websites.map(site => ({
      ...site,
      _id: site._id.toString(),
    })) as unknown as Website[];

    return { websites: plainWebsites };
  } catch (error) {
    console.error("Failed to fetch websites:", error);
    return null;
  }
}

export default async function MyWebsitesPage() {
  const data = await getWebsitesData();

  if (!data) {
    redirect('/login');
  }

  const { websites } = data;

  return (
    <div className="container mx-auto p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Websites</h1>
        <Link href="/dashboard" className="text-purple-300 hover:text-orange-200">&larr; Back to Dashboard</Link>
      </div>

      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20">
        {websites.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {websites.map((site) => (
              <li key={site._id.toString()} className="p-6 flex flex-col md:flex-row justify-between md:items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-semibold text-white">{site.name}</h3>
                  <p className="text-sm text-gray-400">Created on: {new Date(site.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <a 
                    href={`https://${site.subdomain}.vercel.app`} // Assuming deployment on Vercel subdomains
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-orange-400 hover:text-orange-300 font-semibold"
                  >
                    Visit Site ↗
                  </a>
                  <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-semibold">
                    Delete
                  </button>
                </div>
              </li>
             ))}
          </ul>
        ) : (
          <div className="text-center p-10">
            <p className="text-gray-400 text-lg">You haven't created any websites yet.</p>
            <Link href="/dashboard/create-website" className="mt-4 inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg">
              Create Your First Website
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
