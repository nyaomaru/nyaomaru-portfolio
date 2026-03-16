# DEVELOPER.md

Developer guide for **Nyaomaru Portfolio**.
This file documents practical conventions and runtime expectations for this repository.

## Quick Start

Requirements:

- Node.js `>= 24`
- `pnpm`

Setup:

```sh
pnpm install
cp .env.example .env
```

Run app:

```sh
pnpm dev
```

## Main Commands

- `pnpm dev` start Remix dev server
- `pnpm build` production build (`remix vite:build`)
- `pnpm start` serve built app
- `pnpm lint` run ESLint
- `pnpm typecheck` run TypeScript checks
- `pnpm test` run Vitest (watch)
- `pnpm test:run` run Vitest once
- `pnpm test:coverage` run tests with coverage
- `pnpm fmt` format code via oxfmt
- `pnpm fmt:check` check formatting

## Environment Variables

- `OPENAI_API_KEY` is required for `/api/ask`.
- Without a valid key, terminal Q&A API returns an error response.

## Architecture

This project follows Feature-Sliced Design (FSD):

- `app/` Remix app shell and routes
- `pages/` route-level page modules
- `widgets/` composed UI blocks
- `features/` user-facing features (`jump-game`, `terminal`)
- `shared/` reusable ui/lib/constants/api

Import boundaries are enforced by ESLint (`eslint-plugin-boundaries`).
Prefer slice public APIs (`index.ts`) instead of deep imports.

Path alias:

- `@/*` -> repository root (configured in `tsconfig.json`)

## Coding Conventions

- TypeScript strict mode is enabled.
- Keep changes small and focused.
- Prefer explicit types at boundaries.
- Add or update tests for behavior changes.
- Keep asset naming in `public/assets` consistent (snake_case).

For `features/jump-game/model/**`:

- Add `/** ... */` comments for `type`/`interface` properties.
- Add JSDoc for exported functions.

## Testing Expectations

Before PR:

```sh
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
```

When touching game behavior, include targeted tests under `tests/features/jump-game/**` when feasible.

## PR Notes

- Explain what changed and why.
- Include screenshots/GIFs for visible UI/animation changes.
- Mention related issues (`Closes #...`) when applicable.
- Keep PR scope narrow; avoid unrelated refactors in the same PR.
