# Mobile Initial Position Mismatch From JS Breakpoint

**Context:** When first render position differs from retry/reset position on mobile in Remix/React apps.
**Tags:** react, remix, typescript, responsive, css-modules, hydration

## Problem

`player` position was decided by module-scope `isMobile` and written as inline style. On first paint (SSR/hydration boundary), this could use a different breakpoint result than the browser layout, so initial position and retry position diverged.

## Solution

Use CSS media queries as the single source of truth for responsive position:

- Move `player` left positioning into `JumpGame.module.css`.
- Apply a stable class to the player element.
- In reset/sequence code, clear `style.left` (`''`) so CSS baseline is reapplied.

This keeps initial render and retry behavior consistent.

## Example

```ts
// useJumpGameScene.ts
if (playerRef.current) {
  playerRef.current.style.left = '';
}
```

```css
/* JumpGame.module.css */
.player {
  left: max(2.5rem, 8%);
}
@media (max-width: 639px) {
  .player {
    left: max(0.5rem, calc(8% - 1.75rem));
  }
}
```

## When To Use

Use when mobile/desktop positioning is currently controlled by JS breakpoint flags and users report first-render vs retry mismatch.

## Related Files

- `features/jump-game/model/useJumpGameScene.ts`
- `features/jump-game/model/useBossClearSequence.ts`
- `features/jump-game/ui/JumpGame.module.css`
- `features/jump-game/ui/JumpGame.tsx`
