import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Property } from '../components/PropertyCard';
import PropertyCard from '../components/PropertyCard';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    verified: 0,
    featured: 0,
  });
  const [featuredListings, setFeaturedListings] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading properties:', error);
      } else if (data) {
        // Get featured listings
        const propertyIds = data.map((p: any) => p.id);
        const { data: featuredData } = await supabase
          .from('featured_listings')
          .select('property_id, featured_until, priority')
          .in('property_id', propertyIds)
          .gt('featured_until', new Date().toISOString());

        const featuredMap = new Map();
        if (featuredData) {
          featuredData.forEach((f: any) => {
            featuredMap.set(f.property_id, f);
          });
        }
        setFeaturedListings(featuredMap);

        // Transform database properties to Property type
        const transformedProperties: Property[] = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          price: parseFloat(p.price),
          currency: p.currency || 'NGN',
          property_type: p.property_type,
          listing_type: p.listing_type,
          location: p.location,
          state: p.state,
          city: p.city,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          sqm: p.sqm ? parseFloat(p.sqm) : undefined,
          images: p.images || [],
          is_featured: featuredMap.has(p.id) || p.is_featured || false,
          verification_status: p.verification_status,
        }));

        setProperties(transformedProperties);

        // Calculate stats
        setStats({
          total: transformedProperties.length,
          active: transformedProperties.length,
          pending: transformedProperties.filter(p => p.verification_status === 'pending').length,
          verified: transformedProperties.filter(p => p.verification_status === 'verified').length,
          featured: transformedProperties.filter(p => p.is_featured).length,
        });
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('created_by', user?.id);

      if (error) {
        alert('Error deleting property: ' + error.message);
      } else {
        // Reload properties
        await loadProperties();
      }
    } catch (error: any) {
      alert('Error deleting property: ' + error.message);
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
                <h1 className="text-4xl font-bold mb-2">Seller Dashboard</h1>
                <p className="text-xl text-primary-100">Manage your property listings</p>
              </div>
              <Link
                to="/seller/properties/new"
                className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
              >
                + Add New Property
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Properties</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.active}</div>
              <div className="text-sm text-gray-600">Active Listings</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending Verification</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.verified}</div>
              <div className="text-sm text-gray-600">Verified Properties</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.featured}</div>
              <div className="text-sm text-gray-600">Featured Listings</div>
            </div>
          </div>

          {/* Properties List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">My Properties</h2>
              <Link
                to="/seller/properties/new"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
              >
                + Add Property
              </Link>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start listing your properties to reach potential buyers and renters.
                </p>
                <Link
                  to="/seller/properties/new"
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  List Your First Property
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="relative">
                    <PropertyCard property={property} />
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <Link
                          to={`/seller/properties/${property.id}/edit`}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold text-center"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                      {!property.is_featured && (
                        <Link
                          to={`/pricing?feature=${property.id}`}
                          className="block w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-semibold text-center"
                        >
                          ⭐ Make Featured (₦2,000/mo)
                        </Link>
                      )}
                      {property.is_featured && featuredListings.has(property.id) && (
                        <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 text-center">
                          ⭐ Featured until {new Date(featuredListings.get(property.id).featured_until).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

