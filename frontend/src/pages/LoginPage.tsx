import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [showVerificationLink, setShowVerificationLink] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowVerificationLink(false);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      // Check if error is related to email verification
      const errorLower = error.message?.toLowerCase() || '';
      const isVerificationError = 
        errorLower.includes('email') && 
        (errorLower.includes('verify') || 
         errorLower.includes('confirm') ||
         errorLower.includes('not verified') ||
         errorLower.includes('unverified') ||
         errorLower.includes('verification'));
      
      // Also check for common Supabase auth errors that indicate unverified email
      const isAuthError = 
        errorLower.includes('invalid login') ||
        errorLower.includes('invalid credentials') ||
        errorLower.includes('email not confirmed') ||
        errorLower.includes('user not found');
      
      if (isVerificationError || isAuthError) {
        setShowVerificationLink(true);
      }
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>{error}</p>
            {showVerificationLink && (
              <div className="mt-3 pt-3 border-t border-red-300">
                <p className="text-sm mb-2">Need a new verification email?</p>
                <Link
                  to="/request-verification"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium underline"
                >
                  Request verification email
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>
          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Haven't verified your email?
            </p>
            <Link
              to="/request-verification"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium underline"
            >
              Request verification email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

