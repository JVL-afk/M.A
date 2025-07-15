import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';

// --- 1. The Server Action ---
// This runs securely on the server.
async function analyzeWebsiteAction(formData: FormData) {
  'use server';

  // --- A. Authentication ---
  const token = cookies().get('auth-token')?.value;
  if (!token) {
    redirect('/login');
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    redirect('/login?error=invalid_token');
  }

  // --- B. Get Form Data ---
  const urlToAnalyze = formData.get('urlToAnalyze') as string;
  if (!urlToAnalyze) {
    redirect('/dashboard/analyze-website?error=url_required');
  }

  // --- C. Call Google PageSpeed API ---
  // This is the core logic for the analysis.
  const googleApiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(urlToAnalyze )}&key=${process.env.PAGESPEED_API_KEY}`;

  try {
    const response = await fetch(googleApiUrl);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('PageSpeed API Error:', errorData);
      redirect(`/dashboard/analyze-website?error=${encodeURIComponent(errorData.error.message)}`);
    }
    const data = await response.json();
    
    // Extract key metrics
    const performanceScore = data.lighthouseResult.categories.performance.score * 100;
    const firstContentfulPaint = data.lighthouseResult.audits['first-contentful-paint'].displayValue;
    const speedIndex = data.lighthouseResult.audits['speed-index'].displayValue;
    
    // Encode results to pass them safely in the URL
    const results = { performanceScore, firstContentfulPaint, speedIndex };
    const encodedResults = encodeURIComponent(JSON.stringify(results));

    // --- D. Redirect back with results ---
    redirect(`/dashboard/analyze-website?results=${encodedResults}`);

  } catch (error) {
    console.error('Failed to fetch from PageSpeed API:', error);
    redirect('/dashboard/analyze-website?error=api_fetch_failed');
  }
}

// --- 2. The Page Component ---
// It now displays results passed via searchParams.
export default function AnalyzeWebsitePage({ searchParams }: { searchParams?: { error?: string; results?: string } }) {
  
  let results = null;
  if (searchParams?.results) {
    try {
      results = JSON.parse(decodeURIComponent(searchParams.results));
    } catch {
      // Ignore malformed results
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-orange-800 text-white">
      <div className="w-full max-w-2xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Analyze a Website's Performance</h1>
          <p className="text-orange-200 mt-2">Enter any website URL to get a comprehensive analysis powered by AI and Google PageSpeed Insights.</p>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8">
          <form action={analyzeWebsiteAction} className="space-y-4">
            <div>
              <label htmlFor="urlToAnalyze" className="block text-sm font-medium text-purple-300 mb-1">
                Website URL to Analyze
              </label>
              <input
                id="urlToAnalyze"
                name="urlToAnalyze"
                type="url"
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://www.amazon.com"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 border border-transparent rounded-md text-lg font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors"
            >
              Analyze Website
            </button>
          </form>
        </div>

        {/* Results Display */}
        {results && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-green-500/20 p-8 mt-6">
            <h2 className="text-2xl font-bold text-center mb-4">Analysis Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg text-green-300">Performance Score</p>
                <p className="text-4xl font-bold">{results.performanceScore.toFixed(0 )}</p>
              </div>
              <div>
                <p className="text-lg text-green-300">First Contentful Paint</p>
                <p className="text-4xl font-bold">{results.firstContentfulPaint}</p>
              </div>
              <div>
                <p className="text-lg text-green-300">Speed Index</p>
                <p className="text-4xl font-bold">{results.speedIndex}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {searchParams?.error && (
            <div className="bg-red-900/50 border border-red-500 rounded-md text-center p-4 mt-6">
              <p className="font-bold text-red-300">Analysis Failed</p>
              <p className="text-red-400">{decodeURIComponent(searchParams.error)}</p>
            </div>
        )}

        <div className="text-center mt-6">
          <Link href="/dashboard" className="text-sm text-purple-300 hover:text-orange-200">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
