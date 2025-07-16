import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Server Action for analyzing websites
async function analyzeWebsiteAction(formData: FormData) {
  'use server';
  
  try {
    const url = formData.get('url') as string;
    
    if (!url) {
      return { success: false, error: 'URL is required' };
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return { success: false, error: 'Please enter a valid URL' };
    }

    // Get user from auth token
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Call Google PageSpeed API
    const pagespeedUrl = `https://www.googleapis.com/pagespeed/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${process.env.PAGESPEED_API_KEY}&category=performance&category=accessibility&category=best-practices&category=seo`;
    
    const response = await fetch(pagespeedUrl);
    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract key metrics
    const lighthouse = data.lighthouseResult;
    const categories = lighthouse.categories;
    
    const analysis = {
      url,
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
      loadingTime: lighthouse.audits['speed-index'].displayValue,
      firstContentfulPaint: lighthouse.audits['first-contentful-paint'].displayValue,
      largestContentfulPaint: lighthouse.audits['largest-contentful-paint'].displayValue,
      cumulativeLayoutShift: lighthouse.audits['cumulative-layout-shift'].displayValue,
      analyzedAt: new Date()
    };

    // Save analysis to database
    await db.collection('website_analyses').insertOne({
      userId: user._id,
      ...analysis
    });

    return { success: true, analysis };

  } catch (error) {
    console.error('Website analysis error:', error);
    return { 
      success: false, 
      error: 'Failed to analyze website. Please try again.' 
    };
  }
}

export default function AnalyzeWebsitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Analyze a Website's Performance
            </h1>
            <p className="text-xl text-purple-200">
              Enter any website URL to get a comprehensive analysis powered by AI and Google PageSpeed Insights.
            </p>
          </div>

          {/* Analysis Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
            <form action={analyzeWebsiteAction} className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-purple-300 mb-2">
                  Website URL to Analyze
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  placeholder="https://www.example.com"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-purple-300 mt-2">
                  Enter the complete URL including https://
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              >
                Analyze Website
              </button>
            </form>
          </div>

          {/* Back to Dashboard */}
          <div className="text-center">
            <a
              href="/dashboard"
              className="inline-flex items-center text-purple-300 hover:text-white transition-colors duration-200"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
