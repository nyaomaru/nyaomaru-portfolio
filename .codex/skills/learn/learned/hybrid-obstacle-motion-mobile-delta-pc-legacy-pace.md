# Hybrid Obstacle Motion: Mobile Delta-Time, PC Legacy Pace

**Context:** When mobile gameplay needs frame-rate-independent movement, but PC should keep existing feel.
**Tags:** react, typescript, game-loop, animation, mobile, performance

## Problem

Switching obstacle motion to pure delta-time can change established PC pace, while keeping frame-based movement causes slow motion on mobile devices with unstable FPS.

## Solution

Use a hybrid runtime strategy:

- In `updateObstaclesFrame`, move entities with `frameDistancePx = obstacleSpeedPxPerSec * deltaTimeMs / 1000`.
- In `useGameLoop`, provide speed differently by viewport:
  - mobile: true px/sec speed (`BASE_SPEED * MULTIPLIER * 60`) to gain frame-rate independence.
  - PC: per-frame legacy equivalent converted to per-second (`PC_SPEED * 1000 / deltaTimeMs`) so visual pace matches old behavior.
- Reuse the same speed assumptions in ending/approach timing calculations to keep sequence timing consistent.

## Example

```ts
// obstacles.ts
const frameDistancePx = (obstacleSpeedPxPerSec * deltaTimeMs) / MS_PER_SECOND;
obs.style.left = `${Number.parseFloat(obs.style.left) - frameDistancePx}px`;

// useGameLoop.ts
const obstacleSpeedPxPerSec = isMobile
  ? MOBILE_OBSTACLE_SPEED * MOBILE_OBSTACLE_SPEED_MULTIPLIER * BASE_FRAME_RATE
  : (PC_OBSTACLE_SPEED * MS_PER_SECOND) / Math.max(1, deltaTimeMs);
```

## When To Use

- Mobile devices show visibly slower obstacles under load.
- You need to improve mobile consistency without rebalancing PC difficulty.
- Legacy gameplay tuning must be preserved on desktop.

## Related Files

- `features/jump-game/model/game-loop/useGameLoop.ts`
- `features/jump-game/model/game-loop/obstacles.ts`
- `features/jump-game/model/config/gameplay.ts`
- `features/jump-game/model/useBossClearSequence.ts`
