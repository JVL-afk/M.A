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
  const [error, setError] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  // Fixed form action function to return void
  const analyzeWebsiteAction = async (formData: FormData): Promise<void> => {
    const url = formData.get('url') as string;

    if (!url) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (result.success) {
        setAnalysis(result.analysis);
        setError('');
      } else {
        setError(result.error || 'Failed to analyze website');
        setAnalysis(null);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setAnalysis(null);
    }
  };

  // Handle form submission with transition
  const handleSubmit = (formData: FormData) => {
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
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <BarChart3 className="h-12 w-12 text-purple-300" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Website Performance Analyzer
          </h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Get comprehensive insights into your website's performance, accessibility, SEO, and best practices with our advanced analysis tool.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Analysis Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
            <form action={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-purple-300 mb-2">
                  Website URL to Analyze
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                  <input
                    type="url"
                    id="url"
                    name="url"
                    placeholder="https://example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Analyze Website</span>
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">Analysis Features</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Zap className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Performance Metrics</h4>
                  <p className="text-purple-200 text-sm">Core Web Vitals, loading times, and optimization scores</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Accessibility Check</h4>
                  <p className="text-purple-200 text-sm">WCAG compliance and accessibility best practices</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">SEO Analysis</h4>
                  <p className="text-purple-200 text-sm">Search engine optimization recommendations</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Layers className="h-6 w-6 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Best Practices</h4>
                  <p className="text-purple-200 text-sm">Industry standards and development guidelines</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Analysis Results</h2>
                <p className="text-purple-200">
                  Analyzed: <span className="text-white font-medium">{analysis.url}</span>
                </p>
                <p className="text-purple-300 text-sm">
                  {new Date(analysis.analyzedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`p-6 rounded-xl border ${getScoreBg(analysis.performance)}`}>
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-6 w-6 text-yellow-400" />
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.performance)}`}>
                    {analysis.performance}
                  </span>
                </div>
                <h3 className="font-semibold text-white">Performance</h3>
                <p className="text-purple-200 text-sm">Loading speed & optimization</p>
              </div>

              <div className={`p-6 rounded-xl border ${getScoreBg(analysis.accessibility)}`}>
                <div className="flex items-center justify-between mb-2">
                  <Shield className="h-6 w-6 text-green-400" />
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.accessibility)}`}>
                    {analysis.accessibility}
                  </span>
                </div>
                <h3 className="font-semibold text-white">Accessibility</h3>
                <p className="text-purple-200 text-sm">WCAG compliance</p>
              </div>

              <div className={`p-6 rounded-xl border ${getScoreBg(analysis.bestPractices)}`}>
                <div className="flex items-center justify-between mb-2">
                  <Layers className="h-6 w-6 text-purple-400" />
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.bestPractices)}`}>
                    {analysis.bestPractices}
                  </span>
                </div>
                <h3 className="font-semibold text-white">Best Practices</h3>
                <p className="text-purple-200 text-sm">Development standards</p>
              </div>

              <div className={`p-6 rounded-xl border ${getScoreBg(analysis.seo)}`}>
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.seo)}`}>
                    {analysis.seo}
                  </span>
                </div>
                <h3 className="font-semibold text-white">SEO</h3>
                <p className="text-purple-200 text-sm">Search optimization</p>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <h4 className="font-semibold text-white">Loading Time</h4>
                </div>
                <p className="text-2xl font-bold text-blue-400">{analysis.loadingTime}s</p>
                <p className="text-purple-200 text-sm">Total page load</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  <Eye className="h-5 w-5 text-green-400" />
                  <h4 className="font-semibold text-white">First Paint</h4>
                </div>
                <p className="text-2xl font-bold text-green-400">{analysis.firstContentfulPaint}s</p>
                <p className="text-purple-200 text-sm">First Contentful Paint</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  <Layers className="h-5 w-5 text-yellow-400" />
                  <h4 className="font-semibold text-white">Largest Paint</h4>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{analysis.largestContentfulPaint}s</p>
                <p className="text-purple-200 text-sm">Largest Contentful Paint</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <h4 className="font-semibold text-white">Layout Shift</h4>
                </div>
                <p className="text-2xl font-bold text-purple-400">{analysis.cumulativeLayoutShift}</p>
                <p className="text-purple-200 text-sm">Cumulative Layout Shift</p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Recommendations</h3>
              <div className="space-y-3">
                {analysis.performance < 90 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-purple-200">
                      <span className="text-white font-medium">Performance:</span> Consider optimizing images, minifying CSS/JS, and enabling compression to improve loading times.
                    </p>
                  </div>
                )}
                {analysis.accessibility < 90 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-purple-200">
                      <span className="text-white font-medium">Accessibility:</span> Add alt text to images, improve color contrast, and ensure keyboard navigation works properly.
                    </p>
                  </div>
                )}
                {analysis.seo < 90 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-purple-200">
                      <span className="text-white font-medium">SEO:</span> Add meta descriptions, optimize title tags, and ensure your content is properly structured with headings.
                    </p>
                  </div>
                )}
                {analysis.bestPractices < 90 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-purple-200">
                      <span className="text-white font-medium">Best Practices:</span> Update to HTTPS, remove unused code, and follow modern web development standards.
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

