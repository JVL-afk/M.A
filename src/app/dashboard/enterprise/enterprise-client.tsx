'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addTeamMember, removeTeamMember, generateApiKey, deleteApiKey, updateWhiteLabel } from './enterprise-actions';

// Define the interface for whiteLabelSettings
interface WhiteLabelSettings {
  companyName?: string;
  companyLogo?: string;
  primaryColor?: string;
  accentColor?: string;
  footerText?: string;
}

// Enterprise Client Component
export default function EnterpriseClient({ 
  userInfo,
  activeTab,
  errorMessage,
  successMessage,
  teamMembers,
  apiKeys,
  whiteLabelSettings
}: { 
  userInfo: any;
  activeTab: string;
  errorMessage?: string;
  successMessage?: string;
  teamMembers: any[];
  apiKeys: any[];
  whiteLabelSettings: WhiteLabelSettings;
}) {
  const [isPending, setIsPending] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-orange-800 text-white">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Enterprise Dashboard</h1>
            <p className="text-orange-200 mt-2">
              Advanced features for teams and organizations
            </p>
          </div>
          <Link href="/dashboard" className="text-purple-300 hover:text-orange-200">
            ← Back to Dashboard
          </Link>
        </div>
      
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-500 rounded-lg">
            <p className="text-green-300">{successMessage}</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-300">{errorMessage}</p>
          </div>
        )}
      
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-black/30 p-1 rounded-lg">
          <Link
            href="/dashboard/enterprise?tab=team"
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'team'
                ? 'bg-orange-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Team Collaboration
          </Link>
          <Link
            href="/dashboard/enterprise?tab=api"
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'api'
                ? 'bg-orange-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            API Access
          </Link>
          <Link
            href="/dashboard/enterprise?tab=white-label"
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'white-label'
                ? 'bg-orange-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            White-Label
          </Link>
        </div>
      
        {/* Team Collaboration Tab */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Team Member */}
            <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
              <h2 className="text-2xl font-bold mb-6">Add Team Member</h2>
              
              <form action={async (formData) => {
                setIsPending(true);
                await addTeamMember(formData);
                setIsPending(false);
              }} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-purple-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="colleague@company.com"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-purple-300 mb-2">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="permissions" className="block text-sm font-medium text-purple-300 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" name="permissions" value="create_websites" className="mr-2" defaultChecked />
                      <span className="text-sm">Create websites</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="permissions" value="manage_domains" className="mr-2" />
                      <span className="text-sm">Manage custom domains</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="permissions" value="view_analytics" className="mr-2" defaultChecked />
                      <span className="text-sm">View analytics</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="permissions" value="manage_team" className="mr-2" />
                      <span className="text-sm">Manage team members</span>
                    </label>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
                  disabled={isPending}
                >
                  {isPending ? 'Sending...' : 'Send Invitation'}
                </button>
              </form>
            </div>
            
            {/* Team Members List */}
            <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
              <h2 className="text-2xl font-bold mb-6">Team Members ({teamMembers.length})</h2>
              
              {teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-gray-400 mb-4">No team members yet</p>
                  <p className="text-sm text-gray-500">
                    Invite your team to collaborate on affiliate websites.
                  </p>
                </div>
              ) : (
                teamMembers.map((member) => (
                  <div key={member._id.toString()} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{member.email}</h3>
                        <p className="text-sm text-gray-400 capitalize">{member.role}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {new Date(member.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          member.status === 'active'
                            ? 'bg-green-900 text-green-300'
                            : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {member.status}
                        </span>
                      </div>
                    </div>
                    <form action={async (formData) => {
                      if (confirm('Remove this team member? This action cannot be undone.')) {
                        setIsPending(true);
                        await removeTeamMember(formData);
                        setIsPending(false);
                      }
                    }} className="inline">
                      <input type="hidden" name="memberId" value={member._id.toString()} />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors mt-3"
                        disabled={isPending}
                      >
                        {isPending ? 'Removing...' : 'Remove'}
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* API Access Tab */}
        {activeTab === 'api' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Generate API Key */}
            <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
              <h2 className="text-2xl font-bold mb-6">Generate API Key</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">API Capabilities</h3>
                <div className="space-y-3">
                  <span className="text-green-400">•</span> Generate affiliate websites programmatically
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">•</span> Access analytics data via REST API
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">•</span> Manage custom domains programmatically
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">•</span> Integrate AFFILIFY into your existing tools
                  </div>
                </div>
              </div>
              
              <form action={async (formData) => {
                setIsPending(true);
                await generateApiKey(formData);
                setIsPending(false);
              }} className="space-y-6">
                <div>
                  <label htmlFor="keyName" className="block text-sm font-medium text-purple-300 mb-2">
                    API Key Name
                  </label>
                  <input
                    id="keyName"
                    name="keyName"
                    type="text"
                    placeholder="My Integration Key"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="permissions" className="block text-sm font-medium text-purple-300 mb-2">
                    API Permissions
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" name="apiPermissions" value="websites.create" className="mr-2" defaultChecked />
                      <span className="text-sm">Create websites</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="apiPermissions" value="websites.read" className="mr-2" defaultChecked />
                      <span className="text-sm">Read websites</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="apiPermissions" value="analytics.read" className="mr-2" defaultChecked />
                      <span className="text-sm">Read analytics</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="apiPermissions" value="domains.manage" className="mr-2" />
                      <span className="text-sm">Manage domains</span>
                    </label>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
                  disabled={apiKeys.length >= 5 || isPending}
                >
                  {isPending ? 'Generating...' : (apiKeys.length >= 5 ? 'Maximum Keys Reached' : 'Generate API Key')}
                </button>
              </form>
            </div>
            
            {/* API Keys List */}
            <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
              <h2 className="text-2xl font-bold mb-6">Your API Keys ({apiKeys.length}/5)</h2>
              
              {apiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🔑</div>
                  <p className="text-gray-400 mb-4">No API keys yet</p>
                  <p className="text-sm text-gray-500">
                    Generate your first API key to start integrating with AFFILIFY.
                  </p>
                </div>
              ) : (
                apiKeys.map((apiKey) => (
                  <div key={apiKey._id.toString()} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{apiKey.name}</h3>
                        <p className="text-sm text-gray-400">
                          Created {new Date(apiKey.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last used: {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never used'}
                        </p>
                      </div>
                    </div>
                    <form action={async (formData) => {
                      if (confirm('Delete this API key? This action cannot be undone.')) {
                        setIsPending(true);
                        await deleteApiKey(formData);
                        setIsPending(false);
                      }
                    }} className="inline">
                      <input type="hidden" name="keyId" value={apiKey._id.toString()} />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        disabled={isPending}
                      >
                        {isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    </form>
                  </div>
                ))
              )}
              
              {apiKeys.length > 0 && (
                <div className="bg-gray-900 p-3 rounded font-mono text-sm mb-3">
                  <span className="text-gray-400">Key: </span>
                  <span className="text-green-400">{apiKeys[0]?.key.substring(0, 20)}...</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(apiKeys[0].key)}
                    className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                  >
                    Copy
                  </button>
                </div>
              )}
              
              {apiKeys.length > 0 && apiKeys[0].permissions && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {apiKeys[0].permissions.map((permission: string) => (
                      <span key={permission} className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      
        {/* White-Label Tab */}
        {activeTab === 'white-label' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
              <h2 className="text-2xl font-bold mb-6">White-Label Branding</h2>
              
              <form action={async (formData) => {
                setIsPending(true);
                await updateWhiteLabel(formData);
                setIsPending(false);
              }} className="space-y-8">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-purple-300 mb-2">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    defaultValue={whiteLabelSettings?.companyName || ''}
                    placeholder="Your Company Name"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="companyLogo" className="block text-sm font-medium text-purple-300 mb-2">
                    Logo URL
                  </label>
                  <input
                    id="companyLogo"
                    name="companyLogo"
                    type="url"
                    defaultValue={whiteLabelSettings?.companyLogo || ''}
                    placeholder="https://your-company.com/logo.png"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-purple-300 mb-2">
                      Primary Color
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        id="primaryColor"
                        name="primaryColor"
                        defaultValue={whiteLabelSettings?.primaryColor || '#6d28d9'}
                        className="h-10 w-10 border-0 p-0 mr-2"
                      />
                      <input
                        type="text"
                        aria-labelledby="primaryColor"
                        name="primaryColorHex"
                        defaultValue={whiteLabelSettings?.primaryColor || '#6d28d9'}
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="accentColor" className="block text-sm font-medium text-purple-300 mb-2">
                      Accent Color
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        id="accentColor"
                        name="accentColor"
                        defaultValue={whiteLabelSettings?.accentColor || '#ea580c'}
                        className="h-10 w-10 border-0 p-0 mr-2"
                      />
                      <input
                        type="text"
                        aria-labelledby="accentColor"
                        name="accentColorHex"
                        defaultValue={whiteLabelSettings?.accentColor || '#ea580c'}
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="footerText" className="block text-sm font-medium text-purple-300 mb-2">
                    Footer Text
                  </label>
                  <input
                    id="footerText"
                    name="footerText"
                    type="text"
                    defaultValue={whiteLabelSettings?.footerText || ''}
                    placeholder="© 2025 Your Company Name. All rights reserved."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
                    disabled={isPending}
                  >
                    {isPending ? 'Saving...' : 'Save White-Label Settings'}
                  </button>
                </div>
              </form>
              
              <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-4">
                    <div className="flex items-center">
                      {whiteLabelSettings?.companyLogo ? (
                        <img src={whiteLabelSettings.companyLogo} alt="Logo" className="h-8 mr-3" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-700 rounded-full mr-3"></div>
                      )}
                      <span className="font-bold">{whiteLabelSettings?.companyName || 'Your Company'}</span>
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-4 h-4 rounded-full bg-gray-700"></div>
                      <div className="w-4 h-4 rounded-full bg-gray-700"></div>
                      <div className="w-4 h-4 rounded-full bg-gray-700"></div>
                    </div>
                  </div>
                  <div className="h-32 bg-gray-800 rounded-lg mb-4"></div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800">
                    <div className="text-xs text-gray-500">{whiteLabelSettings?.footerText || '© 2025 Your Company. All rights reserved.'}</div>
                    <div className="flex space-x-2">
                      <div className="w-4 h-4 rounded-full bg-gray-700"></div>
                      <div className="w-4 h-4 rounded-full bg-gray-700"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
