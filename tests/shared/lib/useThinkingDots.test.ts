import { renderHook, act } from '@testing-library/react';
import { useThinkingDots } from '@/shared/lib/terminal';

describe('useThinkingDots', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('inactive', () => {
    it('returns "Thinking" when not active', () => {
      const { result } = renderHook(() => useThinkingDots(false));

      expect(result.current).toBe('Thinking');
    });
    it('does not change dots when inactive', () => {
      const { result } = renderHook(() => useThinkingDots(false));

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('Thinking');
    });
  });

  describe('active', () => {
    it('starts with "Thinking"', () => {
      const { result } = renderHook(() => useThinkingDots(true));

      expect(result.current).toBe('Thinking');
    });
    it('adds dots progressively', () => {
      const { result } = renderHook(() => useThinkingDots(true));

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('Thinking.');

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('Thinking..');

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('Thinking...');
    });
    it('resets to "Thinking" after max dots', () => {
      const { result } = renderHook(() => useThinkingDots(true));

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(result.current).toBe('Thinking...');

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('Thinking');
    });
    it('uses custom interval when provided', () => {
      const customInterval = 1000;

      const { result } = renderHook(() => useThinkingDots(true, customInterval));
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current).toBe('Thinking.');
    });
  });
});
