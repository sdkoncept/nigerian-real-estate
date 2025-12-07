import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import VerificationBadge from '../components/VerificationBadge';
import SecureInput from '../components/SecureInput';
import { supabase } from '../lib/supabase';

interface VerificationSubmission {
  id: string;
  document_type: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  review_notes?: string;
  expiry_date?: string;
  created_at: string;
}

interface AgentProfile {
  id: string;
  license_number?: string;
  company_name?: string;
  bio?: string;
  specialties?: string[];
  years_experience?: number;
  properties_sold?: number;
  verification_status: 'pending' | 'verified' | 'rejected';
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [verificationSubmissions, setVerificationSubmissions] = useState<VerificationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const [uploadForm, setUploadForm] = useState({
    document_type: 'license' as 'license' | 'id' | 'credentials',
    notes: '',
    file: null as File | null,
    expiry_date: '',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Get user profile to check user_type
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading user profile:', profileError);
        setLoading(false);
        return;
      }

      setUserProfile(profileData);

      // Only load agent data if user is an agent
      if (profileData?.user_type !== 'agent') {
        setLoading(false);
        return;
      }

      // Get agent profile - only query if user is an agent
      let { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors if no record

      if (agentError && agentError.code !== 'PGRST116') {
        console.error('Error loading agent profile:', agentError);
      }

      // If no agent profile exists, create one automatically
      if (!agentData && !agentError) {
        const { data: newAgentData, error: createError } = await supabase
          .from('agents')
          .insert({
            user_id: user.id,
            verification_status: 'pending',
            is_active: true,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating agent profile:', createError);
        } else if (newAgentData) {
          agentData = newAgentData;
        }
      }

      // Set agent profile if we have one
      if (agentData) {
        setAgentProfile(agentData);

        // Get verification submissions for this agent
        const { data: verifications, error: verifyError } = await supabase
          .from('verifications')
          .select('*')
          .eq('entity_type', 'agent')
          .eq('entity_id', agentData.id)
          .order('created_at', { ascending: false });

        if (!verifyError && verifications) {
          setVerificationSubmissions(verifications as VerificationSubmission[]);
        }
      }
    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        setPreviewUrl(null);
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Only JPEG, PNG, and PDF files are allowed');
        setPreviewUrl(null);
        return;
      }

      // Create preview URL
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }

      setUploadForm({ ...uploadForm, file });
      setUploadError(null);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmitDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!uploadForm.file) {
      setUploadError('Please select a file to upload');
      return;
    }

    if (!user) {
      setUploadError('You must be logged in to submit documents');
      return;
    }

    setUploading(true);

