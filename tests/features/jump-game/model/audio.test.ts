import {
  getFishCollectSoundEffect,
  getJumpGameSoundEnabled,
  getJumpSoundEffect,
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

  constructor(src: string) {
    this.src = src;
    audioInstances.push(this);
  }

  pause = vi.fn();
  play = vi.fn().mockResolvedValue(undefined);
}

describe('jump-game audio state', () => {
  const originalAudio = globalThis.Audio;

  beforeEach(() => {
    audioInstances.length = 0;
    globalThis.Audio = MockAudio as unknown as typeof Audio;
    resetJumpGameAudioForTesting();
  });

  afterEach(() => {
    globalThis.Audio = originalAudio;
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
});
