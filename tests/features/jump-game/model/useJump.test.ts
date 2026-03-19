import { renderHook, act } from '@testing-library/react';
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
      } as HTMLDivElement,
    };

    audioInstances.length = 0;
    audioPlayMock.mockClear();
    audioPauseMock.mockClear();
    globalThis.Audio = MockAudio as unknown as typeof Audio;
  });

  afterEach(() => {
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
      const { result } = renderHook(() => useJump(playerRef));

      expect(audioInstances).toHaveLength(1);
      audioInstances[0]!.currentTime = 1.25;

      act(() => {
        result.current.jump();
      });

      expect(audioInstances[0]!.currentTime).toBe(0);
      expect(audioPlayMock).toHaveBeenCalledTimes(1);
    });
  });
});
