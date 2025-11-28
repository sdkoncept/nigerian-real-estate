/**
 * Verification Badge Component
 * Displays verification status to prevent fake listings and unverified agents
 */

interface VerificationBadgeProps {
  status: 'verified' | 'pending' | 'rejected';
  type?: 'property' | 'agent';
  size?: 'sm' | 'md' | 'lg';
}

export default function VerificationBadge({ 
  status, 
  type = 'property',
  size = 'md' 
}: VerificationBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  if (status === 'verified') {
    return (
      <div className={`inline-flex items-center ${sizeClasses[size]} bg-green-500 text-white rounded-full font-semibold`}>
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        {type === 'agent' ? 'Verified Agent' : 'Verified Property'}
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className={`inline-flex items-center ${sizeClasses[size]} bg-yellow-500 text-white rounded-full font-semibold`}>
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        Pending Verification
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${sizeClasses[size]} bg-red-500 text-white rounded-full font-semibold`}>
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      Rejected
    </div>
  );
}

