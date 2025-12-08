import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import VerificationBadge from '../components/VerificationBadge';
import SecureInput from '../components/SecureInput';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Agent interface
interface Agent {
  id: string;
  user_id: string;
  license_number?: string;
  company_name?: string;
  bio?: string;
  specialties: string[];
  years_experience: number;
  properties_sold: number;
  rating: number;
  total_reviews: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
  full_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  city?: string;
  state?: string;
}

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    if (id) {
      loadAgent();
    }
  }, [id]);

  const loadAgent = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Load agent from database
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

      if (agentError) {
        console.error('Error loading agent:', agentError);
        setError('Agent not found');
        setLoading(false);
        return;
      }

      if (!agentData) {
        setError('Agent not found');
        setLoading(false);
        return;
      }

      // Load profile information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email, phone, avatar_url')
        .eq('id', agentData.user_id)
        .single();

      if (profileError) {
        console.warn('Error loading profile:', profileError);
      }

      // Combine agent and profile data
      const agentWithProfile: Agent = {
        ...agentData,
        full_name: profile?.full_name || 'Agent',
        email: profile?.email || '',
        phone: profile?.phone || '',
        avatar_url: profile?.avatar_url || undefined,
        specialties: agentData.specialties || [],
        years_experience: agentData.years_experience || 0,
        properties_sold: agentData.properties_sold || 0,
        rating: agentData.rating || 0,
        total_reviews: agentData.total_reviews || 0,
        verification_status: agentData.verification_status || 'pending',
        is_active: agentData.is_active !== undefined ? agentData.is_active : true,
      };

      setAgent(agentWithProfile);
    } catch (error: any) {
      console.error('Error loading agent:', error);
      setError('Failed to load agent');
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

  if (error || !agent) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent Not Found</h1>
            <p className="text-gray-600 mb-6">The agent you're looking for doesn't exist.</p>
            <Link
              to="/agents"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Agents
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Require authentication
    if (!user) {
      navigate('/signup');
      return;
    }
    
    // Submit message via Supabase
    try {
      if (!agent) return;

      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: agent.user_id,
        subject: `Inquiry for ${agent.full_name || 'Agent'}`,
        message: contactForm.message,
      });

      if (error) {
        throw error;
      }

      alert('Message sent successfully! The agent will be notified.');
      setShowContactForm(false);
      setContactForm({ ...contactForm, message: '' });
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Error sending message: ' + error.message);
    }
  };

  const avatarUrl = agent.avatar_url || 'https://picsum.photos/200/200?random=agent';

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-primary-600">Home</Link>
              <span>/</span>
              <Link to="/agents" className="hover:text-primary-600">Agents</Link>
              <span>/</span>
              <span className="text-gray-900">{agent.full_name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Agent Header */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt={agent.full_name || 'Agent'}
                      className="w-32 h-32 rounded-full border-4 border-primary-200 object-cover"
                    />
                    {agent.verification_status === 'verified' && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{agent.full_name}</h1>
                      <VerificationBadge 
                        status={agent.verification_status} 
                        type="agent"
                        size="md"
                      />
                    </div>
                    {agent.company_name && (
                      <p className="text-xl text-primary-600 font-semibold mb-2">{agent.company_name}</p>
                    )}
                    <div className="flex items-center text-gray-600 mb-2">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{agent.city}{agent.state ? `, ${agent.state}` : ''}</span>
                    </div>
                    {/* Rating */}
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(agent.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-lg font-bold text-gray-900">{agent.rating}</span>
                      <span className="ml-2 text-gray-600">({agent.total_reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {agent.bio && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-700 leading-relaxed">{agent.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Statistics</h2>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">{agent.years_experience}</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">{agent.properties_sold}</div>
                    <div className="text-sm text-gray-600">Properties Sold</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">{agent.total_reviews}</div>
                    <div className="text-sm text-gray-600">Total Reviews</div>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              {agent.specialties && agent.specialties.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Specialties</h2>
                  <div className="flex flex-wrap gap-3">
                    {agent.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Contact Card */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Agent</h3>
                
                {agent.email && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <a
                      href={`mailto:${agent.email}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {agent.email}
                    </a>
                  </div>
                )}

                {agent.phone && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <a
                      href={`tel:${agent.phone}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {agent.phone}
                    </a>
                  </div>
                )}

                {agent.license_number && (
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-sm text-gray-600 mb-1">License Number</p>
                    <p className="text-gray-900 font-medium">{agent.license_number}</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!user) {
                      navigate('/signup');
                      return;
                    }
                    setShowContactForm(!showContactForm);
                  }}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold mb-4"
                >
                  {user ? 'Send Message' : 'Sign Up to Contact'}
                </button>

                {/* Contact Form */}
                {showContactForm && user && (
                  <form onSubmit={handleContactSubmit} className="pt-4 border-t">
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
                        placeholder="I'm interested in working with you..."
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

              {/* Agent Info Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Information</h3>
                <div className="space-y-3 text-sm">
                  {agent.license_number && (
                    <div>
                      <span className="text-gray-600">License:</span>
                      <span className="ml-2 font-medium text-gray-900">{agent.license_number}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 font-medium ${
                      agent.verification_status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {agent.verification_status === 'verified' ? '✓ Verified' : 'Pending Verification'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Active:</span>
                    <span className={`ml-2 font-medium ${agent.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {agent.is_active ? 'Yes' : 'No'}
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

