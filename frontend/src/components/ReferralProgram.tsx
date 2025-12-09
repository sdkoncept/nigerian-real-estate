import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../utils/analytics';

export default function ReferralProgram() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralStats, setReferralStats] = useState({
    total: 0,
    signups: 0,
    completed: 0,
    rewards: 0,
  });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get user's referral code
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      } else {
        // Generate referral code if doesn't exist
        const code = 'REF' + Math.random().toString(36).substring(2, 10).toUpperCase();
        await supabase
          .from('profiles')
          .update({ referral_code: code })
          .eq('id', user.id);
        setReferralCode(code);
      }

      // Get referral stats
      const { data: referrals } = await supabase
        .from('referrals')
        .select('status')
        .eq('referrer_id', user.id);

      if (referrals) {
        setReferralStats({
          total: referrals.length,
          signups: referrals.filter(r => r.status === 'signed_up').length,
          completed: referrals.filter(r => r.status === 'completed').length,
          rewards: referrals.filter(r => r.status === 'rewarded').length,
        });
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    trackEvent('Referral', 'Copy Link', referralCode);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const message = `Check out House Direct NG - Nigeria's trusted real estate platform! Use my referral code ${referralCode} when you sign up: ${window.location.origin}/signup?ref=${referralCode}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    trackEvent('Referral', 'Share WhatsApp', referralCode);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg shadow-md p-6 border border-primary-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">🎁 Referral Program</h3>
        <span className="text-sm text-primary-600 font-semibold">Earn Rewards</span>
      </div>

      <p className="text-gray-700 mb-4">
        Share your referral code with friends and earn rewards when they sign up!
      </p>

      {/* Referral Code */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Referral Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralCode}
            readOnly
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white font-mono font-bold text-lg text-primary-600"
          />
          <button
            onClick={copyReferralLink}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Referral Link */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Referral Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={`${window.location.origin}/signup?ref=${referralCode}`}
            readOnly
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          />
          <button
            onClick={copyReferralLink}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Copy Link
          </button>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={shareViaWhatsApp}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <span>📱</span> Share via WhatsApp
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-primary-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">{referralStats.total}</div>
          <div className="text-xs text-gray-600">Total Referrals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{referralStats.signups}</div>
          <div className="text-xs text-gray-600">Sign Ups</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{referralStats.completed}</div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{referralStats.rewards}</div>
          <div className="text-xs text-gray-600">Rewards</div>
        </div>
      </div>

      {/* Rewards Info */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-primary-200">
        <p className="text-sm text-gray-700">
          <strong>How it works:</strong> When someone signs up using your referral code, you both get rewards! 
          Complete actions to unlock more benefits.
        </p>
      </div>
    </div>
  );
}

