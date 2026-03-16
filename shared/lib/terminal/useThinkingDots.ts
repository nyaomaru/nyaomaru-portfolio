import { useState, useEffect } from 'react';
import { UI } from '../../constants';

/**
 * A custom React hook that creates an animated "thinking" indicator with dots.
 *
 * @param isActive - Whether the thinking animation should be active
 * @param interval - The interval in milliseconds between dot additions (defaults to DEFAULT_INTERVAL)
 * @returns A string that cycles between "Thinking", "Thinking.", "Thinking..", "Thinking..." and back to "Thinking"
 */
export const useThinkingDots = (
  isActive: boolean,
  interval: number = UI.THINKING_DOTS.DEFAULT_INTERVAL,
) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setDots((prev) => (prev.length >= UI.THINKING_DOTS.MAX_DOTS ? '' : prev + '.'));
    }, interval);

    return () => clearInterval(timer);
  }, [isActive, interval]);

  return `Thinking${dots}`;
};
