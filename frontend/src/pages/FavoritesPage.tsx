import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PropertyCard from '../components/PropertyCard';
import type { Property } from '../components/PropertyCard';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get favorite property IDs
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (favoritesError) {
        console.error('Error loading favorites:', favoritesError);
        setLoading(false);
        return;
      }

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Get property details
      const propertyIds = favoritesData.map(f => f.property_id);
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds)
        .eq('is_active', true);

      if (propertiesError) {
        console.error('Error loading properties:', propertiesError);
      } else if (propertiesData) {
        // Transform to Property type
        const transformedProperties: Property[] = propertiesData.map((p: any) => ({
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
          is_featured: p.is_featured,
          verification_status: p.verification_status,
        }));

        setFavorites(transformedProperties);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) {
        alert('Error removing favorite: ' + error.message);
      } else {
        // Reload favorites
        await loadFavorites();
      }
    } catch (error: any) {
      alert('Error removing favorite: ' + error.message);
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
            <h1 className="text-4xl font-bold mb-2">My Favorites</h1>
            <p className="text-xl text-primary-100">Properties you've saved</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {favorites.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Favorites Yet</h3>
              <p className="text-gray-600 mb-6">
                Start exploring properties and save your favorites!
              </p>
              <a
                href="/properties"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                Browse Properties
              </a>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <p className="text-gray-600">
                  You have <span className="font-semibold text-gray-900">{favorites.length}</span> favorite{favorites.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((property) => (
                  <div key={property.id} className="relative">
                    <PropertyCard property={property} />
                    <button
                      onClick={() => handleRemoveFavorite(property.id)}
                      className="mt-2 w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
                    >
                      Remove from Favorites
                    </button>
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

