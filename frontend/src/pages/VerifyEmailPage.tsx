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
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;
    let subscription: any = null;

    const verifyEmail = async () => {
      try {
        // Log URL for debugging
        console.log('VerifyEmailPage - Current URL:', window.location.href);
        console.log('VerifyEmailPage - Hash:', window.location.hash);
        console.log('VerifyEmailPage - Search params:', window.location.search);

        // Check URL hash and query params for Supabase tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const tokenHash = hashParams.get('token_hash') || searchParams.get('token_hash');
        const token = hashParams.get('token') || searchParams.get('token');
        const type = hashParams.get('type') || searchParams.get('type') || 'signup';
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        console.log('VerifyEmailPage - Tokens found:', {
          tokenHash: !!tokenHash,
          token: !!token,
          accessToken: !!accessToken,
          refreshToken: !!refreshToken,
          type
        });

        // Note: Supabase might have already verified the email on their server
        // before redirecting here, so tokens might not be in the URL
        // We should check the session first before showing an error
        
        // Try to extract token from referrer if available (Supabase URL)
        // The link goes: Email → Outlook safelinks → Supabase verify → Our page
        // So referrer should contain the Supabase URL with token
        let supabaseToken: string | null = null;
        
        // Check referrer first (Supabase redirects from their server)
        try {
          const referrer = document.referrer;
          console.log('Referrer:', referrer);
          
          // Check if referrer contains Supabase verify URL
          if (referrer.includes('supabase.co/auth/v1/verify')) {
            const referrerUrl = new URL(referrer);
            supabaseToken = referrerUrl.searchParams.get('token');
            console.log('Token extracted from referrer:', supabaseToken ? `Found (${supabaseToken.substring(0, 10)}...)` : 'Not found');
          }
        } catch (e) {
          console.log('Error parsing referrer:', e);
        }

        // Also check if token was passed in our URL (some email clients might preserve it)
        if (!supabaseToken) {
          supabaseToken = searchParams.get('token') || hashParams.get('token');
          if (supabaseToken) {
            console.log('Token found in URL params/hash');
          }
        }

        // If we have a token from referrer, try to verify it immediately
        // This handles the case where Supabase verifies but doesn't pass tokens in redirect
        if (supabaseToken) {
          console.log('Attempting to verify token via backend...');
          try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const verifyResponse = await fetch(`${API_URL}/api/verification/email/check`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: supabaseToken }),
            });

            const verifyData = await verifyResponse.json();
            console.log('Backend verification response:', verifyData);

            if (verifyData.verified === true && verifyData.userId) {
              // Email is verified
              if (mounted) {
                setStatus('success');
                setMessage('Email verified successfully! Redirecting to login...');
                
                // Update profile verification status
                try {
                  await supabase
                    .from('profiles')
                    .update({ is_verified: true })
                    .eq('id', verifyData.userId);
                } catch (profileError) {
                  console.error('Profile update error:', profileError);
                }

                timeoutId = setTimeout(() => {
                  if (mounted) {
                    navigate('/login?verified=true');
                  }
                }, 1500);
              }
              if (subscription) {
                subscription.unsubscribe();
              }
              return;
            } else if (verifyData.verified === 'unknown' || verifyData.suggestLogin) {
              // Token was already used/expired - verification likely succeeded on Supabase's server
              // Tell user to try logging in
              if (mounted) {
                setStatus('success');
                setMessage(
                  'Your email verification link has been processed. ' +
                  'Your email should now be verified. Please try logging in with your email and password.'
                );
                timeoutId = setTimeout(() => {
                  if (mounted) {
                    navigate('/login?verified=true');
                  }
                }, 3000);
              }
              if (subscription) {
                subscription.unsubscribe();
              }
              return;
            }
          } catch (verifyError) {
            console.error('Error verifying token via backend:', verifyError);
            // Continue with normal flow
          }
        }

        // Supabase's detectSessionInUrl automatically processes tokens from URL hash
        // We need to wait for it to complete and then check the session
        
        // Listen for auth state changes (Supabase will update when verification completes)
        const setupAuthListener = () => {
          const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log('Auth state change:', event, session?.user?.email_confirmed_at);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              const user = session?.user;
              if (user?.email_confirmed_at) {
                if (mounted) {
                  setStatus('success');
                  setMessage('Email verified successfully! Redirecting to login...');
                  
                  // Update profile verification status
                  try {
                    await supabase
                      .from('profiles')
                      .update({ is_verified: true })
                      .eq('id', user.id);
                  } catch (profileError) {
                    console.error('Profile update error:', profileError);
                  }

                  timeoutId = setTimeout(() => {
                    if (mounted) {
                      navigate('/login?verified=true');
                    }
                  }, 1500);
                }
                if (subscription) {
                  subscription.unsubscribe();
                }
                return;
              }
            }
          });
          subscription = data.subscription;
        };

        setupAuthListener();

        // Give Supabase time to process the URL tokens (detectSessionInUrl)
        // This is important - Supabase processes tokens asynchronously
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check current session status first (Supabase might have already verified)
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Current session:', {
          hasSession: !!currentSession,
          userId: currentSession?.user?.id,
          emailConfirmed: !!currentSession?.user?.email_confirmed_at,
          error: sessionError?.message
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
        }

        if (currentSession?.user?.email_confirmed_at) {
          if (mounted) {
            setStatus('success');
            setMessage('Email verified successfully! Redirecting to login...');
            
            try {
              await supabase
                .from('profiles')
                .update({ is_verified: true })
                .eq('id', currentSession.user.id);
            } catch (profileError) {
              console.error('Profile update error:', profileError);
            }

            timeoutId = setTimeout(() => {
              if (mounted) {
                navigate('/login?verified=true');
              }
            }, 1500);
          }
          if (subscription) {
            subscription.unsubscribe();
          }
          return;
        }

        // Also check user directly (in case session isn't established but user is verified)
        const { data: { user: directUser } } = await supabase.auth.getUser();
        console.log('Direct user check:', {
          hasUser: !!directUser,
          userId: directUser?.id,
          emailConfirmed: !!directUser?.email_confirmed_at
        });

        if (directUser?.email_confirmed_at) {
          if (mounted) {
            setStatus('success');
            setMessage('Email verified successfully! Redirecting to login...');
            
            try {
              await supabase
                .from('profiles')
                .update({ is_verified: true })
                .eq('id', directUser.id);
            } catch (profileError) {
              console.error('Profile update error:', profileError);
            }

            timeoutId = setTimeout(() => {
              if (mounted) {
                navigate('/login?verified=true');
              }
            }, 1500);
          }
          if (subscription) {
            subscription.unsubscribe();
          }
          return;
        }

        // If we have token_hash but no verified session yet, try manual verification
        if (tokenHash && !currentSession?.user?.email_confirmed_at) {
          try {
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: type as any,
            });

            if (error) {
              console.error('Verification error:', error);
              
              // Check if error is because already verified or expired
              if (error.message?.includes('already') || error.message?.includes('expired') || error.message?.includes('used')) {
                // Check one more time if user is verified
                const { data: { user: checkUser } } = await supabase.auth.getUser();
                if (checkUser?.email_confirmed_at) {
                  if (mounted) {
                    setStatus('success');
                    setMessage('Your email is already verified! Redirecting to login...');
                    timeoutId = setTimeout(() => {
                      if (mounted) {
                        navigate('/login?verified=true');
                      }
                    }, 1500);
                  }
                  subscription.unsubscribe();
                  return;
                }
              }

              // If we get here, verification failed
              if (mounted) {
                setStatus('error');
                setMessage(
                  error.message || 
                  'Verification failed. The link may have expired or already been used. Please request a new verification email.'
                );
              }
              subscription.unsubscribe();
              return;
            }

            if (data?.user?.email_confirmed_at) {
              if (mounted) {
                setStatus('success');
                setMessage('Email verified successfully! Redirecting to login...');
                
                try {
                  await supabase
                    .from('profiles')
                    .update({ is_verified: true })
                    .eq('id', data.user.id);
                } catch (profileError) {
                  console.error('Profile update error:', profileError);
                }

                timeoutId = setTimeout(() => {
                  if (mounted) {
                    navigate('/login?verified=true');
                  }
                }, 1500);
              }
              subscription.unsubscribe();
              return;
            }
          } catch (verifyError: any) {
            console.error('Token verification error:', verifyError);
            if (mounted) {
              setStatus('error');
              setMessage(
                verifyError.message || 
                'An error occurred during verification. Please try requesting a new verification email.'
              );
            }
            subscription.unsubscribe();
            return;
          }
        }

        // If we have access_token and refresh_token, wait a bit more for session to establish
        if (accessToken && refreshToken && !currentSession?.user?.email_confirmed_at) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession?.user?.email_confirmed_at) {
            if (mounted) {
              setStatus('success');
              setMessage('Email verified successfully! Redirecting to login...');
              timeoutId = setTimeout(() => {
                if (mounted) {
                  navigate('/login?verified=true');
                }
              }, 1500);
            }
            subscription.unsubscribe();
            return;
          }
        }

        // If we have tokens but verification hasn't completed yet, wait a bit more
        if (tokenHash || token || accessToken || refreshToken || supabaseToken) {
          console.log('Tokens found but verification not complete, waiting...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Final check after waiting
          const { data: { user: finalUser } } = await supabase.auth.getUser();
          if (finalUser?.email_confirmed_at) {
            if (mounted) {
              setStatus('success');
              setMessage('Email verified successfully! Redirecting to login...');
              timeoutId = setTimeout(() => {
                if (mounted) {
                  navigate('/login?verified=true');
                }
              }, 1500);
            }
            if (subscription) {
              subscription.unsubscribe();
            }
            return;
          }

          // If we have a Supabase token from referrer, try to check verification status via backend
          if (supabaseToken && !finalUser?.email_confirmed_at) {
            try {
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
              const checkResponse = await fetch(`${API_URL}/api/verification/email/check`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: supabaseToken }),
              });

              const checkData = await checkResponse.json();
              console.log('Backend verification check:', checkData);

              if (checkData.verified) {
                if (mounted) {
                  setStatus('success');
                  setMessage('Email verified successfully! Redirecting to login...');
                  timeoutId = setTimeout(() => {
                    if (mounted) {
                      navigate('/login?verified=true');
                    }
                  }, 1500);
                }
                if (subscription) {
                  subscription.unsubscribe();
                }
                return;
              }
            } catch (checkError) {
              console.error('Error checking verification status:', checkError);
            }
          }
        }

        // If still not verified, show appropriate error
        if (mounted) {
          if (!tokenHash && !token && !accessToken && !refreshToken && !supabaseToken) {
            // No tokens found - might be direct navigation or Supabase already processed it
            setStatus('error');
            setMessage(
              'No verification tokens found. ' +
              'If you clicked a verification link from your email, your email may already be verified. ' +
              'Please try logging in with your email and password. ' +
              'If login fails, you can request a new verification email.'
            );
          } else {
            // Tokens found but verification failed or incomplete
            setStatus('error');
            setMessage(
              'Unable to complete email verification automatically. ' +
              'Your email may already be verified. Please try logging in. ' +
              'If login fails, the verification link may have expired. Please request a new verification email.'
            );
          }
        }
        if (subscription) {
          subscription.unsubscribe();
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        if (mounted) {
          setStatus('error');
          setMessage(
            error.message || 
            'An error occurred during verification. Please try requesting a new verification email.'
          );
        }
      }
    };

    verifyEmail();

    // Cleanup
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Note: subscription cleanup is handled within the verifyEmail function
    };
  }, [searchParams, navigate]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Verifying Email</h1>
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
              <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Email Verified!</h1>
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
              <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Verification Failed</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/request-verification')}
                  className="w-full px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Request New Verification Email
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

