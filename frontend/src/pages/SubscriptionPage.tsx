import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Subscription {
  id: string;
  plan_type: 'basic' | 'premium' | 'enterprise' | 'professional';
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at: string | null;
  amount_paid: number;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading subscription:', error);
      } else if (data) {
        setSubscription(data as Subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'premium':
        return 'Premium';
      case 'enterprise':
        return 'Enterprise';
      case 'professional':
        return 'Professional';
      default:
        return 'Free';
    }
  };

  const getPlanPrice = (planType: string) => {
    switch (planType) {
      case 'premium':
        return 5000;
      case 'enterprise':
        return 15000;
      case 'professional':
        return 10000;
      default:
        return 0;
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
            <h1 className="text-4xl font-bold mb-2">My Subscription</h1>
            <p className="text-xl text-primary-100">Manage your subscription and billing</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Current Subscription */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Current Plan</h2>
              
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {getPlanName(subscription.plan_type)} Plan
                      </h3>
                      <p className="text-gray-600">
                        ₦{getPlanPrice(subscription.plan_type).toLocaleString()}/month
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                      {subscription.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Started</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(subscription.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    {subscription.expires_at && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Expires</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(subscription.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                      <p className="font-semibold text-gray-900">
                        ₦{subscription.amount_paid.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Link
                      to="/pricing"
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                    >
                      Upgrade Plan
                    </Link>
                    <button
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel your subscription?')) {
                          alert('Subscription cancellation coming soon. Please contact support.');
                        }
                      }}
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-2">No Active Subscription</h3>
                  <p className="text-gray-600 mb-6">
                    You're currently on the free plan. Upgrade to unlock premium features!
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link
                      to="/pricing"
                      className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                    >
                      View Plans
                    </Link>
                    <Link
                      to="/payments"
                      className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Check Payment History
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Payment History</h2>
              <Link
                to="/payments"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                View All Payments →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

