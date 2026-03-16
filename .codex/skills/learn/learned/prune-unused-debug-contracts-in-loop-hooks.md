# Prune Unused Debug Contracts In Loop Hooks

**Context:** When temporary debug features remain in core loop hook APIs after debugging is finished.
**Tags:** react, typescript, refactoring, api-design, game-loop, hooks

## Problem

`useGameLoop` kept debug-oriented API surface (`bossArmHitboxDebugRef`, `disableObstacles`, attack-active callback) even after callers stopped using them. This increased branching and made the hook harder to maintain.

## Solution

Treat debug paths as removable contracts:

- Remove unused params from the hook type and function signature.
- Delete dead branches and helper functions tied to those params.
- Update call sites to match the reduced contract.
- Verify with typecheck so stale usages are caught immediately.

## Example

```ts
useGameLoop({
  gameOver,
  bossRef,
  playerRef,
  obstaclesRef,
  startTimeRef,
  gameRef,
  bossArmRef,
  showBoss,
  onBossPatternTwoActiveChange: setBossPatternTwoActive,
  onFishCollected: handleFishCollected,
  setGameOver,
  setTitle,
  setShowBoss,
  setGameOverIcon,
});
```

## When To Use

Use after a debug cycle ends and temporary loop diagnostics are no longer required in production behavior.

## Related Files

- `features/jump-game/model/useGameLoop.ts`
- `features/jump-game/model/useJumpGameScene.ts`
