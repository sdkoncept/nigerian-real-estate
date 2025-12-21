import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent } from '../utils/analytics';

interface SoftSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: 'property_limit' | 'time_on_site' | 'scroll' | 'exit_intent';
  propertyViews?: number;
}

export default function SoftSignupModal({ 
  isOpen, 
  onClose, 
  trigger,
  propertyViews = 0 
}: SoftSignupModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      trackEvent('Signup', 'Modal Shown', trigger);
    }
  }, [isOpen, trigger]);

  if (!isOpen || user) return null;

  const handleSignup = () => {
    trackEvent('Signup', 'Modal CTA Clicked', trigger);
    navigate('/signup');
    onClose();
  };

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('dont_show_signup_modal', 'true');
    }
    trackEvent('Signup', 'Modal Dismissed', trigger);
    onClose();
  };

  const getMessage = () => {
    switch (trigger) {
      case 'property_limit':
        return {
          title: '🎯 Unlock Unlimited Property Views!',
          description: `You've viewed ${propertyViews} properties. Sign up for free to view unlimited properties, save favorites, and get personalized recommendations.`,
          benefits: [
            '✅ Unlimited property views',
            '✅ Save favorite properties',
            '✅ Get price alerts',
            '✅ Access exclusive listings'
          ]
        };
      case 'time_on_site':
        return {
          title: '🌟 Join Nigeria\'s #1 Real Estate Platform!',
          description: 'You\'ve been browsing for a while. Create a free account to unlock the full experience!',
          benefits: [
            '✅ Save your searches',
            '✅ Get instant notifications',
            '✅ Connect with verified agents',
            '✅ Track property price changes'
          ]
        };
      default:
        return {
          title: '🚀 Start Your Property Journey Today!',
          description: 'Create a free account to access exclusive features and find your dream property faster.',
          benefits: [
            '✅ Personalized property recommendations',
            '✅ Save and compare properties',
            '✅ Direct contact with sellers',
            '✅ Price drop alerts'
          ]
        };
    }
  };

  const message = getMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
          aria-label="Close"
        >
          ✕
        </button>
        
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {message.title}
          </h3>
          <p className="text-black dark:text-gray-300">
            {message.description}
          </p>
        </div>

        <ul className="space-y-2 mb-6">
          {message.benefits.map((benefit, index) => (
            <li key={index} className="text-sm text-black dark:text-gray-300">
              {benefit}
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          <button
            onClick={handleSignup}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Create Free Account
          </button>
          
          <Link
            to="/login"
            onClick={onClose}
            className="block text-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm"
          >
            Already have an account? Sign in
          </Link>

          <label className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded"
            />
            <span>Don't show this again</span>
          </label>
        </div>
      </div>
    </div>
  );
}

