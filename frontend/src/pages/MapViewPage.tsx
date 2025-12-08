import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import type { Property } from '../components/PropertyCard';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geocodeAddress } from '../utils/geocoding';

// Extend Property interface to include coordinates
interface PropertyWithCoords extends Property {
  coordinates?: { lat: number; lng: number } | null;
  address?: string | null;
}

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = (color: string = '#0284c7') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
      <div style="transform: rotate(45deg); color: white; font-size: 12px; font-weight: bold; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">🏠</div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Component to handle map view changes
function MapViewUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapViewPage() {
  const [properties, setProperties] = useState<PropertyWithCoords[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithCoords | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([6.5244, 3.3792]); // Lagos, Nigeria default
  const [mapZoom, setMapZoom] = useState(10);

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
        const transformedProperties: PropertyWithCoords[] = data.map((p: any) => ({
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
          address: p.address || null,
          coordinates: p.coordinates || null,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          sqm: p.sqm ? parseFloat(p.sqm) : undefined,
          images: p.images || [],
          is_featured: p.is_featured || false,
          verification_status: p.verification_status || 'pending',
        }));
        setProperties(transformedProperties);

        // Set map center based on properties if available
        if (transformedProperties.length > 0) {
          const propertiesWithCoords = transformedProperties.filter(p => p.coordinates);
          if (propertiesWithCoords.length > 0) {
            const avgLat = propertiesWithCoords.reduce((sum, p) => sum + (p.coordinates?.lat || 0), 0) / propertiesWithCoords.length;
            const avgLng = propertiesWithCoords.reduce((sum, p) => sum + (p.coordinates?.lng || 0), 0) / propertiesWithCoords.length;
            setMapCenter([avgLat, avgLng]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleMarkerClick = (property: PropertyWithCoords) => {
    setSelectedProperty(property);
  };

  const formatPrice = (price: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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
          {/* Map Container */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8" style={{ height: '600px' }}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapViewUpdater center={mapCenter} />
              {properties.map((property) => {
                const coords = property.coordinates
                  ? [property.coordinates.lat, property.coordinates.lng]
                  : null;
                
                if (!coords) return null;

                return (
                  <Marker
                    key={property.id}
                    position={coords as [number, number]}
                    icon={createCustomIcon(property.is_featured ? '#f59e0b' : '#0284c7')}
                    eventHandlers={{
                      click: () => handleMarkerClick(property),
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <Link
                          to={`/properties/${property.id}`}
                          className="block hover:underline"
                        >
                          <h3 className="font-bold text-gray-900 mb-1">{property.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {property.location}, {property.city}, {property.state}
                          </p>
                          <p className="text-lg font-bold text-primary-600 mb-2">
                            {formatPrice(property.price, property.currency)}
                          </p>
                          {property.bedrooms && (
                            <p className="text-xs text-gray-500">
                              {property.bedrooms} bed • {property.bathrooms} bath
                              {property.sqm && ` • ${property.sqm} m²`}
                            </p>
                          )}
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="text-blue-600 mr-3 mt-1">ℹ️</div>
              <div className="flex-1">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Properties with exact coordinates are shown on the map. 
                  Properties without coordinates are listed below. Click on markers to view property details.
                </p>
              </div>
            </div>
          </div>

          {/* Selected Property Details */}
          {selectedProperty && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProperty.title}</h3>
                  <p className="text-gray-600 mb-2">
                    {selectedProperty.location}, {selectedProperty.city}, {selectedProperty.state}
                  </p>
                  <p className="text-2xl font-bold text-primary-600 mb-4">
                    {formatPrice(selectedProperty.price, selectedProperty.currency)}
                  </p>
                  {selectedProperty.bedrooms && (
                    <p className="text-gray-600 mb-4">
                      {selectedProperty.bedrooms} bedrooms • {selectedProperty.bathrooms} bathrooms
                      {selectedProperty.sqm && ` • ${selectedProperty.sqm} m²`}
                    </p>
                  )}
                  <Link
                    to={`/properties/${selectedProperty.id}`}
                    className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                  >
                    View Full Details
                  </Link>
                </div>
                {selectedProperty.images && selectedProperty.images.length > 0 && (
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-32 h-32 object-cover rounded-lg ml-4"
                  />
                )}
              </div>
            </div>
          )}

          {/* Property List (Properties without coordinates) */}
          {properties.filter(p => !p.coordinates).length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Properties Without Map Location ({properties.filter(p => !p.coordinates).length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties
                  .filter(p => !p.coordinates)
                  .slice(0, 6)
                  .map((property) => (
                    <Link
                      key={property.id}
                      to={`/properties/${property.id}`}
                      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer block"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">{property.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {property.location}, {property.city}, {property.state}
                      </p>
                      <p className="text-lg font-bold text-primary-600">
                        {formatPrice(property.price, property.currency)}
                      </p>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
