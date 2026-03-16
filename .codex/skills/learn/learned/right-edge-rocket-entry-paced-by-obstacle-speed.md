# Right-Edge Rocket Entry Paced By Obstacle Speed

**Captured:** 2026-03-11
**Context:** When special clear ending should make the rocket enter from the true right edge with movement pace aligned to obstacle motion.
**Tags:** react, remix, typescript, game-loop, animation, css-modules, timing

## Problem

In the special ending, rocket entry looked unnatural for two reasons:

- Entry started from a center-biased transform, not the right edge.
- Entry duration was fixed, so movement speed did not match in-game obstacle speed and looked too fast.

## Solution

Use explicit edge-to-center positioning and duration-by-distance calculation:

- Animate `left` from `100%` to `50%` (with matching `transform`) so the rocket starts at the right edge.
- Derive rocket entry duration from `entryDistancePx / obstacleSpeedPxPerSec` instead of fixed milliseconds.
- Keep timeline and visual animation synchronized by passing computed duration through a CSS variable from model to UI.

## Example

```ts
// helpers.ts
const entryDistancePx = (gameRect?.width ?? FALLBACK_GAME_WIDTH_PX) * ROCKET_ENTRY_DISTANCE_RATIO;
const specialRocketEntryMoveMs = Math.max(
  MIN_SPECIAL_ROCKET_ENTRY_MOVE_MS,
  Math.round((entryDistancePx / obstacleSpeedPxPerSec) * MS_PER_SECOND),
);
```

```css
/* JumpGame.module.css */
@keyframes rocket-enter-from-right {
  from {
    left: 100%;
    transform: translateX(0);
  }
  to {
    left: 50%;
    transform: translateX(-50%);
  }
}
```

## When To Use

Use when:

- A sprite/object must visually enter from a viewport edge.
- Animation pacing should feel consistent with gameplay movement speed.
- Timeline callbacks and CSS animation must stay synchronized.

## Related Files

- `features/jump-game/model/clear-sequence/helpers.ts`
- `features/jump-game/model/useBossClearSequence.ts`
- `features/jump-game/ui/JumpGame.tsx`
- `features/jump-game/ui/JumpGame.module.css`
