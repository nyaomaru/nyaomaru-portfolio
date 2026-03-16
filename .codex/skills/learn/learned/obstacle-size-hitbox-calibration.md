# Obstacle Size Hitbox Calibration

**Context:** When obstacle visual scaling and collision difficulty need to be tuned independently.
**Tags:** react, remix, typescript, collision, balancing, game-loop

## Problem

If visual ratio scaling and collision sizing are coupled in one rule, adjusting obstacle visuals can unintentionally change game difficulty.

## Solution

Use `OBSTACLE_ICON_HEIGHT_RATIOS` for visual scaling and keep collision tuning separate with `dataset.hitboxScale`. Compute one shared `obstacleSizePx` and apply it to both `height` and `width` so size behavior stays deterministic.

## Example

```ts
const OBSTACLE_ICON_HEIGHT_RATIOS = [0.64, 1.36, 0.6, 1.2] as const;
const DESK_HITBOX_SCALE = 0.86;

if (iconIndex === 0 || iconIndex === 1) {
  obs.dataset.hitboxScale = `${DESK_HITBOX_SCALE}`;
}

const obstacleSizePx =
  getGameHeight() *
  (OBSTACLE_ICON_HEIGHT / LEGACY_GAME_HEIGHT) *
  OBSTACLE_ICON_HEIGHT_RATIOS[iconIndex];
obs.style.height = `${obstacleSizePx}px`;
obs.style.width = `${obstacleSizePx}px`;
```

## When To Use

Use this when you need per-obstacle balancing such as "looks larger but should still be less punishing," while keeping visuals and hitboxes independently tunable.

## Related Files

- `features/jump-game/model/useObstacles.ts`
- `features/jump-game/model/useGameLoop.ts`
- `tests/features/jump-game/model/useObstacles.test.ts`
