import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useUserProfile } from '../hooks/useUserProfile';
import { geocodeAddress } from '../utils/geocoding';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  property_type: string;
  listing_type: string;
  location: string;
  state: string;
  city: string;
  address: string | null;
  coordinates: { lat: number; lng: number } | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqm: number | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
  is_featured: boolean;
  created_by: string;
  created_at: string;
  user?: {
    email: string;
    full_name: string;
  };
}

export default function AdminPropertiesPage() {
  const { isAdmin } = useUserProfile();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editFormData, setEditFormData] = useState({
    latitude: '',
    longitude: '',
    address: '',
    city: '',
    state: '',
    location: '',
  });
  const [processing, setProcessing] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadProperties();
    }
  }, [isAdmin, filter]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('verification_status', 'pending');
      } else if (filter === 'verified') {
        query = query.eq('verification_status', 'verified');
      } else if (filter === 'rejected') {
        query = query.eq('verification_status', 'rejected');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading properties:', error);
        setProperties([]);
        return;
      }

      if (!data || data.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      // Load user info for each property
      const propertiesWithUsers = await Promise.all(
        data.map(async (prop: any) => {
          const { data: user } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', prop.created_by)
            .single();

          return {
            ...prop,
            price: parseFloat(prop.price),
            sqm: prop.sqm ? parseFloat(prop.sqm) : null,
            coordinates: prop.coordinates || null,
            user: user || null,
          };
        })
      );

      setProperties(propertiesWithUsers);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (propertyId: string, status: 'verified' | 'rejected') => {
    try {
      setProcessing(propertyId);
      const { error } = await supabase
        .from('properties')
        .update({ verification_status: status })
        .eq('id', propertyId);

      if (error) throw error;

      await loadProperties();
      setSelectedProperty(null);
      alert(`Property ${status === 'verified' ? 'verified' : 'rejected'} successfully!`);
    } catch (error: any) {
      console.error('Error updating property:', error);
      alert(`Failed to update property: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleEditClick = (property: Property) => {
    setEditingProperty(property);
    setEditFormData({
      latitude: property.coordinates?.lat?.toString() || '',
      longitude: property.coordinates?.lng?.toString() || '',
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      location: property.location || '',
    });
  };

  const handleGeocode = async () => {
    try {
      setGeocoding(true);
      const address = editFormData.address || editFormData.location;
      if (address && editFormData.city && editFormData.state) {
        const result = await geocodeAddress(address, editFormData.city, editFormData.state);
        if (result) {
          setEditFormData({
            ...editFormData,
            latitude: result.lat.toString(),
            longitude: result.lng.toString(),
          });
        } else {
          alert('Geocoding failed. Please check the address and try again.');
        }
      } else {
        alert('Please provide address, city, and state for geocoding.');
      }
    } catch (error: any) {
      console.error('Geocoding error:', error);
      alert('Geocoding failed. Please try again.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingProperty) return;

    try {
      setProcessing(editingProperty.id);
      
      // Validate coordinates
      let coordinates = null;
      if (editFormData.latitude && editFormData.longitude) {
        const lat = parseFloat(editFormData.latitude);
        const lng = parseFloat(editFormData.longitude);
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          alert('Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.');
          setProcessing(null);
          return;
        }
        coordinates = { lat, lng };
      }

      const updateData: any = {
        coordinates: coordinates,
        address: editFormData.address || null,
        city: editFormData.city,
        state: editFormData.state,
        location: editFormData.location,
      };

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', editingProperty.id);

      if (error) throw error;

      await loadProperties();
      setEditingProperty(null);
      setEditFormData({
        latitude: '',
        longitude: '',
        address: '',
        city: '',
        state: '',
        location: '',
      });
      alert('Property updated successfully!');
    } catch (error: any) {
      console.error('Error updating property:', error);
      alert(`Failed to update property: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (propertyId: string, propertyTitle: string) => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${propertyTitle}"?\n\nThis will permanently delete:\n- The property listing\n- All favorites\n- All reviews\n- All contact inquiries\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setProcessing(propertyId);

      // Delete related records first (cascade should handle this, but being explicit)
      // Delete favorites
      await supabase
        .from('favorites')
        .delete()
        .eq('property_id', propertyId);

      // Delete reviews
      await supabase
        .from('reviews')
        .delete()
        .eq('property_id', propertyId);

      // Delete contacts
      await supabase
        .from('contacts')
        .delete()
        .eq('property_id', propertyId);

      // Delete featured listings
      await supabase
        .from('featured_listings')
        .delete()
        .eq('property_id', propertyId);

      // Finally, delete the property itself
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      await loadProperties();
      setSelectedProperty(null);
      alert('Property deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting property:', error);
      alert(`Failed to delete property: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const filteredProperties = properties.filter((prop) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        prop.title?.toLowerCase().includes(searchLower) ||
        prop.location?.toLowerCase().includes(searchLower) ||
        prop.city?.toLowerCase().includes(searchLower) ||
        prop.state?.toLowerCase().includes(searchLower) ||
        prop.user?.email?.toLowerCase().includes(searchLower) ||
        prop.user?.full_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
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
            <h1 className="text-4xl font-bold mb-2">Property Management</h1>
            <p className="text-xl text-purple-100">Verify and manage all properties</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by title, location, city, or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Properties Table */}
          {filteredProperties.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
              <p className="text-gray-600">Adjust your filters or search terms to find properties.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coordinates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProperties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{prop.title}</div>
                          <div className="text-sm text-gray-500">
                            {prop.property_type} • {prop.listing_type}
                          </div>
                          <div className="text-sm font-semibold text-primary-600">
                            ₦{prop.price.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{prop.user?.full_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{prop.user?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{prop.location}</div>
                          <div className="text-sm text-gray-500">
                            {prop.city}, {prop.state}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {prop.coordinates ? (
                            <div className="text-sm text-gray-900">
                              <div>Lat: {prop.coordinates.lat.toFixed(4)}</div>
                              <div>Lng: {prop.coordinates.lng.toFixed(4)}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No coordinates</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              prop.verification_status
                            )}`}
                          >
                            {prop.verification_status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setSelectedProperty(prop)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditClick(prop)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            {prop.verification_status !== 'verified' && (
                              <button
                                onClick={() => handleVerify(prop.id, 'verified')}
                                disabled={processing === prop.id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                Verify
                              </button>
                            )}
                            {prop.verification_status !== 'rejected' && (
                              <button
                                onClick={() => handleVerify(prop.id, 'rejected')}
                                disabled={processing === prop.id}
                                className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(prop.id, prop.title)}
                              disabled={processing === prop.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 font-semibold"
                            >
                              {processing === prop.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Property: {editingProperty.title}</h2>
                  <button
                    onClick={() => {
                      setEditingProperty(null);
                      setEditFormData({
                        latitude: '',
                        longitude: '',
                        address: '',
                        city: '',
                        state: '',
                        location: '',
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location/Area</label>
                      <input
                        type="text"
                        value={editFormData.location}
                        onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={editFormData.city}
                        onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={editFormData.state}
                        onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">Coordinates (for map)</label>
                      <button
                        onClick={handleGeocode}
                        disabled={geocoding}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                      >
                        {geocoding ? 'Geocoding...' : 'Auto Geocode'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={editFormData.latitude}
                          onChange={(e) => setEditFormData({ ...editFormData, latitude: e.target.value })}
                          placeholder="6.5244"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={editFormData.longitude}
                          onChange={(e) => setEditFormData({ ...editFormData, longitude: e.target.value })}
                          placeholder="3.3792"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Click "Auto Geocode" to automatically get coordinates from address, or enter them manually.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSaveEdit}
                      disabled={processing === editingProperty.id}
                      className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-semibold"
                    >
                      {processing === editingProperty.id ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingProperty(null);
                        setEditFormData({
                          latitude: '',
                          longitude: '',
                          address: '',
                          city: '',
                          state: '',
                          location: '',
                        });
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProperty.title}</h2>
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Property Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">Type:</span> {selectedProperty.property_type}</p>
                      <p><span className="font-medium">Listing:</span> {selectedProperty.listing_type}</p>
                      <p><span className="font-medium">Price:</span> ₦{selectedProperty.price.toLocaleString()}</p>
                      <p><span className="font-medium">Location:</span> {selectedProperty.location}, {selectedProperty.city}, {selectedProperty.state}</p>
                      {selectedProperty.address && (
                        <p><span className="font-medium">Address:</span> {selectedProperty.address}</p>
                      )}
                      {selectedProperty.coordinates && (
                        <p>
                          <span className="font-medium">Coordinates:</span> {selectedProperty.coordinates.lat.toFixed(4)}, {selectedProperty.coordinates.lng.toFixed(4)}
                        </p>
                      )}
                      {selectedProperty.bedrooms && (
                        <p><span className="font-medium">Bedrooms:</span> {selectedProperty.bedrooms}</p>
                      )}
                      {selectedProperty.bathrooms && (
                        <p><span className="font-medium">Bathrooms:</span> {selectedProperty.bathrooms}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Owner</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><span className="font-medium">Name:</span> {selectedProperty.user?.full_name || 'N/A'}</p>
                      <p><span className="font-medium">Email:</span> {selectedProperty.user?.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    {selectedProperty.verification_status !== 'verified' && (
                      <button
                        onClick={() => {
                          handleVerify(selectedProperty.id, 'verified');
                          setSelectedProperty(null);
                        }}
                        disabled={processing === selectedProperty.id}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
                      >
                        Verify Property
                      </button>
                    )}
                    {selectedProperty.verification_status !== 'rejected' && (
                      <button
                        onClick={() => {
                          handleVerify(selectedProperty.id, 'rejected');
                          setSelectedProperty(null);
                        }}
                        disabled={processing === selectedProperty.id}
                        className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-semibold"
                      >
                        Reject Property
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(selectedProperty.id, selectedProperty.title)}
                      disabled={processing === selectedProperty.id}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
                    >
                      {processing === selectedProperty.id ? 'Deleting...' : 'Delete Property'}
                    </button>
                    <button
                      onClick={() => setSelectedProperty(null)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                    >
                      Close
                    </button>
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