    try {
      if (!agentProfile) {
        throw new Error('Agent profile not found');
      }

      // Upload file directly to Supabase Storage
      const fileName = `${user.id}/${Date.now()}_${uploadForm.file.name}`;
      const filePath = `verifications/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(filePath, uploadForm.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        // Check if the error is due to missing bucket
        const errorMessage = uploadError.message?.toLowerCase() || '';
        if (errorMessage.includes('bucket') || 
            errorMessage.includes('not found')) {
          throw new Error(
            'Storage bucket "verification-documents" not found. ' +
            'Please create this bucket in Supabase Dashboard: Storage → New Bucket → Name: "verification-documents" → Private → Create. ' +
            'See STORAGE_SETUP.md for detailed instructions.'
          );
        }
        throw new Error('Failed to upload document: ' + uploadError.message);
      }

      // Get public URL (or signed URL for private bucket)
      const { data: urlData } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get document URL');
      }

      // Create verification record in database
      const verificationData: any = {
        entity_type: 'agent',
        entity_id: agentProfile.id,
        document_type: uploadForm.document_type,
        document_url: urlData.publicUrl,
        status: 'pending',
      };

      if (uploadForm.notes) {
        verificationData.review_notes = uploadForm.notes;
      }

      if (uploadForm.expiry_date && uploadForm.document_type === 'license') {
        verificationData.expiry_date = uploadForm.expiry_date;
      }

      const { error: insertError } = await supabase
        .from('verifications')
        .insert(verificationData);

      if (insertError) {
        // Try to delete the uploaded file if database insert fails
        await supabase.storage
          .from('verification-documents')
          .remove([filePath]);
        throw new Error('Failed to create verification record: ' + insertError.message);
      }

      setUploadSuccess('Document submitted successfully! It will be reviewed within 2-5 business days.');
      setUploadForm({ document_type: 'license', notes: '', file: null, expiry_date: '' });
      setPreviewUrl(null);
      
      // Reset file input
      const fileInput = document.getElementById('document-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Reload data
      await loadUserData();
    } catch (error: any) {
      console.error('Error submitting document:', error);
      setUploadError(error.message || 'Failed to submit document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'license':
        return 'Real Estate License';
      case 'id':
        return 'Government ID';
      case 'credentials':
        return 'Professional Credentials';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
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

  // Check if user is an agent
  if (userProfile && userProfile.user_type !== 'agent') {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              This page is only available for agents. You are registered as a <strong>{userProfile.user_type}</strong>.
            </p>
            {userProfile.user_type === 'seller' && (
              <p className="text-sm text-gray-500 mb-4">
                Sellers can manage their properties from the Seller Dashboard.
              </p>
            )}
            <a
              href="/seller/dashboard"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go to Seller Dashboard
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  // Show loading state while agent profile is being created/loaded
  if (loading || !agentProfile) {
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
            <h1 className="text-4xl font-bold mb-2">Agent Dashboard</h1>
            <p className="text-xl text-primary-100">Manage your profile and verification documents</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Verification Status Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">Verification Status</h2>
                  <VerificationBadge 
                    status={agentProfile.verification_status} 
                    type="agent"
                    size="md"
                  />
                </div>
                <p className="text-gray-600">
                  {agentProfile.verification_status === 'verified' && (
                    <>Your agent account is verified. You can now list properties and access all features.</>
                  )}
                  {agentProfile.verification_status === 'pending' && (
                    <>Your verification is pending review. This typically takes 2-5 business days.</>
                  )}
                  {agentProfile.verification_status === 'rejected' && (
                    <>Your verification was rejected. Please review the feedback and resubmit your documents.</>
                  )}
                </p>
              </div>

              {/* Document Upload Form */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Submit Verification Document</h2>
                
                {uploadError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{uploadError}</p>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">{uploadSuccess}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitDocument} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={uploadForm.document_type}
                      onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="license">Real Estate License (Required)</option>
                      <option value="id">Government ID (Required)</option>
                      <option value="credentials">Professional Credentials (Optional)</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {uploadForm.document_type === 'license' && 'Upload your valid Real Estate Agent License'}
                      {uploadForm.document_type === 'id' && 'Upload a government-issued ID (National ID, Passport, Driver\'s License, or Voter\'s Card)'}
                      {uploadForm.document_type === 'credentials' && 'Upload any additional professional certifications or credentials'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document File <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="document-file"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Accepted formats: JPG, PNG, PDF. Maximum file size: 5MB
                    </p>
                    {uploadForm.file && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700 mb-2">
                          Selected: <span className="font-medium">{uploadForm.file.name}</span> ({(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        {previewUrl && (
                          <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <p className="text-xs text-gray-600 mb-2">Preview:</p>
                            <img 
                              src={previewUrl} 
                              alt="Document preview" 
                              className="max-w-full h-auto max-h-64 rounded border border-gray-300"
                            />
                          </div>
                        )}
                        {uploadForm.file.type === 'application/pdf' && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              📄 PDF files cannot be previewed. Please ensure your document is clear and readable.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {uploadForm.document_type === 'license' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Expiry Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={uploadForm.expiry_date}
                        onChange={(e) => setUploadForm({ ...uploadForm, expiry_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        If your license has an expiration date, please provide it. You'll be notified before it expires.
                      </p>
                    </div>
                  )}

                  <div>
                    <SecureInput
                      type="textarea"
                      label="Notes (Optional)"
                      name="notes"
                      value={uploadForm.notes}
                      onChange={(value) => setUploadForm({ ...uploadForm, notes: value })}
                      placeholder="Add any additional notes about this document..."
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || !uploadForm.file}
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    {uploading ? 'Uploading...' : 'Submit Document'}
                  </button>
                </form>
              </div>

              {/* Previous Submissions */}
              {verificationSubmissions.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Previous Submissions</h2>
                  <div className="space-y-4">
                    {verificationSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {getDocumentTypeLabel(submission.document_type)}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Submitted: {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                        {submission.expiry_date && (
                          <p className="text-sm text-gray-600 mb-2">
                            Expires: {new Date(submission.expiry_date).toLocaleDateString()}
                            {new Date(submission.expiry_date) < new Date() && (
                              <span className="ml-2 text-red-600 font-semibold">(Expired)</span>
                            )}
                            {new Date(submission.expiry_date) >= new Date() && 
                             new Date(submission.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                              <span className="ml-2 text-yellow-600 font-semibold">(Expiring Soon)</span>
                            )}
                          </p>
                        )}
                        {submission.document_url && (
                          <div className="mt-2">
                            <a
                              href={submission.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:text-primary-700 underline"
                            >
                              View Document →
                            </a>
                          </div>
                        )}
                        {submission.review_notes && (
                          <div className="mt-2 p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-700">
                              <strong>Review Notes:</strong> {submission.review_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Agent Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Information</h3>
                <div className="space-y-3 text-sm">
                  {agentProfile.license_number && (
                    <div>
                      <span className="text-gray-600">License:</span>
                      <span className="ml-2 font-medium text-gray-900">{agentProfile.license_number}</span>
                    </div>
                  )}
                  {agentProfile.company_name && (
                    <div>
                      <span className="text-gray-600">Company:</span>
                      <span className="ml-2 font-medium text-gray-900">{agentProfile.company_name}</span>
                    </div>
                  )}
                  {agentProfile.years_experience !== undefined && (
                    <div>
                      <span className="text-gray-600">Experience:</span>
                      <span className="ml-2 font-medium text-gray-900">{agentProfile.years_experience} years</span>
                    </div>
                  )}
                  {agentProfile.properties_sold !== undefined && (
                    <div>
                      <span className="text-gray-600">Properties Sold:</span>
                      <span className="ml-2 font-medium text-gray-900">{agentProfile.properties_sold}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Verification Requirements</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Real Estate License (Required)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Government ID (Required)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Professional Credentials (Optional)</span>
                  </li>
                </ul>
                <p className="mt-4 text-xs text-blue-700">
                  Review typically takes 2-5 business days. You'll receive an email notification when your verification status changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

