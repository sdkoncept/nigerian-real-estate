import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '../lib/supabase';

interface Verification {
  id: string;
  entity_type: 'agent' | 'property';
  entity_id: string;
  document_type: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  review_notes: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
  entity_name?: string;
  entity_email?: string;
}

export default function AdminVerificationsPage() {
  const { user } = useAuth();
  const { isAdmin } = useUserProfile();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      loadVerifications();
    }
  }, [user, isAdmin, filter]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      
      // Use Supabase directly - admins have RLS access
      let query = supabase
        .from('verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: verificationsList, error } = await query;

      if (error) {
        console.error('Error loading verifications:', error);
        throw error;
      }

      // Get entity details for each verification
      const verificationsWithDetails = await Promise.all(
        (verificationsList || []).map(async (v: any) => {
          if (v.entity_type === 'agent') {
            const { data: agent } = await supabase
              .from('agents')
              .select('user_id, profiles:user_id(email, full_name)')
              .eq('id', v.entity_id)
              .single();

            if (agent && (agent as any).profiles) {
              v.entity_name = (agent as any).profiles.full_name || 'Unknown';
              v.entity_email = (agent as any).profiles.email || '';
            }
          } else if (v.entity_type === 'property') {
            const { data: property } = await supabase
              .from('properties')
              .select('title, created_by, profiles:created_by(email, full_name)')
              .eq('id', v.entity_id)
              .single();

            if (property) {
              v.entity_name = (property as any).title || 'Unknown Property';
              v.entity_email = (property as any).profiles?.email || '';
            }
          }
          return v;
        })
      );

      setVerifications(verificationsWithDetails);
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId: string) => {
    if (!reviewNotes.trim() && !confirm('Approve without notes?')) {
      return;
    }

    try {
      setProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update verification status directly in Supabase
      const { error: verifyError } = await supabase
        .from('verifications')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          review_notes: reviewNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', verificationId);

      if (verifyError) throw verifyError;

      // Update entity verification status
      const verification = verifications.find((v) => v.id === verificationId);
      if (verification) {
        if (verification.entity_type === 'agent') {
          const { error: agentUpdateError } = await supabase
            .from('agents')
            .update({ verification_status: 'verified' })
            .eq('id', verification.entity_id);
          
          if (agentUpdateError) {
            console.error('Error updating agent verification status:', agentUpdateError);
            throw agentUpdateError;
          }
        } else if (verification.entity_type === 'property') {
          const { error: propertyUpdateError } = await supabase
            .from('properties')
            .update({ verification_status: 'verified' })
            .eq('id', verification.entity_id);
          
          if (propertyUpdateError) {
            console.error('Error updating property verification status:', propertyUpdateError);
            throw propertyUpdateError;
          }
        }
      }

      await loadVerifications();
      setSelectedVerification(null);
      setReviewNotes('');
      alert('Verification approved successfully!');
    } catch (error: any) {
      console.error('Error approving verification:', error);
      alert('Error approving verification: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (verificationId: string) => {
    if (!reviewNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update verification status directly in Supabase
      const { error: verifyError } = await supabase
        .from('verifications')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          review_notes: reviewNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', verificationId);

      if (verifyError) throw verifyError;

      // Update entity verification status
      const verification = verifications.find((v) => v.id === verificationId);
      if (verification) {
        if (verification.entity_type === 'agent') {
          const { error: agentUpdateError } = await supabase
            .from('agents')
            .update({ verification_status: 'rejected' })
            .eq('id', verification.entity_id);
          
          if (agentUpdateError) {
            console.error('Error updating agent verification status:', agentUpdateError);
            throw agentUpdateError;
          }
        } else if (verification.entity_type === 'property') {
          const { error: propertyUpdateError } = await supabase
            .from('properties')
            .update({ verification_status: 'rejected' })
            .eq('id', verification.entity_id);
          
          if (propertyUpdateError) {
            console.error('Error updating property verification status:', propertyUpdateError);
            throw propertyUpdateError;
          }
        }
      }

      await loadVerifications();
      setSelectedVerification(null);
      setReviewNotes('');
      alert('Verification rejected');
    } catch (error: any) {
      console.error('Error rejecting verification:', error);
      alert('Error rejecting verification: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  const filteredVerifications = verifications.filter((v) => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Verification Management</h1>
                <p className="text-xl text-purple-100">Review and approve verification documents</p>
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
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} (
                  {verifications.filter((v) => status === 'all' || v.status === status).length})
                </button>
              ))}
            </div>
          </div>

          {/* Verifications List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredVerifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Verifications Found</h3>
                <p className="text-gray-600">All verifications have been reviewed.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredVerifications.map((verification) => (
                  <div
                    key={verification.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              verification.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : verification.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {verification.status.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {verification.entity_type.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {verification.entity_name || 'Unknown Entity'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Document Type: <span className="font-semibold">{verification.document_type}</span>
                        </p>
                        {verification.entity_email && (
                          <p className="text-sm text-gray-500">{verification.entity_email}</p>
                        )}
                        {verification.review_notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            Notes: {verification.review_notes}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Submitted: {new Date(verification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <a
                          href={verification.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                        >
                          View Document
                        </a>
                        {verification.status === 'pending' && (
                          <button
                            onClick={() => setSelectedVerification(verification)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Review Modal */}
        {selectedVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Verification</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entity: {selectedVerification.entity_name}
                  </label>
                  <p className="text-sm text-gray-600">
                    Type: {selectedVerification.entity_type} | Document: {selectedVerification.document_type}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Add notes about this verification..."
                  />
                </div>
                <div>
                  <a
                    href={selectedVerification.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Document →
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleApprove(selectedVerification.id)}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(selectedVerification.id)}
                  disabled={processing || !reviewNotes.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => {
                    setSelectedVerification(null);
                    setReviewNotes('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

