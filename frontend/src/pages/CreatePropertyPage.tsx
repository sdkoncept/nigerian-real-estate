import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import SecureInput from '../components/SecureInput';

export default function CreatePropertyPage() {
  const { user } = useAuth();
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
    bedrooms: '',
    bathrooms: '',
    sqm: '',
    parking: '0',
    year_built: '',
    features: '',
    amenities: '',
  });

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
            continue;
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

      // Create property
      const { error: insertError } = await supabase
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
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
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

