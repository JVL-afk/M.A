import Link from 'next/link'

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-lg mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  By accessing and using AFFILIFY ("the Service"), you accept and agree to be bound by 
                  the terms and provision of this agreement. If you do not agree to abide by the above, 
                  please do not use this service.
                </p>
                <p>
                  These Terms of Service ("Terms") govern your use of our website located at affilify.eu 
                  and our affiliate website generation service operated by AFFILIFY.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  AFFILIFY is a SaaS platform that enables users to create affiliate marketing websites 
                  automatically. Our service includes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Automated website generation for affiliate marketing</li>
                  <li>Template customization and design tools</li>
                  <li>Analytics and performance tracking</li>
                  <li>API access for Enterprise users</li>
                  <li>Customer support and documentation</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">Account Creation:</strong> You must create an account 
                  to use certain features of our service. You are responsible for maintaining the 
                  confidentiality of your account credentials.
                </p>
                <p>
                  <strong className="text-white">Account Responsibility:</strong> You are responsible 
                  for all activities that occur under your account. You must notify us immediately 
                  of any unauthorized use of your account.
                </p>
                <p>
                  <strong className="text-white">Account Termination:</strong> We reserve the right 
                  to suspend or terminate your account at any time for violation of these terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription Plans and Payment</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">Subscription Plans:</strong> We offer multiple 
                  subscription tiers (Basic, Pro, Enterprise) with different features and limitations.
                </p>
                <p>
                  <strong className="text-white">Payment Terms:</strong> Subscriptions are billed 
                  monthly or annually in advance. All fees are non-refundable except as required by law.
                </p>
                <p>
                  <strong className="text-white">Price Changes:</strong> We reserve the right to 
                  modify our pricing with 30 days advance notice to existing subscribers.
                </p>
                <p>
                  <strong className="text-white">Cancellation:</strong> You may cancel your subscription 
                  at any time. Cancellation will take effect at the end of your current billing period.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use Policy</h2>
              <div className="text-gray-300 space-y-4">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Create websites promoting illegal products or services</li>
                  <li>Engage in fraudulent or deceptive affiliate marketing practices</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights of others</li>
                  <li>Distribute malware, spam, or other harmful content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use the service for any unlawful or prohibited purpose</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Content and Intellectual Property</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">Your Content:</strong> You retain ownership of content 
                  you create using our service. You grant us a license to host, store, and display 
                  your content as necessary to provide the service.
                </p>
                <p>
                  <strong className="text-white">Our Content:</strong> The AFFILIFY platform, including 
                  all software, templates, and documentation, is our intellectual property and is 
                  protected by copyright and other laws.
                </p>
                <p>
                  <strong className="text-white">Third-Party Content:</strong> You are responsible 
                  for ensuring you have proper rights to use any third-party content in your websites.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. API Usage Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">Enterprise API Access:</strong> API access is available 
                  only to Enterprise plan subscribers and subject to rate limits and usage restrictions.
                </p>
                <p>
                  <strong className="text-white">API Keys:</strong> You are responsible for keeping 
                  your API keys secure. Any usage under your API key is your responsibility.
                </p>
                <p>
                  <strong className="text-white">API Limitations:</strong> We may impose rate limits, 
                  usage quotas, and other restrictions on API usage to ensure service quality.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Service Availability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">Uptime:</strong> We strive to maintain high service 
                  availability but do not guarantee 100% uptime. Scheduled maintenance will be 
                  announced in advance when possible.
                </p>
                <p>
                  <strong className="text-white">Service Modifications:</strong> We reserve the right 
                  to modify, suspend, or discontinue any part of the service with reasonable notice.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  To the maximum extent permitted by law, AFFILIFY shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, including without limitation, 
                  loss of profits, data, use, goodwill, or other intangible losses.
                </p>
                <p>
                  Our total liability to you for all claims arising from or relating to the service 
                  shall not exceed the amount you paid us in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Indemnification</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  You agree to indemnify and hold harmless AFFILIFY and its officers, directors, 
                  employees, and agents from any claims, damages, losses, or expenses arising from 
                  your use of the service or violation of these terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Privacy Policy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also 
                  governs your use of the service, to understand our practices.
                </p>
                <p>
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                    View our Privacy Policy
                  </Link>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Dispute Resolution</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">Governing Law:</strong> These terms shall be governed 
                  by and construed in accordance with the laws of the European Union.
                </p>
                <p>
                  <strong className="text-white">Dispute Resolution:</strong> Any disputes arising 
                  from these terms or your use of the service shall be resolved through binding 
                  arbitration or in the courts of the European Union.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">13. Termination</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">Termination by You:</strong> You may terminate your 
                  account at any time by canceling your subscription through your account settings.
                </p>
                <p>
                  <strong className="text-white">Termination by Us:</strong> We may terminate or 
                  suspend your account immediately for violation of these terms or for any other 
                  reason with reasonable notice.
                </p>
                <p>
                  <strong className="text-white">Effect of Termination:</strong> Upon termination, 
                  your right to use the service will cease immediately. We may delete your account 
                  data after a reasonable period.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">14. Changes to Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of 
                  material changes via email or through the service. Continued use of the service 
                  after changes constitutes acceptance of the new terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">15. Severability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If any provision of these terms is found to be unenforceable or invalid, that 
                  provision will be limited or eliminated to the minimum extent necessary so that 
                  these terms will otherwise remain in full force and effect.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">16. Contact Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                  <p><strong className="text-white">Email:</strong> legal@affilify.eu</p>
                  <p><strong className="text-white">Support:</strong> support@affilify.eu</p>
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
