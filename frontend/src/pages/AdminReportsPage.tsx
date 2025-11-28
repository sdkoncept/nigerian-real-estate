import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '../lib/supabase';

interface Report {
  id: string;
  reporter_id: string;
  entity_type: 'property' | 'agent' | 'user';
  entity_id: string;
  reason: string;
  description: string;
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reporter_name?: string;
  reporter_email?: string;
  entity_name?: string;
}

export default function AdminReportsPage() {
  const { user } = useAuth();
  const { isAdmin } = useUserProfile();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'investigating' | 'resolved' | 'dismissed'>('new');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<'new' | 'investigating' | 'resolved' | 'dismissed'>('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      loadReports();
    }
  }, [user, isAdmin]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Use Supabase directly - admins have RLS access
      const { data: reportsList, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading reports:', error);
        throw error;
      }

      // Get reporter and entity details
      const reportsWithDetails = await Promise.all(
        (reportsList || []).map(async (report: any) => {
          // Get reporter info
          const { data: reporter } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', report.reporter_id)
            .single();

          if (reporter) {
            report.reporter_name = reporter.full_name || 'Unknown';
            report.reporter_email = reporter.email || '';
          }

          // Get entity info
          if (report.entity_type === 'property') {
            const { data: property } = await supabase
              .from('properties')
              .select('title')
              .eq('id', report.entity_id)
              .single();
            report.entity_name = property?.title || 'Unknown Property';
          } else if (report.entity_type === 'agent') {
            const { data: agent } = await supabase
              .from('agents')
              .select('company_name, profiles:user_id(full_name)')
              .eq('id', report.entity_id)
              .single();
            report.entity_name = (agent as any)?.profiles?.full_name || (agent as any)?.company_name || 'Unknown Agent';
          }

          return report;
        })
      );

      setReports(reportsWithDetails);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport) return;

    try {
      setProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update report directly in Supabase
      const { error } = await supabase
        .from('reports')
        .update({
          status: statusUpdate,
          admin_notes: adminNotes || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedReport.id);

      if (error) throw error;

      await loadReports();
      setSelectedReport(null);
      setAdminNotes('');
      setStatusUpdate('new');
      alert('Report updated successfully!');
    } catch (error: any) {
      console.error('Error updating report:', error);
      alert('Error updating report: ' + (error.message || 'Unknown error'));
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

  const filteredReports = reports.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Report Management</h1>
                <p className="text-xl text-purple-100">Review and manage user reports</p>
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
              {(['all', 'new', 'investigating', 'resolved', 'dismissed'] as const).map((status) => (
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
                  {reports.filter((r) => status === 'all' || r.status === status).length})
                </button>
              ))}
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🚨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Found</h3>
                <p className="text-gray-600">All reports have been reviewed.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedReport(report);
                      setStatusUpdate(report.status);
                      setAdminNotes(report.admin_notes || '');
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              report.status === 'new'
                                ? 'bg-red-100 text-red-800'
                                : report.status === 'investigating'
                                ? 'bg-yellow-100 text-yellow-800'
                                : report.status === 'resolved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {report.status.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {report.entity_type.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {report.reason}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {report.description}
                        </p>
                        <div className="text-sm text-gray-500">
                          <p>
                            Reporter: {report.reporter_name} ({report.reporter_email})
                          </p>
                          <p>Entity: {report.entity_name}</p>
                          <p>Reported: {new Date(report.created_at).toLocaleString()}</p>
                        </div>
                        {report.admin_notes && (
                          <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 p-2 rounded">
                            Admin Notes: {report.admin_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Update Status Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Report Status</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Reason:</strong> {selectedReport.reason}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Description:</strong> {selectedReport.description}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Reporter:</strong> {selectedReport.reporter_name} ({selectedReport.reporter_email})
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Entity:</strong> {selectedReport.entity_name} ({selectedReport.entity_type})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="new">New</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Add notes about this report..."
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleUpdateStatus}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {processing ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setAdminNotes('');
                    setStatusUpdate('new');
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

