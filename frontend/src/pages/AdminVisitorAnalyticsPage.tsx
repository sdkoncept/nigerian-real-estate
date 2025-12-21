import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { supabase } from '../lib/supabase';

interface VisitorRecord {
  id: string;
  session_id: string;
  user_id: string | null;
  page_path: string;
  page_title: string | null;
  referrer: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  is_new_visitor: boolean;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export default function AdminVisitorAnalyticsPage() {
  const { user } = useAuth();
  const { isAdmin } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
  
  // Filters
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'desktop' | 'mobile' | 'tablet'>('all');
  const [userFilter, setUserFilter] = useState<'all' | 'logged_in' | 'anonymous'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin, dateRange, deviceFilter, userFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Calculate date range
      let startDate: Date | null = null;
      if (dateRange === 'today') {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === '7d') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } else if (dateRange === '30d') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
      }

      // Build query
      let query = supabase
        .from('visitor_tracking')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (deviceFilter !== 'all') {
        query = query.eq('device_type', deviceFilter);
      }

      if (userFilter === 'logged_in') {
        query = query.not('user_id', 'is', null);
      } else if (userFilter === 'anonymous') {
        query = query.is('user_id', null);
      }

      const { data: visitorData, error } = await query;

      if (error) throw error;

      // Get user details for logged-in visitors
      const visitorsWithUsers = await Promise.all(
        (visitorData || []).map(async (visitor: any) => {
          if (visitor.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', visitor.user_id)
              .single();
            
            if (profile) {
              visitor.user_name = profile.full_name;
              visitor.user_email = profile.email;
            }
          }
          return visitor;
        })
      );

      setVisitors(visitorsWithUsers);

    } catch (error) {
      console.error('Error loading visitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter visitors by search query
  const filteredVisitors = visitors.filter(visitor => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      visitor.page_path.toLowerCase().includes(query) ||
      visitor.page_title?.toLowerCase().includes(query) ||
      visitor.user_name?.toLowerCase().includes(query) ||
      visitor.user_email?.toLowerCase().includes(query) ||
      visitor.session_id.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);
  const paginatedVisitors = filteredVisitors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Group by device type
  const deviceStats = {
    desktop: visitors.filter(v => v.device_type === 'desktop').length,
    mobile: visitors.filter(v => v.device_type === 'mobile').length,
    tablet: visitors.filter(v => v.device_type === 'tablet').length,
  };


  // Most visited pages
  const pageStats = visitors.reduce((acc: any, visitor) => {
    const path = visitor.page_path;
    if (!acc[path]) {
      acc[path] = { path, count: 0, title: visitor.page_title };
    }
    acc[path].count++;
    return acc;
  }, {});
  const topPages = Object.values(pageStats)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10);

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">This page is only available for administrators.</p>
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Visitor Analytics</h1>
                <p className="text-xl text-purple-100">Deep dive into visitor data and behavior</p>
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Total Visitors</p>
              <p className="text-3xl font-bold text-gray-900">{filteredVisitors.length > 0 ? new Set(filteredVisitors.map(v => v.session_id)).size : 0}</p>
              <p className="text-xs text-gray-500 mt-1">Unique sessions</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Total Page Views</p>
              <p className="text-3xl font-bold text-blue-600">{filteredVisitors.length}</p>
              <p className="text-xs text-gray-500 mt-1">In selected period</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Logged In Users</p>
              <p className="text-3xl font-bold text-green-600">{visitors.filter(v => v.user_id).length}</p>
              <p className="text-xs text-gray-500 mt-1">Authenticated visits</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">New Visitors</p>
              <p className="text-3xl font-bold text-purple-600">{visitors.filter(v => v.is_new_visitor).length}</p>
              <p className="text-xs text-gray-500 mt-1">First-time visitors</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="today">Today</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Device Type</label>
                <select
                  value={deviceFilter}
                  onChange={(e) => {
                    setDeviceFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Devices</option>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                <select
                  value={userFilter}
                  onChange={(e) => {
                    setUserFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="logged_in">Logged In</option>
                  <option value="anonymous">Anonymous</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search pages, users..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Device Type Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Type Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Desktop</span>
                    <span className="text-sm font-semibold">{deviceStats.desktop}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(deviceStats.desktop / visitors.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Mobile</span>
                    <span className="text-sm font-semibold">{deviceStats.mobile}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(deviceStats.mobile / visitors.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Tablet</span>
                    <span className="text-sm font-semibold">{deviceStats.tablet}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(deviceStats.tablet / visitors.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Visited Pages</h3>
              <div className="space-y-2">
                {topPages.map((page: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{page.path}</p>
                      {page.title && (
                        <p className="text-xs text-gray-500 truncate">{page.title}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-purple-600 ml-2">{page.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visitor List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Visitor Details</h3>
              <span className="text-sm text-gray-600">
                Showing {paginatedVisitors.length} of {filteredVisitors.length} visits
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(visitor.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {visitor.user_id ? (
                          <div>
                            <div className="font-medium text-gray-900">{visitor.user_name || 'User'}</div>
                            <div className="text-gray-500">{visitor.user_email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Anonymous</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="max-w-xs truncate" title={visitor.page_path}>
                          {visitor.page_path}
                        </div>
                        {visitor.page_title && (
                          <div className="text-xs text-gray-500 truncate" title={visitor.page_title}>
                            {visitor.page_title}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          visitor.device_type === 'mobile' ? 'bg-green-100 text-green-800' :
                          visitor.device_type === 'tablet' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {visitor.device_type || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.browser || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                        {visitor.session_id.substring(0, 20)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedVisitor(visitor)}
                          className="text-purple-600 hover:text-purple-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Visitor Detail Modal */}
        {selectedVisitor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Visitor Details</h3>
                  <button
                    onClick={() => setSelectedVisitor(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visit Time</label>
                    <p className="text-gray-900">{new Date(selectedVisitor.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
                    <p className="text-gray-900">{selectedVisitor.page_path}</p>
                    {selectedVisitor.page_title && (
                      <p className="text-sm text-gray-500">{selectedVisitor.page_title}</p>
                    )}
                  </div>
                  {selectedVisitor.user_id ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                      <p className="text-gray-900">{selectedVisitor.user_name || 'User'}</p>
                      <p className="text-sm text-gray-500">{selectedVisitor.user_email}</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                      <p className="text-gray-500">Anonymous Visitor</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Device</label>
                    <p className="text-gray-900">{selectedVisitor.device_type || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Browser</label>
                    <p className="text-gray-900">{selectedVisitor.browser || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session ID</label>
                    <p className="text-gray-900 font-mono text-sm break-all">{selectedVisitor.session_id}</p>
                  </div>
                  {selectedVisitor.referrer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Referrer</label>
                      <p className="text-gray-900 break-all">{selectedVisitor.referrer}</p>
                    </div>
                  )}
                  {selectedVisitor.user_agent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                      <p className="text-gray-900 text-sm break-all">{selectedVisitor.user_agent}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Type</label>
                    <p className="text-gray-900">
                      {selectedVisitor.is_new_visitor ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">New Visitor</span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Returning Visitor</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

