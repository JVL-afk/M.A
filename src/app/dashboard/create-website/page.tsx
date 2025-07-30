'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserInfo {
  id: string;
  email: string;
  plan: string;
  websiteCount: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  isPremium: boolean;
  features: string[];
}

export default function CreateWebsitePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    productUrl: '',
    niche: '',
    targetAudience: '',
    template: 'simple',
    customDomain: '',
    seoKeywords: '',
    whiteLabel: false
  });

  // Plan limits - UPDATED FOR BETTER CONVERSION
  const planLimits = {
    basic: 3,        // 3 websites - encourages quick upgrade
    pro: 10,         // 10 websites - good for serious users  
    enterprise: Infinity  // UNLIMITED - the magic word!
  };

  // All available templates
  const allTemplates: Template[] = [
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

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/plan');
      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          id: data.user.id,
          email: data.user.email,
          plan: data.user.plan,
          websiteCount: data.planLimits?.websites || 0
        });
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/ai/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Website created successfully! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard/my-websites');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create website');
      }
    } catch (error) {
      setError('An error occurred while creating the website');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  const userLimit = planLimits[userInfo.plan as keyof typeof planLimits] || 3;
  const limitReached = userInfo.websiteCount >= userLimit;
  const availableTemplates = userInfo.plan === 'basic'
    ? allTemplates.filter(template => !template.isPremium)
    : allTemplates;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-red-900 text-white">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Create New Website</h1>
          <Link href="/dashboard" className="text-orange-300 hover:text-orange-200">
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
                Websites: {userInfo.websiteCount}/{userLimit === Infinity ? 'UNLIMITED' : userLimit}
              </p>
              {userInfo.plan === 'basic' && userInfo.websiteCount >= 2 && (
                <p className="text-orange-400 text-sm mt-1">
                  ⚠️ Almost at your limit! Upgrade for more websites.
                </p>
              )}
            </div>
            {userInfo.plan !== 'enterprise' && (
              <Link 
                href="/pricing" 
                className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                {userInfo.plan === 'basic' ? 'Upgrade for More' : 'Get UNLIMITED'}
              </Link>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
            <p className="text-green-200">{success}</p>
          </div>
        )}

        {/* Limit Reached Warning */}
        {limitReached && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 mb-8 text-center">
            <h3 className="text-xl font-bold mb-2">Website Limit Reached</h3>
            <p className="text-gray-300 mb-4">
              You've created all {userLimit} websites allowed on the {userInfo.plan} plan.
              {userInfo.plan === 'basic' && " That was quick! Ready for more?"}
              {userInfo.plan === 'pro' && " Want unlimited websites?"}
            </p>
            <div className="space-x-4">
              {userInfo.plan === 'basic' && (
                <>
                  <Link 
                    href="/pricing" 
                    className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
                  >
                    Upgrade to Pro (10 websites)
                  </Link>
                  <Link 
                    href="/pricing" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
                  >
                    Go UNLIMITED! 🚀
                  </Link>
                </>
              )}
              {userInfo.plan === 'pro' && (
                <Link 
                  href="/pricing" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
                >
                  Upgrade to UNLIMITED Enterprise! 🚀
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        {!limitReached && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NO BS Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6">🚀 No BS Website Creation</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Required: Product URL */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Product/Affiliate URL *
                  </label>
                  <input
                    type="url"
                    name="productUrl"
                    value={formData.productUrl}
                    onChange={handleInputChange}
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
                    value={formData.niche}
                    onChange={handleInputChange}
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
                    value={formData.targetAudience}
                    onChange={handleInputChange}
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
                          checked={formData.template === template.id}
                          onChange={handleInputChange}
                          className="sr-only peer"
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
                          value={formData.customDomain}
                          onChange={handleInputChange}
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
                          value={formData.seoKeywords}
                          onChange={handleInputChange}
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
                              checked={formData.whiteLabel}
                              onChange={handleInputChange}
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
                  disabled={creating || !formData.productUrl}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                >
                  {creating ? 'Creating Website...' : 'Create Website with AI 🚀'}
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
                      Upgrade to Pro (10 websites) or Enterprise (UNLIMITED) to access premium templates!
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

                {/* Future Feature Teaser */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">🔮 Coming Soon</h4>
                  <p className="text-sm text-gray-300">
                    Automatic promotion service - we'll market your websites for you! 
                    The ultimate money-making machine! 🚀
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



