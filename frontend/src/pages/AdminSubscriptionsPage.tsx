import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useUserProfile } from '../hooks/useUserProfile';

interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'basic' | 'premium' | 'enterprise' | 'professional';
  status: 'active' | 'expired' | 'cancelled';
  payment_provider: string | null;
  payment_reference: string | null;
  amount_paid: number;
  currency: string;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name: string | null;
    user_type: string;
  };
}

export default function AdminSubscriptionsPage() {
  const { isAdmin } = useUserProfile();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadSubscriptions();
    }
  }, [isAdmin, filter]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Build query based on filter
      let query = supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'active') {
        query = query.eq('status', 'active');
      } else if (filter === 'expired') {
        query = query.eq('status', 'expired');
      } else if (filter === 'cancelled') {
        query = query.eq('status', 'cancelled');
      }

      const { data, error } = await query;

      // Filter expired subscriptions client-side (includes active subscriptions past expiry)
      let filteredData = data || [];
      if (filter === 'expired') {
        const now = new Date();
        filteredData = filteredData.filter((sub: any) => {
          return sub.status === 'expired' || 
                 (sub.status === 'active' && sub.expires_at && new Date(sub.expires_at) < now);
        });
      }

      if (error) {
        console.error('Error loading subscriptions:', error);
        setSubscriptions([]);
        return;
      }

      if (!filteredData || filteredData.length === 0) {
        setSubscriptions([]);
        setLoading(false);
        return;
      }

      // Load user information for each subscription
      const subscriptionsWithUsers = await Promise.all(
        filteredData.map(async (sub: any) => {
          const { data: user } = await supabase
            .from('profiles')
            .select('email, full_name, user_type')
            .eq('id', sub.user_id)
            .single();

          return {
            ...sub,
            user: user || null,
          };
        })
      );

      setSubscriptions(subscriptionsWithUsers);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        sub.user?.email?.toLowerCase().includes(searchLower) ||
        sub.user?.full_name?.toLowerCase().includes(searchLower) ||
        sub.payment_reference?.toLowerCase().includes(searchLower) ||
        sub.plan_type.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'premium':
        return 'Premium';
      case 'enterprise':
        return 'Enterprise';
      case 'professional':
        return 'Professional';
      case 'basic':
        return 'Basic';
      default:
        return planType;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Access Denied</h1>
            <p className="text-black dark:text-gray-300">You need admin privileges to access this page.</p>
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

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const expiredCount = subscriptions.filter((s) => s.status === 'expired').length;
  const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Subscriptions Management</h1>
                <p className="text-xl text-purple-100">View and manage all user subscriptions</p>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Subscriptions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{subscriptions.length}</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{activeCount}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Expired</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{expiredCount}</p>
                </div>
                <div className="text-4xl">⏰</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Cancelled</p>
                  <p className="text-3xl font-bold text-gray-600 mt-2">{cancelledCount}</p>
                </div>
                <div className="text-4xl">❌</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by email, name, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'active', 'expired', 'cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      filter === status
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subscriptions Table */}
          {filteredSubscriptions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">No Subscriptions Found</h3>
              <p className="text-black dark:text-gray-300">
                {searchTerm
                  ? 'No subscriptions match your search criteria.'
                  : filter === 'all'
                  ? 'No subscriptions have been created yet.'
                  : `No ${filter} subscriptions found.`}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days Remaining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Paid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSubscriptions.map((subscription) => {
                      const daysRemaining = getDaysRemaining(subscription.expires_at);
                      const expired = isExpired(subscription.expires_at);

                      return (
                        <tr key={subscription.id} className="hover:bg-gray-50 dark:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-black dark:text-white">
                                {subscription.user?.full_name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">{subscription.user?.email || 'N/A'}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {subscription.user?.user_type || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-black dark:text-white">
                              {getPlanName(subscription.plan_type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                subscription.status
                              )}`}
                            >
                              {subscription.status.toUpperCase()}
                              {subscription.status === 'active' && expired && ' (EXPIRED)'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                            {new Date(subscription.started_at).toLocaleDateString()}
                            <br />
                            <span className="text-gray-500 text-xs">
                              {new Date(subscription.started_at).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                            {subscription.expires_at ? (
                              <>
                                {new Date(subscription.expires_at).toLocaleDateString()}
                                <br />
                                <span className="text-gray-500 text-xs">
                                  {new Date(subscription.expires_at).toLocaleTimeString()}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400">No expiry</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {daysRemaining !== null ? (
                              <span
                                className={`font-semibold ${
                                  daysRemaining < 0
                                    ? 'text-red-600'
                                    : daysRemaining < 7
                                    ? 'text-orange-600'
                                    : 'text-green-600'
                                }`}
                              >
                                {daysRemaining < 0
                                  ? `Expired ${Math.abs(daysRemaining)} days ago`
                                  : `${daysRemaining} days`}
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black dark:text-white">
                            {subscription.currency} {subscription.amount_paid.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {subscription.payment_reference ? (
                              <span className="text-xs">
                                {subscription.payment_reference.substring(0, 12)}...
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

