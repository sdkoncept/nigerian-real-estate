import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import SecureInput from '../components/SecureInput';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  user_type: 'buyer' | 'seller' | 'agent' | 'admin';
  is_verified: boolean;
  created_at: string;
  properties_count?: number;
  agent_profile?: any;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buyer' | 'seller' | 'agent' | 'admin'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    user_type: 'buyer' as 'buyer' | 'seller' | 'agent' | 'admin',
    is_verified: false,
  });

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('user_type', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading users:', error);
        setUsers([]);
        return;
      }

      if (!data || data.length === 0) {
        setUsers([]);
        return;
      }

      // Get additional info for each user
      const usersWithDetails = await Promise.all(
        data.map(async (user: any) => {
          // Get properties count
          const { count: propertiesCount } = await supabase
            .from('properties')
            .select('id', { count: 'exact', head: true })
            .eq('created_by', user.id);

          // Get agent profile if exists
          let agentProfile = null;
          if (user.user_type === 'agent') {
            const { data: agent } = await supabase
              .from('agents')
              .select('*')
              .eq('user_id', user.id)
              .single();
            agentProfile = agent;
          }

          return {
            ...user,
            properties_count: propertiesCount || 0,
            agent_profile: agentProfile,
          };
        })
      );

      setUsers(usersWithDetails);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      user_type: user.user_type,
      is_verified: user.is_verified,
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      // Optimistically update the local state
      const updatedUsers = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              full_name: editForm.full_name || null,
              phone: editForm.phone || null,
              user_type: editForm.user_type,
              is_verified: editForm.is_verified,
            }
          : u
      );
      setUsers(updatedUsers);

      // Close modal immediately for better UX
      const userIdToUpdate = editingUser.id;
      setEditingUser(null);
      setEditForm({
        full_name: '',
        phone: '',
        user_type: 'buyer',
        is_verified: false,
      });

      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name || null,
          phone: editForm.phone || null,
          user_type: editForm.user_type,
          is_verified: editForm.is_verified,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userIdToUpdate);

      if (error) {
        // Revert optimistic update on error
        await loadUsers();
        alert('Error updating user: ' + error.message);
        return;
      }

      // Reload to get fresh data (including any computed fields)
      await loadUsers();
      
      // Show success message after reload
      alert('User updated successfully!');
    } catch (error: any) {
      console.error('Error updating user:', error);
      // Revert on error
      await loadUsers();
      alert('Error updating user: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const userTypeCounts = {
    all: users.length,
    buyer: users.filter((u) => u.user_type === 'buyer').length,
    seller: users.filter((u) => u.user_type === 'seller').length,
    agent: users.filter((u) => u.user_type === 'agent').length,
    admin: users.filter((u) => u.user_type === 'admin').length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">User Management</h1>
                <p className="text-xl text-purple-100">Manage all platform users</p>
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
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-black dark:text-white">{userTypeCounts.all}</div>
              <div className="text-sm text-black dark:text-gray-300">Total Users</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{userTypeCounts.buyer}</div>
              <div className="text-sm text-black dark:text-gray-300">Buyers</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{userTypeCounts.seller}</div>
              <div className="text-sm text-black dark:text-gray-300">Sellers</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{userTypeCounts.agent}</div>
              <div className="text-sm text-black dark:text-gray-300">Agents</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{userTypeCounts.admin}</div>
              <div className="text-sm text-black dark:text-gray-300">Admins</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'buyer', 'seller', 'agent', 'admin'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      filter === type
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Properties
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-black dark:text-white">
                            {user.full_name || 'No name'}
                          </div>
                          <div className="text-sm text-black dark:text-gray-400">{user.email}</div>
                          {user.phone && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">{user.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.user_type === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : user.user_type === 'agent'
                              ? 'bg-purple-100 text-purple-800'
                              : user.user_type === 'seller'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.user_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_verified ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                        {user.properties_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black dark:text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Users Found</h3>
              <p className="text-black dark:text-gray-300">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Edit User</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-black dark:text-gray-400"
                  />
                </div>

                <SecureInput
                  type="text"
                  label="Full Name"
                  name="full_name"
                  value={editForm.full_name}
                  onChange={(value) => setEditForm({ ...editForm, full_name: value })}
                />

                <SecureInput
                  type="tel"
                  label="Phone"
                  name="phone"
                  value={editForm.phone}
                  onChange={(value) => setEditForm({ ...editForm, phone: value })}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Type</label>
                  <select
                    value={editForm.user_type}
                    onChange={(e) =>
                      setEditForm({ ...editForm, user_type: e.target.value as any })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_verified"
                    checked={editForm.is_verified}
                    onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_verified" className="ml-2 block text-sm text-black dark:text-white">
                    Verified
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSaveUser}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
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

