import Link from 'next/link';
import { 
  addTeamMember, 
  removeTeamMember, 
  generateApiKey, 
  deleteApiKey, 
  updateWhiteLabel 
} from './enterprise-actions';

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enterprise Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your enterprise features and settings</p>
        </div>

        {/* Team Management Section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Team Management</h2>
          </div>
          <div className="p-6">
            <form action={addTeamMember} className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    name="role"
                    id="role"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a role</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Team Member
              </button>
            </form>

            {/* Team Members List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Current Team Members</h3>
              {/* This would be populated with actual team members data */}
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">john@example.com</p>
                    <p className="text-sm text-gray-500">Admin</p>
                  </div>
                  <form action={removeTeamMember}>
                    <input type="hidden" name="memberId" value="example-id" />
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Key Management Section */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">API Key Management</h2>
          </div>
          <div className="p-6">
            <form action={generateApiKey} className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="keyName" className="block text-sm font-medium text-gray-700">
                    Key Name
                  </label>
                  <input
                    type="text"
                    name="keyName"
                    id="keyName"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Permissions
                  </label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="apiPermissions"
                        value="read"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Read</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="apiPermissions"
                        value="write"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Write</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="apiPermissions"
                        value="delete"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Delete</span>
                    </label>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Generate API Key
              </button>
            </form>

            {/* API Keys List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Active API Keys</h3>
              {/* This would be populated with actual API keys data */}
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Production Key</p>
                    <p className="text-sm text-gray-500 font-mono">ak_***************</p>
                    <p className="text-xs text-gray-400">Read, Write permissions</p>
                  </div>
                  <form action={deleteApiKey}>
                    <input type="hidden" name="keyId" value="example-key-id" />
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* White Label Settings Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">White Label Settings</h2>
          </div>
          <div className="p-6">
            <form action={updateWhiteLabel}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="companyLogo" className="block text-sm font-medium text-gray-700">
                    Company Logo URL
                  </label>
                  <input
                    type="url"
                    name="companyLogo"
                    id="companyLogo"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    name="primaryColor"
                    id="primaryColor"
                    className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    name="secondaryColor"
                    id="secondaryColor"
                    className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-6 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Update White Label Settings
              </button>
            </form>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
