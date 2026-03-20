import {
  FISH_COLLECT_SOUND_EFFECT,
  PLAYER_FAULT_SOUND_EFFECT,
  PLAYER_JUMP_SOUND_EFFECT,
} from './config/assets';

const SOUND_EFFECT_SOURCES = {
  jump: PLAYER_JUMP_SOUND_EFFECT,
  fishCollect: FISH_COLLECT_SOUND_EFFECT,
  playerFault: PLAYER_FAULT_SOUND_EFFECT,
} as const;

type JumpGameSoundName = keyof typeof SOUND_EFFECT_SOURCES;

const soundEffectCache = new Map<JumpGameSoundName, HTMLAudioElement>();
let isJumpGameSoundEnabled = true;
let unlockJumpGameAudioPromise: Promise<void> | null = null;

const applySoundEnabledState = (soundEffect: HTMLAudioElement) => {
  soundEffect.muted = !isJumpGameSoundEnabled;
};

const getSoundEffect = (name: JumpGameSoundName) => {
  if (typeof Audio === 'undefined') return null;

  const cachedSoundEffect = soundEffectCache.get(name);
  if (cachedSoundEffect) return cachedSoundEffect;

  const soundEffect = new Audio(SOUND_EFFECT_SOURCES[name]);
  soundEffect.preload = 'auto';
  applySoundEnabledState(soundEffect);
  soundEffectCache.set(name, soundEffect);
  return soundEffect;
};

const primeSoundEffect = async (soundEffect: HTMLAudioElement) => {
  const previousMuted = soundEffect.muted;
  const previousVolume = soundEffect.volume;

  soundEffect.muted = true;
  soundEffect.volume = 0;
  soundEffect.currentTime = 0;

  try {
    const playbackAttempt = soundEffect.play();
    if (playbackAttempt) {
      await playbackAttempt;
    }
  } catch {
    // Ignore embed/autoplay failures so gameplay startup continues.
  } finally {
    soundEffect.pause();
    soundEffect.currentTime = 0;
    soundEffect.muted = previousMuted;
    soundEffect.volume = previousVolume;
  }
};

/**
 * Returns the shared jump sound effect instance used by player jump input.
 */
export function getJumpSoundEffect() {
  return getSoundEffect('jump');
}

/**
 * Returns the shared fish-collect sound effect instance used by the scene model.
 */
export function getFishCollectSoundEffect() {
  return getSoundEffect('fishCollect');
}

/**
 * Returns the shared fault/end sound effect instance used by the scene model.
 */
export function getPlayerFaultSoundEffect() {
  return getSoundEffect('playerFault');
}

/**
 * Returns whether jump-game sound effects are currently enabled.
 */
export function getJumpGameSoundEnabled() {
  return isJumpGameSoundEnabled;
}

/**
 * Enables or disables every shared jump-game sound effect and applies the
 * state immediately to already-cached audio elements.
 *
 * @param value - Whether sound effects should be audible.
 */
export function setJumpGameSoundEnabled(value: boolean) {
  isJumpGameSoundEnabled = value;

  for (const soundEffect of soundEffectCache.values()) {
    applySoundEnabledState(soundEffect);
  }
}

/**
 * Attempts to unlock jump-game audio from the first trusted user interaction by
 * priming each shared sound effect through a muted play/pause cycle.
 */
export function unlockJumpGameAudio() {
  if (unlockJumpGameAudioPromise) return unlockJumpGameAudioPromise;

  const soundEffects = [
    getJumpSoundEffect(),
    getFishCollectSoundEffect(),
    getPlayerFaultSoundEffect(),
  ].filter((soundEffect): soundEffect is HTMLAudioElement => soundEffect !== null);

  unlockJumpGameAudioPromise = Promise.all(soundEffects.map(primeSoundEffect)).then(
    () => undefined,
  );
  return unlockJumpGameAudioPromise;
}

/**
 * Resets cached jump-game audio singletons. Intended for tests only.
 */
export function resetJumpGameAudioForTesting() {
  for (const soundEffect of soundEffectCache.values()) {
    soundEffect.pause();
    soundEffect.src = '';
  }

  soundEffectCache.clear();
  isJumpGameSoundEnabled = true;
  unlockJumpGameAudioPromise = null;
}
