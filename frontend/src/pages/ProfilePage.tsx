import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SecureInput from '../components/SecureInput';
import { SecurityService } from '../services/security';
import type { TwoFactorSetup } from '../services/security';
import { useUserProfile } from '../hooks/useUserProfile';

export default function ProfilePage() {
  const { user } = useAuth();
  const { isAdmin } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
    user_type: '',
  });

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      if (isAdmin) {
        check2FAStatus();
      }
    }
  }, [user, isAdmin]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      } else if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || '',
          user_type: data.user_type || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const check2FAStatus = async () => {
    if (!isAdmin) return;
    
    try {
      const { enabled } = await SecurityService.check2FAStatus();
      setTwoFactorEnabled(enabled);
    } catch (err: any) {
      console.error('Error checking 2FA status:', err);
      // Don't show error if user is not admin or endpoint doesn't exist yet
    }
  };

  const handleSetup2FA = async () => {
    if (!isAdmin) return;
    
    setTwoFactorLoading(true);
    setError(null);
    
    try {
      const setup = await SecurityService.setup2FA();
      setTwoFactorSetup(setup);
      setShow2FASetup(true);
      setShowBackupCodes(true);
    } catch (err: any) {
      console.error('Error setting up 2FA:', err);
      setError(err.message || 'Failed to set up 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!isAdmin || !twoFactorToken) return;
    
    setTwoFactorLoading(true);
    setError(null);
    
    try {
      await SecurityService.verify2FA(twoFactorToken);
      setSuccess('2FA enabled successfully! Please save your backup codes.');
      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      setTwoFactorToken('');
      setTimeout(() => {
        setSuccess(null);
        setShowBackupCodes(false);
      }, 10000);
    } catch (err: any) {
      console.error('Error verifying 2FA:', err);
      setError(err.message || 'Invalid token. Please try again.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!isAdmin || !confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return;
    }
    
    setTwoFactorLoading(true);
    setError(null);
    
    try {
      await SecurityService.disable2FA();
      setSuccess('2FA disabled successfully');
      setTwoFactorEnabled(false);
      setTwoFactorSetup(null);
      setShow2FASetup(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error disabling 2FA:', err);
      setError(err.message || 'Failed to disable 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    if (!user) {
      setError('You must be logged in to update your profile');
      setSaving(false);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-xl text-primary-100">Manage your account information</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800">{success}</p>
                </div>
              )}

              {/* Account Info */}
              <div>
                <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Type
                    </label>
                    <input
                      type="text"
                      value={profile.user_type.charAt(0).toUpperCase() + profile.user_type.slice(1)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">User type cannot be changed</p>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div>
                <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Profile Details</h2>
                <div className="space-y-4">
                  <SecureInput
                    type="text"
                    label="Full Name"
                    name="full_name"
                    value={profile.full_name}
                    onChange={(value) => setProfile({ ...profile, full_name: value })}
                    placeholder="Your full name"
                  />

                  <SecureInput
                    type="tel"
                    label="Phone Number"
                    name="phone"
                    value={profile.phone}
                    onChange={(value) => setProfile({ ...profile, phone: value })}
                    placeholder="+234 800 000 0000"
                  />

                  <SecureInput
                    type="text"
                    label="Avatar URL (Optional)"
                    name="avatar_url"
                    value={profile.avatar_url}
                    onChange={(value) => setProfile({ ...profile, avatar_url: value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            {/* Two-Factor Authentication Section (Admin Only) */}
            {isAdmin && (
              <div className="mt-8 bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Add an extra layer of security to your admin account
                    </p>
                  </div>
                  <div className="flex items-center">
                    {twoFactorEnabled ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        ✓ Enabled
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>

                {!twoFactorEnabled && !show2FASetup && (
                  <div>
                    <p className="text-gray-700 mb-4">
                      2FA is required for admin accounts. Enable it now to secure your account.
                    </p>
                    <button
                      onClick={handleSetup2FA}
                      disabled={twoFactorLoading}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      {twoFactorLoading ? 'Setting up...' : 'Enable 2FA'}
                    </button>
                  </div>
                )}

                {show2FASetup && twoFactorSetup && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Step 1: Scan QR Code</h3>
                      <p className="text-sm text-blue-800 mb-4">
                        Use an authenticator app (Google Authenticator, Authy, Microsoft Authenticator) to scan this QR code:
                      </p>
                      <div className="flex justify-center bg-white p-4 rounded-lg">
                        <img src={twoFactorSetup.qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                      </div>
                    </div>

                    {showBackupCodes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Save Your Backup Codes</h3>
                        <p className="text-sm text-yellow-800 mb-3">
                          Save these codes in a safe place. You can use them to access your account if you lose access to your authenticator app.
                        </p>
                        <div className="bg-white p-4 rounded-lg font-mono text-sm space-y-1">
                          {twoFactorSetup.backupCodes.map((code, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span>{code}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(code);
                                  alert('Code copied to clipboard!');
                                }}
                                className="text-primary-600 hover:text-primary-700 text-xs"
                              >
                                Copy
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            const codesText = twoFactorSetup.backupCodes.join('\n');
                            navigator.clipboard.writeText(codesText);
                            alert('All backup codes copied to clipboard!');
                          }}
                          className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-semibold"
                        >
                          Copy All Codes
                        </button>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-black dark:text-white mb-2">Step 2: Verify Setup</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Enter the 6-digit code from your authenticator app to complete setup:
                      </p>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={twoFactorToken}
                          onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                        />
                        <button
                          onClick={handleVerify2FA}
                          disabled={twoFactorLoading || twoFactorToken.length !== 6}
                          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                          {twoFactorLoading ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShow2FASetup(false);
                        setTwoFactorSetup(null);
                        setTwoFactorToken('');
                        setShowBackupCodes(false);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel Setup
                    </button>
                  </div>
                )}

                {twoFactorEnabled && !show2FASetup && (
                  <div>
                    <p className="text-gray-700 mb-4">
                      Two-factor authentication is enabled. Your account is protected with an extra layer of security.
                    </p>
                    <button
                      onClick={handleDisable2FA}
                      disabled={twoFactorLoading}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      {twoFactorLoading ? 'Disabling...' : 'Disable 2FA'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

