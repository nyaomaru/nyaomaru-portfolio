# Type Property Comments And Public JSDoc

**Context:** `features/jump-game/model` where hooks and utility functions are reused across scene/game-loop modules.
**Tags:** typescript, jsdoc, maintainability, hooks

## Problem

As model hooks grow, anonymous object types and undocumented exported functions make intent hard to track, especially around timing/collision contracts.

## Solution

Add property-level comments to type definitions and JSDoc to exported functions. Prefer named option types over inline object types when parameters represent a stable contract.

## Example

```ts
type SpawnableObstacleIndicesParams = {
  /** Candidate obstacle indices supplied by caller or full default list. */
  candidateIndices: ObstacleIconIndex[];
  /** Whether current spawn should apply boss-mode exclusions. */
  isBossMode: boolean;
};

/**
 * Runs the per-frame simulation loop for obstacles, boss state machine, and collisions.
 */
export function useGameLoop(params: UseGameLoopParams) {
  // ...
}
```

## When To Use

- A type is shared across module boundaries or controls gameplay behavior.
- Public functions are consumed by other hooks/components.
- Onboarding/debugging cost is rising due to unclear parameter meaning.

## Related Files

- `features/jump-game/model/useJumpGameScene.spawn.ts`
- `features/jump-game/model/useObstacles.ts`
- `features/jump-game/model/game-loop/constants.ts`
- `features/jump-game/model/game-loop/helpers.ts`
- `features/jump-game/model/game-loop/obstacles.ts`
- `features/jump-game/model/game-loop/useGameLoop.ts`
