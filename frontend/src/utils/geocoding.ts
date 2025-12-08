/**
 * Geocoding utility functions
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
}

/**
 * Geocode an address to coordinates
 * @param address - Full address string
 * @param city - City name
 * @param state - State name
 * @param country - Country name (default: Nigeria)
 * @returns Promise with coordinates or null if geocoding fails
 */
export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  country: string = 'Nigeria'
): Promise<GeocodeResult | null> {
  try {
    // Build query string
    const queryParts = [];
    if (address) queryParts.push(address);
    if (city) queryParts.push(city);
    if (state) queryParts.push(state);
    if (country) queryParts.push(country);
    
    const query = queryParts.join(', ');
    
    if (!query.trim()) {
      console.warn('Geocoding: Empty query');
      return null;
    }

    // Use Nominatim API (OpenStreetMap geocoding service)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=ng`,
      {
        headers: {
          'User-Agent': 'HouseDirectNG/1.0 (https://housedirectng.com)',
          'Accept-Language': 'en',
        },
      }
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn('Geocoding: No results found for', query);
      return null;
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name || query,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with address or null if reverse geocoding fails
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'HouseDirectNG/1.0 (https://housedirectng.com)',
          'Accept-Language': 'en',
        },
      }
    );

    if (!response.ok) {
      console.error('Reverse geocoding API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

