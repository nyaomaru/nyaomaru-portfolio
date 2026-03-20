import { renderHook, act } from '@testing-library/react';
import {
  BASELINE_JUMP_DELTA,
  FALLBACK_PLAYER_HEIGHT,
  JUMP_APEX_HOLD_MS,
} from '@/features/jump-game/model/config/jump';
import {
  JUMP_LOCK_INTERVAL,
  JUMP_UP_INTERVAL,
  JUMP_VELOCITY,
} from '@/features/jump-game/model/config/gameplay';
import { BASELINE_GAME_HEIGHT } from '@/features/jump-game/model/config/metrics';
import { resetJumpGameAudioForTesting } from '@/features/jump-game/model/audio';
import { useJump } from '@/features/jump-game/model/useJump';

const audioPlayMock = vi.fn().mockResolvedValue(undefined);
const audioPauseMock = vi.fn();
const audioInstances: MockAudio[] = [];

class MockAudio {
  currentTime = 0;
  preload = '';
  src: string;

  constructor(src: string) {
    this.src = src;
    audioInstances.push(this);
  }

  play = audioPlayMock;
  pause = audioPauseMock;
}

describe('useJump', () => {
  let playerRef: React.RefObject<HTMLDivElement>;
  const originalAudio = globalThis.Audio;

  beforeEach(() => {
    playerRef = {
      current: {
        style: { bottom: '0px' },
        clientHeight: FALLBACK_PLAYER_HEIGHT,
        parentElement: { clientHeight: BASELINE_GAME_HEIGHT },
      } as HTMLDivElement,
    };

    audioInstances.length = 0;
    audioPlayMock.mockClear();
    audioPauseMock.mockClear();
    globalThis.Audio = MockAudio as unknown as typeof Audio;
    resetJumpGameAudioForTesting();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.Audio = originalAudio;
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
      expect(audioPlayMock).toHaveBeenCalledTimes(1);
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
      expect(audioPlayMock).toHaveBeenCalledTimes(1);
    });

    it('resets jump sound playback before replaying it', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useJump(playerRef));

      act(() => {
        result.current.jump();
      });

      expect(audioInstances).toHaveLength(1);
      audioInstances[0]!.currentTime = 1.25;

      act(() => {
        vi.advanceTimersByTime(JUMP_LOCK_INTERVAL + 1);
        result.current.jump();
      });

      expect(audioInstances[0]!.currentTime).toBe(0);
      expect(audioPlayMock).toHaveBeenCalledTimes(2);
    });

    it('holds briefly at the jump apex before starting descent', () => {
      vi.useFakeTimers();
      const setIntervalSpy = vi.spyOn(window, 'setInterval');
      const { result } = renderHook(() => useJump(playerRef));
      const ascentDurationMs = Math.ceil(BASELINE_JUMP_DELTA / JUMP_VELOCITY) * JUMP_UP_INTERVAL;

      act(() => {
        result.current.jump();
      });

      expect(setIntervalSpy).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(ascentDurationMs);
      });

      expect(parseFloat(playerRef.current!.style.bottom)).toBe(BASELINE_JUMP_DELTA);
      expect(setIntervalSpy).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(JUMP_APEX_HOLD_MS - 1);
      });

      expect(parseFloat(playerRef.current!.style.bottom)).toBe(BASELINE_JUMP_DELTA);
      expect(setIntervalSpy).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(setIntervalSpy).toHaveBeenCalledTimes(2);
    });
  });
});
