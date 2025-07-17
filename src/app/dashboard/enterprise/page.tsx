'use client';

import { useState, useEffect } from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

// Enterprise Dashboard Page
export default async function EnterprisePage({ searchParams }: { searchParams: { tab?: string; error?: string; success?: string } }) {
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
  
  if (!userInfo || userInfo.plan !== 'enterprise') {
    redirect('/pricing?feature=enterprise');
  }
  
  const activeTab = searchParams?.tab || 'team';
  const errorMessage = searchParams?.error;
  const successMessage = searchParams?.success;
  
  // Get team members, API keys, and white-label settings
  const client = await connectToDatabase();
  const db = client.db('affilify');
  
  const teamMembers = await db.collection('team_members')
    .find({ organizationId: userInfo.user._id })
    .sort({ createdAt: -1 })
    .toArray();
  
  const apiKeys = await db.collection('api_keys')
    .find({ userId: userInfo.user._id })
    .sort({ createdAt: -1 })
    .toArray();
  
  // Define the interface for whiteLabelSettings
  interface WhiteLabelSettings {
    companyName?: string;
    companyLogo?: string;
    primaryColor?: string;
    accentColor?: string;
    footerText?: string;
  }
  
  // Initialize with empty object and proper type
  const whiteLabelSettings: WhiteLabelSettings = await db.collection('white_label_settings')
    .findOne({ userId: userInfo.user._id }) || {};
  
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
              
              <form action={addTeamMember} className="space-y-6">
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
                >
                  Send Invitation
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
                    <form action={removeTeamMember} className="inline">
                      <input type="hidden" name="memberId" value={member._id.toString()} />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors mt-3"
                        onClick={(e) => {
                          if (!confirm('Remove this team member? This action cannot be undone.')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Remove
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
              
              <form action={generateApiKey} className="space-y-6">
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
                  disabled={apiKeys.length >= 5}
                >
                  {apiKeys.length >= 5 ? 'Maximum Keys Reached' : 'Generate API Key'}
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
                    <form action={deleteApiKey} className="inline">
                      <input type="hidden" name="keyId" value={apiKey._id.toString()} />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        onClick={(e) => {
                          if (!confirm('Delete this API key? This action cannot be undone.')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                ))
              )}
              
              <div className="bg-gray-900 p-3 rounded font-mono text-sm mb-3">
                <span className="text-gray-400">Key: </span>
                <span className="text-green-400">{apiKey?.key.substring(0, 20)}...</span>
                <button
                  onClick={() => navigator.clipboard.writeText(apiKey.key)}
                  className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                >
                  Copy
                </button>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {apiKey.permissions?.map((permission: string) => (
                    <span key={permission} className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      
        {/* White-Label Tab */}
        {activeTab === 'white-label' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/30 p-8 rounded-xl border border-purple-500/20">
              <h2 className="text-2xl font-bold mb-6">White-Label Branding</h2>
              
              <form action={updateWhiteLabel} className="space-y-8">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-purple-300 mb-2">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    defaultValue={whiteLabelSettings.companyName || ''}
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
                    defaultValue={whiteLabelSettings.companyLogo || ''}
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
                        defaultValue={whiteLabelSettings.primaryColor || '#6d28d9'}
                        className="h-10 w-10 border-0 p-0 mr-2"
                      />
                      <input
                        type="text"
                        aria-labelledby="primaryColor"
                        name="primaryColorHex"
                        defaultValue={whiteLabelSettings.primaryColor || '#6d28d9'}
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
                        defaultValue={whiteLabelSettings.accentColor || '#ea580c'}
                        className="h-10 w-10 border-0 p-0 mr-2"
                      />
                      <input
                        type="text"
                        aria-labelledby="accentColor"
                        name="accentColorHex"
                        defaultValue={whiteLabelSettings.accentColor || '#ea580c'}
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
                    defaultValue={whiteLabelSettings.footerText || ''}
                    placeholder="© 2025 Your Company Name. All rights reserved."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Save White-Label Settings
                  </button>
                </div>
              </form>
              
              <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-4">
                    <div className="flex items-center">
                      {whiteLabelSettings.companyLogo ? (
                        <img src={whiteLabelSettings.companyLogo} alt="Logo" className="h-8 mr-3" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-700 rounded-full mr-3"></div>
                      )}
                      <span className="font-bold">{whiteLabelSettings.companyName || 'Your Company'}</span>
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-4 h-4 rounded-full bg-gray-700"></div>
                      <div className="w-4 h-4 rounded-full bg-gray-700"></div>
                      <div className="w-4 h-4 rounded-full bg-gray-700"></div>
                    </div>
                  </div>
                  <div className="h-32 bg-gray-800 rounded-lg mb-4"></div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800">
                    <div className="text-xs text-gray-500">{whiteLabelSettings.footerText || '© 2025 Your Company. All rights reserved.'}</div>
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

// Server Actions
async function addTeamMember(formData: FormData) {
  'use server';
  
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;
  const permissions = formData.getAll('permissions') as string[];
  
  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    // Check if email already exists
    const existingMember = await db.collection('team_members').findOne({ email });
    if (existingMember) {
      return { success: false, error: 'This email is already a team member.' };
    }
    
    // Add team member
    await db.collection('team_members').insertOne({
      email,
      role,
      permissions,
      organizationId: new ObjectId(decoded.userId),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // TODO: Send invitation email
    
    return { success: true, message: 'Team member has been successfully added!' };
  } catch (error) {
    console.error('ADD_TEAM_MEMBER_ERROR:', error);
    return { success: false, error: 'Failed to add team member. Please try again.' };
  }
}

async function removeTeamMember(formData: FormData) {
  'use server';
  
  const memberId = formData.get('memberId') as string;
  
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    // Remove team member
    await db.collection('team_members').deleteOne({
      _id: new ObjectId(memberId),
      organizationId: new ObjectId(decoded.userId),
    });
    
    return { success: true, message: 'Team member has been removed.' };
  } catch (error) {
    console.error('REMOVE_TEAM_MEMBER_ERROR:', error);
    return { success: false, error: 'Failed to remove team member. Please try again.' };
  }
}

async function generateApiKey(formData: FormData) {
  'use server';
  
  const keyName = formData.get('keyName') as string;
  const permissions = formData.getAll('apiPermissions') as string[];
  
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    // Check API key limit
    const keyCount = await db.collection('api_keys').countDocuments({
      userId: new ObjectId(decoded.userId),
    });
    
    if (keyCount >= 5) {
      return { success: false, error: 'Maximum number of API keys reached (5).' };
    }
    
    // Generate API key
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Save API key
    await db.collection('api_keys').insertOne({
      name: keyName,
      key: apiKey,
      permissions,
      userId: new ObjectId(decoded.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return { success: true, message: 'API key has been generated successfully!', apiKey };
  } catch (error) {
    console.error('GENERATE_API_KEY_ERROR:', error);
    return { success: false, error: 'Operation failed. Please try again.' };
  }
}

async function deleteApiKey(formData: FormData) {
  'use server';
  
  const keyId = formData.get('keyId') as string;
  
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    // Delete API key
    await db.collection('api_keys').deleteOne({
      _id: new ObjectId(keyId),
      userId: new ObjectId(decoded.userId),
    });
    
    return { success: true, message: 'API key has been deleted.' };
  } catch (error) {
    console.error('DELETE_API_KEY_ERROR:', error);
    return { success: false, error: 'Failed to delete API key. Please try again.' };
  }
}

async function updateWhiteLabel(formData: FormData) {
  'use server';
  
  const companyName = formData.get('companyName') as string;
  const companyLogo = formData.get('companyLogo') as string;
  const primaryColor = formData.get('primaryColor') as string;
  const accentColor = formData.get('accentColor') as string;
  const footerText = formData.get('footerText') as string;
  
  try {
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const client = await connectToDatabase();
    const db = client.db('affilify');
    
    // Update or create white-label settings
    await db.collection('white_label_settings').updateOne(
      { userId: new ObjectId(decoded.userId) },
      {
        $set: {
          companyName,
          companyLogo,
          primaryColor,
          accentColor,
          footerText,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    
    return { success: true, message: 'White-label settings have been updated!' };
  } catch (error) {
    console.error('UPDATE_WHITE_LABEL_ERROR:', error);
    return { success: false, error: 'Failed to update white-label settings. Please try again.' };
  }
}

function redirect(path: string) {
  return {
    redirect: {
      destination: path,
      permanent: false,
    },
  };
}

