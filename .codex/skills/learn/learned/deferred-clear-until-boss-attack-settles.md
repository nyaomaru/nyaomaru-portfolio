# Deferred Clear Until Boss Attack Settles

**Context:** When clear/end-state must not interrupt an active boss attack animation.
**Tags:** react, typescript, game-loop, state-machine, clear-sequence, boss

## Problem

At clear time, forcing immediate clear could cut boss attack mid-phase, producing inconsistent pose and confusing transition into boss fade out.

## Solution

Gate clear with a deferred flag:

- Set `clearRequested` once elapsed time reaches clear threshold.
- Stop spawning/moving obstacles and block new attacks.
- Wait until arm FSM reaches `idle`.
- Then normalize boss pose (`boss_base1`, grounded transform, arm reset) and trigger clear result.

This keeps transition deterministic and visually coherent.

## Example

```ts
if (elapsed >= CLEAR_DURATION) {
  clearRequestedRef.current = true;
}

const canStartNewAttack = !clearRequestedRef.current && pulseElapsed >= BOSS_ARM.PULSE_INTERVAL;

if (clearRequestedRef.current) {
  const waiting = showBossRef.current && armStateRef.current.phase !== 'idle';
  if (!waiting) {
    triggerClearSuccess(); // sets boss_base1 + grounded pose, then gameOver clear
    return;
  }
}
```

## When To Use

Use when end-of-level transitions should preserve attack state integrity and avoid snapping from attack frames directly into exit animation.

## Related Files

- `features/jump-game/model/useGameLoop.ts`
- `features/jump-game/model/useBossClearSequence.ts`
- `features/jump-game/ui/JumpGame.tsx`
