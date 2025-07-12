'use client'

import Navbar from '@/components/Navbar'

export default function CookiePolicy() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <h1 className="text-4xl font-bold text-white mb-8">🍪 Cookie Policy</h1>
          
          <div className="text-gray-200 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies</h2>
              <p>
                Cookies are small text files that are stored on your computer or mobile device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and improving our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How We Use Cookies</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Managing Cookies</h2>
              <p>
                You can control and manage cookies in your browser settings. Please note that removing or blocking 
                cookies may impact your user experience and some features may not work properly.
              </p>
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white mb-2">Browser Settings:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                  <li><strong>Edge:</strong> Settings → Cookies and Site Permissions</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Third-Party Cookies</h2>
              <p>
                We may use third-party services that set cookies on our website, including:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Google Analytics for website analytics</li>
                <li>Stripe for payment processing</li>
                <li>Social media platforms for sharing features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p>
                If you have any questions about our Cookie Policy, please contact us at{' '}
                <a href="mailto:privacy@affilify.com" className="text-red-400 hover:text-red-300">
                  privacy@affilify.com
                </a>
              </p>
            </section>

            <div className="border-t border-white/20 pt-6 mt-8">
              <p className="text-sm text-gray-400">
                Last updated: June 22, 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
