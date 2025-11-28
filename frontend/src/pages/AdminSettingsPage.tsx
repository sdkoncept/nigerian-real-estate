import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useUserProfile } from '../hooks/useUserProfile';

export default function AdminSettingsPage() {
  const { isAdmin } = useUserProfile();
  const [settings, setSettings] = useState({
    platformName: 'Nigerian Real Estate Platform',
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    requirePhoneVerification: false,
    maxPropertiesPerUser: 50,
    maxImagesPerProperty: 10,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Implement API call to save settings
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully! (Note: This is a placeholder - implement API integration)');
    }, 1000);
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only available for administrators.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">System Settings</h1>
                <p className="text-xl text-purple-100">Configure platform settings</p>
              </div>
              <Link
                to="/admin/dashboard"
                className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
              {/* General Settings */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Registration Settings */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Registration Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Allow New Registrations
                      </label>
                      <p className="text-xs text-gray-500">Enable or disable new user signups</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.allowNewRegistrations}
                      onChange={(e) => setSettings({ ...settings, allowNewRegistrations: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Require Email Verification
                      </label>
                      <p className="text-xs text-gray-500">Users must verify their email to use the platform</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requireEmailVerification}
                      onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Require Phone Verification
                      </label>
                      <p className="text-xs text-gray-500">Users must verify their phone number</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requirePhoneVerification}
                      onChange={(e) => setSettings({ ...settings, requirePhoneVerification: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Property Settings */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Properties Per User
                    </label>
                    <input
                      type="number"
                      value={settings.maxPropertiesPerUser}
                      onChange={(e) => setSettings({ ...settings, maxPropertiesPerUser: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Images Per Property
                    </label>
                    <input
                      type="number"
                      value={settings.maxImagesPerProperty}
                      onChange={(e) => setSettings({ ...settings, maxImagesPerProperty: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">System Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Maintenance Mode
                      </label>
                      <p className="text-xs text-gray-500">Put the platform in maintenance mode</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Note: Settings are saved locally. Implement API integration for persistence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

