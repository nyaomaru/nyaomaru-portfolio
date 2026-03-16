import { useEffect, useState } from 'react';
import { UI } from '../../constants';

/**
 * Custom hook for handling fade-in animation on component mount.
 *
 * @param delay - Optional delay in milliseconds before starting the animation (default: 0)
 * @returns Object containing isVisible state for animation control
 */
export const useAnimation = (delay: number = UI.ANIMATION.DEFAULT_DELAY) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return { isVisible };
};
