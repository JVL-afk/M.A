import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="bg-gradient-to-br from-orange-900 via-orange-800 to-black animate-color-transition">
        {/* Hero Section with Affiliate Website Image */}
        <div className="container mx-auto px-4 py-16">
          {/* Attractive Affiliate Marketing Website Preview */}
          <div className="text-center mb-12">
            <div className="relative mx-auto max-w-4xl mb-8">
              <div className="bg-white rounded-lg shadow-2xl p-6 transform hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
                  <h3 className="text-xl font-bold">TechReviews Pro</h3>
                  <p className="text-sm opacity-90">Your trusted source for tech reviews</p>
                </div>
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-3 rounded shadow">
                      <div className="w-full h-20 bg-gray-300 rounded mb-2"></div>
                      <p className="text-xs text-gray-600">Latest iPhone Review</p>
                    </div>
                    <div className="bg-white p-3 rounded shadow">
                      <div className="w-full h-20 bg-gray-300 rounded mb-2"></div>
                      <p className="text-xs text-gray-600">Best Laptops 2025</p>
                    </div>
                    <div className="bg-white p-3 rounded shadow">
                      <div className="w-full h-20 bg-gray-300 rounded mb-2"></div>
                      <p className="text-xs text-gray-600">Gaming Setup Guide</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <button className="bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition-colors">
                      Shop Now - 50% OFF!
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Welcome Message */}
            <h1 className="text-7xl font-bold text-white mb-4 animate-bounce">
              WELCOME TO AFFILIFY
            </h1>
            <p className="text-3xl text-orange-200 mb-8 font-semibold">
              Your gateway to profit
            </p>
          </div>

          {/* Scrollable Reviews Section */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-white text-center mb-8">What Our Users Say</h2>
            <div className="overflow-x-auto">
              <div className="flex space-x-6 pb-4" style={{width: 'max-content'}}>
                {[
                  {
                    name: "Sarah Johnson",
                    review: "AFFILIFY changed my life! I went from $0 to $5,000/month in just 3 months!",
                    rating: 5,
                    profit: "$5,000/month"
                  },
                  {
                    name: "Mike Chen",
                    review: "The AI website generator is incredible. My sites look professional and convert amazingly!",
                    rating: 5,
                    profit: "$3,200/month"
                  },
                  {
                    name: "Emma Rodriguez",
                    review: "I was skeptical at first, but AFFILIFY delivered. My first website made $500 in the first week!",
                    rating: 5,
                    profit: "$2,800/month"
                  },
                  {
                    name: "David Thompson",
                    review: "Finally, a platform that actually works! The analytics help me optimize everything.",
                    rating: 5,
                    profit: "$4,100/month"
                  },
                  {
                    name: "Lisa Park",
                    review: "From complete beginner to affiliate marketing success story. Thank you AFFILIFY!",
                    rating: 5,
                    profit: "$6,500/month"
                  }
                ].map((review, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-xl min-w-80 max-w-80">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {review.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold text-gray-800">{review.name}</h4>
                        <div className="flex text-yellow-400">
                          {'★'.repeat(review.rating)}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">"{review.review}"</p>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      💰 {review.profit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white mb-6">
              Don't believe us? Try it out yourself!
            </h2>
            <Link href="/signup">
              <button className="bg-gradient-to-r from-red-600 to-red-800 text-white text-2xl font-bold px-12 py-6 rounded-full shadow-2xl hover:from-red-700 hover:to-red-900 transform hover:scale-110 transition-all duration-300 pulse-button">
                SIGN UP NOW
              </button>
            </Link>
            <p className="text-orange-200 mt-4 text-lg">
              Join thousands of successful affiliate marketers!
            </p>
          </div>
        </div>

        {/* Success Stories Section */}
        <div className="bg-black bg-opacity-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-8">Success by the Numbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-400 mb-2">10,000+</div>
                <div className="text-white text-lg">Websites Created</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-400 mb-2">$2.5M+</div>
                <div className="text-white text-lg">Total Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-400 mb-2">5,000+</div>
                <div className="text-white text-lg">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-400 mb-2">98%</div>
                <div className="text-white text-lg">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
