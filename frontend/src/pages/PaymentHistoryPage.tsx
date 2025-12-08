import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PaymentService } from '../services/payment';

interface Payment {
  id: string;
  payment_type: 'subscription' | 'featured_listing' | 'verification_fee' | 'listing_fee';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_reference: string;
  created_at: string;
  metadata?: any;
}

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [showManualVerify, setShowManualVerify] = useState(false);
  const [manualReference, setManualReference] = useState('');
  const [manualVerifying, setManualVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user]);

  const loadPayments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading payments:', error);
      } else if (data) {
        setPayments(data as Payment[]);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'subscription':
        return 'Subscription';
      case 'featured_listing':
        return 'Featured Listing';
      case 'verification_fee':
        return 'Priority Verification';
      case 'listing_fee':
        return 'Listing Fee';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVerifyPayment = async (reference: string) => {
    if (!user) return;

    try {
      setVerifying(reference);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to verify payment');
        return;
      }

      const result = await PaymentService.verifyPayment(reference, session.access_token);
      
      if (result.success) {
        alert('Payment verified successfully! Your subscription has been activated.');
        // Reload payments and redirect to subscription page
        await loadPayments();
        window.location.href = '/subscription';
      } else {
        alert(`Verification failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      alert(`Error: ${error.message || 'Failed to verify payment'}`);
    } finally {
      setVerifying(null);
    }
  };

  const handleManualVerify = async () => {
    if (!manualReference.trim()) {
      alert('Please enter a payment reference');
      return;
    }

    if (!user) return;

    try {
      setManualVerifying(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to verify payment');
        return;
      }

      const result = await PaymentService.verifyPayment(manualReference.trim(), session.access_token);
      
      if (result.success) {
        alert('Payment verified successfully! Your subscription has been activated.');
        // Reload payments and redirect to subscription page
        setManualReference('');
        setShowManualVerify(false);
        await loadPayments();
        window.location.href = '/subscription';
      } else {
        alert(`Verification failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      alert(`Error: ${error.message || 'Failed to verify payment'}`);
    } finally {
      setManualVerifying(false);
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Payment History</h1>
                <p className="text-xl text-primary-100">View all your transactions</p>
              </div>
              <Link
                to="/subscription"
                className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
              >
                My Subscription
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Manual Verification Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Verify Payment Manually</h2>
                <button
                  onClick={() => setShowManualVerify(!showManualVerify)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
                >
                  {showManualVerify ? 'Hide' : 'Verify Payment'}
                </button>
              </div>
              {showManualVerify && (
                <div className="mt-4">
                  <p className="text-gray-600 mb-4">
                    Enter your Paystack payment reference to verify and activate your subscription. 
                    You can find this in your Paystack dashboard or email receipt.
                  </p>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={manualReference}
                      onChange={(e) => setManualReference(e.target.value)}
                      placeholder="Enter payment reference (e.g., PAY_1234567890_abc123)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={manualVerifying}
                    />
                    <button
                      onClick={handleManualVerify}
                      disabled={manualVerifying || !manualReference.trim()}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {manualVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {payments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Yet</h3>
                <p className="text-gray-600 mb-6">
                  Your payment history will appear here once you make a payment.
                </p>
                <Link
                  to="/pricing"
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  View Plans
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(payment.created_at).toLocaleDateString()}
                            <br />
                            <span className="text-gray-500 text-xs">
                              {new Date(payment.created_at).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getPaymentTypeLabel(payment.payment_type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {payment.currency} {payment.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                payment.status
                              )}`}
                            >
                              {payment.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {payment.payment_reference.substring(0, 12)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {payment.status === 'pending' && payment.payment_type === 'subscription' && (
                              <button
                                onClick={() => handleVerifyPayment(payment.payment_reference)}
                                disabled={verifying === payment.payment_reference}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold"
                              >
                                {verifying === payment.payment_reference ? 'Verifying...' : 'Verify Payment'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

