# Moving Entity Motion Contract

**Captured:** 2026-03-12
**Context:** When spawned entities and per-frame movement logic share implicit dataset/style conventions.
**Tags:** react, typescript, game-loop, animation, contract, maintainability

## Problem

Spawn logic and frame-update logic duplicated motion keys and transform rules (`spawnLeft`, `translateX`). This created drift risk: changing one side could silently break movement or collision thresholds.

## Solution

Define one shared motion contract module and use it from both ends:

- `initializeMovingEntityMotion` sets spawn anchor and initial transform state.
- `advanceMovingEntityMotion` updates transform and returns effective left position for collision/deadline checks.
- Keep obstacle/fish logic focused on gameplay decisions, not motion bookkeeping.

## Example

```ts
// spawn side
initializeMovingEntityMotion(obs, getSpawnLeft());

// frame-update side
const { currentLeftPx } = advanceMovingEntityMotion(obs, frameDistancePx);
```

## When To Use

- DOM entities are spawned in one module and animated in another.
- Multiple entity types (obstacle/fish) must share identical movement semantics.
- You need to change motion implementation (e.g., left -> transform) safely.

## Related Files

- `features/jump-game/model/game-loop/moving-entity-motion.ts`
- `features/jump-game/model/useObstacles.ts`
- `features/jump-game/model/game-loop/obstacles.ts`
