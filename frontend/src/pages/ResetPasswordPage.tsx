import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let mounted = true;
    
    const checkResetLink = async () => {
      // Log URL for debugging
      console.log('ResetPasswordPage - Current URL:', window.location.href);
      console.log('ResetPasswordPage - Hash:', window.location.hash);
      console.log('ResetPasswordPage - Search params:', window.location.search);

      // Check if we have tokens in the URL (Supabase passes them in hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      console.log('ResetPasswordPage - Tokens found:', {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
        type
      });

      // Supabase's detectSessionInUrl automatically processes tokens from URL hash
      // Wait a moment for Supabase to process the redirect
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user has a session (Supabase creates one after processing reset link)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('ResetPasswordPage - Session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        error: sessionError?.message
      });

      if (sessionError) {
        console.error('ResetPasswordPage - Session error:', sessionError);
      }

      // If no tokens and no session, show error
      if (!accessToken && !refreshToken && !session) {
        if (mounted) {
          setError('Invalid or expired password reset link. Please request a new one.');
        }
      } else if (session) {
        // User has a session, which means reset link was processed
        console.log('ResetPasswordPage - Session found, ready to reset password');
      }
    };

    checkResetLink();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      console.log('ResetPasswordPage - Attempting to update password...');
      
      // Check if we have a session first (required for password update)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('ResetPasswordPage - Session error:', sessionError);
        setError('Session error. Please click the password reset link from your email again.');
        setLoading(false);
        return;
      }

      if (!session) {
        console.error('ResetPasswordPage - No session found');
        setError('No active session. Please click the password reset link from your email to continue.');
        setLoading(false);
        return;
      }

      console.log('ResetPasswordPage - Session found, updating password...');
      
      // Update the password (requires an active session from the reset link)
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      console.log('ResetPasswordPage - Update result:', {
        hasData: !!data,
        error: updateError ? {
          message: updateError.message,
          status: updateError.status
        } : null
      });

      if (updateError) {
        console.error('ResetPasswordPage - Update error:', updateError);
        
        // Handle specific errors
        if (updateError.message?.includes('session') || updateError.message?.includes('expired')) {
          setError('Your password reset session has expired. Please request a new password reset link.');
        } else {
          setError(updateError.message || 'Failed to reset password. Please try again.');
        }
        setLoading(false);
      } else {
        console.log('ResetPasswordPage - Password updated successfully!');
        setSuccess(true);
        setTimeout(() => {
          navigate('/login?password-reset=true');
        }, 2000);
      }
    } catch (err: any) {
      console.error('ResetPasswordPage - Exception:', err);
      console.error('ResetPasswordPage - Exception details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Reset Password</h1>
          <p className="text-gray-600">
            Enter your new password below.
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  Password reset successfully!
                </p>
                <p className="mt-1 text-sm text-green-700">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
            {error.includes('Invalid or expired') && (
              <div className="mt-3">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium underline"
                >
                  Request a new password reset link
                </Link>
              </div>
            )}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
