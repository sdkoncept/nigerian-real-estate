import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SecureInput from '../components/SecureInput';

export default function ProfilePage() {
  const { user } = useAuth();
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

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

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
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
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
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Details</h2>
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
          </div>
        </div>
      </div>
    </Layout>
  );
}

