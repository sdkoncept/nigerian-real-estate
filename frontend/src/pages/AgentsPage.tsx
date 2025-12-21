import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import AgentCard from '../components/AgentCard';
import { supabase } from '../lib/supabase';
import { sampleAgents } from '../data/sampleAgents';

// Agent interface - moved here to avoid importing from sampleAgents
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

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedVerification, setSelectedVerification] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

  useEffect(() => {
    console.log('🚀 AgentsPage component mounted');
    // Clear any cached data
    setAgents([]);
    setLoading(true);
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      console.log('=== AGENTS PAGE: Starting to load agents ===');
      console.log('Supabase client:', supabase ? 'Initialized' : 'NOT INITIALIZED');
      
      // Test Supabase connection first
      const { error: testError } = await supabase
        .from('agents')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('=== SUPABASE CONNECTION TEST FAILED ===');
        console.error('Error:', testError);
        console.error('Error code:', testError.code);
        console.error('Error message:', testError.message);
        console.error('Error details:', testError.details);
        console.error('Error hint:', testError.hint);
        setError(`Database connection error: ${testError.message || 'Unable to connect to database'}`);
        setAgents([]);
        setLoading(false);
        return;
      }
      
      console.log('✅ Supabase connection test passed');
      console.log('🔄 Loading all agents from database...');
      
      // Load agents with profiles in a single query using Supabase join (much faster!)
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('verification_status', 'verified') // Only show verified agents
        .order('rating', { ascending: false });

      if (agentsError) {
        console.error('❌ Error loading agents:', agentsError);
        console.error('Error code:', agentsError.code);
        console.error('Error message:', agentsError.message);
        console.error('Error details:', agentsError.details);
        setError(`Error loading agents: ${agentsError.message || 'Unknown error'}`);
        setAgents([]);
        setLoading(false);
        return;
      }

      if (!agentsData) {
        console.warn('⚠️ No agents data returned (null or undefined)');
        setAgents([]);
        setLoading(false);
        return;
      }

      if (agentsData.length === 0) {
        console.log('ℹ️ No agents found in database');
        setAgents([]);
        setLoading(false);
        return;
      }

      console.log(`✅ Loaded ${agentsData.length} agents from database with profiles`);

      // Filter out inactive agents (but keep NULL as active)
      const activeAgents = agentsData.filter(agent => agent.is_active !== false);
      console.log(`✅ ${activeAgents.length} active agents after filtering`);

      // Transform agents with profile data (already loaded via join)
      const agentsWithProfiles = activeAgents.map((agent: any) => {
        try {
          // Handle profile data - Supabase returns it as an array or object depending on relationship
          const profile = Array.isArray(agent.profiles) 
            ? agent.profiles[0] 
            : agent.profiles;

          const transformedAgent = {
            ...agent,
            full_name: profile?.full_name || 'Agent',
            email: profile?.email || '',
            phone: profile?.phone || '',
            avatar_url: profile?.avatar_url || undefined,
            // Ensure required fields have defaults
            specialties: agent.specialties || [],
            years_experience: agent.years_experience || 0,
            properties_sold: agent.properties_sold || 0,
            rating: agent.rating || 0,
            total_reviews: agent.total_reviews || 0,
            verification_status: agent.verification_status || 'pending',
            is_active: agent.is_active !== undefined ? agent.is_active : true,
            // Optional location fields
            city: undefined,
            state: undefined,
          };

          return transformedAgent;
        } catch (error) {
          console.error(`❌ Error processing agent ${agent.id}:`, error);
          // Return agent with minimal data if profile fetch fails
          return {
            ...agent,
            full_name: 'Agent',
            email: '',
            phone: '',
            specialties: agent.specialties || [],
            years_experience: agent.years_experience || 0,
            properties_sold: agent.properties_sold || 0,
            rating: agent.rating || 0,
            total_reviews: agent.total_reviews || 0,
            verification_status: agent.verification_status || 'pending',
            is_active: agent.is_active !== undefined ? agent.is_active : true,
          };
        }
      });

      console.log(`✅ Successfully loaded ${agentsWithProfiles.length} agents with profiles`);
      console.log('📋 Verification status breakdown:', {
        verified: agentsWithProfiles.filter(a => a.verification_status === 'verified').length,
        pending: agentsWithProfiles.filter(a => a.verification_status === 'pending').length,
        rejected: agentsWithProfiles.filter(a => a.verification_status === 'rejected').length,
      });
      console.log('👤 Agent names:', agentsWithProfiles.map(a => a.full_name));

      // Combine database agents with sample agents
      const allAgents = [...agentsWithProfiles, ...sampleAgents];
      console.log(`✅ Combined ${allAgents.length} total agents (${agentsWithProfiles.length} from database + ${sampleAgents.length} sample)`);
      
      setAgents(allAgents);
      
      // Double check - log what we just set
      setTimeout(() => {
        console.log('🔍 Verification: Agents state after set:', agentsWithProfiles.length);
      }, 100);
    } catch (error) {
      console.error('❌ Unexpected error loading agents:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        setError(`Unexpected error: ${error.message}`);
      } else {
        setError('An unexpected error occurred while loading agents');
      }
      setAgents([]);
    } finally {
      setLoading(false);
      console.log('✅ Finished loading agents');
      setError(null); // Clear error if we successfully loaded
    }
  };

  // Get unique states for filter
  const states = Array.from(new Set(agents.map(a => a.state).filter(Boolean))).sort();

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      (agent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (agent.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (agent.city?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (agent.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) || false);
    
    const matchesState = selectedState === 'all' || agent.state === selectedState;
    const matchesVerification = selectedVerification === 'all' || agent.verification_status === selectedVerification;

    return matchesSearch && matchesState && matchesVerification;
  });

  // Sort agents
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'experience':
        return b.years_experience - a.years_experience;
      case 'properties':
        return b.properties_sold - a.properties_sold;
      case 'name':
        return (a.full_name || '').localeCompare(b.full_name || '');
      default:
        return 0;
    }
  });

  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Find Verified Real Estate Agents</h1>
            <p className="text-xl text-primary-100">
              Connect with trusted, licensed agents across Nigeria
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, company, city, or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All States</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Verification Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification
                </label>
                <select
                  value={selectedVerification}
                  onChange={(e) => setSelectedVerification(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Agents</option>
                  <option value="verified">Verified Only</option>
                  <option value="pending">Pending Verification</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="rating">Highest Rating</option>
                  <option value="experience">Most Experience</option>
                  <option value="properties">Most Properties Sold</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error Loading Agents</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      loadAgents();
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-300">
                  Found <span className="font-semibold text-gray-900 dark:text-white">{sortedAgents.length}</span> agent{sortedAgents.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Agents Grid */}
              {sortedAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

