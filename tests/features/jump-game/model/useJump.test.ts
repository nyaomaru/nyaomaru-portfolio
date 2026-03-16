import { renderHook, act } from '@testing-library/react';
import { useJump } from '@/features/jump-game/model/useJump';

vi.mock('./constants', () => ({
  MAX_JUMP_COUNT: 2,
  JUMP_VELOCITY: 10,
  JUMP_UP_INTERVAL: 16,
  JUMP_DOWN_INTERVAL: 16,
  JUMP_LOCK_INTERVAL: 100,
}));

describe('useJump', () => {
  let playerRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    playerRef = {
      current: {
        style: { bottom: '0px' },
      } as HTMLDivElement,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('jump functionality', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useJump(playerRef));

      expect(result.current.isOnGroundRef.current).toBe(true);
    });

    it('allows jumping when on ground', () => {
      const setIntervalSpy = vi.spyOn(window, 'setInterval');
      const { result } = renderHook(() => useJump(playerRef));

      act(() => {
        result.current.jump();
      });

      expect(result.current.isOnGroundRef.current).toBe(false);
      expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    });

    it('prevents jumping when locked', () => {
      const setIntervalSpy = vi.spyOn(window, 'setInterval');
      const { result } = renderHook(() => useJump(playerRef));

      act(() => {
        result.current.jump();
      });
      act(() => {
        result.current.jump();
      });

      expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    });
  });
});
