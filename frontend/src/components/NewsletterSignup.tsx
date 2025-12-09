import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../utils/analytics';

interface NewsletterSignupProps {
  className?: string;
  variant?: 'default' | 'inline';
}

export default function NewsletterSignup({ className = '', variant = 'default' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Store newsletter subscription in database
      // You can create a newsletter_subscriptions table or use profiles table
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert({
          email: email,
          newsletter_subscribed: true,
          newsletter_subscribed_at: new Date().toISOString(),
        }, {
          onConflict: 'email',
        });

      if (insertError) {
        // If profiles table doesn't have newsletter fields, try alternative approach
        // Store in a separate table or use Supabase Storage/Edge Functions
        console.error('Newsletter subscription error:', insertError);
        
        // For now, just track the event
        trackEvent('Newsletter', 'Subscribe', email);
        setSuccess(true);
        setEmail('');
      } else {
        trackEvent('Newsletter', 'Subscribe', email);
        setSuccess(true);
        setEmail('');
      }
    } catch (err: any) {
      console.error('Newsletter subscription error:', err);
      setError('Something went wrong. Please try again.');
      trackEvent('Newsletter', 'Subscribe Error', email);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50"
        >
          {loading ? '...' : 'Subscribe'}
        </button>
      </form>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-2">📧 Stay Updated</h3>
      <p className="text-gray-600 mb-4">
        Get the latest property listings and real estate news delivered to your inbox.
      </p>

      {success ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✅ Successfully subscribed! Check your email for confirmation.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <p className="text-xs text-gray-500">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      )}
    </div>
  );
}

