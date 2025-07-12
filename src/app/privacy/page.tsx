import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-white">
              AFFILIFY
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-gray-300 hover:text-white transition-colors">
                Docs
              </Link>
              <Link href="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-lg mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We collect information you provide directly to us, such as when you create an account, 
                  subscribe to our service, or contact us for support.
                </p>
                <p>
                  <strong className="text-white">Personal Information:</strong> Name, email address, 
                  payment information, and any other information you choose to provide.
                </p>
                <p>
                  <strong className="text-white">Usage Information:</strong> Information about how you 
                  use our service, including websites created, affiliate links used, and platform interactions.
                </p>
                <p>
                  <strong className="text-white">Technical Information:</strong> IP address, browser type, 
                  device information, and other technical data collected automatically.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices, updates, and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze usage patterns and trends</li>
                  <li>Detect, investigate, and prevent fraudulent activities</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  except as described in this policy.
                </p>
                <p>
                  <strong className="text-white">Service Providers:</strong> We may share your information 
                  with trusted third-party service providers who assist us in operating our platform, 
                  processing payments, or providing customer support.
                </p>
                <p>
                  <strong className="text-white">Legal Requirements:</strong> We may disclose your information 
                  if required by law or in response to valid legal requests.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We implement appropriate technical and organizational security measures to protect your 
                  personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <p>
                  However, no method of transmission over the internet or electronic storage is 100% secure, 
                  and we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Retention</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We retain your personal information for as long as necessary to provide our services 
                  and fulfill the purposes outlined in this policy, unless a longer retention period 
                  is required by law.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
              <div className="text-gray-300 space-y-4">
                <p>Depending on your location, you may have the following rights:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access to your personal information</li>
                  <li>Correction of inaccurate information</li>
                  <li>Deletion of your personal information</li>
                  <li>Restriction of processing</li>
                  <li>Data portability</li>
                  <li>Objection to processing</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at privacy@affilify.eu
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies and Tracking</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We use cookies and similar tracking technologies to enhance your experience, 
                  analyze usage patterns, and provide personalized content.
                </p>
                <p>
                  You can control cookie settings through your browser preferences, though some 
                  features may not function properly if cookies are disabled.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Third-Party Services</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Our service may contain links to third-party websites or integrate with third-party 
                  services. We are not responsible for the privacy practices of these third parties.
                </p>
                <p>
                  We use the following third-party services:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Stripe for payment processing</li>
                  <li>Email service providers for communications</li>
                  <li>Analytics services for usage tracking</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. International Data Transfers</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place to protect your information during such transfers.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Children's Privacy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Our service is not intended for children under 13 years of age. We do not knowingly 
                  collect personal information from children under 13.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any 
                  material changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about this privacy policy or our privacy practices, 
                  please contact us at:
                </p>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <p><strong className="text-white">Email:</strong> privacy@affilify.eu</p>
                  <p><strong className="text-white">Website:</strong> https://affilify.eu</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 mb-4 md:mb-0">
              © 2025 AFFILIFY. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/docs" className="text-gray-300 hover:text-white transition-colors">
                Docs
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
