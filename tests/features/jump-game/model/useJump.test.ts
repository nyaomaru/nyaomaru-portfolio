import { renderHook, act } from '@testing-library/react';
import {
  BASELINE_JUMP_DELTA,
  FALLBACK_PLAYER_HEIGHT,
  JUMP_APEX_HOLD_MS,
} from '@/features/jump-game/model/config/jump';
import {
  JUMP_DOWN_INTERVAL,
  JUMP_LOCK_INTERVAL,
  JUMP_UP_INTERVAL,
  JUMP_VELOCITY,
} from '@/features/jump-game/model/config/gameplay';
import { BASELINE_GAME_HEIGHT } from '@/features/jump-game/model/config/metrics';
import { resetJumpGameAudioForTesting } from '@/features/jump-game/model/audio';
import { useJump } from '@/features/jump-game/model/useJump';
import {
  FALL_SPEED_MULTIPLIER,
  MOBILE_FALL_SPEED_MULTIPLIER,
} from '@/features/jump-game/model/config/jump';

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
  const originalPerformanceNow = performance.now.bind(performance);

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
    vi.spyOn(performance, 'now').mockReturnValue(0);
    globalThis.Audio = MockAudio as unknown as typeof Audio;
    resetJumpGameAudioForTesting();
  });

  afterEach(() => {
    globalThis.Audio = originalAudio;
    vi.spyOn(performance, 'now').mockImplementation(originalPerformanceNow);
    vi.restoreAllMocks();
  });

  describe('jump functionality', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useJump(playerRef));

      expect(result.current.isOnGroundRef.current).toBe(true);
    });

    it('allows jumping when on ground', () => {
      const { result } = renderHook(() => useJump(playerRef));

      act(() => {
        result.current.jump();
      });

      expect(result.current.isOnGroundRef.current).toBe(false);
      expect(audioPlayMock).toHaveBeenCalledTimes(1);
    });

    it('uses cached jump metrics instead of reading layout on jump input', () => {
      let gameHeightReadCount = 0;
      let playerHeightReadCount = 0;
      playerRef = {
        current: {
          style: { bottom: '0px' },
          get clientHeight() {
            playerHeightReadCount += 1;
            return FALLBACK_PLAYER_HEIGHT;
          },
          parentElement: {
            get clientHeight() {
              gameHeightReadCount += 1;
              return BASELINE_GAME_HEIGHT;
            },
          },
        } as HTMLDivElement,
      };

      const { result } = renderHook(() => useJump(playerRef));

      gameHeightReadCount = 0;
      playerHeightReadCount = 0;

      act(() => {
        result.current.jump();
      });

      expect(gameHeightReadCount).toBe(0);
      expect(playerHeightReadCount).toBe(0);
    });

    it('prevents jumping when locked', () => {
      const { result } = renderHook(() => useJump(playerRef));

      act(() => {
        result.current.jump();
      });
      act(() => {
        result.current.jump();
      });

      expect(audioPlayMock).toHaveBeenCalledTimes(1);
    });

    it('resets jump sound playback before replaying it', () => {
      const { result } = renderHook(() => useJump(playerRef));

      act(() => {
        result.current.jump();
      });

      expect(audioInstances).toHaveLength(1);
      audioInstances[0]!.currentTime = 1.25;

      act(() => {
        vi.mocked(performance.now).mockReturnValue(JUMP_LOCK_INTERVAL + 1);
        result.current.jump();
      });

      expect(audioInstances[0]!.currentTime).toBe(0);
      expect(audioPlayMock).toHaveBeenCalledTimes(2);
    });

    it('holds briefly at the jump apex before starting descent', () => {
      const { result } = renderHook(() => useJump(playerRef));
      const ascentDurationMs = BASELINE_JUMP_DELTA / (JUMP_VELOCITY / JUMP_UP_INTERVAL);

      act(() => {
        result.current.jump();
      });

      act(() => {
        result.current.updateJumpFrame({
          nowMs: ascentDurationMs,
          deltaTimeMs: ascentDurationMs,
        });
      });

      expect(parseFloat(playerRef.current!.style.bottom)).toBe(BASELINE_JUMP_DELTA);
      expect(result.current.isOnGroundRef.current).toBe(false);

      act(() => {
        result.current.updateJumpFrame({
          nowMs: ascentDurationMs + JUMP_APEX_HOLD_MS - 1,
          deltaTimeMs: JUMP_APEX_HOLD_MS - 1,
        });
      });

      expect(parseFloat(playerRef.current!.style.bottom)).toBe(BASELINE_JUMP_DELTA);

      act(() => {
        result.current.updateJumpFrame({
          nowMs: ascentDurationMs + JUMP_APEX_HOLD_MS,
          deltaTimeMs: 1,
        });
      });

      expect(parseFloat(playerRef.current!.style.bottom)).toBe(BASELINE_JUMP_DELTA);
    });

    it('lands through frame updates and restores grounded state', () => {
      const { result } = renderHook(() => useJump(playerRef));
      const ascentDurationMs = BASELINE_JUMP_DELTA / (JUMP_VELOCITY / JUMP_UP_INTERVAL);
      const downVelocityPxPerMs =
        (JUMP_VELOCITY * FALL_SPEED_MULTIPLIER * MOBILE_FALL_SPEED_MULTIPLIER) / JUMP_DOWN_INTERVAL;
      const descentDurationMs = BASELINE_JUMP_DELTA / downVelocityPxPerMs;

      act(() => {
        result.current.jump();
        result.current.updateJumpFrame({
          nowMs: ascentDurationMs,
          deltaTimeMs: ascentDurationMs,
        });
        result.current.updateJumpFrame({
          nowMs: ascentDurationMs + JUMP_APEX_HOLD_MS,
          deltaTimeMs: JUMP_APEX_HOLD_MS,
        });
        result.current.updateJumpFrame({
          nowMs: ascentDurationMs + JUMP_APEX_HOLD_MS + descentDurationMs,
          deltaTimeMs: descentDurationMs,
        });
      });

      expect(parseFloat(playerRef.current!.style.bottom)).toBe(0);
      expect(result.current.isOnGroundRef.current).toBe(true);
    });
  });
});
