# JumpGame CSS Modules With Runtime CSS Variables

**Context:** When `ui` components become large due to inline keyframes and style objects, but still need dynamic animation values.
**Tags:** react, typescript, fsd, css-modules, animation, maintainability

## Problem

Keeping `@keyframes` and animation strings inside `JumpGame.tsx` bloats render code and mixes styling concerns with orchestration logic.

## Solution

Move static animation/keyframe rules to `JumpGame.module.css` in the same `ui` slice. Keep only dynamic values (`x`, `y`, `duration`) in TS via CSS custom properties.

## Example

```ts
const FLYOUT_DURATION_CSS_VAR = '--flyout-duration-ms';

<div
  className={styles.flyoutMotion}
  style={
    {
      '--flyout-origin-x': `${specialFlyoutOrigin.x}px`,
      '--flyout-origin-y': `${specialFlyoutOrigin.y}px`,
      [FLYOUT_DURATION_CSS_VAR]: `${specialFlyoutDurationMs}ms`,
    } as CSSProperties
  }
/>
```

```css
.flyoutMotion {
  left: var(--flyout-origin-x);
  top: var(--flyout-origin-y);
  animation: special-flyout-motion var(--flyout-duration-ms) cubic-bezier(0.24, 0.82, 0.22, 1)
    forwards;
}
```

## When To Use

Use when component-level animation is mostly static CSS and only timing/position is runtime-dependent.

## Related Files

- `features/jump-game/ui/JumpGame.tsx`
- `features/jump-game/ui/JumpGame.module.css`
- `features/jump-game/model/useJumpGameScene.ts`
