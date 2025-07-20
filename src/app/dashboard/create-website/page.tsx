import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Complete Create Website Page with All Features Integrated
export default async function CreateWebsitePage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
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
    basic: 3,
    pro: 10,
    enterprise: Infinity
  };

  const userLimit = planLimits[userInfo.plan as keyof typeof planLimits] || 3;
  const isLimitReached = userInfo.websiteCount >= userLimit;
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
          <div>
            <h1 className="text-4xl font-bold">Create AI-Powered Affiliate Website</h1>
            <p className="text-orange-200 mt-2">
              Generate a professional affiliate website in seconds using AI
            </p>
          </div>
          <Link href="/dashboard" className="text-purple-300 hover:text-orange-200">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Plan Status and Limits */}
        <div className="mb-8 p-6 bg-black/30 rounded-xl border border-purple-500/20">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">Your Plan: {userInfo.plan.charAt(0).toUpperCase() + userInfo.plan.slice(1)}</h2>
              <p className="text-gray-300">
                {userInfo.plan === 'enterprise' 
                  ? `Unlimited websites • ${userInfo.websiteCount} created`
                  : `${userInfo.websiteCount} / ${userLimit} websites used`
                }
              </p>
            </div>
            <div className="text-right">
              {userInfo.plan !== 'enterprise' && (
                <div className="mb-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-orange-500'}`}
                      style={{ width: `${Math.min((userInfo.websiteCount / userLimit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {isLimitReached && (
                <Link 
                  href="/pricing" 
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-500 rounded-lg">
            <p className="text-green-300">
              {successMessage === 'website_created' && 'Website created successfully!'}
              {successMessage === 'website_generated' && 'Your affiliate website has been generated and is ready to use!'}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-300">
              {errorMessage === 'limit_reached' && `You've reached your plan limit of ${userLimit} websites. Please upgrade to create more.`}
              {errorMessage === 'missing_fields' && 'Please fill in all required fields.'}
              {errorMessage === 'generation_failed' && 'Website generation failed. Please try again.'}
              {errorMessage === 'invalid_url' && 'Please enter a valid affiliate link URL.'}
            </p>
          </div>
        )}

        {/* Limit Reached Warning */}
        {isLimitReached && (
          <div className="mb-8 p-6 bg-red-900/30 border border-red-500/50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-red-300 mb-2">Website Limit Reached</h3>
                <p className="text-red-200">
                  You've used all {userLimit} websites in your {userInfo.plan} plan. 
                  Upgrade to create more professional affiliate websites.
                </p>
              </div>
              <Link 
                href="/pricing" 
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Website Generation Form */}
          <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-6">Website Details</h2>
            
            <form action={generateWebsite} className="space-y-6">
              <div>
                <label htmlFor="affiliateLink" className="block text-sm font-medium text-purple-300 mb-2">
                  Affiliate Link *
                </label>
                <input
                  id="affiliateLink"
                  name="affiliateLink"
                  type="url"
                  placeholder="https://example.com/your-affiliate-link"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
                  disabled={isLimitReached}
                />
                <p className="text-sm text-gray-400 mt-1">
                  Enter the affiliate link you want to promote
                </p>
              </div>

              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-purple-300 mb-2">
                  Product Name (Optional)
                </label>
                <input
                  id="productName"
                  name="productName"
                  type="text"
                  placeholder="e.g., iPhone 15 Pro, Nike Air Max, etc."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  disabled={isLimitReached}
                />
                <p className="text-sm text-gray-400 mt-1">
                  Specify the product name for better AI generation (optional)
                </p>
              </div>

              <div>
                <label htmlFor="websiteName" className="block text-sm font-medium text-purple-300 mb-2">
                  Website Name *
                </label>
                <input
                  id="websiteName"
                  name="websiteName"
                  type="text"
                  placeholder="My Awesome Product Site"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
                  disabled={isLimitReached}
                />
                <p className="text-sm text-gray-400 mt-1">
                  Choose a name for your website (for your reference)
                </p>
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-4">
                  Choose Template *
                </label>
                <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                  {availableTemplates.map((template) => (
                    <label key={template.id} className="relative">
                      <input
                        type="radio"
                        name="templateId"
                        value={template.id}
                        className="sr-only peer"
                        defaultChecked={template.id === 'simple'}
                        disabled={isLimitReached}
                      />
                      <div className="p-4 bg-gray-800/50 border border-gray-600 rounded-lg cursor-pointer peer-checked:border-orange-500 peer-checked:bg-orange-900/20 hover:border-gray-500 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          {template.isPremium && (
                            <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded font-medium">
                              PRO
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {/* Premium Templates Upgrade Prompt for Basic Users */}
                {userInfo.plan === 'basic' && (
                  <div className="mt-4 p-4 bg-orange-900/20 border border-orange-500/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-orange-300">Want More Templates?</h4>
                        <p className="text-sm text-orange-200">
                          Upgrade to Pro to access 5 additional premium templates with advanced features.
                        </p>
                      </div>
                      <Link 
                        href="/pricing" 
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Upgrade
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Chatbot Integration (Pro+ Only) */}
              {(userInfo.plan === 'pro' || userInfo.plan === 'enterprise') && (
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="includeChatbot"
                      defaultChecked
                      className="w-4 h-4 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                      disabled={isLimitReached}
                    />
                    <div>
                      <span className="text-sm font-medium text-purple-300">Include AI Chatbot</span>
                      <span className="ml-2 px-2 py-1 bg-orange-600 text-white text-xs rounded font-medium">PRO</span>
                      <p className="text-xs text-gray-400 mt-1">
                        Add an intelligent AI chatbot to help visitors and increase conversions
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Enterprise API Key Generator */}
              {userInfo.plan === 'enterprise' && (
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-purple-300">API Integration</h4>
                      <p className="text-sm text-gray-400">
                        Generate API keys for programmatic website creation
                      </p>
                    </div>
                    <Link 
                      href="/dashboard/enterprise?tab=api" 
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Manage API Keys
                    </Link>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLimitReached}
                className={`w-full py-4 px-6 font-bold rounded-lg transition-colors ${
                  isLimitReached
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {isLimitReached ? 'Upgrade to Create More Websites' : 'Generate Website with AI'}
              </button>
            </form>
          </div>

          {/* Template Preview and Features */}
          <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-6">Template Preview</h2>
            
            <div className="space-y-6">
              {/* Plan Benefits */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Plan Benefits</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-sm">
                      {userInfo.plan === 'basic' && '3 websites per month'}
                      {userInfo.plan === 'pro' && '10 websites per month'}
                      {userInfo.plan === 'enterprise' && 'Unlimited websites'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-sm">
                      {userInfo.plan === 'basic' && '1 template (Simple)'}
                      {userInfo.plan === 'pro' && '6 templates (including premium)'}
                      {userInfo.plan === 'enterprise' && '6 templates (including premium)'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={userInfo.plan === 'basic' ? 'text-gray-500' : 'text-green-400'}>
                      {userInfo.plan === 'basic' ? '✗' : '✓'}
                    </span>
                    <span className={`text-sm ${userInfo.plan === 'basic' ? 'text-gray-500' : ''}`}>
                      AI Chatbot Integration
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={userInfo.plan === 'basic' ? 'text-gray-500' : 'text-green-400'}>
                      {userInfo.plan === 'basic' ? '✗' : '✓'}
                    </span>
                    <span className={`text-sm ${userInfo.plan === 'basic' ? 'text-gray-500' : ''}`}>
                      Custom Domain Support
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={userInfo.plan === 'enterprise' ? 'text-green-400' : 'text-gray-500'}>
                      {userInfo.plan === 'enterprise' ? '✓' : '✗'}
                    </span>
                    <span className={`text-sm ${userInfo.plan === 'enterprise' ? '' : 'text-gray-500'}`}>
                      API Access & Team Collaboration
                    </span>
                  </div>
                </div>
              </div>

              {/* Upgrade Prompt for Basic Users */}
              {userInfo.plan === 'basic' && (
                <div className="p-4 bg-gradient-to-r from-orange-900/30 to-purple-900/30 border border-orange-500/50 rounded-lg">
                  <h4 className="font-semibold text-orange-300 mb-2">Unlock Premium Features</h4>
                  <p className="text-sm text-orange-200 mb-3">
                    Upgrade to Pro and get access to premium templates, AI chatbot, custom domains, and advanced analytics.
                  </p>
                  <Link 
                    href="/pricing" 
                    className="inline-block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
                  >
                    View Pricing Plans
                  </Link>
                </div>
              )}

              {/* Recent Websites */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link 
                    href="/dashboard/analytics" 
                    className="block p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">View Analytics</span>
                      <span className="text-purple-400">→</span>
                    </div>
                  </Link>
                  {(userInfo.plan === 'pro' || userInfo.plan === 'enterprise') && (
                    <Link 
                      href="/dashboard/custom-domains" 
                      className="block p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Manage Custom Domains</span>
                        <span className="text-purple-400">→</span>
                      </div>
                    </Link>
                  )}
                  {(userInfo.plan === 'pro' || userInfo.plan === 'enterprise') && (
                    <Link 
                      href="/dashboard/chatbot" 
                      className="block p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Configure AI Chatbot</span>
                        <span className="text-purple-400">→</span>
                      </div>
                    </Link>
                  )}
                  {userInfo.plan === 'enterprise' && (
                    <Link 
                      href="/dashboard/enterprise" 
                      className="block p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Enterprise Dashboard</span>
                        <span className="text-purple-400">→</span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Server Action for Website Generation
async function generateWebsite(formData: FormData) {
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
    if (!user) {
      redirect('/login');
    }

    // Check website limits
    const websiteCount = await db.collection('generated_websites').countDocuments({
      userId: user._id
    });

    const planLimits = { basic: 3, pro: 10, enterprise: Infinity };
    const userLimit = planLimits[user.plan as keyof typeof planLimits] || 3;

    if (websiteCount >= userLimit) {
      redirect('/dashboard/create-website?error=limit_reached');
    }

    // Get form data
    const affiliateLink = (formData.get('affiliateLink') as string)?.trim();
    const productName = (formData.get('productName') as string)?.trim();
    const websiteName = (formData.get('websiteName') as string)?.trim();
    const templateId = formData.get('templateId') as string || 'simple';
    const includeChatbot = formData.get('includeChatbot') === 'on';

    // Validate required fields
    if (!affiliateLink || !websiteName) {
      redirect('/dashboard/create-website?error=missing_fields');
    }

    // Validate URL
    try {
      new URL(affiliateLink);
    } catch {
      redirect('/dashboard/create-website?error=invalid_url');
    }

    // Generate website content based on template
    const websiteContent = generateWebsiteContent(
      templateId, 
      productName || 'Product', 
      affiliateLink,
      includeChatbot && (user.plan === 'pro' || user.plan === 'enterprise')
    );

    // Generate unique subdomain
    const subdomain = `${websiteName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

    // Save to database
    const newWebsite = {
      userId: user._id,
      name: websiteName,
      productName: productName || null,
      affiliateLink,
      subdomain,
      templateId,
      content: websiteContent,
      includeChatbot: includeChatbot && (user.plan === 'pro' || user.plan === 'enterprise'),
      createdAt: new Date(),
      isActive: true
    };

    await db.collection('generated_websites').insertOne(newWebsite);

    redirect('/dashboard?success=website_created');

  } catch (error) {
    console.error('Website generation error:', error);
    redirect('/dashboard/create-website?error=generation_failed');
  }
}

// Helper function to generate website content
function generateWebsiteContent(templateId: string, productName: string, affiliateLink: string, includeChatbot: boolean = false): string {
  const chatbotScript = includeChatbot ? `
    <!-- AI Chatbot Integration -->
    <div id="ai-chatbot" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
      <div id="chatbot-button" style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04.97 4.43L1 23l6.57-1.97C9.96 21.64 11.46 22 13 22h7c1.1 0 2-.9 2-2V12c0-5.52-4.48-10-10-10z"/>
        </svg>
      </div>
    </div>
    <script>
      // Simple chatbot functionality
      document.getElementById('chatbot-button').addEventListener('click', function() {
        alert('AI Chatbot: Hello! I can help you learn more about ${productName}. Click the button below to get started!');
      });
    </script>
  ` : '';

  const baseTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${productName} - Get Yours Today</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hero { text-align: center; padding: 80px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 20px; font-weight: bold; }
        .hero p { font-size: 1.3rem; margin-bottom: 40px; opacity: 0.9; }
        .cta-button { display: inline-block; background: #ff6b6b; color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1.1rem; transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px; }
        .cta-button:hover { background: #ff5252; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255,107,107,0.3); }
        .features { padding: 80px 0; background: #f8f9fa; }
        .features h2 { text-align: center; margin-bottom: 60px; font-size: 2.5rem; color: #333; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; }
        .feature { text-align: center; padding: 40px 20px; background: white; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); transition: transform 0.3s; }
        .feature:hover { transform: translateY(-5px); }
        .feature h3 { margin-bottom: 20px; color: #667eea; font-size: 1.5rem; }
        .feature p { color: #666; }
        .testimonials { padding: 80px 0; }
        .testimonials h2 { text-align: center; margin-bottom: 60px; font-size: 2.5rem; }
        .testimonial { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .testimonial p { font-style: italic; margin-bottom: 15px; }
        .testimonial .author { font-weight: bold; color: #667eea; }
        .final-cta { padding: 80px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; }
        .final-cta h2 { font-size: 2.5rem; margin-bottom: 20px; }
        .final-cta p { font-size: 1.2rem; margin-bottom: 40px; opacity: 0.9; }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .hero p { font-size: 1.1rem; }
            .feature-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="hero">
        <div class="container">
            <h1>${productName}</h1>
            <p>Discover the perfect solution that will transform your life</p>
            <a href="${affiliateLink}" class="cta-button" onclick="trackClick()">Get Started Now</a>
        </div>
    </div>
    
    <div class="features">
        <div class="container">
            <h2>Why Choose ${productName}?</h2>
            <div class="feature-grid">
                <div class="feature">
                    <h3>Premium Quality</h3>
                    <p>Experience unmatched quality that exceeds all expectations and delivers lasting value.</p>
                </div>
                <div class="feature">
                    <h3>Exceptional Value</h3>
                    <p>Get the most bang for your buck with features and benefits that justify every penny.</p>
                </div>
                <div class="feature">
                    <h3>24/7 Support</h3>
                    <p>Round-the-clock customer support ensures you're never left hanging when you need help.</p>
                </div>
            </div>
        </div>
    </div>

    <div class="testimonials">
        <div class="container">
            <h2>What Our Customers Say</h2>
            <div class="testimonial">
                <p>"This product completely changed my life! I can't imagine going back to how things were before."</p>
                <div class="author">- Sarah Johnson</div>
            </div>
            <div class="testimonial">
                <p>"Outstanding quality and incredible value. I've recommended this to all my friends and family."</p>
                <div class="author">- Mike Chen</div>
            </div>
            <div class="testimonial">
                <p>"The customer service is amazing and the product delivers exactly what it promises. Highly recommended!"</p>
                <div class="author">- Emily Rodriguez</div>
            </div>
        </div>
    </div>

    <div class="final-cta">
        <div class="container">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of satisfied customers who have already transformed their lives</p>
            <a href="${affiliateLink}" class="cta-button" onclick="trackClick()">Get ${productName} Now</a>
        </div>
    </div>

    ${chatbotScript}

    <script>
        function trackClick() {
            // Track affiliate link clicks for analytics
            fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    type: 'click', 
                    websiteId: '${Date.now()}',
                    affiliateLink: '${affiliateLink}'
                })
            }).catch(err => console.log('Analytics tracking failed:', err));
        }
    </script>
</body>
</html>`;

  return baseTemplate;
}


