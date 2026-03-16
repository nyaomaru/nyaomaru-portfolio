# Project Agent Notes

## Local Skills

- `learn`: Extract reusable engineering patterns from non-trivial solutions in this project.  
  File: `.codex/skills/learn/SKILL.md`

## Trigger Rule

- If the user runs `.codex/skills/learn`, open `.codex/skills/learn/SKILL.md` and follow its workflow.

## Learned Pattern Enforcement

- Scope: tasks touching `features/jump-game/**`
- Before editing code, always read `.codex/skills/learn/LEARNED_INDEX.md`.
- Then open and apply at least one relevant file from `.codex/skills/learn/learned/*.md`.
- In implementation notes/final response, explicitly state which learned pattern(s) were applied.
- After non-trivial changes, propose updating learn artifacts:
  - add or update one file in `.codex/skills/learn/learned/`
  - update `.codex/skills/learn/LEARNED_INDEX.md`

## Jump Game Model Documentation Rules

- Scope: `features/jump-game/model/**`
- For `type` / `interface`, add inline property comments using `/** ... */` directly above each property.
- For `export function` / exported function-like `const`, add a JSDoc block describing purpose and behavior.
- Avoid anonymous inline object types for function parameters when the shape is stable; define a named type and document each property.

## Boolean `isXXX` Rules

- When declaring `isXXX` booleans or `isXXX` predicates, use `is-kit` utilities (e.g. `equals`, `define`, combinators) instead of ad-hoc inline comparisons where applicable.
