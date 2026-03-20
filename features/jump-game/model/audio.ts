import {
  FISH_COLLECT_SOUND_EFFECT,
  PLAYER_FAULT_SOUND_EFFECT,
  PLAYER_JUMP_SOUND_EFFECT,
} from './config/assets';

const createSoundEffectSourceCandidates = (preferredSource: string) =>
  preferredSource.endsWith('.ogg')
    ? ([preferredSource, preferredSource.replace(/\.ogg$/, '.wav')] as const)
    : ([preferredSource] as const);

const SOUND_EFFECT_SOURCES = {
  jump: createSoundEffectSourceCandidates(PLAYER_JUMP_SOUND_EFFECT),
  fishCollect: createSoundEffectSourceCandidates(FISH_COLLECT_SOUND_EFFECT),
  playerFault: createSoundEffectSourceCandidates(PLAYER_FAULT_SOUND_EFFECT),
} as const;

type JumpGameSoundName = keyof typeof SOUND_EFFECT_SOURCES;
const ESSENTIAL_SOUND_EFFECT_NAMES = ['jump'] as const;
const AUXILIARY_SOUND_EFFECT_NAMES = ['fishCollect', 'playerFault'] as const;

type AudioContextConstructor = new () => AudioContext;

/**
 * Unlock policy for jump-game sound effects.
 */
type UnlockJumpGameAudioOptions = {
  /** Whether non-jump effects should also be preloaded during this user interaction. */
  includeNonJumpEffects?: boolean;
};

/**
 * Cached decode state for one sound effect.
 */
type DecodedSoundEffectEntry = {
  /** Decoded audio buffer ready for low-latency playback. */
  buffer: AudioBuffer | null;
  /** In-flight decode request for this sound effect. */
  decodePromise: Promise<AudioBuffer | null> | null;
};

const decodedSoundEffectCache = new Map<JumpGameSoundName, DecodedSoundEffectEntry>();
const fallbackSoundEffectCache = new Map<JumpGameSoundName, HTMLAudioElement>();
const resolvedSoundEffectSourceCache = new Map<JumpGameSoundName, string>();
let jumpGameAudioContext: AudioContext | null = null;
let jumpGameAudioGainNode: GainNode | null = null;
let isJumpGameSoundEnabled = true;
let unlockEssentialJumpGameAudioPromise: Promise<void> | null = null;
let unlockAuxiliaryJumpGameAudioPromise: Promise<void> | null = null;

const applyFallbackSoundEnabledState = (soundEffect: HTMLAudioElement) => {
  soundEffect.muted = !isJumpGameSoundEnabled;
};

const syncGainNodeEnabledState = () => {
  if (!jumpGameAudioGainNode) return;
  jumpGameAudioGainNode.gain.value = isJumpGameSoundEnabled ? 1 : 0;
};

const getAudioContextConstructor = (): AudioContextConstructor | null => {
  if (typeof window === 'undefined') return null;

  const audioWindow = window as Window & {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  };
  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext ?? null;
};

const ensureAudioContext = () => {
  if (jumpGameAudioContext) return jumpGameAudioContext;

  const AudioContextCtor = getAudioContextConstructor();
  if (!AudioContextCtor) return null;

  const audioContext = new AudioContextCtor();
  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  jumpGameAudioContext = audioContext;
  jumpGameAudioGainNode = gainNode;
  syncGainNodeEnabledState();
  return jumpGameAudioContext;
};

const resumeAudioContext = async () => {
  const audioContext = ensureAudioContext();
  if (!audioContext) return null;

  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch {
      // Ignore resume failures and allow fallback playback to proceed.
    }
  }

  return audioContext;
};

const getFallbackSoundEffect = (name: JumpGameSoundName) => {
  if (typeof Audio === 'undefined') return null;

  const cachedSoundEffect = fallbackSoundEffectCache.get(name);
  if (cachedSoundEffect) return cachedSoundEffect;

  const soundEffect = new Audio(resolveSoundEffectSource(name));
  soundEffect.preload = 'auto';
  applyFallbackSoundEnabledState(soundEffect);
  fallbackSoundEffectCache.set(name, soundEffect);
  return soundEffect;
};

const getSoundEffectMimeType = (source: string) => {
  if (source.endsWith('.ogg')) return 'audio/ogg; codecs="vorbis"';
  if (source.endsWith('.wav')) return 'audio/wav; codecs="1"';
  return 'audio/*';
};

