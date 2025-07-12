'use client';

import { useEffect, useState } from 'react';

// Define the interface for a single analysis object
interface Analysis {
  id: string;
  summary: string;
  seoRecommendations: string[];
  contentOpportunities: string[];
  affiliateSuggestions: string[];
  // Add any other properties that an analysis object might have
}

export default function MyAnalysesPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    async function fetchAnalyses() {
      try {
        // In a real application, you would fetch this data from your backend API
        // For now, we'll use mock data
        const mockData: Analysis[] = [
          {
            id: '1',
            summary: 'This is a sample analysis summary.',
            seoRecommendations: ['Improve meta descriptions.', 'Add alt tags to images.'],
            contentOpportunities: ['Write a blog post about a new topic.'],
            affiliateSuggestions: ['Join a new affiliate program.'],
          },
        ];
        setAnalyses(mockData);
      } catch (err) {
        setError('Failed to fetch analyses.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyses();
  }, []);

  const handleViewDetails = (analysis: Analysis) => {
    setSelectedAnalysis(selectedAnalysis?.id === analysis.id ? null : analysis);
  };

  if (loading) {
    return <p>Loading analyses...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My AI Analyses</h1>
      <div className="space-y-4">
        {analyses.map((analysis) => (
          <div key={analysis.id} className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold">{analysis.summary}</h2>
            <button
              onClick={() => handleViewDetails(analysis)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {selectedAnalysis?.id === analysis.id ? 'Hide Details' : 'View Details'}
            </button>
            {selectedAnalysis?.id === analysis.id && (
              <div className="mt-4 space-y-2">
                <div>
                  <h3 className="font-bold">SEO Recommendations:</h3>
                  <ul className="list-disc list-inside">
                    {analysis.seoRecommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold">Content Opportunities:</h3>
                  <ul className="list-disc list-inside">
                    {analysis.contentOpportunities.map((opp, index) => (
                      <li key={index}>{opp}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold">Affiliate Suggestions:</h3>
                  <ul className="list-disc list-inside">
                    {analysis.affiliateSuggestions.map((sug, index) => (
                      <li key={index}>{sug}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
