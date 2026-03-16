# Behavior-Preserving Loop Decomposition

**Captured:** 2026-03-12
**Context:** When core gameplay hooks become too large and difficult to evolve safely, but runtime behavior must stay unchanged.
**Tags:** react, remix, typescript, game-loop, refactoring, architecture

## Problem

Large orchestration hooks (game loop / clear sequence) mixed timing math, viewport math, timeline scheduling, and DOM updates in one place. Small changes became risky because responsibilities were tightly coupled.

## Solution

Split by responsibility without changing external contracts:

- Move frame/elapsed/speed math into a runtime helper module.
- Move viewport and scaling calculations into a dedicated metrics module.
- Move clear-sequence timeline assembly into a timeline builder module.
- Keep the original hook API and call order intact so behavior remains stable.

## Example

```ts
// useGameLoop.ts
const timing = getFrameTiming(nowMs, lastFrameAtMsRef.current);
const elapsedTime = getElapsedTime(startTimeRef.current, Date.now());
const obstacleSpeedPxPerSec = getObstacleSpeedPxPerSec(isMobileViewport, timing.deltaTimeMs);
```

## When To Use

- A hook exceeds practical review size and owns multiple domains.
- You need to improve maintainability without rebalancing gameplay.
- You want unit-testable pure helpers around timing and sequencing.

## Related Files

- `features/jump-game/model/game-loop/useGameLoop.ts`
- `features/jump-game/model/game-loop/runtime.ts`
- `features/jump-game/model/game-loop/viewport.ts`
- `features/jump-game/model/useBossClearSequence.ts`
- `features/jump-game/model/clear-sequence/timeline.ts`
