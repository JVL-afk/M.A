"use client";

import { useState, useEffect } from 'react';

// This is the PUBLIC URL of your REAL backend service
const BACKEND_API_URL = 'http://45.32.73.36:3000/api/analyze-website';

interface AnalysisResult {
  url: string;
  [key: string]: any; // Allow any other fields
}

export default function AnalyzeWebsite( ) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setAnalysis(null);

    try {
      // This fetch call is now made DIRECTLY from the browser to the backend
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: websiteUrl,
        }),
      });

      if (!response.ok) {
        // Try to get a meaningful error from the backend response
        const errorText = await response.text();
        throw new Error(`Analysis server returned an error: ${response.status} ${response.statusText}. Details: ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Failed to analyze website. Please try again.');
      }
    } catch (err: any) {
      console.error("Analysis submission error:", err);
      setError('An unexpected error occurred: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-orange-600 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Analyze a Website's Performance</h1>
        <p className="text-center text-orange-200 mb-8">
          Enter any website URL to get a comprehensive analysis powered by AI and Google PageSpeed Insights.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8 bg-black/30 p-6 rounded-xl">
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium mb-2 text-purple-300">
              Website URL to Analyze
            </label>
            <input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-3 bg-gray-800 border border-purple-500/50 rounded-lg text-white focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? 'Analyzing, please wait (this can take up to a minute )...' : 'Analyze Website'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
            <p className="font-bold">Analysis Failed</p>
            <p>{error}</p>
          </div>
        )}

        {analysis && (
          <div className="mt-6 space-y-6 animate-fade-in">
            <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Analysis Complete!</h3>
              <p>Website: <a href={analysis.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{analysis.url}</a></p>
            </div>

            <div className="bg-black/30 p-6 rounded-xl">
              <h4 className="font-semibold text-lg mb-3 text-purple-300">Full Analysis Report:</h4>
              <pre className="text-sm text-white bg-gray-900 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-words">
                {JSON.stringify(analysis, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
