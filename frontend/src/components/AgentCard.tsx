import { Link } from 'react-router-dom';
import type { Agent } from '../data/sampleAgents';
import VerificationBadge from './VerificationBadge';

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const avatarUrl = agent.avatar_url || 'https://picsum.photos/200/200?random=agent';

  return (
    <Link to={`/agents/${agent.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        {/* Agent Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={agent.full_name || 'Agent'}
                className="w-20 h-20 rounded-full border-4 border-white object-cover"
              />
              {agent.verification_status === 'verified' && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">{agent.full_name || 'Agent'}</h3>
              {agent.company_name && (
                <p className="text-primary-100 text-sm">{agent.company_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Agent Info */}
        <div className="p-6">
          {/* Verification Badge */}
          <div className="mb-4">
            <VerificationBadge 
              status={agent.verification_status} 
              type="agent"
              size="sm"
            />
          </div>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-lg font-bold text-gray-900 mr-2">{agent.rating}</span>
              <span className="text-sm text-gray-600">({agent.total_reviews} reviews)</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
            <div>
              <div className="text-2xl font-bold text-primary-600">{agent.years_experience}</div>
              <div className="text-xs text-gray-600">Years Experience</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600">{agent.properties_sold}</div>
              <div className="text-xs text-gray-600">Properties Sold</div>
            </div>
          </div>

          {/* Specialties */}
          {agent.specialties && agent.specialties.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Specialties:</p>
              <div className="flex flex-wrap gap-2">
                {agent.specialties.slice(0, 3).map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {(agent.city || agent.state) && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{agent.city}{agent.state ? `, ${agent.state}` : ''}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

