// GEMINI-POWERED AI CHATBOT SYSTEM FOR PRO USERS
// Integrates Google Gemini API for intelligent customer support

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Chatbot configuration page for Pro+ users
export default async function ChatbotConfigPage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
  const token = cookies().get('auth-token')?.value;
  
  let userInfo = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const client = await connectToDatabase();
      const db = client.db('affilify');
      
      const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
      if (user) {
        const userPlan = user.plan || 'basic';
        userInfo = { user, plan: userPlan };
      }
    } catch (error) {
      redirect('/login');
    }
  }

  if (!userInfo || userInfo.plan === 'basic') {
    redirect('/pricing?feature=chatbot');
  }

  const errorMessage = searchParams?.error;
  const successMessage = searchParams?.success;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-orange-800 text-white">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">AI Chatbot Integration</h1>
            <p className="text-orange-200 mt-2">
              Add intelligent customer support to your affiliate websites
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
              {successMessage === 'chatbot_configured' && 'Chatbot has been successfully configured for your websites!'}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-300">
              {errorMessage === 'configuration_failed' && 'Failed to configure chatbot. Please try again.'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chatbot Features */}
          <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-6">AI Chatbot Features</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🤖</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Intelligent Responses</h3>
                  <p className="text-gray-300">
                    Powered by Google Gemini AI to provide helpful, contextual responses about your products.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="text-2xl">💬</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">24/7 Customer Support</h3>
                  <p className="text-gray-300">
                    Automatically answer customer questions, provide product information, and guide users to purchase.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="text-2xl">📊</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Conversation Analytics</h3>
                  <p className="text-gray-300">
                    Track chatbot interactions, common questions, and conversion assistance metrics.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="text-2xl">🎨</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Customizable Appearance</h3>
                  <p className="text-gray-300">
                    Match your website's branding with customizable colors, position, and welcome messages.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="text-2xl">🔗</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Easy Integration</h3>
                  <p className="text-gray-300">
                    Automatically added to all your generated websites with zero technical setup required.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-6">Configure Your Chatbot</h2>
            
            <form action={configureChatbot} className="space-y-6">
              <div>
                <label htmlFor="chatbotName" className="block text-sm font-medium text-purple-300 mb-2">
                  Chatbot Name
                </label>
                <input
                  id="chatbotName"
                  name="chatbotName"
                  type="text"
                  defaultValue="AI Assistant"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Product Helper, Sales Assistant"
                />
              </div>

              <div>
                <label htmlFor="welcomeMessage" className="block text-sm font-medium text-purple-300 mb-2">
                  Welcome Message
                </label>
                <textarea
                  id="welcomeMessage"
                  name="welcomeMessage"
                  rows={3}
                  defaultValue="Hi! I'm here to help you learn more about our products. What questions do you have?"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="chatbotColor" className="block text-sm font-medium text-purple-300 mb-2">
                  Chatbot Color Theme
                </label>
                <select
                  id="chatbotColor"
                  name="chatbotColor"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="blue">Blue (Professional)</option>
                  <option value="green">Green (Friendly)</option>
                  <option value="purple">Purple (Creative)</option>
                  <option value="orange">Orange (Energetic)</option>
                  <option value="red">Red (Bold)</option>
                </select>
              </div>

              <div>
                <label htmlFor="chatbotPosition" className="block text-sm font-medium text-purple-300 mb-2">
                  Position on Website
                </label>
                <select
                  id="chatbotPosition"
                  name="chatbotPosition"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              <div>
                <label htmlFor="productContext" className="block text-sm font-medium text-purple-300 mb-2">
                  Product Context (Optional)
                </label>
                <textarea
                  id="productContext"
                  name="productContext"
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Provide context about your products to help the AI give better responses..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  id="enableChatbot"
                  name="enableChatbot"
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="enableChatbot" className="text-sm text-gray-300">
                  Enable chatbot on all my websites
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
              >
                Configure AI Chatbot
              </button>
            </form>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-12 bg-black/30 p-8 rounded-xl border border-purple-500/20">
          <h2 className="text-2xl font-bold mb-6">Chatbot Preview</h2>
          <div className="bg-gray-800 p-6 rounded-lg relative">
            <p className="text-gray-400 mb-4">This is how your chatbot will appear on your websites:</p>
            
            {/* Mock website preview */}
            <div className="bg-white text-black p-6 rounded-lg relative min-h-[300px]">
              <h3 className="text-xl font-bold mb-4">Your Affiliate Website</h3>
              <p className="text-gray-600 mb-4">
                This is a preview of how your website will look with the AI chatbot integrated.
              </p>
              
              {/* Mock chatbot widget */}
              <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-xs">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                    🤖
                  </div>
                  <span className="font-semibold">AI Assistant</span>
                </div>
                <p className="text-sm">
                  Hi! I'm here to help you learn more about our products. What questions do you have?
                </p>
                <div className="mt-3 flex space-x-2">
                  <button className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded text-xs">
                    Product Info
                  </button>
                  <button className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded text-xs">
                    Pricing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Server action to configure chatbot
