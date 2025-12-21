import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPropertyViewCount } from '../utils/propertyViewLimit';

export function useSignupTriggers() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [trigger, setTrigger] = useState<'property_limit' | 'time_on_site' | 'scroll' | 'exit_intent'>('property_limit');

  useEffect(() => {
    if (user) return;

    // Check if user dismissed modal
    if (localStorage.getItem('dont_show_signup_modal') === 'true') {
      return;
    }

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && getPropertyViewCount() >= 2) {
        setTrigger('exit_intent');
        setShowModal(true);
      }
    };

    // Scroll-based trigger (after 75% scroll)
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 75 && getPropertyViewCount() >= 2) {
        setTrigger('scroll');
        setShowModal(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    // Time on site trigger (after 2 minutes)
    const timeTrigger = setTimeout(() => {
      if (getPropertyViewCount() >= 1) {
        setTrigger('time_on_site');
        setShowModal(true);
      }
    }, 120000); // 2 minutes

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeTrigger);
    };
  }, [user]);

  return { showModal, setShowModal, trigger };
}

