// SUPPORT SYSTEM WITH PLAN-BASED ACCESS
// Priority Support (Pro): Email - Dedicated Support (Enterprise): Phone

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Support contact information
const SUPPORT_CONTACTS = {
  basic: {
    title: "Standard Support",
    description: "Get help through our comprehensive documentation and community forums.",
    methods: [
      {
        type: "Documentation",
        icon: "📚",
        description: "Browse our detailed guides and tutorials",
        action: "Browse Docs",
        link: "/docs"
      },
      {
        type: "Community Forum",
        icon: "💬",
        description: "Connect with other users and get community support",
        action: "Join Forum",
        link: "https://community.affilify.com"
      }
    ]
  },
  pro: {
    title: "Priority Support",
    description: "Get faster response times with direct email support from our team.",
    methods: [
      {
        type: "Priority Email Support",
        icon: "📧",
        description: "Direct email access to our support team",
        contact: "jvlmanus@gmail.com",
        responseTime: "Within 24 hours",
        action: "Send Email"
      },
      {
        type: "Documentation",
        icon: "📚",
        description: "Access to Pro-only guides and advanced tutorials",
        action: "Browse Pro Docs",
        link: "/docs/pro"
      }
    ]
  },
  enterprise: {
    title: "Dedicated Support",
    description: "Premium support with phone access and dedicated account management.",
    methods: [
      {
        type: "Dedicated Phone Support",
        icon: "📞",
        description: "Direct phone line to our enterprise support team",
        contact: "+40 772 150 449",
        responseTime: "Immediate during business hours",
        action: "Call Now"
      },
      {
        type: "Priority Email Support",
        icon: "📧",
        description: "Expedited email support with enterprise SLA",
        contact: "jvlmanus@gmail.com",
        responseTime: "Within 4 hours",
        action: "Send Email"
      },
      {
        type: "Account Manager",
        icon: "👤",
        description: "Dedicated account manager for personalized assistance",
        action: "Contact Manager",
        link: "/enterprise/contact"
      }
    ]
  }
};

// Get user support access
async function getUserSupportAccess() {
  const token = cookies().get('auth-token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) return null;

    const userPlan = user.plan || 'basic';
    return {
      user,
      plan: userPlan,
      supportLevel: SUPPORT_CONTACTS[userPlan as keyof typeof SUPPORT_CONTACTS]
    };
  } catch (error) {
    console.error("Failed to get user support access:", error);
    return null;
  }
}

// Support ticket submission action
async function submitSupportTicket(formData: FormData) {
  'use server';

  const token = cookies().get('auth-token')?.value;
  if (!token) {
    redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      redirect('/login?error=user_not_found');
    }

    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const priority = formData.get('priority') as string;

    if (!subject || !message) {
      redirect('/dashboard/support?error=missing_fields');
    }

    // Store support ticket in database
    await db.collection('support_tickets').insertOne({
      userId: user._id,
      userEmail: user.email,
      userPlan: user.plan || 'basic',
      subject,
      message,
      priority,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    redirect('/dashboard/support?success=ticket_submitted');
  } catch (error) {
    console.error("Failed to submit support ticket:", error);
    redirect('/dashboard/support?error=submission_failed');
  }
}

// Main support page component
export default async function SupportPage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
  const data = await getUserSupportAccess();

  if (!data) {
    redirect('/login');
  }

  const { user, plan, supportLevel } = data;
  const errorMessage = searchParams?.error;
  const successMessage = searchParams?.success;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-orange-800 text-white">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Support Center</h1>
            <p className="text-orange-200 mt-2">
              {supportLevel.title} • {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
            </p>
          </div>
          <Link href="/dashboard" className="text-purple-300 hover:text-orange-200">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-500 rounded-lg">
            <p className="text-green-300">
              {successMessage === 'ticket_submitted' && 'Your support ticket has been submitted successfully!'}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-300">
              {errorMessage === 'missing_fields' && 'Please fill in all required fields.'}
              {errorMessage === 'submission_failed' && 'Failed to submit support ticket. Please try again.'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Support Methods */}
          <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-4">{supportLevel.title}</h2>
            <p className="text-gray-300 mb-6">{supportLevel.description}</p>

            <div className="space-y-6">
              {supportLevel.methods.map((method, index) => (
                <div key={index} className="bg-gray-800/50 p-6 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{method.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{method.type}</h3>
                      <p className="text-gray-300 mb-3">{method.description}</p>
                      
                      {method.contact && (
                        <div className="mb-3">
                          <p className="text-orange-400 font-semibold">{method.contact}</p>
                          {method.responseTime && (
                            <p className="text-sm text-gray-400">Response time: {method.responseTime}</p>
                          )}
                        </div>
                      )}

                      {method.contact ? (
                        <a
                          href={method.type.includes('Phone') ? `tel:${method.contact}` : `mailto:${method.contact}`}
                          className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          {method.action}
                        </a>
                      ) : method.link ? (
                        <Link
                          href={method.link}
                          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          {method.action}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Ticket Form */}
          <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-4">Submit Support Ticket</h2>
            <p className="text-gray-300 mb-6">
              Can't find what you're looking for? Submit a support ticket and we'll get back to you.
            </p>

            <form action={submitSupportTicket} className="space-y-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-purple-300 mb-2">
                  Subject *
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-purple-300 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="low">Low - General question</option>
                  <option value="medium">Medium - Feature request</option>
                  <option value="high">High - Bug or issue</option>
                  {(plan === 'pro' || plan === 'enterprise') && (
                    <option value="urgent">Urgent - Critical issue</option>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-purple-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Please provide as much detail as possible about your issue or question..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
              >
                Submit Ticket
              </button>
            </form>

            {/* Upgrade prompt for basic users */}
            {plan === 'basic' && (
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-600 to-orange-600 rounded-lg text-center">
                <h3 className="text-lg font-bold mb-2">Need Faster Support?</h3>
                <p className="text-sm mb-4">
                  Upgrade to Pro for priority email support or Enterprise for dedicated phone support.
                </p>
                <Link
                  href="/pricing"
                  className="inline-block bg-white text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  View Plans
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-black/30 p-8 rounded-xl border border-purple-500/20">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">How do I create my first website?</h3>
              <p className="text-gray-300 text-sm">
                Go to your dashboard and click "Create Website". Enter your affiliate link and product name, then let our AI generate your site.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I customize my website design?</h3>
              <p className="text-gray-300 text-sm">
                Pro and Enterprise users have access to premium templates with advanced customization options.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">How do I track my affiliate performance?</h3>
              <p className="text-gray-300 text-sm">
                Use our analytics dashboard to track clicks, conversions, and revenue. Pro users get advanced analytics.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What's included in each plan?</h3>
              <p className="text-gray-300 text-sm">
                Check our pricing page for detailed plan comparisons. Each plan offers different website limits and features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
