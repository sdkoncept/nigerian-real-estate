import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import type { Property } from '../components/PropertyCard';

export default function MapViewPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading properties:', error);
      } else if (data) {
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
          is_featured: p.is_featured || false,
          verification_status: p.verification_status || 'pending',
        }));
        setProperties(transformedProperties);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
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
            <h1 className="text-4xl font-bold mb-2">Property Map</h1>
            <p className="text-xl text-primary-100">View properties on an interactive map</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Map Integration Coming Soon</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're working on integrating Google Maps to show property locations. For now, you can browse properties using the list view.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                <strong>Planned Features:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-2 max-w-md mx-auto text-left">
                <li>✓ Interactive map with property markers</li>
                <li>✓ Click markers to view property details</li>
                <li>✓ Search by location on map</li>
                <li>✓ Filter properties on map</li>
                <li>✓ Nearby amenities display</li>
                <li>✓ Directions integration</li>
              </ul>
              <div className="pt-6">
                <a
                  href="/properties"
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Browse Properties List
                </a>
              </div>
            </div>
          </div>

          {/* Property List (Fallback) */}
          {properties.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Properties ({properties.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.slice(0, 6).map((property) => (
                  <div
                    key={property.id}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedProperty(property)}
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{property.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {property.location}, {property.city}, {property.state}
                    </p>
                    <p className="text-lg font-bold text-primary-600">
                      ₦{property.price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

