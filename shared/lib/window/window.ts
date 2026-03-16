import { useState, useEffect } from 'react';
import { UI } from '@/shared/constants';

const hasWindow = () => typeof window !== 'undefined';

/**
 * Determines if the current viewport is considered mobile based on screen width.
 *
 * @returns `true` if running in browser with viewport width < 640px, `false` otherwise
 */
export const isMobile = () => hasWindow() && window.innerWidth < UI.MOBILE_BREAKPOINT;

/**
 * Hook for responsive mobile detection that updates on window resize.
 *
 * @returns `true` if current viewport width is less than mobile breakpoint, `false` otherwise
 */
export const useIsMobile = () => {
  const [isMobileViewport, setIsMobileViewport] = useState(isMobile);

  useEffect(() => {
    if (!hasWindow()) return;

    const handleResize = () => {
      setIsMobileViewport(isMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobileViewport;
};
