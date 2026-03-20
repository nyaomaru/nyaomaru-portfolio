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
const ESSENTIAL_SOUND_EFFECT_NAMES = ['jump'] as const;
const AUXILIARY_SOUND_EFFECT_NAMES = ['fishCollect', 'playerFault'] as const;

/**
 * Unlock policy for jump-game sound effects.
 */
type UnlockJumpGameAudioOptions = {
  /** Whether non-jump effects should also be primed during this user interaction. */
  includeNonJumpEffects?: boolean;
};

const soundEffectCache = new Map<JumpGameSoundName, HTMLAudioElement>();
let isJumpGameSoundEnabled = true;
let unlockEssentialJumpGameAudioPromise: Promise<void> | null = null;
let unlockAuxiliaryJumpGameAudioPromise: Promise<void> | null = null;

const applySoundEnabledState = (soundEffect: HTMLAudioElement) => {
  soundEffect.muted = !isJumpGameSoundEnabled;
};

const resolveSoundEffects = (names: readonly JumpGameSoundName[]) =>
  names
    .map((name) => getSoundEffect(name))
    .filter((soundEffect): soundEffect is HTMLAudioElement => soundEffect !== null);

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
 * priming shared sound effects through a muted play/pause cycle.
 *
 * @param options - Controls whether only the jump effect or every effect is
 * primed during the current interaction.
 * @param options.includeNonJumpEffects - When `true`, also primes fish/end
 * effects. Defaults to `true`.
 */
export function unlockJumpGameAudio({
  includeNonJumpEffects = true,
}: UnlockJumpGameAudioOptions = {}) {
  if (!unlockEssentialJumpGameAudioPromise) {
    const essentialSoundEffects = resolveSoundEffects(ESSENTIAL_SOUND_EFFECT_NAMES);
    unlockEssentialJumpGameAudioPromise = Promise.all(
      essentialSoundEffects.map(primeSoundEffect),
    ).then(() => undefined);
  }

  if (!includeNonJumpEffects) {
    return unlockEssentialJumpGameAudioPromise;
  }

  if (!unlockAuxiliaryJumpGameAudioPromise) {
    const auxiliarySoundEffects = resolveSoundEffects(AUXILIARY_SOUND_EFFECT_NAMES);
    unlockAuxiliaryJumpGameAudioPromise = Promise.all(
      auxiliarySoundEffects.map(primeSoundEffect),
    ).then(() => undefined);
  }

  return Promise.all([
    unlockEssentialJumpGameAudioPromise,
    unlockAuxiliaryJumpGameAudioPromise,
  ]).then(() => undefined);
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
  unlockEssentialJumpGameAudioPromise = null;
  unlockAuxiliaryJumpGameAudioPromise = null;
}
