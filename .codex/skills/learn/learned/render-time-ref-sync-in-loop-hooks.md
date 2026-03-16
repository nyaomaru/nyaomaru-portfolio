# Render-Time Ref Sync In Loop Hooks

**Context:** Hooks that register long-lived listeners (`setInterval`, DOM events, RAF) but must call the latest callback/flag from React props/state.
**Tags:** react, typescript, hooks, game-loop, refs

## Problem

`useEffect`-based ref synchronization (`ref.current = value`) adds extra effect cycles and can complicate dependencies, even when no side effect is required.

## Solution

Keep listener registration in `useEffect`, but sync latest values to refs during render. This removes sync-only effects while preserving stale-closure safety for handlers.

## Example

```ts
const onJumpRef = useRef(onJump);
onJumpRef.current = onJump;

useEffect(() => {
  const handleKeyDown = () => onJumpRef.current();
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [gameRef]);
```

## When To Use

- The effect only existed to mirror props/state into a ref.
- Handler registration lifecycle should stay stable.
- The callback must always point to the latest implementation.

## Related Files

- `features/jump-game/model/useJumpInputControls.ts`
- `features/jump-game/model/game-loop/useGameLoop.ts`
