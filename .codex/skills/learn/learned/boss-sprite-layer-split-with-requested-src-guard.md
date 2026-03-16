# Boss Sprite Layer Split With Requested-Src Guard

**Context:** Boss attack/retract animation flickers when sprite is swapped via `backgroundImage` during per-frame loop updates.
**Tags:** react, typescript, game-loop, sprite, animation, performance

## Problem

Even after separating React styles from imperative writes, boss flicker remained during attack/retract.
`backgroundImage` swaps on the boss container were still sensitive to frame timing, async image readiness, and frequent width/layout updates.

## Solution

Render boss visuals as a dedicated `<img>` inside the boss container and drive only `img.src` from the game loop.

Key rules:

- Keep transform/position/width on container (`bossRef`).
- Keep sprite frame switching on image node (`bossSpriteRef.current.src`).
- Use `requested/current` refs to ignore stale async sprite apply.
- Preload boss sprite set and apply only when requested sprite is still current.
- During attack/retract, keep boss width stable at `base + targetLen` to reduce per-frame layout jitter.

## Example

```ts
const requestedBossSpriteRef = useRef(BOSS_BASE_SPRITES[0]);
const currentBossSpriteRef = useRef<string | null>(null);

const setBossSprite = (spritePath: string) => {
  requestedBossSpriteRef.current = spritePath;
  const applySprite = () => {
    const el = bossSpriteRef.current;
    if (!el) return;
    if (requestedBossSpriteRef.current !== spritePath) return;
    if (currentBossSpriteRef.current === spritePath) return;
    currentBossSpriteRef.current = spritePath;
    el.src = spritePath;
  };

  if (preloadedBossSprites.has(spritePath)) {
    applySprite();
    return;
  }
  void ensureBossSpriteLoaded(spritePath).then(applySprite);
};
```

## When To Use

Use when per-frame sprite animation on a container background still flickers after React/imperative ownership separation, especially in attack/retract-style high-frequency frame changes.

## Related Files

- `features/jump-game/model/game-loop/useGameLoop.ts`
- `features/jump-game/model/useBossClearSequence.ts`
- `features/jump-game/model/game-scene/useJumpGameScene.ts`
- `features/jump-game/ui/JumpGame.tsx`
- `features/jump-game/ui/JumpGame.module.css`
