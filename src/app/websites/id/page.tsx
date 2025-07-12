'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface GeneratedWebsite {
  _id: string;
  content: string;
  createdAt: string;
  websiteConfig: {
    niche?: string;
    product?: string;
    audience?: string;
    features?: string[];
    callToAction?: string;
  };
}

interface ParsedContent {
  hero?: { title: string; body: string };
  about?: { title: string; body: string };
  services?: { title: string; body: string };
  testimonials?: { title: string; body: string };
  contact?: { title: string; body: string };
}

export default function GeneratedWebsitePage() {
  const params = useParams();
  const [website, setWebsite] = useState<GeneratedWebsite | null>(null);
  const [parsedContent, setParsedContent] = useState<ParsedContent>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const response = await fetch(`/api/websites/${params.id}`);
        if (!response.ok) {
          throw new Error('Website not found');
        }
        const data = await response.json();
        setWebsite(data.website);
        
        // Parse the AI-generated content
        try {
          const parsed = JSON.parse(data.website.content);
          setParsedContent(parsed);
        } catch (parseError) {
          // If content is not JSON, treat it as plain text
          setParsedContent({
            hero: {
              title: data.website.websiteConfig.product || 'Welcome',
              body: data.website.content
            }
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchWebsite();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your website...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Website Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Website Not Available</h1>
          <p className="text-gray-600">The requested website could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {parsedContent.hero && (
        <section className="bg-blue-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {parsedContent.hero.title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              {parsedContent.hero.body}
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {website.websiteConfig.callToAction || 'Get Started'}
            </button>
          </div>
        </section>
      )}

      {/* About Section */}
      {parsedContent.about && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
                {parsedContent.about.title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {parsedContent.about.body}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {parsedContent.services && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
                {parsedContent.services.title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {parsedContent.services.body}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {parsedContent.testimonials && (
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
                {parsedContent.testimonials.title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {parsedContent.testimonials.body}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {parsedContent.contact && (
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                {parsedContent.contact.title}
              </h2>
              <p className="text-lg leading-relaxed mb-8">
                {parsedContent.contact.body}
              </p>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                {website.websiteConfig.callToAction || 'Contact Us'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            Generated by Affilify • {new Date(website.createdAt).toLocaleDateString()}
          </p>
        </div>
      </footer>
    </div>
  );
}
