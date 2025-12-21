import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalAgents: number;
  pendingVerifications: number;
  pendingReports: number;
  activeProperties: number;
  verifiedAgents: number;
  verifiedProperties: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { profile, isAdmin } = useUserProfile();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalAgents: 0,
    pendingVerifications: 0,
    pendingReports: 0,
    activeProperties: 0,
    verifiedAgents: 0,
    verifiedProperties: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties' | 'verifications' | 'reports' | 'settings' | 'subscriptions'>('overview');

  useEffect(() => {
    if (user && isAdmin) {
      loadStats();
    }
  }, [user, isAdmin]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load all stats in parallel
      const [
        usersResult,
        propertiesResult,
        agentsResult,
        verificationsResult,
        reportsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id, is_active, verification_status', { count: 'exact' }),
        supabase.from('agents').select('id, verification_status', { count: 'exact' }),
        supabase.from('verifications').select('id').eq('status', 'pending'),
        supabase.from('reports').select('id').eq('status', 'new'),
      ]);

      const totalUsers = usersResult.count || 0;
      const totalProperties = propertiesResult.count || 0;
      const totalAgents = agentsResult.count || 0;
      const pendingVerifications = verificationsResult.data?.length || 0;
      const pendingReports = reportsResult.data?.length || 0;

      const activeProperties = propertiesResult.data?.filter((p: any) => p.is_active).length || 0;
      const verifiedAgents = agentsResult.data?.filter((a: any) => a.verification_status === 'verified').length || 0;
      const verifiedProperties = propertiesResult.data?.filter((p: any) => p.verification_status === 'verified').length || 0;

      setStats({
        totalUsers,
        totalProperties,
        totalAgents,
        pendingVerifications,
        pendingReports,
        activeProperties,
        verifiedAgents,
        verifiedProperties,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  if (profile && !isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              This page is only available for administrators.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

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
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                  <span className="px-3 py-1 bg-white text-purple-600 rounded-full text-sm font-semibold">
                    ADMIN
                  </span>
                </div>
                <p className="text-xl text-purple-100">Manage your platform</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'users', label: 'Users', icon: '👥' },
                  { id: 'properties', label: 'Properties', icon: '🏠', link: '/admin/properties' },
                  { id: 'subscriptions', label: 'Subscriptions', icon: '💳', link: '/admin/subscriptions' },
                  { id: 'verifications', label: 'Verifications', icon: '✓' },
                  { id: 'reports', label: 'Dispute Resolution', icon: '🚨' },
                  { id: 'settings', label: 'Settings', icon: '⚙️' },
                ].map((tab: any) => (
                  tab.link ? (
                    <Link
                      key={tab.id}
                      to={tab.link}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </Link>
                  ) : (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-purple-600 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  )
                ))}
              </nav>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <div className="text-4xl">👥</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Properties</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
                    </div>
                    <div className="text-4xl">🏠</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Agents</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalAgents}</p>
                    </div>
                    <div className="text-4xl">👨‍💼</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pending Verifications</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.pendingVerifications}</p>
                    </div>
                    <div className="text-4xl">⏳</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pending Disputes</p>
                      <p className="text-3xl font-bold text-red-600">{stats.pendingReports}</p>
                    </div>
                    <div className="text-4xl">🚨</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Active Properties</p>
                      <p className="text-3xl font-bold text-green-600">{stats.activeProperties}</p>
                    </div>
                    <div className="text-4xl">✅</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Verified Agents</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.verifiedAgents}</p>
                    </div>
                    <div className="text-4xl">✓</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Verified Properties</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.verifiedProperties}</p>
                    </div>
                    <div className="text-4xl">✓</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/admin/users"
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <div className="text-2xl mb-2">👥</div>
                    <div className="font-semibold text-gray-900">Manage Users</div>
                    <div className="text-sm text-gray-600">View and edit all users</div>
                  </Link>

                  <Link
                    to="/admin/verifications"
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <div className="text-2xl mb-2">✓</div>
                    <div className="font-semibold text-gray-900">Review Verifications</div>
                    <div className="text-sm text-gray-600">{stats.pendingVerifications} pending</div>
                  </Link>

                  <Link
                    to="/admin/reports"
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <div className="text-2xl mb-2">🚨</div>
                    <div className="font-semibold text-gray-900">Dispute Resolution</div>
                    <div className="text-sm text-gray-600">{stats.pendingReports} new</div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Management</h2>
              <p className="text-gray-600 mb-4">View and manage all platform users</p>
              <Link
                to="/admin/users"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Go to User Management →
              </Link>
            </div>
          )}

          {/* Verifications Tab */}
          {activeTab === 'verifications' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Verification Management</h2>
              <p className="text-gray-600 mb-4">
                {stats.pendingVerifications} pending verifications
              </p>
              <Link
                to="/admin/verifications"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Review Verifications →
              </Link>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
              <p className="text-gray-600 mb-4">
                {stats.pendingReports} new disputes
              </p>
              <Link
                to="/admin/reports"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                View Disputes →
              </Link>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">System Settings</h2>
              <p className="text-gray-600 mb-4">Configure platform settings</p>
              <Link
                to="/admin/settings"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Open Settings →
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

