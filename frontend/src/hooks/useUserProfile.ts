import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  user_type: 'buyer' | 'seller' | 'agent' | 'admin';
  is_verified: boolean;
  avatar_url: string | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = profile?.user_type === 'admin';
  const isAgent = profile?.user_type === 'agent';
  const isSeller = profile?.user_type === 'seller';
  const isBuyer = profile?.user_type === 'buyer';

  return {
    profile,
    loading,
    isAdmin,
    isAgent,
    isSeller,
    isBuyer,
    refreshProfile: loadProfile,
  };
}

