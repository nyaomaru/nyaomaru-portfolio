# Game Loop Subdirectory With Barrel API

**Context:** A hook grows into multiple helper/constant files and file naming becomes noisy (`useGameLoop.*`).
**Tags:** architecture, fsd, react, typescript, refactoring

## Problem

Flat file placement with many `useGameLoop.*` siblings reduces discoverability and increases import churn.

## Solution

Move the hook family into a dedicated directory and expose a single public import via `index.ts`. Keep internal helpers/constants private to that directory.

## Example

```ts
// features/jump-game/model/game-loop/index.ts
export { useGameLoop } from './useGameLoop';

// consumer
import { useGameLoop } from './game-loop';
```

## When To Use

- One hook has multiple implementation siblings (`constants`, `helpers`, `obstacles`).
- You want to hide internal file structure from consumers.
- Future expansion is expected (pattern modules, collision modules, etc.).

## Related Files

- `features/jump-game/model/game-loop/useGameLoop.ts`
- `features/jump-game/model/game-loop/constants.ts`
- `features/jump-game/model/game-loop/helpers.ts`
- `features/jump-game/model/game-loop/obstacles.ts`
- `features/jump-game/model/game-loop/index.ts`
- `features/jump-game/model/useJumpGameScene.ts`
