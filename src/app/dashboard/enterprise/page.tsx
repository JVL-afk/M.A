// ENTERPRISE FEATURES SYSTEM
// Team collaboration, white-label branding, and API access for Enterprise users

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

// Enterprise Dashboard Page
export default async function EnterprisePage({ searchParams }: { searchParams?: { tab?: string; error?: string; success?: string } }) {
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

  const whiteLabelSettings = await db.collection('white_label_settings')
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
            <p className="text-green-300">
              {successMessage === 'member_added' && 'Team member has been successfully added!'}
              {successMessage === 'member_removed' && 'Team member has been removed.'}
              {successMessage === 'api_key_generated' && 'API key has been generated successfully!'}
              {successMessage === 'api_key_deleted' && 'API key has been deleted.'}
              {successMessage === 'white_label_updated' && 'White-label settings have been updated!'}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-300">
              {errorMessage === 'member_exists' && 'This email is already a team member.'}
              {errorMessage === 'invalid_email' && 'Please enter a valid email address.'}
              {errorMessage === 'api_limit_reached' && 'Maximum number of API keys reached (5).'}
              {errorMessage === 'operation_failed' && 'Operation failed. Please try again.'}
            </p>
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
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member._id.toString()} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
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
                          <form action={removeTeamMember} className="inline">
                            <input type="hidden" name="memberId" value={member._id.toString()} />
                            <button
                              type="submit"
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                              onClick={(e) => {
                                if (!confirm('Remove this team member?')) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-400">Permissions:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.permissions?.map((permission: string) => (
                            <span key={permission} className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded">
                              {permission.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span>Generate affiliate websites programmatically</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span>Access analytics data via REST API</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span>Manage custom domains programmatically</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span>Integrate AFFILIFY into your existing tools</span>
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
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey._id.toString()} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{apiKey.name}</h3>
                          <p className="text-sm text-gray-400">
                            Created {new Date(apiKey.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Last used: {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
                          </p>
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
                      
                      <div className="bg-gray-900 p-3 rounded font-mono text-sm mb-3">
                        <span className="text-gray-400">Key: </span>
                        <span className="text-green-400">{apiKey.key.substring(0, 20)}...</span>
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
                  ))}
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
              
              <form action={updateWhiteLabel} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      placeholder="https://yourcompany.com/logo.png"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-purple-300 mb-2">
                      Primary Color
                    </label>
                    <input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      defaultValue={whiteLabelSettings.primaryColor || '#F59E0B'}
                      className="w-full h-12 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="secondaryColor" className="block text-sm font-medium text-purple-300 mb-2">
                      Secondary Color
                    </label>
                    <input
                      id="secondaryColor"
                      name="secondaryColor"
                      type="color"
                      defaultValue={whiteLabelSettings.secondaryColor || '#8B5CF6'}
                      className="w-full h-12 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="customDomain" className="block text-sm font-medium text-purple-300 mb-2">
                    Custom Dashboard Domain (Optional)
                  </label>
                  <input
                    id="customDomain"
                    name="customDomain"
                    type="text"
                    defaultValue={whiteLabelSettings.customDomain || ''}
                    placeholder="dashboard.yourcompany.com"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Host the AFFILIFY dashboard under your own domain
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Branding Options</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        name="removeBranding" 
                        defaultChecked={whiteLabelSettings.removeBranding || false}
                        className="mr-3" 
                      />
                      <span className="text-sm">Remove "Powered by AFFILIFY" from generated websites</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        name="customFooter" 
                        defaultChecked={whiteLabelSettings.customFooter || false}
                        className="mr-3" 
                      />
                      <span className="text-sm">Add custom footer to generated websites</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        name="hideAffiliateLinks" 
                        defaultChecked={whiteLabelSettings.hideAffiliateLinks || false}
                        className="mr-3" 
                      />
                      <span className="text-sm">Hide affiliate link references in website source</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors"
                >
                  Update White-Label Settings
                </button>
              </form>

              {/* Preview */}
              <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <div className="bg-white text-black p-4 rounded">
                  <div className="flex items-center space-x-3 mb-4">
                    {whiteLabelSettings.companyLogo && (
                      <img src={whiteLabelSettings.companyLogo} alt="Logo" className="h-8 w-8 object-contain" />
                    )}
                    <h4 className="font-bold" style={{ color: whiteLabelSettings.primaryColor || '#F59E0B' }}>
                      {whiteLabelSettings.companyName || 'Your Company'} Dashboard
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    This is how your white-labeled dashboard will appear to your clients.
                  </p>
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
  
  const token = cookies().get('auth-token')?.value;
  if (!token) redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user || user.plan !== 'enterprise') {
      redirect('/pricing?feature=enterprise');
    }

    const email = (formData.get('email') as string).toLowerCase().trim();
    const role = formData.get('role') as string;
    const permissions = formData.getAll('permissions') as string[];

    // Check if member already exists
    const existingMember = await db.collection('team_members').findOne({
      organizationId: user._id,
      email
    });

    if (existingMember) {
      redirect('/dashboard/enterprise?tab=team&error=member_exists');
    }

    await db.collection('team_members').insertOne({
      organizationId: user._id,
      email,
      role,
      permissions,
      status: 'pending',
      createdAt: new Date()
    });

    redirect('/dashboard/enterprise?tab=team&success=member_added');
  } catch (error) {
    redirect('/dashboard/enterprise?tab=team&error=operation_failed');
  }
}

