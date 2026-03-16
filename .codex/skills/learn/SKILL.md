---
name: learn
description: Extract reusable patterns from non-trivial problems solved in a session and store them as reusable project knowledge. Use after complex debugging, architecture discoveries, or practical workarounds.
---

# /learn - Extract Reusable Patterns

Analyze the current session and capture patterns worth reusing in this Remix + React + TypeScript portfolio project.

## Auto-Activation Criteria

Consider auto-activating this skill when:

1. A complex bug was fixed (non-obvious root cause, multi-step diagnosis).
2. A new implementation pattern was discovered and validated.
3. A workaround was implemented for a library/framework/platform limitation.
4. The session is ending and meaningful technical learning was produced (ask user before writing).

Do not activate for:

- trivial typo fixes
- one-line obvious refactors
- temporary external incidents (e.g., transient API outage)
- patterns already documented in `.codex/skills/learn/learned/`

## Manual Trigger

Run `/learn` after resolving a non-trivial issue.

## What To Extract

### 1. Error Resolution Patterns

- What failed?
- What was the real root cause?
- What exact fix worked?
- How can the same pattern be reused?

Project-relevant examples:

- React state/ref synchronization issues in game loops.
- Collision box mismatches vs. rendered visuals.
- TypeScript literal type narrowing issues in refs/state.
- Asset-driven animation state bugs (timing/order/race).

### 2. Debugging Techniques

- Non-obvious debugging sequence that worked.
- Useful command/tool combinations.
- Fast diagnosis patterns.

Project-relevant examples:

- Using `pnpm typecheck` + `pnpm build` after each gameplay logic change.
- Comparing style-driven transforms with `getBoundingClientRect()` collision logic.
- Isolating hooks (`useGameLoop`, `useObstacles`, `useJump`) to pinpoint regressions.

### 3. Workarounds

- Framework/library constraints and mitigations.
- Version-specific fixes.
- Practical tradeoffs that were chosen and why.

Project-relevant examples:

- Sprite/background animation fallback instead of SVG internals.
- Responsive scaling using legacy baseline ratios.
- Clear-state sequence orchestration with phased timers.

### 4. Project-Specific Patterns

- Codebase conventions discovered during implementation.
- Architecture decisions and integration boundaries.

Project-relevant examples:

- Feature-based structure (`features/jump-game/...`) and hook boundaries.
- Runtime DOM element creation pattern in obstacle systems.
- Separation of render state (UI) vs. simulation state (loop refs).

## Output Format

Create one file per pattern at:

`.codex/skills/learn/learned/[pattern-name].md`

Template:

````markdown
# [Descriptive Pattern Name]

**Captured:** YYYY-MM-DD
**Context:** [When this pattern applies]
**Tags:** react, remix, typescript, game-loop, collision, animation, etc.

## Problem

[Specific recurring problem this pattern solves]

## Solution

[Reusable approach, key decisions, and constraints]

## Example

```ts
// Minimal real example from this codebase
```
````

## When To Use

[Trigger conditions for applying this pattern]

## Related Files

- `features/jump-game/model/useGameLoop.ts`
- `features/jump-game/model/useObstacles.ts`
- `features/jump-game/ui/JumpGame.tsx`

```

## Process

1. Review the session for candidate learnings.
2. Select the highest-value reusable pattern(s).
3. Draft the pattern file.
4. Ask user confirmation before saving.
5. Save to `.codex/skills/learn/learned/`.
6. Update `.codex/skills/learn/LEARNED_INDEX.md` with a one-line entry (required).

Index format:

`- **[pattern-name](learned/pattern-name.md)** - One-line summary.`

## Common Pattern Categories For This Project

- Game loop timing and state synchronization
- Collision detection vs. rendered position alignment
- Responsive scaling from fixed-pixel legacy assumptions
- Sprite animation sequencing and transitions
- Boss/obstacle/fish spawn balancing and fail-state prevention
- TypeScript safety for refs, unions, and hook contracts

## Notes

- Capture only non-trivial, reusable patterns.
- Keep one pattern per file.
- Prefer concrete examples from this repository.
- Keep entries short, searchable, and implementation-focused.

```
