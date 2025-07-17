'use client';

import { useState, useTransition } from 'react';
import { Bot, MessageSquare, Settings, Zap, Brain, Users, Globe, Shield } from 'lucide-react';

interface ChatbotConfig {
  name: string;
  personality: string;
  responseStyle: string;
  knowledgeBase: string;
  language: string;
  isActive: boolean;
}

export default function ChatbotPage() {
  const [config, setConfig] = useState<ChatbotConfig>({
    name: 'AFFILIFY Assistant',
    personality: 'professional',
    responseStyle: 'helpful',
    knowledgeBase: 'general',
    language: 'english',
    isActive: true,
  });
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  // Fixed API call function (separate from form action)
  const updateChatbotConfig = async (formData: FormData): Promise<void> => {
    const chatbotName = formData.get('chatbotName') as string;
    const personality = formData.get('personality') as string;
    const responseStyle = formData.get('responseStyle') as string;
    const knowledgeBase = formData.get('knowledgeBase') as string;
    const language = formData.get('language') as string;
    const isActive = formData.get('isActive') === 'on';

    try {
      const response = await fetch('/api/chatbot/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: chatbotName,
          personality,
          responseStyle,
          knowledgeBase,
          language,
          isActive,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setConfig({
          name: chatbotName,
          personality,
          responseStyle,
          knowledgeBase,
          language,
          isActive,
        });
        setMessage('Chatbot configuration updated successfully!');
        setError('');
      } else {
        setError(result.error || 'Failed to update chatbot configuration');
        setMessage('');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setMessage('');
    }
  };

  // Fixed form action function to return void
  const updateChatbotAction = (formData: FormData): void => {
    startTransition(() => {
      updateChatbotConfig(formData);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <Bot className="h-12 w-12 text-purple-300" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AI Chatbot Assistant
          </h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Enhance your website with an intelligent AI chatbot that provides instant customer support and engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chatbot Configuration */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="h-6 w-6 text-purple-300" />
              <h2 className="text-2xl font-bold text-white">Customize Your Chatbot</h2>
            </div>
            
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
                    defaultValue={config.name}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter chatbot name"
                  />
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-purple-300 mb-2">
                    Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    defaultValue={config.language}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="italian">Italian</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="personality" className="block text-sm font-medium text-purple-300 mb-2">
                    Personality
                  </label>
                  <select
                    id="personality"
                    name="personality"
                    defaultValue={config.personality}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="enthusiastic">Enthusiastic</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="responseStyle" className="block text-sm font-medium text-purple-300 mb-2">
                    Response Style
                  </label>
                  <select
                    id="responseStyle"
                    name="responseStyle"
                    defaultValue={config.responseStyle}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="helpful">Helpful</option>
                    <option value="concise">Concise</option>
                    <option value="detailed">Detailed</option>
                    <option value="creative">Creative</option>
                    <option value="analytical">Analytical</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="knowledgeBase" className="block text-sm font-medium text-purple-300 mb-2">
                  Knowledge Base
                </label>
                <select
                  id="knowledgeBase"
                  name="knowledgeBase"
                  defaultValue={config.knowledgeBase}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="general">General Knowledge</option>
                  <option value="business">Business & Marketing</option>
                  <option value="technical">Technical Support</option>
                  <option value="sales">Sales & Customer Service</option>
                  <option value="custom">Custom Training Data</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={config.isActive}
                  className="w-5 h-5 text-purple-600 bg-white/5 border border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-purple-300">
                  Enable chatbot on website
                </label>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Settings className="h-5 w-5" />
                    <span>Update Configuration</span>
                  </>
                )}
              </button>
            </form>

            {/* Success/Error Messages */}
            {message && (
              <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-300 text-sm">{message}</p>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Chatbot Preview */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-center space-x-3 mb-6">
              <MessageSquare className="h-6 w-6 text-blue-300" />
              <h2 className="text-2xl font-bold text-white">Chatbot Preview</h2>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 h-96 flex flex-col">
              <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-white/10">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{config.name}</h3>
                  <p className="text-sm text-purple-300">
                    {config.isActive ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 max-w-xs">
                    <p className="text-white text-sm">
                      Hello! I'm {config.name}. How can I help you today?
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-purple-600 rounded-lg p-3 max-w-xs">
                    <p className="text-white text-sm">
                      Can you tell me about your services?
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 max-w-xs">
                    <p className="text-white text-sm">
                      I'd be happy to help! We offer AI-powered website creation, analytics, and optimization services. What specific area interests you?
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    disabled
                  />
                  <button
                    disabled
                    className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <MessageSquare className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="h-8 w-8 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">AI-Powered</h3>
            </div>
            <p className="text-purple-200 text-sm">
              Advanced natural language processing for intelligent conversations
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="h-8 w-8 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Instant Response</h3>
            </div>
            <p className="text-purple-200 text-sm">
              Provide immediate answers to customer questions 24/7
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-8 w-8 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Multi-Language</h3>
            </div>
            <p className="text-purple-200 text-sm">
              Support customers in multiple languages automatically
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-8 w-8 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Secure & Private</h3>
            </div>
            <p className="text-purple-200 text-sm">
              Enterprise-grade security with data privacy protection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
