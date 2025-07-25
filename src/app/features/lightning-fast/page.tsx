// FILE LOCATION: src/app/features/lightning-fast/page.tsx
// This file fixes the "Navbar is not defined" error for the lightning-fast feature page

import Navbar from '../../../components/Navbar';

export default function LightningFast() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            ⚡ Lightning-Fast Generation
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Create professional affiliate websites in under 60 seconds
          </p>
        </div>
        
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Instant Setup</h3>
              <p className="mt-2 text-gray-600">
                No coding required. Just enter your affiliate links and let our AI do the rest.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">60-Second Deploy</h3>
              <p className="mt-2 text-gray-600">
                From idea to live website in under a minute. The fastest way to start earning.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Instant Results</h3>
              <p className="mt-2 text-gray-600">
                Start generating revenue immediately with optimized, conversion-ready sites.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <a
            href="/signup"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Try Lightning-Fast Generation
          </a>
        </div>
      </div>
    </div>
  );
}

