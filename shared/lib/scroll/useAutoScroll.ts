import { useEffect, useRef } from 'react';

/**
 * A custom hook that automatically scrolls a container element to the bottom
 * whenever the specified dependency changes.
 *
 * @param dep - A dependency to watch. When it changes, the container will scroll to the bottom.
 * @returns An object containing a `containerRef` to be attached to the scrollable element.
 *
 * @example
 * const { containerRef } = useAutoScroll(messages);
 * return <div ref={containerRef}>...</div>;
 */
export const useAutoScroll = (dep: unknown) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
    });
  }, [dep]);

  return { containerRef };
};
