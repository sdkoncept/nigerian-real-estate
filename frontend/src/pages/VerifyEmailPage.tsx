import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type') || 'signup';
        const tokenHash = searchParams.get('token_hash');

        if (!token && !tokenHash) {
          setStatus('error');
          setMessage('Invalid verification link. No token found.');
          return;
        }

        // Supabase handles email verification automatically when the link is clicked
        // We just need to check if the user is now confirmed
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
        }

        // Try to verify the email using the token
        if (tokenHash) {
          // This is the hash format Supabase uses
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });

          if (error) {
            console.error('Verification error:', error);
            setStatus('error');
            setMessage(error.message || 'Failed to verify email. The link may have expired.');
            return;
          }

          if (data?.user) {
            setStatus('success');
            setMessage('Email verified successfully! Redirecting to login...');
            
            // Update profile verification status
            await supabase
              .from('profiles')
              .update({ is_verified: true })
              .eq('id', data.user.id);

            // Redirect to login after 2 seconds
            setTimeout(() => {
              navigate('/login?verified=true');
            }, 2000);
          } else {
            setStatus('error');
            setMessage('Verification failed. Please try again.');
          }
        } else if (token) {
          // Alternative token format
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any,
          });

          if (error) {
            console.error('Verification error:', error);
            setStatus('error');
            setMessage(error.message || 'Failed to verify email. The link may have expired.');
            return;
          }

          if (data?.user) {
            setStatus('success');
            setMessage('Email verified successfully! Redirecting to login...');
            
            // Update profile verification status
            await supabase
              .from('profiles')
              .update({ is_verified: true })
              .eq('id', data.user.id);

            // Redirect to login after 2 seconds
            setTimeout(() => {
              navigate('/login?verified=true');
            }, 2000);
          } else {
            setStatus('error');
            setMessage('Verification failed. Please try again.');
          }
        } else {
          // Check if user is already verified (link was already used)
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email_confirmed_at) {
            setStatus('success');
            setMessage('Your email is already verified! Redirecting to login...');
            setTimeout(() => {
              navigate('/login?verified=true');
            }, 2000);
          } else {
            setStatus('error');
            setMessage('Invalid verification link. Please request a new verification email.');
          }
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'An unexpected error occurred. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
              <p className="text-gray-600 mb-4">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

