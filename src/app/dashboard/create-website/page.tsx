import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Complete Create Website Page with All Features Integrated
export default async function CreateWebsitePage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
  // Get authentication token
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  let userInfo = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const client = await connectToDatabase();
      const db = client.db('affilify');

      const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
      if (user) {
        const userPlan = user.plan || 'basic';

        // Get current website count for limits
        const websiteCount = await db.collection('generated_websites').countDocuments({
          userId: user._id
        });

        userInfo = { user, plan: userPlan, websiteCount };
      }
    } catch (error) {
      redirect('/login');
    }
  }

  if (!userInfo) {
    redirect('/login');
  }

  // Define plan limits
  const planLimits = {
    basic: 5,
    pro: 25,
    enterprise: Infinity
  };

  const userLimit = planLimits[userInfo.plan as keyof typeof planLimits] || 5;
  const limitReached = userInfo.websiteCount >= userLimit;
  const errorMessage = searchParams?.error;
  const successMessage = searchParams?.success;

  // Define available templates based on plan
  const allTemplates = [
    {
      id: 'simple',
      name: 'Simple Landing Page',
      description: 'Clean, minimalist design perfect for any product',
      preview: '/templates/simple-preview.jpg',
      isPremium: false,
      features: ['Responsive design', 'Call-to-action buttons', 'Product showcase']
    },
    {
      id: 'modern-sales',
      name: 'Modern Sales Page',
      description: 'High-converting sales page with testimonials and urgency',
      preview: '/templates/modern-sales-preview.jpg',
      isPremium: true,
      features: ['Testimonials section', 'Urgency timers', 'Social proof', 'Advanced CTAs']
    },
    {
      id: 'product-showcase',
      name: 'Product Showcase',
      description: 'Beautiful product gallery with detailed features',
      preview: '/templates/product-showcase-preview.jpg',
      isPremium: true,
      features: ['Image galleries', 'Feature comparisons', 'Detailed specs', 'Reviews']
    },
    {
      id: 'review-comparison',
      name: 'Review & Comparison',
      description: 'Perfect for product reviews and comparisons',
      preview: '/templates/review-comparison-preview.jpg',
      isPremium: true,
      features: ['Comparison tables', 'Rating systems', 'Pros/cons lists', 'Expert reviews']
    },
    {
      id: 'video-landing',
      name: 'Video Landing Page',
      description: 'Video-first design for maximum engagement',
      preview: '/templates/video-landing-preview.jpg',
      isPremium: true,
      features: ['Video backgrounds', 'Play buttons', 'Video testimonials', 'Engagement tracking']
    },
    {
      id: 'luxury-brand',
      name: 'Luxury Brand',
      description: 'Premium design for high-end products',
      preview: '/templates/luxury-brand-preview.jpg',
      isPremium: true,
      features: ['Elegant typography', 'Premium animations', 'Luxury aesthetics', 'High-end feel']
    }
  ];

  // Filter templates based on user plan
  const availableTemplates = userInfo.plan === 'basic'
    ? allTemplates.filter(template => !template.isPremium)
    : allTemplates;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-orange-800 text-white">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Create New Website</h1>
          <Link href="/dashboard" className="text-orange-400 hover:text-orange-300">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Plan Status */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">
                Plan: {userInfo.plan.charAt(0).toUpperCase() + userInfo.plan.slice(1)}
              </h3>
              <p className="text-gray-300">
                Websites: {userInfo.websiteCount}/{userLimit === Infinity ? '∞' : userLimit}
              </p>
            </div>
            {userInfo.plan === 'basic' && (
              <Link 
                href="/pricing" 
                className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Upgrade for More Templates
              </Link>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
            <p className="text-green-200">{successMessage}</p>
          </div>
        )}

        {/* Limit Reached Warning */}
        {limitReached && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 mb-8 text-center">
            <h3 className="text-xl font-bold mb-2">Website Limit Reached</h3>
            <p className="text-gray-300 mb-4">
              You've reached your limit of {userLimit} websites on the {userInfo.plan} plan.
            </p>
            <Link 
              href="/pricing" 
              className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Upgrade to Create More Websites
            </Link>
          </div>
        )}

        {/* Main Content */}
        {!limitReached && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NO BS Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6">🚀 No BS Website Creation</h2>
              
              <form action="/api/ai/generate-website" method="POST" className="space-y-6">
                {/* Required: Product URL */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Product/Affiliate URL *
                  </label>
                  <input
                    type="url"
                    name="productUrl"
                    placeholder="https://example.com/affiliate-product"
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                  <p className="text-gray-300 text-sm mt-1">
                    Just paste your affiliate link - our AI will handle the rest! 🧡
                  </p>
                </div>

                {/* Optional: Niche */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Niche/Category <span className="text-gray-400">(Optional )</span>
                  </label>
                  <input
                    type="text"
                    name="niche"
                    placeholder="e.g., Fitness, Technology, Beauty (AI will detect if empty)"
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Optional: Target Audience */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Target Audience <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    name="targetAudience"
                    placeholder="AI will analyze your product and create perfect audience targeting..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-white font-semibold mb-4">
                    Choose Template Style
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {availableTemplates.map((template) => (
                      <label key={template.id} className="cursor-pointer">
                        <input
                          type="radio"
                          name="template"
                          value={template.id}
                          defaultChecked={template.id === 'simple'}
                          className="sr-only"
                        />
                        <div className="border-2 border-white/30 rounded-lg p-4 hover:border-orange-500 transition-colors peer-checked:border-orange-500 peer-checked:bg-orange-500/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{template.name}</h4>
                              <p className="text-gray-300 text-sm">{template.description}</p>
                            </div>
                            {template.isPremium && (
                              <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded">
                                PRO
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Advanced Options for Pro/Enterprise */}
                {userInfo.plan !== 'basic' && (
                  <details className="bg-white/5 rounded-lg p-4">
                    <summary className="cursor-pointer font-semibold text-orange-400">
                      🎯 Advanced Options (Pro/Enterprise)
                    </summary>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Custom Domain <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="customDomain"
                          placeholder="your-domain.com"
                          className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-white font-semibold mb-2">
                          SEO Keywords <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="seoKeywords"
                          placeholder="keyword1, keyword2, keyword3"
                          className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      {userInfo.plan === 'enterprise' && (
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              name="whiteLabel"
                              className="rounded"
                            />
                            <span>White-label (Remove AFFILIFY branding)</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Create Website with AI 🚀
                </button>
              </form>
            </div>

            {/* Template Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6">Template Preview</h2>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Available Templates</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {userInfo.plan === 'basic' 
                      ? `You have access to ${availableTemplates.length} template(s) on the Basic plan.`
                      : `You have access to all ${availableTemplates.length} premium templates!`
                    }
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {availableTemplates.slice(0, 4).map((template) => (
                      <div key={template.id} className="bg-white/10 rounded p-2 text-center">
                        <div className="h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded mb-2"></div>
                        <p className="text-xs">{template.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {userInfo.plan === 'basic' && (
                  <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">🚀 Unlock More Templates</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Upgrade to Pro or Enterprise to access premium templates with advanced features!
                    </p>
                    <Link 
                      href="/pricing" 
                      className="text-orange-400 hover:text-orange-300 text-sm font-semibold"
                    >
                      View Pricing →
                    </Link>
                  </div>
                )}

                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">🎯 What You Get</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>✅ AI-powered content generation</li>
                    <li>✅ Mobile-responsive design</li>
                    <li>✅ SEO optimization</li>
                    <li>✅ Fast loading speed</li>
                    {userInfo.plan !== 'basic' && (
                      <>
                        <li>✅ Advanced analytics</li>
                        <li>✅ Custom domains</li>
                        <li>✅ A/B testing</li>
                      </>
                    )}
                    {userInfo.plan === 'enterprise' && (
                      <>
                        <li>✅ White-label options</li>
                        <li>✅ API access</li>
                        <li>✅ Priority support</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