async function removeTeamMember(formData: FormData) {
  'use server';
  
  const token = cookies().get('auth-token')?.value;
  if (!token) redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const memberId = formData.get('memberId') as string;

    const client = await connectToDatabase();
    const db = client.db('affilify');

    await db.collection('team_members').deleteOne({
      _id: new ObjectId(memberId),
      organizationId: new ObjectId(decoded.userId)
    });

    redirect('/dashboard/enterprise?tab=team&success=member_removed');
  } catch (error) {
    redirect('/dashboard/enterprise?tab=team&error=operation_failed');
  }
}

async function generateApiKey(formData: FormData) {
  'use server';
  
  const token = cookies().get('auth-token')?.value;
  if (!token) redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user || user.plan !== 'enterprise') {
      redirect('/pricing?feature=enterprise');
    }

    // Check API key limit
    const existingKeys = await db.collection('api_keys').countDocuments({ userId: user._id });
    if (existingKeys >= 5) {
      redirect('/dashboard/enterprise?tab=api&error=api_limit_reached');
    }

    const keyName = formData.get('keyName') as string;
    const permissions = formData.getAll('apiPermissions') as string[];
    
    // Generate secure API key
    const apiKey = `aff_${crypto.randomBytes(32).toString('hex')}`;

    await db.collection('api_keys').insertOne({
      userId: user._id,
      name: keyName,
      key: apiKey,
      permissions,
      createdAt: new Date(),
      lastUsed: null,
      isActive: true
    });

    redirect('/dashboard/enterprise?tab=api&success=api_key_generated');
  } catch (error) {
    redirect('/dashboard/enterprise?tab=api&error=operation_failed');
  }
}

async function deleteApiKey(formData: FormData) {
  'use server';
  
  const token = cookies().get('auth-token')?.value;
  if (!token) redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const keyId = formData.get('keyId') as string;

    const client = await connectToDatabase();
    const db = client.db('affilify');

    await db.collection('api_keys').deleteOne({
      _id: new ObjectId(keyId),
      userId: new ObjectId(decoded.userId)
    });

    redirect('/dashboard/enterprise?tab=api&success=api_key_deleted');
  } catch (error) {
    redirect('/dashboard/enterprise?tab=api&error=operation_failed');
  }
}

async function updateWhiteLabel(formData: FormData) {
  'use server';
  
  const token = cookies().get('auth-token')?.value;
  if (!token) redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const client = await connectToDatabase();
    const db = client.db('affilify');

    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user || user.plan !== 'enterprise') {
      redirect('/pricing?feature=enterprise');
    }

    const whiteLabelData = {
      userId: user._id,
      companyName: formData.get('companyName') as string,
      companyLogo: formData.get('companyLogo') as string,
      primaryColor: formData.get('primaryColor') as string,
      secondaryColor: formData.get('secondaryColor') as string,
      customDomain: formData.get('customDomain') as string,
      removeBranding: formData.get('removeBranding') === 'on',
      customFooter: formData.get('customFooter') === 'on',
      hideAffiliateLinks: formData.get('hideAffiliateLinks') === 'on',
      updatedAt: new Date()
    };

    await db.collection('white_label_settings').replaceOne(
      { userId: user._id },
      whiteLabelData,
      { upsert: true }
    );

    redirect('/dashboard/enterprise?tab=white-label&success=white_label_updated');
  } catch (error) {
    redirect('/dashboard/enterprise?tab=white-label&error=operation_failed');
  }
}
