import { Link } from 'react-router-dom';
import { useState } from 'react';
import ProtectedImage from './ProtectedImage';

export interface Property {
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
  bedrooms?: number;
  bathrooms?: number;
  sqm?: number;
  images: string[];
  is_featured?: boolean;
  verification_status?: string;
}

interface PropertyCardProps {
  property: Property;
}

// Placeholder image that doesn't require CORS
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5Qcm9wZXJ0eSBJbWFnZTwvdGV4dD48L3N2Zz4=';

export default function PropertyCard({ property }: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const mainImage = imageError || !property.images || property.images.length === 0
    ? PLACEHOLDER_IMAGE
    : property.images[0];

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link to={`/properties/${property.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <ProtectedImage
            src={mainImage}
            alt={property.title}
            onError={handleImageError}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {property.is_featured && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              ⭐ Featured
            </div>
          )}
          {property.verification_status === 'verified' && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              ✓ Verified
            </div>
          )}
          {property.listing_type === 'sale' && (
            <span className="absolute bottom-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
              For Sale
            </span>
          )}
          {property.listing_type === 'rent' && (
            <span className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
              For Rent
            </span>
          )}
          {property.listing_type === 'lease' && (
            <span className="absolute bottom-2 right-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold">
              For Lease
            </span>
          )}
          {property.listing_type === 'short_stay' && (
            <span className="absolute bottom-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Short Stay
            </span>
          )}
          {property.listing_type === 'airbnb' && (
            <span className="absolute bottom-2 right-2 bg-pink-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Airbnb
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
            {property.title}
          </h3>
          
          <p className="text-primary-600 font-bold text-xl mb-2">
            {formatPrice(property.price)}
          </p>

          <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{property.city}, {property.state}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 border-t dark:border-gray-700 pt-3">
            {property.bedrooms && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                <span>{property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {property.sqm && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>{property.sqm} m²</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

