import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { hasReachedLimit, getPropertyViewCount } from '../utils/propertyViewLimit';
import SoftSignupModal from './SoftSignupModal';

interface PropertyViewLimitBlockerProps {
  children: React.ReactNode;
  propertyId: string;
}

export default function PropertyViewLimitBlocker({ 
  children, 
  propertyId 
}: PropertyViewLimitBlockerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (!user && propertyId) {
      const count = getPropertyViewCount();
      setViewCount(count);
      
      if (hasReachedLimit()) {
        setShowModal(true);
      }
    }
  }, [user, propertyId]);

  if (user) {
    return <>{children}</>;
  }

  if (hasReachedLimit()) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Unlock Unlimited Property Views!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You've viewed {viewCount} properties. Sign up for free to continue browsing unlimited properties!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/signup')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Free forever • No credit card required
            </p>
          </div>
        </div>
        <SoftSignupModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          trigger="property_limit"
          propertyViews={viewCount}
        />
      </>
    );
  }

  return <>{children}</>;
}

