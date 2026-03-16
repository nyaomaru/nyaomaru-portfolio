# Boss Bob Phase And Ground Charge Gating

**Context:** When boss idle motion must start from grounded position and attack timing should feel intentional.
**Tags:** react, typescript, game-loop, boss, animation, state-machine

## Problem

Using global `performance.now()` modulo for idle bob can make boss spawn at an arbitrary Y offset (appears floating). Also, firing attack immediately at ground contact feels abrupt.

## Solution

Anchor bob phase to `entryElapsedMs` (time since boss appeared), not absolute time. Add explicit `groundChargeStartMs` in arm state, and only enter `extending` after a fixed grounded charge duration.

## Example

```ts
const waitBobState = getBossWaitBob(entryElapsedMs, baselineScale);
const canStartNewAttack = nowMs - arm.lastPulseMs >= BOSS_ARM.PULSE_INTERVAL;

if (arm.phase === 'idle') {
  if (!canStartNewAttack) {
    arm.groundChargeStartMs = 0;
  } else if (arm.groundChargeStartMs === 0 && waitBobState.atGround) {
    arm.groundChargeStartMs = nowMs;
  } else if (nowMs - arm.groundChargeStartMs >= BOSS_WAIT_ATTACK_CHARGE_MS) {
    arm.phase = 'extending';
    arm.groundChargeStartMs = 0;
  }
}
```

## When To Use

Use when idle oscillation should have deterministic start position and attack triggers need a readable anticipation window.

## Related Files

- `features/jump-game/model/useGameLoop.ts`
- `features/jump-game/model/constants.ts`
