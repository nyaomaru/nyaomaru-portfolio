import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/shared/lib/window';

const setWindowInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

describe('useIsMobile', () => {
  const resizeEvent = () => window.dispatchEvent(new Event('resize'));

  beforeEach(() => {
    vi.stubGlobal('innerWidth', 1024); // default safe value
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true if innerWidth < 640 on mount', () => {
    setWindowInnerWidth(500);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should return false if innerWidth >= 640 on mount', () => {
    setWindowInnerWidth(800);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should update to true on resize below 640', async () => {
    setWindowInnerWidth(800);

    const { result } = renderHook(() => useIsMobile());

    act(() => {
      setWindowInnerWidth(500);
      resizeEvent();
    });

    expect(result.current).toBe(true);
  });

  it('should update to false on resize above or equal 640', async () => {
    setWindowInnerWidth(500);

    const { result } = renderHook(() => useIsMobile());

    act(() => {
      setWindowInnerWidth(800);
      resizeEvent();
    });

    expect(result.current).toBe(false);
  });
});
