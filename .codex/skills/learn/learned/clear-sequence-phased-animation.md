# Clear Sequence Phased Animation

**Context:** When you need a stable, ordered clear sequence for boss exit, player move, and icon transitions.
**Tags:** react, remix, typescript, game-loop, animation, state-machine

## Problem

When multiple `setTimeout` callbacks and DOM style updates are mixed in one clear animation, boss visibility and clear-icon transitions can race or overlap.

## Solution

Model the sequence with an explicit phase state (`idle` / `boss_exit` / `player_move` / `happy`) and derive render conditions from that phase. Keep timing and distance values as constants, and orchestrate the full order in one `useEffect`.

## Example

```ts
type ClearSequencePhase = 'idle' | 'boss_exit' | 'player_move' | 'happy';

const shouldShowHappyIcon = isBossClearResult && clearSequencePhase === 'happy';
const shouldRenderBoss =
  showBoss && (!gameOver || (isBossClearResult && clearSequencePhase !== 'happy'));

setClearSequencePhase('boss_exit');
bossRef.current.style.transition = `transform ${CLEAR_BOSS_EXIT_MS}ms ease`;
bossRef.current.style.transform = `translateX(${CLEAR_BOSS_EXIT_TRANSLATE_X})`;

const moveTimerId = window.setTimeout(() => {
  setClearSequencePhase('player_move');
  playerRef.current.style.transition = `left ${CLEAR_PLAYER_MOVE_MS}ms linear, transform ${CLEAR_PLAYER_MOVE_MS}ms linear`;
}, CLEAR_BOSS_EXIT_MS);
```

## When To Use

Use this when a boss-clear flow needs staged transitions across multiple animated entities (player, boss, and clear icon) without timing conflicts.

## Related Files

- `features/jump-game/ui/JumpGame.tsx`
- `features/jump-game/model/useGameLoop.ts`
