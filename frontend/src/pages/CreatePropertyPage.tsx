import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SecureInput from '../components/SecureInput';
import { useUserProfile } from '../hooks/useUserProfile';
import { geocodeAddress } from '../utils/geocoding';

export default function CreatePropertyPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    property_type: 'House',
    listing_type: 'sale',
    location: '',
    state: '',
    city: '',
    address: '',
    latitude: '',
    longitude: '',
    bedrooms: '',
    bathrooms: '',
    sqm: '',
    parking: '0',
    year_built: '',
    features: '',
    amenities: '',
    is_featured: false,
  });
  const [useManualCoordinates, setUseManualCoordinates] = useState(false);

  // Check verification status on mount
  useEffect(() => {
    if (user && profile) {
      const userType = profile.user_type;
      
      // Agents and sellers must be verified
      if (userType === 'agent' || userType === 'seller') {
        if (userType === 'agent') {
          supabase
            .from('agents')
            .select('verification_status')
            .eq('user_id', user.id)
            .single()
            .then(({ data, error }) => {
              if (error || !data) {
                setError('Agent profile not found. Please complete your agent profile first.');
              } else if (data.verification_status !== 'verified') {
                setError('You must be verified by an admin before you can add properties. Please submit your verification documents and wait for approval.');
              }
            });
        } else if (userType === 'seller') {
          if (!profile.is_verified) {
            setError('You must be verified before you can add properties. Please complete your verification.');
          }
        }
      }
    }
  }, [user, profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = files.slice(0, 10); // Max 10 images
      
      setImageFiles(newFiles);
      
      // Create previews
      const previews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!user) {
      setError('You must be logged in to create a property');
      setLoading(false);
      return;
    }

    // Check verification for agents and sellers
    const userType = profile?.user_type;
    if (userType === 'agent' || userType === 'seller') {
      if (userType === 'agent') {
        const { data: agentData } = await supabase
          .from('agents')
          .select('verification_status')
          .eq('user_id', user.id)
          .single();
        
        if (!agentData || agentData.verification_status !== 'verified') {
          setError('You must be verified by an admin before you can add properties. Please submit your verification documents and wait for approval.');
          setLoading(false);
          return;
        }
      } else if (userType === 'seller') {
        if (!profile?.is_verified) {
          setError('You must be verified before you can add properties. Please complete your verification.');
          setLoading(false);
          return;
        }
      }
    }

    try {
      // Upload images to Supabase Storage
      const imageUrls: string[] = [];
      
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileName = `${user.id}/${Date.now()}_${file.name}`;
          const filePath = `properties/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            
            // Check for different error types
            const errorMessage = uploadError.message?.toLowerCase() || '';
            
            let userFriendlyError = '';
            
            if (errorMessage.includes('bucket') && errorMessage.includes('not found')) {
              userFriendlyError = 'Storage bucket "property-images" not found. Please create this bucket in Supabase Dashboard → Storage → New Bucket.';
            } else if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
              userFriendlyError = 'Permission denied. Storage policies are missing or incorrect. Please check that INSERT policy exists for "property-images" bucket. See STORAGE_SETUP.md for setup instructions.';
            } else if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
              // File already exists, try with a different timestamp
              console.warn('File already exists, skipping:', filePath);
              continue;
            } else {
              userFriendlyError = `Upload failed: ${uploadError.message || 'Unknown error'}. Please check storage policies and try again.`;
            }
            
            // Show error to user
            setError(userFriendlyError);
            console.error('Full error details:', {
              message: uploadError.message,
              name: uploadError.name,
            });
            
            // Stop uploading remaining images on error
            break;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            imageUrls.push(urlData.publicUrl);
          }
        }
      }

      // Parse features and amenities
      const featuresArray = formData.features
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);
      
      const amenitiesArray = formData.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      // Get coordinates - either manual or geocoded
      let coordinates = null;
      
      // Use manual coordinates if provided
      if (useManualCoordinates && formData.latitude && formData.longitude) {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          coordinates = { lat, lng };
          console.log('Using manual coordinates:', coordinates);
        } else {
          setError('Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.');
          setLoading(false);
          return;
        }
      } else {
        // Auto-geocode address if manual coordinates not provided
        try {
          const address = formData.address || formData.location;
          if (address && formData.city && formData.state) {
            console.log('Geocoding address:', { address, city: formData.city, state: formData.state });
            const geocodeResult = await geocodeAddress(address, formData.city, formData.state);
            if (geocodeResult) {
              coordinates = {
                lat: geocodeResult.lat,
                lng: geocodeResult.lng,
              };
              console.log('Geocoding successful:', coordinates);
            } else {
              console.warn('Geocoding failed for address:', address);
            }
          }
        } catch (geocodeError) {
          console.error('Geocoding error (non-fatal):', geocodeError);
          // Don't fail property creation if geocoding fails
        }
      }

      // Create property
      const { data: propertyData, error: insertError } = await supabase
        .from('properties')
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          currency: 'NGN',
          property_type: formData.property_type,
          listing_type: formData.listing_type,
          location: formData.location,
          state: formData.state,
          city: formData.city,
          address: formData.address || null,
          coordinates: coordinates,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
          sqm: formData.sqm ? parseFloat(formData.sqm) : null,
          parking: parseInt(formData.parking),
          year_built: formData.year_built ? parseInt(formData.year_built) : null,
          images: imageUrls,
          features: featuresArray,
          amenities: amenitiesArray,
          created_by: user.id,
          verification_status: 'pending',
          is_active: true,
          is_featured: formData.is_featured || false,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // If featured listing was selected, initiate payment
      if (formData.is_featured && propertyData) {
        try {
          // Get session token
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('Please log in to continue');
          }

          // Import PaymentService dynamically to avoid circular dependencies
          const { PaymentService } = await import('../services/payment');

          // Initialize featured listing payment
          const paymentResult = await PaymentService.initializePayment(
            {
              amount: 2000, // ₦2,000 per month
              currency: 'NGN',
              payment_type: 'featured_listing',
              entity_id: propertyData.id,
              description: `Featured Listing - ${formData.title}`,
            },
            session.access_token
          );

          if (!paymentResult.success || !paymentResult.authorization_url) {
            throw new Error(paymentResult.error || 'Failed to initialize payment');
          }

          // Open Paystack payment window
          const paymentCompleted = await PaymentService.openPaymentWindow(
            paymentResult.authorization_url
          );

          if (paymentCompleted && paymentResult.reference) {
            // Verify payment
            const verifyResult = await PaymentService.verifyPayment(
              paymentResult.reference,
              session.access_token
            );

            if (verifyResult.success) {
              // Create featured listing record
              const featuredUntil = new Date();
              featuredUntil.setMonth(featuredUntil.getMonth() + 1); // 1 month from now

              const { error: featuredError } = await supabase
                .from('featured_listings')
                .insert({
                  property_id: propertyData.id,
                  featured_until: featuredUntil.toISOString(),
                  priority: 1,
                });

              if (featuredError) {
                console.error('Error creating featured listing:', featuredError);
                // Payment succeeded but featured listing creation failed
                alert('Payment successful! However, there was an error activating featured status. Please contact support.');
              } else {
                alert('Payment successful! Your property is now featured for 1 month.');
              }
            } else {
              throw new Error('Payment verification failed. Please contact support.');
            }
          }
        } catch (paymentError: any) {
          console.error('Featured listing payment error:', paymentError);
          alert(`Payment error: ${paymentError.message}. Your property has been created but is not featured. You can upgrade later.`);
        }
      }

      // Success - redirect to property detail or dashboard
      navigate(`/seller/dashboard`);
    } catch (err: any) {
      console.error('Error creating property:', err);
      setError(err.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">List Your Property</h1>
            <p className="text-xl text-primary-100">Add a new property listing</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Basic Information */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <SecureInput
                      type="text"
                      label="Property Title"
                      name="title"
                      value={formData.title}
                      onChange={(value) => handleInputChange('title', value)}
                      required
                      placeholder="e.g., Luxury 3-Bedroom Apartment in Lekki"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <SecureInput
                      type="textarea"
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={(value) => handleInputChange('description', value)}
                      required
                      rows={5}
                      placeholder="Describe your property in detail..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.property_type}
                      onChange={(e) => handleInputChange('property_type', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="House">House</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Condo">Condo</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Land">Land</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Shortlet">Shortlet</option>
                      <option value="Airbnb">Airbnb</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Listing Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.listing_type}
                      onChange={(e) => handleInputChange('listing_type', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                      <option value="lease">For Lease</option>
                      <option value="short_stay">Short Stay</option>
                      <option value="airbnb">Airbnb</option>
                    </select>
                  </div>

                  <div>
                    <SecureInput
                      type="text"
                      label="Price (NGN)"
                      name="price"
                      value={formData.price}
                      onChange={(value) => handleInputChange('price', value)}
                      required
                      placeholder="50000000"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <SecureInput
                      type="text"
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={(value) => handleInputChange('state', value)}
                      required
                      placeholder="Lagos"
                    />
                  </div>

                  <div>
                    <SecureInput
                      type="text"
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={(value) => handleInputChange('city', value)}
                      required
                      placeholder="Lagos"
                    />
                  </div>

                  <div>
                    <SecureInput
                      type="text"
                      label="Location/Area"
                      name="location"
                      value={formData.location}
                      onChange={(value) => handleInputChange('location', value)}
                      required
                      placeholder="Lekki Phase 1"
                    />
                  </div>

                  <div>
                    <SecureInput
                      type="text"
                      label="Address (Optional)"
                      name="address"
                      value={formData.address}
                      onChange={(value) => handleInputChange('address', value)}
                      placeholder="Full street address"
                    />
                  </div>
                </div>

                {/* Manual Coordinates Option */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="useManualCoordinates"
                      checked={useManualCoordinates}
                      onChange={(e) => setUseManualCoordinates(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="useManualCoordinates" className="ml-2 text-sm font-medium text-gray-700">
                      Manually set coordinates (for map display)
                    </label>
                  </div>
                  {useManualCoordinates && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                          Latitude
                        </label>
                        <input
                          id="latitude"
                          type="number"
                          step="any"
                          name="latitude"
                          value={formData.latitude}
                          onChange={(e) => handleInputChange('latitude', e.target.value)}
                          placeholder="6.5244"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Example: 6.5244 (for Lagos)</p>
                      </div>
                      <div>
                        <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                          Longitude
                        </label>
                        <input
                          id="longitude"
                          type="number"
                          step="any"
                          name="longitude"
                          value={formData.longitude}
                          onChange={(e) => handleInputChange('longitude', e.target.value)}
                          placeholder="3.3792"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Example: 3.3792 (for Lagos)</p>
                      </div>
                    </div>
                  )}
                  {!useManualCoordinates && (
                    <p className="text-xs text-gray-600 mt-2">
                      💡 Coordinates will be automatically generated from your address. Or check the box above to set them manually.
                    </p>
                  )}
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Property Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <SecureInput
                      type="number"
                      label="Bedrooms"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={(value) => handleInputChange('bedrooms', value)}
                      placeholder="3"
                    />
                  </div>

                  <div>
                    <SecureInput
                      type="text"
                      label="Bathrooms"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={(value) => handleInputChange('bathrooms', value)}
                      placeholder="2.5"
                    />
                  </div>

                  <div>
                    <SecureInput
                      type="text"
                      label="Square Meters (sqm)"
                      name="sqm"
                      value={formData.sqm}
                      onChange={(value) => handleInputChange('sqm', value)}
                      placeholder="150"
                    />
                  </div>

                  <div>
                    <SecureInput
                      type="number"
                      label="Parking Spaces"
                      name="parking"
                      value={formData.parking}
                      onChange={(value) => handleInputChange('parking', value)}
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <SecureInput
                      type="number"
                      label="Year Built (Optional)"
                      name="year_built"
                      value={formData.year_built}
                      onChange={(value) => handleInputChange('year_built', value)}
                      placeholder="2020"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Property Images</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images (Max 10, JPG/PNG)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Upload up to 10 images. First image will be the main property image.
                  </p>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = imageFiles.filter((_, i) => i !== index);
                            const newPreviews = imagePreviews.filter((_, i) => i !== index);
                            setImageFiles(newFiles);
                            setImagePreviews(newPreviews);
                            // Revoke URL to free memory
                            URL.revokeObjectURL(preview);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Features & Amenities */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <SecureInput
                      type="textarea"
                      label="Features (comma-separated)"
                      name="features"
                      value={formData.features}
                      onChange={(value) => handleInputChange('features', value)}
                      rows={3}
                      placeholder="Swimming Pool, Gym, Security, Generator"
                    />
                  </div>

                  <div>
                    <SecureInput
                      type="textarea"
                      label="Amenities (comma-separated)"
                      name="amenities"
                      value={formData.amenities}
                      onChange={(value) => handleInputChange('amenities', value)}
                      rows={3}
                      placeholder="WiFi, AC, Parking, Elevator"
                    />
                  </div>
                </div>
              </div>

              {/* Featured Listing Option */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                      ⭐ Featured Listing
                    </h3>
                    <p className="text-gray-700 mb-2">
                      Make your property stand out with featured placement at the top of search results
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>✓ Top placement in search results</li>
                      <li>✓ Highlighted with special badge</li>
                      <li>✓ 3x more views on average</li>
                      <li>✓ Priority in property listings</li>
                    </ul>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary-600">₦2,000</span>
                      <span className="text-gray-600">per month</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured || false}
                        onChange={(e) => handleInputChange('is_featured', e.target.checked.toString())}
                        className="w-6 h-6 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm font-semibold text-gray-700">Make Featured</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Payment required after listing
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {loading ? 'Creating Property...' : 'Create Property Listing'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/seller/dashboard')}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

