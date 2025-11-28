import { useState } from 'react';
import Layout from '../components/Layout';
import AgentCard from '../components/AgentCard';
import type { Agent } from '../data/sampleAgents';
import { sampleAgents } from '../data/sampleAgents';

export default function AgentsPage() {
  const [agents] = useState<Agent[]>(sampleAgents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedVerification, setSelectedVerification] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

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
      <div className="bg-gray-50 min-h-screen">
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Found <span className="font-semibold text-gray-900">{sortedAgents.length}</span> agent{sortedAgents.length !== 1 ? 's' : ''}
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
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