const getCandidateSoundEffectSources = (name: JumpGameSoundName) => SOUND_EFFECT_SOURCES[name];

const resolveSoundEffectSource = (name: JumpGameSoundName) => {
  const cachedSource = resolvedSoundEffectSourceCache.get(name);
  if (cachedSource) return cachedSource;

  const candidateSources = getCandidateSoundEffectSources(name);
  if (typeof Audio === 'undefined') {
    const fallbackSource = candidateSources[0];
    resolvedSoundEffectSourceCache.set(name, fallbackSource);
    return fallbackSource;
  }

  const audioProbe = new Audio();
  const canPlayType =
    typeof audioProbe.canPlayType === 'function' ? audioProbe.canPlayType.bind(audioProbe) : null;
  const resolvedSource =
    candidateSources.find((source) => {
      if (!canPlayType) return false;
      return canPlayType(getSoundEffectMimeType(source)).length > 0;
    }) ?? candidateSources[0];
  resolvedSoundEffectSourceCache.set(name, resolvedSource);
  return resolvedSource;
};

const getDecodedSoundEffectEntry = (name: JumpGameSoundName): DecodedSoundEffectEntry => {
  const cachedEntry = decodedSoundEffectCache.get(name);
  if (cachedEntry) return cachedEntry;

  const entry: DecodedSoundEffectEntry = {
    buffer: null,
    decodePromise: null,
  };
  decodedSoundEffectCache.set(name, entry);
  return entry;
};

const decodeSoundEffect = async (name: JumpGameSoundName) => {
  const audioContext = ensureAudioContext();
  if (!audioContext || typeof fetch === 'undefined') return null;

  const entry = getDecodedSoundEffectEntry(name);
  if (entry.buffer) return entry.buffer;
  if (entry.decodePromise) return entry.decodePromise;

  const candidateSources = [
    resolveSoundEffectSource(name),
    ...getCandidateSoundEffectSources(name).filter(
      (source) => source !== resolveSoundEffectSource(name),
    ),
  ];

  entry.decodePromise = Promise.all(candidateSources)
    .then(async (sources) => {
      for (const source of sources) {
        try {
          const response = await fetch(source);
          if (!response.ok) continue;
          const audioData = await response.arrayBuffer();
          const decodedBuffer = await audioContext.decodeAudioData(audioData.slice(0));
          entry.buffer = decodedBuffer;
          resolvedSoundEffectSourceCache.set(name, source);
          return decodedBuffer;
        } catch {
          // Try the next candidate source.
        }
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      entry.decodePromise = null;
    });

  return entry.decodePromise;
};

const preloadSoundEffects = async (names: readonly JumpGameSoundName[]) => {
  await resumeAudioContext();
  await Promise.all(names.map((name) => decodeSoundEffect(name)));
};

const playFallbackSoundEffect = (name: JumpGameSoundName) => {
  const soundEffect = getFallbackSoundEffect(name);
  if (!soundEffect) return;

  soundEffect.currentTime = 0;
  const playbackAttempt = soundEffect.play();
  if (!playbackAttempt) return;

  void playbackAttempt.catch(() => {
    // Ignore autoplay-blocked or interrupted playback. Gameplay should continue unchanged.
  });
};

const primeFallbackSoundEffect = async (name: JumpGameSoundName) => {
  const soundEffect = getFallbackSoundEffect(name);
  if (!soundEffect) return;

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
    // Ignore fallback priming failures so gameplay startup continues.
  } finally {
    soundEffect.pause();
    soundEffect.currentTime = 0;
    soundEffect.muted = previousMuted;
    soundEffect.volume = previousVolume;
    applyFallbackSoundEnabledState(soundEffect);
  }
};

const playDecodedSoundEffect = (name: JumpGameSoundName) => {
  const audioContext = ensureAudioContext();
  const gainNode = jumpGameAudioGainNode;
  const decodedBuffer = getDecodedSoundEffectEntry(name).buffer;
  if (!audioContext || !gainNode || !decodedBuffer) return false;

  if (audioContext.state === 'suspended') {
    void audioContext.resume().catch(() => undefined);
  }
  if (audioContext.state !== 'running') {
    return false;
  }

  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = decodedBuffer;
  sourceNode.connect(gainNode);
  sourceNode.start(0);
  return true;
};

