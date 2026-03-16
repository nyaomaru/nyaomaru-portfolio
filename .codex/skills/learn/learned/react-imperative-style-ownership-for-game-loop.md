# React Imperative Style Ownership For Game Loop

**Context:** When a game loop mutates DOM styles directly while React also provides `style` props for the same nodes.
**Tags:** react, typescript, game-loop, animation, rendering, hooks

## Problem

`useGameLoop` and sprite hooks updated `player`/`boss` styles imperatively (`backgroundImage`, `transform`, `width`, `right`), while `useJumpGameScene` still passed overlapping inline styles through React. Re-renders reapplied React styles and caused visual flicker.

## Solution

Define ownership clearly:

- Keep runtime-changing style fields in loop/animation hooks only.
- Keep React `style` props limited to static baseline fields.
- Remove duplicated dynamic fields from render-time style objects to avoid write contention.

## Example

```ts
// static from scene model
const bossStyle: CSSProperties = {
  height: '40%',
  backgroundSize: 'auto 100%',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right bottom',
};

// dynamic from game loop
bossRef.current.style.right = `${getBossRightOffsetPx()}px`;
bossRef.current.style.transform = `translate(${bossEntryOffset}px, ${waitOffsetY}px)`;
bossRef.current.style.backgroundImage = `url(${BOSS_ATTACK_SPRITES[frameIndex]})`;
```

## When To Use

Use when animation/simulation hooks need per-frame DOM writes and React re-renders are causing flicker or state desynchronization.

## Related Files

- `features/jump-game/model/useGameLoop.ts`
- `features/jump-game/model/useJumpGameScene.ts`
- `features/jump-game/ui/JumpGame.tsx`
