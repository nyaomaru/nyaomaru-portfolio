# Server Gateway Barrel For Remix Bundle Splitting

**Context:** When a feature exposes both browser-safe APIs and server-only logic in a Remix + Vite app.
**Tags:** remix, vite, architecture, fsd, server-client-boundary, typescript

## Problem

Feature-level barrels can accidentally re-export server-only modules (`fs/promises`, `path`, `.server.ts`) into client-imported paths, triggering build errors like `Server-only module referenced by client`.

## Solution

Split the feature entrypoints by runtime:

- Keep `features/<feature>/index.ts` client-safe only.
- Add `features/<feature>/server.ts` as a server-only gateway.
- Import server logic from routes/actions via `@/features/<feature>/server`.

This preserves a clean FSD public API while preventing accidental client bundle leakage.

## Example

```ts
// features/terminal/index.ts (client-safe)
export * from './api';

// features/terminal/server.ts (server-only)
export * from './model';

// app/routes/api.ask.ts
import { makeProfileQAChain } from '@/features/terminal/server';
```

## When To Use

- A feature has both `api` (client) and `model` (server-only) modules.
- Vite/Remix reports server-only references during client build.
- You want to keep feature imports ergonomic without exposing wrong runtime code.

## Related Files

- `features/terminal/index.ts`
- `features/terminal/server.ts`
- `features/terminal/model/make-profile-qa-chain.ts`
- `app/routes/api.ask.ts`
