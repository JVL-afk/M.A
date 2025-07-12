'use client';

import { useEffect, useState } from 'react';

// Define the interface for the analytics data
interface AnalyticsData {
  generations: number;
  analyses: number;
  // Add any other properties that analyticsData might have
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        // In a real application, you would fetch this data from your backend API
        // For now, we'll use mock data
        const mockData: AnalyticsData = {
          generations: 15,
          analyses: 7,
        };
        setAnalyticsData(mockData);
      } catch (err) {
        setError('Failed to fetch analytics data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return <p>Loading analytics...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Analytics</h1>
      {analyticsData ? (
        <div>
          <p>Website generations: {analyticsData.generations || 0}</p>
          <p>AI analyses: {analyticsData.analyses || 0}</p>
        </div>
      ) : (
        <p>No analytics data available.</p>
      )}
    </div>
  );
}
