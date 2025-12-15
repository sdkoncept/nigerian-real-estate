import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword } = useAuth();

  // Log when component mounts
  useEffect(() => {
    console.log('=== ForgotPasswordPage MOUNTED ===');
    console.log('Current URL:', window.location.href);
    console.log('Path:', window.location.pathname);
    console.log('Component state:', { email, loading, success, error });
    
    // Test if form element exists
    setTimeout(() => {
      const form = document.querySelector('form');
      const button = document.querySelector('button[type="submit"]');
      console.log('DOM check:', {
        formExists: !!form,
        buttonExists: !!button,
        buttonDisabled: button ? (button as HTMLButtonElement).disabled : 'N/A',
        buttonText: button ? button.textContent : 'N/A'
      });
    }, 100);
  }, []);

  // Check if Supabase is configured
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('ForgotPasswordPage - Checking Supabase config:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing'
    });
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase not configured!', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
      setError('Application configuration error. Please contact support.');
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== FORGOT PASSWORD FORM SUBMITTED ===');
    console.log('Email:', email);
    console.log('Form event:', e.type);
    
    setError(null);
    setSuccess(false);
    setLoading(true);

    console.log('ForgotPasswordPage - Submitting email:', email);

    try {
      // Validate email format
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      console.log('ForgotPasswordPage - Calling resetPassword with email:', email);
      
      // Get redirect URL
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
      const redirectTo = `${frontendUrl}/reset-password`;
      console.log('ForgotPasswordPage - Redirect URL:', redirectTo);
      console.log('ForgotPasswordPage - Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'NOT CONFIGURED');
      
      // Test Supabase connection first
      console.log('ForgotPasswordPage - Testing Supabase connection...');
      const testConnection = await supabase.auth.getSession();
      console.log('ForgotPasswordPage - Supabase connection test:', {
        hasSession: !!testConnection.data?.session,
        error: testConnection.error?.message
      });
      
      // Call Supabase directly to get better error information and debugging
      console.log('ForgotPasswordPage - Calling Supabase resetPasswordForEmail directly...');
      console.log('ForgotPasswordPage - Parameters:', { email, redirectTo });
      
      const startTime = Date.now();
      const supabaseResult = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });
      const endTime = Date.now();
      
      console.log('ForgotPasswordPage - Supabase call completed in', endTime - startTime, 'ms');
      console.log('ForgotPasswordPage - Supabase direct call result:', {
        hasData: !!supabaseResult.data,
        data: supabaseResult.data,
        error: supabaseResult.error ? {
          message: supabaseResult.error.message,
          status: supabaseResult.error.status,
          name: supabaseResult.error.name,
          code: (supabaseResult.error as any).code
        } : null
      });
      
      // Check network tab for failed requests
      if (!supabaseResult.data && !supabaseResult.error) {
        console.warn('ForgotPasswordPage - WARNING: No data and no error returned. This might indicate a network issue.');
      }
      
      // Use the direct result for better error handling
      const result = { error: supabaseResult.error };
      

      if (result.error) {
        console.error('ForgotPasswordPage - Error details:', {
          message: result.error.message,
          status: result.error.status,
          name: result.error.name
        });
        
        // Handle specific Supabase errors
        if (result.error.message?.includes('rate limit')) {
          setError('Too many requests. Please wait a few minutes and try again.');
        } else if (result.error.message?.includes('not found') || result.error.message?.includes('does not exist')) {
          // Don't reveal if email exists (security best practice)
          // Still show success message
          setSuccess(true);
          setEmail('');
        } else {
          setError(result.error.message || 'Failed to send password reset email. Please try again.');
        }
        setLoading(false);
      } else {
        console.log('ForgotPasswordPage - Success! Supabase call completed without error.');
        console.log('ForgotPasswordPage - Note: If email service is not configured in Supabase, emails may not be sent.');
        console.log('ForgotPasswordPage - Check Supabase Dashboard → Settings → Auth → Email Templates');
        
        // Always show success (security - don't reveal if email exists)
        // Note: Supabase might succeed even if email service isn't configured
        setSuccess(true);
        setEmail(''); // Clear email for security
        setLoading(false);
        
        // Show additional info in success message
        console.log('ForgotPasswordPage - If you don\'t receive an email, check:');
        console.log('1. Spam folder');
        console.log('2. Supabase Dashboard → Authentication → Email Templates');
        console.log('3. Supabase Dashboard → Settings → Auth → SMTP Settings');
      }
    } catch (err: any) {
      console.error('ForgotPasswordPage - Exception:', err);
      console.error('ForgotPasswordPage - Exception details:', {
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
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
                  Password reset email sent!
                </p>
                <p className="mt-1 text-sm text-green-700">
                  Please check your inbox and click the link to reset your password. If you don't see it, check your spam folder.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!success && (
          <form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && email) {
                console.log('Enter key pressed in form');
              }
            }}
          >
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
                autoComplete="email"
              />
              <p className="mt-2 text-sm text-gray-500">
                We'll send a password reset link to this email address.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              onClick={(e) => {
                console.log('=== BUTTON CLICKED ===');
                console.log('Button clicked!', { loading, email, disabled: loading || !email });
                console.log('Event type:', e.type);
                if (!email) {
                  console.log('No email, preventing default');
                  e.preventDefault();
                  setError('Please enter your email address');
                  return false;
                }
                console.log('Email present, allowing form submission');
              }}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            {loading && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 text-center">
                  Please wait while we send the reset link...
                </p>
                <div className="mt-2 flex justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                </div>
              </div>
            )}
            
            {!loading && email && (
              <p className="text-xs text-gray-400 text-center mt-2">
                Click the button above to send a password reset link to {email}
              </p>
            )}
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
