import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Server Action for updating chatbot settings
async function updateChatbotAction(formData: FormData) {
  'use server';
  
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if user has Pro+ plan
    if (user.plan === 'basic') {
      return { success: false, error: 'Pro plan required for AI chatbot features' };
    }

    const chatbotName = formData.get('chatbotName') as string;
    const welcomeMessage = formData.get('welcomeMessage') as string;
    const primaryColor = formData.get('primaryColor') as string;
    const position = formData.get('position') as string;

    // Update user's chatbot settings
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          chatbotSettings: {
            name: chatbotName || 'AI Assistant',
            welcomeMessage: welcomeMessage || 'Hi! How can I help you today?',
            primaryColor: primaryColor || '#667eea',
            position: position || 'bottom-right',
            enabled: true,
            updatedAt: new Date()
          }
        }
      }
    );

    return { success: true, message: 'Chatbot settings updated successfully!' };

  } catch (error) {
    console.error('Chatbot update error:', error);
    return { 
      success: false, 
      error: 'Failed to update chatbot settings. Please try again.' 
    };
  }
}

// Get user data and chatbot settings
async function getUserData() {
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    return user;
  } catch (error) {
    console.error('Get user data error:', error);
    return null;
  }
}

export default async function ChatbotPage() {
  const user = await getUserData();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p>Please log in to access the chatbot settings.</p>
        </div>
      </div>
    );
  }

  const isProUser = user.plan === 'pro' || user.plan === 'enterprise';
  const chatbotSettings = user.chatbotSettings || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              AI Chatbot Integration
            </h1>
            <p className="text-xl text-purple-200">
              Add an intelligent AI chatbot to your affiliate websites to boost conversions
            </p>
          </div>

          {!isProUser ? (
            /* Upgrade Prompt for Basic Users */
            <div className="bg-gradient-to-r from-orange-500/20 to-red-600/20 backdrop-blur-md rounded-2xl p-8 border border-orange-500/30 text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-3xl font-bold text-white mb-4">AI Chatbot - Pro Feature</h2>
              <p className="text-xl text-orange-200 mb-6">
                Upgrade to Pro to add intelligent AI chatbots to your affiliate websites
              </p>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Smart Conversations</h3>
                  <p className="text-purple-200">AI-powered responses that understand your products and help visitors make decisions</p>
                </div>
                <div className="bg-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
                  <p className="text-purple-200">Provide instant customer support even when you're not available</p>
                </div>
                <div className="bg-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Conversion Boost</h3>
                  <p className="text-purple-200">Guide visitors through the buying process and increase your affiliate commissions</p>
                </div>
                <div className="bg-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Easy Integration</h3>
                  <p className="text-purple-200">Automatically added to all your generated websites with zero setup</p>
                </div>
              </div>
              <a
                href="/pricing"
                className="inline-block bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              >
                Upgrade to Pro - $29/month
              </a>
            </div>
          ) : (
            /* Chatbot Configuration for Pro+ Users */
            <div className="space-y-8">
              {/* Current Status */}
              <div className="bg-green-500/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">✅</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">AI Chatbot Active</h3>
                    <p className="text-green-200">Your chatbot is automatically added to all new websites</p>
                  </div>
                </div>
              </div>

              {/* Chatbot Settings Form */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Customize Your Chatbot</h2>
                
                <form action={updateChatbotAction} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="chatbotName" className="block text-sm font-medium text-purple-300 mb-2">
                        Chatbot Name
                      </label>
                      <input
                        type="text"
                        id="chatbotName"
                        name="chatbotName"
                        defaultValue={chatbotSettings.name || 'AI Assistant'}
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="AI Assistant"
                      />
                    </div>

                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-purple-300 mb-2">
                        Position
                      </label>
                      <select
                        id="position"
                        name="position"
                        defaultValue={chatbotSettings.position || 'bottom-right'}
                        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="welcomeMessage" className="block text-sm font-medium text-purple-300 mb-2">
                      Welcome Message
                    </label>
                    <textarea
                      id="welcomeMessage"
                      name="welcomeMessage"
                      rows={3}
                      defaultValue={chatbotSettings.welcomeMessage || 'Hi! How can I help you today?'}
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Hi! How can I help you today?"
                    />
                  </div>

                  <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-purple-300 mb-2">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      id="primaryColor"
                      name="primaryColor"
                      defaultValue={chatbotSettings.primaryColor || '#667eea'}
                      className="w-20 h-12 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Update Chatbot Settings
                  </button>
                </form>
              </div>

              {/* Preview */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Chatbot Preview</h2>
                <div className="bg-gray-100 rounded-lg p-6 relative min-h-[300px]">
                  <p className="text-gray-600 text-center">Website Preview Area</p>
                  
                  {/* Chatbot Widget Preview */}
                  <div 
                    className="fixed bottom-4 right-4 z-50"
                    style={{ position: 'absolute' }}
                  >
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg"
                      style={{ backgroundColor: chatbotSettings.primaryColor || '#667eea' }}
                    >
                      💬
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Back to Dashboard */}
          <div className="text-center mt-8">
            <a
              href="/dashboard"
              className="inline-flex items-center text-purple-300 hover:text-white transition-colors duration-200"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