async function configureChatbot(formData: FormData) {
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
    if (!user || user.plan === 'basic') {
      redirect('/pricing?feature=chatbot');
    }

    const chatbotConfig = {
      name: formData.get('chatbotName') as string,
      welcomeMessage: formData.get('welcomeMessage') as string,
      color: formData.get('chatbotColor') as string,
      position: formData.get('chatbotPosition') as string,
      productContext: formData.get('productContext') as string,
      enabled: formData.get('enableChatbot') === 'on',
      updatedAt: new Date()
    };

    // Update user's chatbot configuration
    await db.collection('users').updateOne(
      { _id: new ObjectId(decoded.userId) },
      { 
        $set: { 
          chatbotConfig,
          'features.chatbot': true
        } 
      }
    );

    redirect('/dashboard/chatbot?success=chatbot_configured');
  } catch (error) {
    console.error("Failed to configure chatbot:", error);
    redirect('/dashboard/chatbot?error=configuration_failed');
  }
}

// Chatbot API endpoint (separate file: /api/chatbot/route.ts)
export const ChatbotAPI = `
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { message, websiteId, productContext } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create context-aware prompt
    const systemPrompt = \`You are a helpful AI assistant for an affiliate marketing website. 
Your role is to help visitors learn about products and guide them toward making a purchase.

Product Context: \${productContext || 'General affiliate products'}

Guidelines:
- Be friendly, helpful, and professional
- Focus on product benefits and value
- Answer questions about features, pricing, and usage
- Encourage visitors to click affiliate links when appropriate
- If you don't know something specific, be honest but still helpful
- Keep responses concise but informative
- Always maintain a positive, sales-oriented tone

User Question: \${message}\`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      response: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
`;

// Chatbot widget JavaScript (to be injected into generated websites)
export const ChatbotWidget = \`
<!-- AI Chatbot Widget -->
<div id="ai-chatbot-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
  <div id="chatbot-button" style="
    width: 60px; 
    height: 60px; 
    background: #3B82F6; 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    cursor: pointer; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
  ">
    <span style="font-size: 24px;">🤖</span>
  </div>
  
  <div id="chatbot-window" style="
    position: absolute;
    bottom: 70px;
    right: 0;
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    display: none;
    flex-direction: column;
    overflow: hidden;
  ">
    <!-- Chatbot Header -->
    <div style="background: #3B82F6; color: white; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>🤖</span>
        <span style="font-weight: bold;">AI Assistant</span>
      </div>
      <button id="close-chatbot" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
    </div>
    
    <!-- Chat Messages -->
    <div id="chat-messages" style="flex: 1; padding: 16px; overflow-y: auto; background: #f9fafb;">
      <div style="background: #e5e7eb; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
        <p style="margin: 0; color: #374151;">Hi! I'm here to help you learn more about our products. What questions do you have?</p>
      </div>
    </div>
    
    <!-- Chat Input -->
    <div style="padding: 16px; border-top: 1px solid #e5e7eb; background: white;">
      <div style="display: flex; gap: 8px;">
        <input 
          id="chat-input" 
          type="text" 
          placeholder="Type your message..." 
          style="flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; outline: none;"
        />
        <button 
          id="send-message" 
          style="background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</div>

<script>
(function() {
  const chatbotButton = document.getElementById('chatbot-button');
  const chatbotWindow = document.getElementById('chatbot-window');
  const closeChatbot = document.getElementById('close-chatbot');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-message');
  const chatMessages = document.getElementById('chat-messages');
  
  let isOpen = false;
  
  chatbotButton.addEventListener('click', () => {
    isOpen = !isOpen;
    chatbotWindow.style.display = isOpen ? 'flex' : 'none';
  });
  
  closeChatbot.addEventListener('click', () => {
    isOpen = false;
    chatbotWindow.style.display = 'none';
  });
  
  function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = \`
      background: \${isUser ? '#3B82F6' : '#e5e7eb'};
      color: \${isUser ? 'white' : '#374151'};
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      margin-left: \${isUser ? '20px' : '0'};
      margin-right: \${isUser ? '0' : '20px'};
    \`;
    messageDiv.innerHTML = \`<p style="margin: 0;">\${message}</p>\`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    chatInput.value = '';
    
    // Add typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.style.cssText = 'background: #e5e7eb; padding: 12px; border-radius: 8px; margin-bottom: 12px; color: #6b7280;';
    typingDiv.innerHTML = '<p style="margin: 0;">AI is typing...</p>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          websiteId: window.location.hostname,
          productContext: document.querySelector('meta[name="product-context"]')?.content || ''
        })
      });
      
      const data = await response.json();
      
      // Remove typing indicator
      document.getElementById('typing-indicator')?.remove();
      
      if (data.response) {
        addMessage(data.response);
      } else {
        addMessage('Sorry, I encountered an error. Please try again.');
      }
    } catch (error) {
      document.getElementById('typing-indicator')?.remove();
      addMessage('Sorry, I'm having trouble connecting. Please try again later.');
    }
  }
  
  sendButton.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
</script>
\`;
