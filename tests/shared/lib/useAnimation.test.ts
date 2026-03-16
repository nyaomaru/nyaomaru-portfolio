import { act, renderHook } from '@testing-library/react';
import { useAnimation } from '@/shared/lib/animation';

describe('useAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should start with isVisible as false', () => {
    const { result } = renderHook(() => useAnimation());

    expect(result.current.isVisible).toBe(false);
  });

  it('should set isVisible to true after mount with no delay', async () => {
    const { result } = renderHook(() => useAnimation());

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('should set isVisible to true after specified delay', async () => {
    const delay = 1000;
    const { result } = renderHook(() => useAnimation(delay));

    expect(result.current.isVisible).toBe(false);

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('should not set isVisible to true before delay completes', () => {
    const delay = 1000;
    const { result } = renderHook(() => useAnimation(delay));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    const { unmount } = renderHook(() => useAnimation(1000));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
