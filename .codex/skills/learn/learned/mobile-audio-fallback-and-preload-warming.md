# Mobile Audio Fallback And Preload Warming

**Captured:** 2026-03-21
**Context:** When short game sound effects must stay responsive on mobile browsers with uneven codec support and strict user-gesture audio rules.
**Tags:** react, typescript, audio, mobile, safari, performance, preload, game-loop

## Problem

Jump-game sound effects played reliably on desktop but failed or stuttered on mobile:

- `ogg` assets could be unsupported on some mobile browsers.
- `AudioContext` could stay suspended even after setup, leaving decoded playback silent.
- The first `jump` or `fish` interaction paid source-resolution and asset-load cost, causing a visible hitch.

## Solution

Use a layered audio strategy:

- Keep compressed `ogg` as the preferred source for browsers that support it.
- Provide a compressed `mp3` fallback instead of `wav` to preserve mobile compatibility without reintroducing large asset costs.
- On initial render, warm audio assets without unlocking playback:
  - resolve the playable source via `canPlayType`
  - create fallback `HTMLAudioElement` instances
  - call `load()`
  - fetch the resolved asset into browser cache
- On the first real user gesture, run audio unlock/priming so playback becomes legal on mobile.
- During runtime playback, use decoded Web Audio when the context is actually `running`; otherwise fall back to the primed `HTMLAudioElement`.

## Example

```ts
const createSoundEffectSourceCandidates = (preferredSource: string) =>
  preferredSource.endsWith('.ogg')
    ? ([preferredSource, preferredSource.replace(/\.ogg$/, '.mp3')] as const)
    : ([preferredSource] as const);

export function preloadJumpGameAudioAssets() {
  if (preloadJumpGameAudioAssetsPromise) {
    return preloadJumpGameAudioAssetsPromise;
  }

  preloadJumpGameAudioAssetsPromise = preloadResolvedSoundEffectAssets([
    ...ESSENTIAL_SOUND_EFFECT_NAMES,
    ...AUXILIARY_SOUND_EFFECT_NAMES,
  ]).then(() => undefined);
  return preloadJumpGameAudioAssetsPromise;
}

export function unlockJumpGameAudio({
  includeNonJumpEffects = true,
}: UnlockJumpGameAudioOptions = {}) {
  if (!unlockEssentialJumpGameAudioPromise) {
    unlockEssentialJumpGameAudioPromise = Promise.all([
      primeFallbackSoundEffects(ESSENTIAL_SOUND_EFFECT_NAMES),
      preloadSoundEffects(ESSENTIAL_SOUND_EFFECT_NAMES),
    ]).then(() => undefined);
  }
}
```

## When To Use

- Mobile browsers are silent while desktop audio works.
- First-play sound effects hitch, but repeated playback is smooth.
- You need browser-compatible fallback audio without the payload cost of `wav`.

## Related Files

- `features/jump-game/model/audio.ts`
- `features/jump-game/index.ts`
- `pages/game/ui/Game.tsx`
- `public/assets/sound-effects/jump.ogg`
- `public/assets/sound-effects/jump.mp3`
