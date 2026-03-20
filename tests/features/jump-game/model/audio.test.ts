import {
  getFishCollectSoundEffect,
  getJumpGameSoundEnabled,
  getJumpSoundEffect,
  playJumpSoundEffect,
  getPlayerFaultSoundEffect,
  resetJumpGameAudioForTesting,
  setJumpGameSoundEnabled,
  unlockJumpGameAudio,
} from '@/features/jump-game/model/audio';

const audioInstances: MockAudio[] = [];

class MockAudio {
  currentTime = 0;
  muted = false;
  preload = '';
  src: string;
  volume = 1;

  constructor(src = '') {
    this.src = src;
    if (src.length > 0) {
      audioInstances.push(this);
    }
  }

  canPlayType() {
    return '';
  }
  pause = vi.fn();
  play = vi.fn().mockResolvedValue(undefined);
}

describe('jump-game audio state', () => {
  const originalAudio = globalThis.Audio;
  const originalFetch = globalThis.fetch;
  const originalWindowAudioContext = window.AudioContext;
  const originalWindowWebkitAudioContext = (window as Window & { webkitAudioContext?: unknown })
    .webkitAudioContext;

  beforeEach(() => {
    audioInstances.length = 0;
    globalThis.Audio = MockAudio as unknown as typeof Audio;
    resetJumpGameAudioForTesting();
  });

  afterEach(() => {
    globalThis.Audio = originalAudio;
    globalThis.fetch = originalFetch;
    window.AudioContext = originalWindowAudioContext;
    (
      window as Window & {
        webkitAudioContext?: unknown;
      }
    ).webkitAudioContext = originalWindowWebkitAudioContext;
    vi.restoreAllMocks();
  });

  it('mutes cached and newly-created sound effects when sound is disabled', () => {
    const jumpSound = getJumpSoundEffect();

    expect(jumpSound?.muted).toBe(false);
    expect(getJumpGameSoundEnabled()).toBe(true);

    setJumpGameSoundEnabled(false);

    expect(getJumpGameSoundEnabled()).toBe(false);
    expect(jumpSound?.muted).toBe(true);

    const fishSound = getFishCollectSoundEffect();
    expect(fishSound?.muted).toBe(true);
    expect(audioInstances).toHaveLength(2);
  });

  it('can unlock only the jump sound effect during start interactions', async () => {
    await unlockJumpGameAudio({ includeNonJumpEffects: false });

    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0]?.src.endsWith('/jump.ogg')).toBe(true);
    expect(audioInstances[0]?.play).toHaveBeenCalledTimes(1);
  });

  it('unlocks auxiliary sound effects when full audio priming is requested', async () => {
    await unlockJumpGameAudio();

    const jumpSound = getJumpSoundEffect();
    const fishSound = getFishCollectSoundEffect();
    const faultSound = getPlayerFaultSoundEffect();

    expect(audioInstances).toHaveLength(3);
    expect(jumpSound?.play).toHaveBeenCalledTimes(1);
    expect(fishSound?.play).toHaveBeenCalledTimes(1);
    expect(faultSound?.play).toHaveBeenCalledTimes(1);
  });

  it('falls back to primed HTMLAudio playback when AudioContext does not reach running state', async () => {
    const gainNode = {
      gain: { value: 1 },
      connect: vi.fn(),
    };
    const bufferSource = {
      buffer: null as AudioBuffer | null,
      connect: vi.fn(),
      start: vi.fn(),
    };
    class MockAudioContext {
      state: AudioContextState = 'suspended';
      destination = {} as AudioDestinationNode;

      createGain() {
        return gainNode as unknown as GainNode;
      }

      createBufferSource() {
        return bufferSource as unknown as AudioBufferSourceNode;
      }

      resume = vi.fn().mockResolvedValue(undefined);
      decodeAudioData = vi.fn().mockResolvedValue({} as AudioBuffer);
      close = vi.fn().mockResolvedValue(undefined);
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    } as unknown as Response);
    window.AudioContext = MockAudioContext as unknown as typeof AudioContext;

    await unlockJumpGameAudio({ includeNonJumpEffects: false });
    playJumpSoundEffect();

    const jumpSound = getJumpSoundEffect();
    expect(jumpSound?.play).toHaveBeenCalledTimes(2);
    expect(bufferSource.start).not.toHaveBeenCalled();
  });

  it('selects mp3 fallback sources when ogg playback is unsupported', async () => {
    vi.spyOn(MockAudio.prototype, 'canPlayType').mockImplementation((...args: string[]) => {
      const mimeType = args[0];
      return mimeType?.includes('audio/mpeg') ? 'probably' : '';
    });

    await unlockJumpGameAudio();

    expect(audioInstances.some((audio) => audio.src.endsWith('/jump.mp3'))).toBe(true);
    expect(audioInstances.some((audio) => audio.src.endsWith('/fish.mp3'))).toBe(true);
    expect(audioInstances.some((audio) => audio.src.endsWith('/end.mp3'))).toBe(true);
  });
});
