// FILE LOCATION: src/app/cookie-policy/page.tsx
// This file fixes the "Navbar is not defined" error for the cookie-policy page

import Navbar from '../../components/Navbar';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">What Are Cookies</h2>
            <p className="text-gray-600 mb-6">
              Cookies are small text files that are stored on your computer or mobile device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and improving our services.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Cookies</h2>
            <p className="text-gray-600 mb-4">We use cookies for the following purposes:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-6">
              <li>Authentication and security</li>
              <li>Remembering your preferences and settings</li>
              <li>Analytics and performance monitoring</li>
              <li>Improving user experience</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Types of Cookies We Use</h2>
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Essential Cookies</h3>
              <p className="text-gray-600 mb-4">
                These cookies are necessary for the website to function properly. They enable core functionality 
                such as security, network management, and accessibility.
              </p>
              
              <h3 className="text-xl font-medium text-gray-900 mb-2">Analytics Cookies</h3>
              <p className="text-gray-600 mb-4">
                These cookies help us understand how visitors interact with our website by collecting and 
                reporting information anonymously.
              </p>
              
              <h3 className="text-xl font-medium text-gray-900 mb-2">Functional Cookies</h3>
              <p className="text-gray-600 mb-4">
                These cookies enable the website to provide enhanced functionality and personalization, 
                such as remembering your login details.
              </p>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Managing Cookies</h2>
            <p className="text-gray-600 mb-6">
              You can control and manage cookies in various ways. Please note that removing or blocking cookies 
              may impact your user experience and parts of our website may no longer be fully accessible.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about this Cookie Policy, please contact us at support@affilify.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

