'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  Clock, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

// Define proper types for support methods
interface SupportMethod {
  type: string;
  icon: string;
  description: string;
  action: string;
  link: string;
  // Make contact optional since it doesn't exist on all methods
  contact?: string;
  responseTime?: string;
}

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  
  const supportCategories = [
    { id: 'general', name: 'General Questions' },
    { id: 'technical', name: 'Technical Support' },
    { id: 'billing', name: 'Billing & Payments' },
    { id: 'feature', name: 'Feature Requests' },
    { id: 'bug', name: 'Bug Reports' },
  ];
  
  const supportMethods: SupportMethod[] = [
    {
      type: 'chat',
      icon: 'MessageCircle',
      description: 'Chat with our support team in real-time',
      action: 'Start Chat',
      link: '/dashboard/support/chat',
      responseTime: 'Typically < 5 minutes'
    },
    {
      type: 'email',
      icon: 'Mail',
      description: 'Send us an email and we\'ll get back to you',
      action: 'Send Email',
      link: 'mailto:support@affilify.com',
      contact: 'support@affilify.com',
      responseTime: 'Within 24 hours'
    },
    {
      type: 'phone',
      icon: 'Phone',
      description: 'Call our dedicated support line',
      action: 'Call Now',
      link: 'tel:+18005551234',
      contact: '+1 (800) 555-1234',
      responseTime: 'Available 9am-5pm EST'
    },
    {
      type: 'ticket',
      icon: 'FileText',
      description: 'Submit a support ticket for detailed assistance',
      action: 'Submit Ticket',
      link: '#ticket-form',
      responseTime: 'Within 48 hours'
    }
  ];
  
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageCircle':
        return <MessageCircle className="h-6 w-6" />;
      case 'Mail':
        return <Mail className="h-6 w-6" />;
      case 'Phone':
        return <Phone className="h-6 w-6" />;
      case 'FileText':
        return <FileText className="h-6 w-6" />;
      case 'Clock':
        return <Clock className="h-6 w-6" />;
      default:
        return null;
    }
  };
  
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit the ticket to your backend
    setTicketSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setTicketSubmitted(false);
      const form = document.getElementById('support-ticket-form') as HTMLFormElement;
      if (form) form.reset();
    }, 3000);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-orange-800 text-white">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Support Center</h1>
            <p className="text-orange-200 mt-2">
              We're here to help you succeed with AFFILIFY
            </p>
          </div>
          <Link href="/dashboard" className="text-purple-300 hover:text-orange-200">
            ← Back to Dashboard
          </Link>
        </div>
        
        {/* Support Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {supportMethods.map((method) => (
            <div key={method.type} className="bg-black/30 p-6 rounded-xl border border-purple-500/20 hover:border-orange-500/40 transition-all">
              <div className="flex items-center mb-4 text-orange-400">
                {renderIcon(method.icon)}
                <h3 className="text-xl font-bold ml-2 capitalize">{method.type} Support</h3>
              </div>
              
              <p className="text-gray-300 mb-3">{method.description}</p>
              
              {/* Only render contact info if it exists */}
              {method.contact && (
                <div className="mb-3">
                  <p className="text-orange-400 font-semibold">{method.contact}</p>
                </div>
              )}
              
              {method.responseTime && (
                <div className="flex items-center text-gray-400 mb-4 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{method.responseTime}</span>
                </div>
              )}
              
              <Link 
                href={method.link} 
                className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors"
              >
                {method.action} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
        
        {/* Support Ticket Form */}
        <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20 max-w-3xl mx-auto" id="ticket-form">
          <h2 className="text-2xl font-bold mb-6">Submit a Support Ticket</h2>
          
          {ticketSubmitted ? (
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-6 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-green-300 mb-2">Ticket Submitted Successfully!</h3>
              <p className="text-green-200">We've received your support request and will get back to you shortly.</p>
            </div>
          ) : (
            <form id="support-ticket-form" onSubmit={handleSubmitTicket} className="space-y-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-purple-300 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  {supportCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-purple-300 mb-2">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-purple-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="Please provide as much detail as possible..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-purple-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Where should we send our response?"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label htmlFor="attachment" className="block text-sm font-medium text-purple-300 mb-2">
                  Attachment (optional)
                </label>
                <input
                  id="attachment"
                  name="attachment"
                  type="file"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md text-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-gray-400 mt-1">Max file size: 10MB</p>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
              <h3 className="text-lg font-bold mb-3 text-orange-400">How do I create my first affiliate website?</h3>
              <p className="text-gray-300">
                Navigate to the "Create Website" section in your dashboard, select a template, customize it with your affiliate links and content, then publish it with a single click.
              </p>
            </div>
            
            <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
              <h3 className="text-lg font-bold mb-3 text-orange-400">How do I connect my custom domain?</h3>
              <p className="text-gray-300">
                Go to the "Domains" section, click "Add Domain", enter your domain name, and follow the DNS configuration instructions provided.
              </p>
            </div>
            
            <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
              <h3 className="text-lg font-bold mb-3 text-orange-400">How do I upgrade my subscription?</h3>
              <p className="text-gray-300">
                Visit the "Billing" section in your account settings, select your desired plan, and complete the payment process to instantly upgrade your account.
              </p>
            </div>
            
            <div className="bg-black/30 p-6 rounded-xl border border-purple-500/20">
              <h3 className="text-lg font-bold mb-3 text-orange-400">How do I track my affiliate earnings?</h3>
              <p className="text-gray-300">
                AFFILIFY provides analytics for your website traffic, but you'll need to check your affiliate program dashboards to track actual earnings from conversions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
