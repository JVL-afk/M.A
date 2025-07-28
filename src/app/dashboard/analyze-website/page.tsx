'use client';

import { useState, useTransition } from 'react';
import { Search, BarChart3, Zap, Shield, Globe, Clock, Eye, Layers, TrendingUp } from 'lucide-react';

interface AnalysisResult {
  url: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  loadingTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  analyzedAt: Date;
}

export default function AnalyzeWebsitePage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  // ✅ FIXED: Proper async function with error handling
  const analyzeWebsiteAction = async (formData: FormData): Promise<void> => {
    const url = formData.get('url') as string;
    
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }

    // ✅ FIXED: URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    try {
      setError('');
      
      const response = await fetch('/api/ai/analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setAnalysis(result.analysis);
        setError('');
      } else {
        setError(result.error || 'Failed to analyze website');
        setAnalysis(null);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Network error. Please try again.');
      setAnalysis(null);
    }
  };

  // ✅ FIXED: Proper form submission handler
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    startTransition(() => {
      analyzeWebsiteAction(formData);
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 border-green-500/30';
    if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Website Performance Analyzer
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get comprehensive insights into your website's performance, accessibility, SEO, and best practices with our advanced analysis tool.
          </p>
        </div>

        {/* Analysis Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-lg font-semibold text-white mb-3">
                Website URL to Analyze
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  id="url"
                  name="url"
                  placeholder="https://example.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Analyze Website</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <BarChart3 className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Performance Metrics</h3>
            <p className="text-gray-300 text-sm">Core Web Vitals, loading times, and optimization scores</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Shield className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Accessibility Check</h3>
            <p className="text-gray-300 text-sm">WCAG compliance and accessibility best practices</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <TrendingUp className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">SEO Analysis</h3>
            <p className="text-gray-300 text-sm">Search engine optimization recommendations</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <Zap className="w-8 h-8 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Best Practices</h3>
            <p className="text-gray-300 text-sm">Industry standards and development guidelines</p>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Analysis Results</h2>
              <div className="flex items-center justify-between text-gray-300">
                <span>Analyzed: {analysis.url}</span>
                <span className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(analysis.analyzedAt).toLocaleString()}</span>
                </span>
              </div>
            </div>

            {/* Score Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`rounded-xl p-6 border ${getScoreBg(analysis.performance)}`}>
                <div className={`text-3xl font-bold ${getScoreColor(analysis.performance)} mb-2`}>
                  {analysis.performance}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Performance</h3>
                <p className="text-gray-300 text-sm">Loading speed & optimization</p>
              </div>

              <div className={`rounded-xl p-6 border ${getScoreBg(analysis.accessibility)}`}>
                <div className={`text-3xl font-bold ${getScoreColor(analysis.accessibility)} mb-2`}>
                  {analysis.accessibility}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Accessibility</h3>
                <p className="text-gray-300 text-sm">WCAG compliance</p>
              </div>

              <div className={`rounded-xl p-6 border ${getScoreBg(analysis.bestPractices)}`}>
                <div className={`text-3xl font-bold ${getScoreColor(analysis.bestPractices)} mb-2`}>
                  {analysis.bestPractices}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Best Practices</h3>
                <p className="text-gray-300 text-sm">Development standards</p>
              </div>

              <div className={`rounded-xl p-6 border ${getScoreBg(analysis.seo)}`}>
                <div className={`text-3xl font-bold ${getScoreColor(analysis.seo)} mb-2`}>
                  {analysis.seo}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">SEO</h3>
                <p className="text-gray-300 text-sm">Search optimization</p>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{analysis.loadingTime}s</div>
                <h4 className="text-sm font-semibold text-gray-300 mb-1">Loading Time</h4>
                <p className="text-xs text-gray-400">Total page load</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{analysis.firstContentfulPaint}s</div>
                <h4 className="text-sm font-semibold text-gray-300 mb-1">First Paint</h4>
                <p className="text-xs text-gray-400">First Contentful Paint</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{analysis.largestContentfulPaint}s</div>
                <h4 className="text-sm font-semibold text-gray-300 mb-1">Largest Paint</h4>
                <p className="text-xs text-gray-400">Largest Contentful Paint</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{analysis.cumulativeLayoutShift}</div>
                <h4 className="text-sm font-semibold text-gray-300 mb-1">Layout Shift</h4>
                <p className="text-xs text-gray-400">Cumulative Layout Shift</p>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Recommendations</h3>
              <div className="space-y-4">
                {analysis.performance < 90 && (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-200">
                      <strong>Performance:</strong> Consider optimizing images, minifying CSS/JS, and enabling compression to improve loading times.
                    </p>
                  </div>
                )}
                
                {analysis.accessibility < 90 && (
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200">
                      <strong>Accessibility:</strong> Add alt text to images, improve color contrast, and ensure keyboard navigation works properly.
                    </p>
                  </div>
                )}
                
                {analysis.seo < 90 && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-200">
                      <strong>SEO:</strong> Add meta descriptions, optimize title tags, and ensure your content is properly structured with headings.
                    </p>
                  </div>
                )}
                
                {analysis.bestPractices < 90 && (
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                    <p className="text-purple-200">
                      <strong>Best Practices:</strong> Update to HTTPS, remove unused code, and follow modern web development standards.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