const primeFallbackSoundEffects = (names: readonly JumpGameSoundName[]) =>
  Promise.all(names.map((name) => primeFallbackSoundEffect(name)));

const playSoundEffect = (name: JumpGameSoundName) => {
  if (!isJumpGameSoundEnabled) return;

  if (playDecodedSoundEffect(name)) return;

  void decodeSoundEffect(name);
  playFallbackSoundEffect(name);
};

/**
 * Returns the shared fallback jump sound effect instance used when Web Audio is unavailable.
 */
export function getJumpSoundEffect() {
  return getFallbackSoundEffect('jump');
}

/**
 * Returns the shared fallback fish-collect sound effect instance used when Web Audio is unavailable.
 */
export function getFishCollectSoundEffect() {
  return getFallbackSoundEffect('fishCollect');
}

/**
 * Returns the shared fallback fault/end sound effect instance used when Web Audio is unavailable.
 */
export function getPlayerFaultSoundEffect() {
  return getFallbackSoundEffect('playerFault');
}

/**
 * Plays the jump sound effect using the lowest-latency playback path available.
 */
export function playJumpSoundEffect() {
  playSoundEffect('jump');
}

/**
 * Plays the fish-collect sound effect using the lowest-latency playback path available.
 */
export function playFishCollectSoundEffect() {
  playSoundEffect('fishCollect');
}

/**
 * Plays the fault/end sound effect using the lowest-latency playback path available.
 */
export function playPlayerFaultSoundEffect() {
  playSoundEffect('playerFault');
}

/**
 * Returns whether jump-game sound effects are currently enabled.
 */
export function getJumpGameSoundEnabled() {
  return isJumpGameSoundEnabled;
}

/**
 * Enables or disables jump-game sound playback across Web Audio and fallback audio elements.
 *
 * @param value - Whether sound effects should be audible.
 */
export function setJumpGameSoundEnabled(value: boolean) {
  isJumpGameSoundEnabled = value;
  syncGainNodeEnabledState();

  for (const soundEffect of fallbackSoundEffectCache.values()) {
    applyFallbackSoundEnabledState(soundEffect);
  }
}

/**
 * Unlocks the shared audio context and preloads selected sound effects for low-latency playback.
 *
 * @param options - Controls whether only the jump effect or every effect is preloaded.
 * @param options.includeNonJumpEffects - When `true`, also preloads fish/end effects. Defaults to `true`.
 */
export function unlockJumpGameAudio({
  includeNonJumpEffects = true,
}: UnlockJumpGameAudioOptions = {}) {
  if (!unlockEssentialJumpGameAudioPromise) {
    unlockEssentialJumpGameAudioPromise = Promise.all([
      primeFallbackSoundEffects(ESSENTIAL_SOUND_EFFECT_NAMES),
      preloadSoundEffects(ESSENTIAL_SOUND_EFFECT_NAMES),
    ]).then(() => undefined);
  }

  if (!includeNonJumpEffects) {
    return unlockEssentialJumpGameAudioPromise;
  }

  if (!unlockAuxiliaryJumpGameAudioPromise) {
    unlockAuxiliaryJumpGameAudioPromise = Promise.all([
      primeFallbackSoundEffects(AUXILIARY_SOUND_EFFECT_NAMES),
      preloadSoundEffects(AUXILIARY_SOUND_EFFECT_NAMES),
    ]).then(() => undefined);
  }

  return Promise.all([
    unlockEssentialJumpGameAudioPromise,
    unlockAuxiliaryJumpGameAudioPromise,
  ]).then(() => undefined);
}

/**
 * Resets cached jump-game audio state. Intended for tests only.
 */
export function resetJumpGameAudioForTesting() {
  for (const soundEffect of fallbackSoundEffectCache.values()) {
    soundEffect.pause();
    soundEffect.src = '';
  }

  fallbackSoundEffectCache.clear();
  decodedSoundEffectCache.clear();
  resolvedSoundEffectSourceCache.clear();
  isJumpGameSoundEnabled = true;
  unlockEssentialJumpGameAudioPromise = null;
  unlockAuxiliaryJumpGameAudioPromise = null;
  syncGainNodeEnabledState();
  if (jumpGameAudioContext) {
    const closeResult = jumpGameAudioContext.close();
    if (closeResult && typeof closeResult.catch === 'function') {
      void closeResult.catch(() => undefined);
    }
  }
  jumpGameAudioContext = null;
  jumpGameAudioGainNode = null;
}
