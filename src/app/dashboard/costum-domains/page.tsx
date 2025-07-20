// CUSTOM DOMAIN MANAGEMENT SYSTEM FOR PRO USERS
// Complete Vercel API integration for seamless domain management

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Custom Domain Management Page
export default async function CustomDomainPage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
  const token = cookies().get('auth-token')?.value;
  
  let userInfo = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const client = await connectToDatabase();
      const db = client.db('affilify');
      
      const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
      if (user) {
        const userPlan = user.plan || 'basic';
        userInfo = { user, plan: userPlan };
      }
    } catch (error) {
      redirect('/login');
    }
  }

  if (!userInfo || userInfo.plan === 'basic') {
    redirect('/pricing?feature=custom_domains');
  }

  // Get user's websites and domains
  const client = await connectToDatabase();
  const db = client.db('affilify');
  
  const websites = await db.collection('generated_websites')
    .find({ userId: userInfo.user._id })
    .sort({ createdAt: -1 })
    .toArray();

  const domains = await db.collection('custom_domains')
    .find({ userId: userInfo.user._id })
    .sort({ createdAt: -1 })
    .toArray();

  const errorMessage = searchParams?.error;
  const successMessage = searchParams?.success;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-orange-800 text-white">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Custom Domains</h1>
            <p className="text-orange-200 mt-2">
              Connect your own domain to your affiliate websites
            </p>
          </div>
          <Link href="/dashboard" className="text-purple-300 hover:text-orange-200">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-500 rounded-lg">
            <p className="text-green-300">
              {successMessage === 'domain_added' && 'Domain has been successfully added! Please configure your DNS settings.'}
              {successMessage === 'domain_verified' && 'Domain has been verified and is now active!'}
              {successMessage === 'domain_removed' && 'Domain has been successfully removed.'}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-300">
              {errorMessage === 'domain_exists' && 'This domain is already configured.'}
              {errorMessage === 'invalid_domain' && 'Please enter a valid domain name.'}
              {errorMessage === 'vercel_error' && 'Failed to configure domain. Please try again.'}
              {errorMessage === 'no_website' && 'Please select a website to connect the domain to.'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add New Domain */}
          <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-6">Add Custom Domain</h2>
            
            <form action={addCustomDomain} className="space-y-6">
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-purple-300 mb-2">
                  Domain Name
                </label>
                <input
                  id="domain"
                  name="domain"
                  type="text"
                  placeholder="example.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
                />
                <p className="text-sm text-gray-400 mt-1">
                  Enter your domain without www (e.g., mystore.com)
                </p>
              </div>

              <div>
                <label htmlFor="websiteId" className="block text-sm font-medium text-purple-300 mb-2">
                  Connect to Website
                </label>
                <select
                  id="websiteId"
                  name="websiteId"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
                >
                  <option value="">Select a website...</option>
                  {websites.map((website) => (
                    <option key={website._id.toString()} value={website._id.toString()}>
                      {website.name} ({website.subdomain})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
              >
                Add Custom Domain
              </button>
            </form>

            {/* Domain Benefits */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">Benefits of Custom Domains:</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span>Professional branding with your own domain</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span>Automatic SSL certificate (HTTPS)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span>Better SEO and search rankings</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span>Increased trust and conversion rates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Domain List */}
          <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-6">Your Domains</h2>
            
            {domains.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🌐</div>
                <p className="text-gray-400 mb-4">No custom domains yet</p>
                <p className="text-sm text-gray-500">
                  Add your first custom domain to get started with professional branding.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {domains.map((domain) => (
                  <div key={domain._id.toString()} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{domain.domain}</h3>
                        <p className="text-sm text-gray-400">
                          Connected to: {websites.find(w => w._id.toString() === domain.websiteId)?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          domain.status === 'active' 
                            ? 'bg-green-900 text-green-300' 
                            : domain.status === 'pending'
                            ? 'bg-yellow-900 text-yellow-300'
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {domain.status}
                        </span>
                      </div>
                    </div>
                    
                    {domain.status === 'pending' && (
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3 mb-3">
                        <p className="text-yellow-300 text-sm font-medium mb-2">DNS Configuration Required:</p>
                        <div className="space-y-1 text-xs text-yellow-200">
                          <p><strong>Type:</strong> CNAME</p>
                          <p><strong>Name:</strong> @ (or leave blank)</p>
                          <p><strong>Value:</strong> cname.vercel-dns.com</p>
                        </div>
                        <p className="text-xs text-yellow-300 mt-2">
                          Configure these DNS settings with your domain registrar.
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {domain.status === 'active' && (
                        <a
                          href={`https://${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                        >
                          Visit Site
                        </a>
                      )}
                      <form action={verifyDomain} className="inline">
                        <input type="hidden" name="domainId" value={domain._id.toString()} />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
                        >
                          Verify
                        </button>
                      </form>
                      <form action={removeDomain} className="inline">
                        <input type="hidden" name="domainId" value={domain._id.toString()} />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to remove this domain?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DNS Setup Guide */}
        <div className="mt-12 bg-black/30 p-8 rounded-xl border border-purple-500/20">
          <h2 className="text-2xl font-bold mb-6">DNS Setup Guide</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Step 1: Add Domain in AFFILIFY</h3>
              <ol className="space-y-2 text-sm text-gray-300">
                <li>1. Enter your domain name (e.g., mystore.com)</li>
                <li>2. Select the website to connect it to</li>
                <li>3. Click "Add Custom Domain"</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Step 2: Configure DNS</h3>
              <ol className="space-y-2 text-sm text-gray-300">
                <li>1. Go to your domain registrar (GoDaddy, Namecheap, etc.)</li>
                <li>2. Find DNS settings or DNS management</li>
                <li>3. Add a CNAME record pointing to cname.vercel-dns.com</li>
                <li>4. Wait 5-10 minutes for DNS propagation</li>
                <li>5. Click "Verify" in AFFILIFY</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded">
            <p className="text-blue-300 text-sm">
              <strong>Need help?</strong> Contact our priority support at jvlmanus@gmail.com for assistance with DNS configuration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Server action to add custom domain
async function addCustomDomain(formData: FormData) {
  'use server';

  const token = cookies().get('auth-token')?.value;
  if (!token) {
    redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user || user.plan === 'basic') {
      redirect('/pricing?feature=custom_domains');
    }

    const domain = (formData.get('domain') as string).toLowerCase().trim();
    const websiteId = formData.get('websiteId') as string;

    if (!domain || !websiteId) {
      redirect('/dashboard/custom-domains?error=invalid_domain');
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      redirect('/dashboard/custom-domains?error=invalid_domain');
    }

    // Check if domain already exists
    const existingDomain = await db.collection('custom_domains').findOne({ domain });
    if (existingDomain) {
      redirect('/dashboard/custom-domains?error=domain_exists');
    }

    // Verify website belongs to user
    const website = await db.collection('generated_websites').findOne({
      _id: new ObjectId(websiteId),
      userId: user._id
    });

    if (!website) {
      redirect('/dashboard/custom-domains?error=no_website');
    }

    // Add domain to Vercel via API
    try {
      const vercelResponse = await fetch(`https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: domain,
        }),
      });

      if (!vercelResponse.ok) {
        console.error('Vercel API error:', await vercelResponse.text());
        redirect('/dashboard/custom-domains?error=vercel_error');
      }

      // Store domain in database
      await db.collection('custom_domains').insertOne({
        userId: user._id,
        websiteId,
        domain,
        status: 'pending',
        createdAt: new Date(),
        vercelConfigured: true
      });

      redirect('/dashboard/custom-domains?success=domain_added');
    } catch (vercelError) {
      console.error('Failed to configure domain with Vercel:', vercelError);
      redirect('/dashboard/custom-domains?error=vercel_error');
    }

  } catch (error) {
    console.error("Failed to add custom domain:", error);
    redirect('/dashboard/custom-domains?error=vercel_error');
  }
}

// Server action to verify domain
async function verifyDomain(formData: FormData) {
  'use server';

  const token = cookies().get('auth-token')?.value;
  if (!token) {
    redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const domainId = formData.get('domainId') as string;

    const client = await connectToDatabase();
    const db = client.db('affilify');

    const domain = await db.collection('custom_domains').findOne({
      _id: new ObjectId(domainId),
      userId: new ObjectId(decoded.userId)
    });

    if (!domain) {
      redirect('/dashboard/custom-domains?error=domain_not_found');
    }

    // Check domain status with Vercel
    const vercelResponse = await fetch(`https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain.domain}`, {
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
      },
    });

    if (vercelResponse.ok) {
      const domainData = await vercelResponse.json();
      
      // Update domain status based on Vercel response
      const newStatus = domainData.verified ? 'active' : 'pending';
      
      await db.collection('custom_domains').updateOne(
        { _id: new ObjectId(domainId) },
        { 
          $set: { 
            status: newStatus,
            lastVerified: new Date()
          } 
        }
      );

      if (newStatus === 'active') {
        redirect('/dashboard/custom-domains?success=domain_verified');
      } else {
        redirect('/dashboard/custom-domains?error=domain_not_ready');
      }
    } else {
      redirect('/dashboard/custom-domains?error=verification_failed');
    }

  } catch (error) {
    console.error("Failed to verify domain:", error);
    redirect('/dashboard/custom-domains?error=verification_failed');
  }
}

// Server action to remove domain
async function removeDomain(formData: FormData) {
  'use server';

  const token = cookies().get('auth-token')?.value;
  if (!token) {
    redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const domainId = formData.get('domainId') as string;

    const client = await connectToDatabase();
    const db = client.db('affilify');

    const domain = await db.collection('custom_domains').findOne({
      _id: new ObjectId(domainId),
      userId: new ObjectId(decoded.userId)
    });

    if (!domain) {
      redirect('/dashboard/custom-domains?error=domain_not_found');
    }

    // Remove domain from Vercel
    try {
      await fetch(`https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain.domain}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
        },
      });
    } catch (vercelError) {
      console.error('Failed to remove domain from Vercel:', vercelError);
      // Continue with database removal even if Vercel fails
    }

    // Remove domain from database
    await db.collection('custom_domains').deleteOne({ _id: new ObjectId(domainId) });

    redirect('/dashboard/custom-domains?success=domain_removed');

  } catch (error) {
    console.error("Failed to remove domain:", error);
    redirect('/dashboard/custom-domains?error=removal_failed');
  }
}
