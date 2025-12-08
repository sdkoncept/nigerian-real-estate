import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import VerificationBadge from '../components/VerificationBadge';
import SecureInput from '../components/SecureInput';
import { validatePropertyForm } from '../utils/validation';
import { detectSuspiciousPatterns } from '../utils/security';
import { supabase } from '../lib/supabase';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency?: string;
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
  verification_status?: 'verified' | 'pending' | 'rejected';
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  // Helper function to check if a string is a valid UUID
  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Load property from database or sample data
  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  // Check if property is in favorites
  useEffect(() => {
    if (user && id && property) {
      checkFavorite();
    }
  }, [user, id, property]);

  const loadProperty = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Loading property with ID:', id);
      console.log('Is UUID?', isValidUUID(id));

      // Check if it's a UUID (database property) or sample data ID
      if (isValidUUID(id)) {
        // Fetch from database - try without is_active filter first (RLS will handle it)
        const { data, error: dbError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        console.log('Database query result:', { data, error: dbError });

        if (dbError) {
          console.error('Error loading property:', dbError);
          // Check if it's a permission error or not found
          if (dbError.code === 'PGRST116' || dbError.message?.includes('No rows')) {
            setError('Property not found. It may have been deleted or is not active.');
          } else if (dbError.message?.includes('permission') || dbError.message?.includes('policy')) {
            setError('Permission denied. You may not have access to view this property.');
          } else {
            setError(`Error loading property: ${dbError.message || 'Unknown error'}`);
          }
          setLoading(false);
          return;
        }

        if (!data) {
          console.warn('No data returned from database');
          setError('Property not found');
          setLoading(false);
          return;
        }

        console.log('Property loaded successfully:', data);

        // Check if property is featured (don't fail if this query fails)
        let featuredData = null;
        try {
          const { data: featured } = await supabase
            .from('featured_listings')
            .select('property_id, priority, featured_until')
            .eq('property_id', id)
            .gt('featured_until', new Date().toISOString())
            .maybeSingle();
          featuredData = featured;
        } catch (featuredError) {
          console.warn('Error checking featured status:', featuredError);
          // Continue anyway
        }

        // Transform database property to Property type
        const transformedProperty: Property = {
          id: data.id,
          title: data.title,
          description: data.description,
          price: parseFloat(String(data.price)),
          currency: data.currency || 'NGN',
          property_type: data.property_type,
          listing_type: data.listing_type,
          location: data.location,
          state: data.state,
          city: data.city,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          sqm: data.sqm ? parseFloat(String(data.sqm)) : undefined,
          images: Array.isArray(data.images) ? data.images : [],
          is_featured: !!featuredData || data.is_featured || false,
          verification_status: data.verification_status || 'pending',
        };

        console.log('Transformed property:', transformedProperty);
        setProperty(transformedProperty);
      } else {
        // Not a valid UUID - property not found
        console.warn('Invalid property ID format:', id);
        setError('Property not found. Invalid property ID format.');
      }
    } catch (error: any) {
      console.error('Error loading property:', error);
      setError(`Failed to load property: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!user || !id || !property) return;

    // Only check favorites for UUIDs (database properties), not sample data
    if (!isValidUUID(id)) {
      setIsFavorite(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', id)
        .single();

      if (!error && data) {
        setIsFavorite(true);
      }
    } catch (error) {
      // Not in favorites
      setIsFavorite(false);
    }
  };

  const [contactForm, setContactForm] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    message: '',
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-gray-600 mb-2">{error || "The property you're looking for doesn't exist."}</p>
            {id && (
              <p className="text-sm text-gray-500 mb-4">
                Property ID: <code className="bg-gray-100 px-2 py-1 rounded">{id}</code>
              </p>
            )}
            <div className="space-y-3">
              <Link
                to="/properties"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse Properties
              </Link>
              <div className="text-xs text-gray-500 mt-4">
                <p>If this property was just created, please check:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Browser console (F12) for detailed error messages</li>
                  <li>That the property ID matches what's in the database</li>
                  <li>That the property is set to <code>is_active = true</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validatePropertyForm({
      title: 'Contact Form',
      description: contactForm.message,
      price: 0,
      email: contactForm.email,
      phone: contactForm.phone,
    });

    if (!validation.valid) {
      alert('Please fix the errors in the form');
      return;
    }

    // Check for suspicious patterns (fraud detection)
    const suspiciousCheck = detectSuspiciousPatterns(contactForm.message);
    if (suspiciousCheck.suspicious) {
      alert('Your message contains suspicious content. Please revise and try again.');
      console.warn('Suspicious patterns detected:', suspiciousCheck.reasons);
      return;
    }

    // Submit message via Supabase
    try {
      if (!user || !property) return;

      // Get property owner from database if property is from database
      let recipientId = property.id; // Default fallback
      
      if (isValidUUID(property.id)) {
        const { data: propertyData } = await supabase
          .from('properties')
          .select('user_id')
          .eq('id', property.id)
          .single();
        
        if (propertyData?.user_id) {
          recipientId = propertyData.user_id;
        }
      }

      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: recipientId,
        property_id: isValidUUID(property.id) ? property.id : null,
        subject: `Inquiry about ${property.title}`,
        message: contactForm.message,
      });

      if (error) {
        throw error;
      }

      alert('Message sent successfully! The property owner will be notified.');
      setShowContactForm(false);
      setContactForm({ ...contactForm, message: '' });
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Error sending message: ' + error.message);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const mainImage = property.images && property.images.length > 0 
    ? property.images[selectedImageIndex] 
    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5Qcm9wZXJ0eSBJbWFnZTwvdGV4dD48L3N2Zz4=';

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-primary-600">Home</Link>
              <span>/</span>
              <Link to="/properties" className="hover:text-primary-600">Properties</Link>
              <span>/</span>
              <span className="text-gray-900">{property.title}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="relative h-96 bg-gray-200">
                  <img
                    src={mainImage}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {property.is_featured && (
                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      ⭐ Featured
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <VerificationBadge 
                      status={(property.verification_status as 'verified' | 'pending' | 'rejected') || 'pending'} 
                      type="property"
                      size="md"
                    />
                  </div>
                </div>
                
                {/* Thumbnail Gallery */}
                {property.images && property.images.length > 1 && (
                  <div className="p-4 grid grid-cols-4 gap-2">
                    {property.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative h-20 rounded overflow-hidden border-2 ${
                          selectedImageIndex === index
                            ? 'border-primary-600'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${property.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-lg">{property.location}, {property.city}, {property.state}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary-600 mb-1">
                      {formatPrice(property.price)}
                    </p>
                    <span className="text-sm text-gray-600 uppercase">{property.listing_type}</span>
                  </div>
                </div>

                <div className="border-t border-b py-6 my-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {property.bedrooms && (
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                        <div className="text-sm text-gray-600">Bedrooms</div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                        <div className="text-sm text-gray-600">Bathrooms</div>
                      </div>
                    )}
                    {property.sqm && (
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{property.sqm}</div>
                        <div className="text-sm text-gray-600">Square Meters</div>
                      </div>
                    )}
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{property.property_type}</div>
                      <div className="text-sm text-gray-600">Type</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              </div>

              {/* Features & Amenities */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Property Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-gray-700">{property.bedrooms} Bedrooms</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                      <span className="text-gray-700">{property.bathrooms} Bathrooms</span>
                    </div>
                  )}
                  {property.sqm && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span className="text-gray-700">{property.sqm} m²</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-gray-700">24/7 Security</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-gray-700">Parking Space</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span className="text-gray-700">Generator</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-20">
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/signup');
                        return;
                      }
                      setShowContactForm(!showContactForm);
                    }}
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                  >
                    {user ? 'Contact Agent' : 'Sign Up to Contact'}
                  </button>
                  
                  <button
                    onClick={async () => {
                      if (!user) {
                        navigate('/signup');
                        return;
                      }

                      // Only allow favorites for database properties (UUIDs), not sample data
                      if (!isValidUUID(property.id)) {
                        alert('Favorites are only available for properties listed in the database. This is a sample property.');
                        return;
                      }

                      try {
                        if (isFavorite) {
                          // Remove from favorites
                          const { error } = await supabase
                            .from('favorites')
                            .delete()
                            .eq('user_id', user.id)
                            .eq('property_id', property.id);

                          if (error) throw error;
                          setIsFavorite(false);
                        } else {
                          // Add to favorites
                          const { error } = await supabase
                            .from('favorites')
                            .insert({
                              user_id: user.id,
                              property_id: property.id,
                            });

                          if (error) throw error;
                          setIsFavorite(true);
                        }
                      } catch (error: any) {
                        console.error('Error updating favorite:', error);
                        alert('Error updating favorite: ' + (error.message || 'Unknown error'));
                      }
                    }}
                    className={`w-full px-6 py-3 rounded-lg transition-colors font-semibold ${
                      isFavorite
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                  </button>

                  <button
                    onClick={handleShare}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                  >
                    📤 Share Property
                  </button>
                </div>

                {/* Contact Form */}
                {showContactForm && user && (
                  <form onSubmit={handleContactSubmit} className="mt-6 pt-6 border-t">
                    <div className="space-y-4">
                      <SecureInput
                        type="text"
                        label="Name"
                        name="name"
                        value={contactForm.name}
                        onChange={(value) => setContactForm({ ...contactForm, name: value })}
                        required
                        placeholder="Your full name"
                      />
                      <SecureInput
                        type="email"
                        label="Email"
                        name="email"
                        value={contactForm.email}
                        onChange={(value) => setContactForm({ ...contactForm, email: value })}
                        required
                        placeholder="your.email@example.com"
                      />
                      <SecureInput
                        type="tel"
                        label="Phone"
                        name="phone"
                        value={contactForm.phone}
                        onChange={(value) => setContactForm({ ...contactForm, phone: value })}
                        placeholder="+234 800 000 0000"
                      />
                      <SecureInput
                        type="textarea"
                        label="Message"
                        name="message"
                        value={contactForm.message}
                        onChange={(value) => setContactForm({ ...contactForm, message: value })}
                        required
                        rows={4}
                        placeholder="I'm interested in this property..."
                        validation={(value) => {
                          if (!value || value.trim().length < 10) {
                            return { valid: false, error: 'Message must be at least 10 characters' };
                          }
                          return { valid: true };
                        }}
                      />
                      <button
                        type="submit"
                        className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Property Info Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900 text-right">{property.location}{property.city ? `, ${property.city}` : ''}{property.state ? `, ${property.state}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900">{property.property_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listing:</span>
                    <span className="font-medium text-gray-900 capitalize">{property.listing_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      property.verification_status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {property.verification_status === 'verified' ? '✓ Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

