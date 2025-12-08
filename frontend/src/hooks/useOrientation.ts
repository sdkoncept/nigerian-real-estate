import { useState, useEffect } from 'react';

interface OrientationState {
  angle: number;
  type: 'portrait' | 'landscape';
  isLandscape: boolean;
  isPortrait: boolean;
}

/**
 * Hook to detect device orientation and provide responsive state
 */
export function useOrientation(): OrientationState {
  const [orientation, setOrientation] = useState<OrientationState>(() => {
    // Initial state - check window orientation if available
    if (typeof window !== 'undefined') {
      const angle = (window.screen.orientation?.angle ?? window.orientation ?? 0) as number;
      const isLandscape = Math.abs(angle) === 90 || window.innerWidth > window.innerHeight;
      
      return {
        angle,
        type: isLandscape ? 'landscape' : 'portrait',
        isLandscape,
        isPortrait: !isLandscape,
      };
    }
    
    return {
      angle: 0,
      type: 'portrait',
      isLandscape: false,
      isPortrait: true,
    };
  });

  useEffect(() => {
    const updateOrientation = () => {
      if (typeof window !== 'undefined') {
        const angle = (window.screen.orientation?.angle ?? window.orientation ?? 0) as number;
        const isLandscape = Math.abs(angle) === 90 || window.innerWidth > window.innerHeight;
        
        setOrientation({
          angle,
          type: isLandscape ? 'landscape' : 'portrait',
          isLandscape,
          isPortrait: !isLandscape,
        });
      }
    };

    // Listen for orientation changes
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);
    
    // Also listen to screen orientation API if available
    if (window.screen.orientation) {
      window.screen.orientation.addEventListener('change', updateOrientation);
    }

    return () => {
      window.removeEventListener('orientationchange', updateOrientation);
      window.removeEventListener('resize', updateOrientation);
      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', updateOrientation);
      }
    };
  }, []);

  return orientation;
}

