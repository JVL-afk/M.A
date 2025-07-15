import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// --- 1. The Server Action (Corrected Return Types) ---
async function generateWebsiteAction(formData: FormData) {
  'use server'; // This directive marks it as a Server Action

  // --- A. Authentication ---
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) {
    redirect('/login'); // Redirect if not authenticated
  }

  let decoded: { userId: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key-for-development') as { userId: string };
  } catch (error) {
    redirect('/login?error=invalid_token'); // Redirect on bad token
  }

  // --- B. Get Form Data ---
  const affiliateLink = formData.get('affiliateLink') as string;
  const productName = formData.get('productName') as string | null;

  if (!affiliateLink) {
    // Redirect back to the form with an error query parameter
    redirect('/dashboard/create-website?error=link_required');
  }

  // --- C. Connect to DB and Get User ---
  const client = await connectToDatabase();
  const db = client.db('affilify');
  const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });

  if (!user) {
    redirect('/login?error=user_not_found');
  }
  
  // --- D. (Placeholder) AI Generation Logic ---
  console.log(`Generating website for ${user.email} with link: ${affiliateLink}`);
  const generatedContent = `<html><body><h1>Welcome to the ${productName || 'Awesome Product'} website!</h1><a href="${affiliateLink}">Buy Now!</a></body></html>`;
  const newSubdomain = `site-${Date.now()}`;

  // --- E. Store the New Website in the Database ---
  await db.collection('generated_websites').insertOne({
    userId: user._id,
    name: productName || 'My New Website',
    affiliateLink,
    subdomain: newSubdomain,
    content: generatedContent,
    createdAt: new Date(),
  });

  // --- F. Redirect to a success page ---
  redirect(`/dashboard/my-websites?success=true`);
}


// --- 2. The Page Component (with Error Message Display) ---
// We add searchParams to read the error from the URL
export default function CreateWebsitePage({ searchParams }: { searchParams?: { error?: string } }) {
  
  const errorMessage = searchParams?.error === 'link_required' 
    ? 'Affiliate Link is a required field.' 
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-orange-800 text-white">
      <div className="w-full max-w-lg p-8 space-y-6 bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Create AI-Powered Affiliate Website</h1>
          <p className="text-orange-200 mt-2">Generate a professional affiliate website in seconds using AI</p>
        </div>
        
        <form action={generateWebsiteAction} className="space-y-6">
          <div>
            <label htmlFor="affiliateLink" className="block text-sm font-medium text-purple-300">
              Affiliate Link *
            </label>
            <input
              id="affiliateLink"
              name="affiliateLink"
              type="url"
              required
              className="mt-1 block w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="https://your-affiliate-link.com"
            />
          </div>

          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-purple-300">
              Product Name (Optional )
            </label>
            <input
              id="productName"
              name="productName"
              type="text"
              className="mt-1 block w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g., The Ultimate Productivity Planner"
            />
          </div>

          {/* Display error message right above the button */}
          {errorMessage && (
            <div className="p-3 bg-red-900/50 border border-red-500 rounded-md text-center">
              <p className="text-red-300">{errorMessage}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              Generate Website with AI
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link href="/dashboard" className="text-sm text-purple-300 hover:text-orange-200">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}


