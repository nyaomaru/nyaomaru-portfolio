# Contributing to Nyaomaru Portfolio

Thanks for your interest in contributing.
This repository is a Remix + React + TypeScript portfolio organized with FSD layers.

## Setup

```sh
pnpm install
cp .env.example .env
```

If you plan to test `/api/ask`, set:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Local Development

```sh
pnpm dev
```

## Quality Checks

Run these before opening a PR:

```sh
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
```

## Workflow

1. Fork the repository.
2. Create a branch from `main`.
3. Keep changes focused (one concern per PR when possible).
4. Add or update tests for behavior changes.
5. Open a PR with a clear summary and rationale.

## Commit Style

Conventional Commits are recommended:

```text
feat(scope): short description
fix(scope): short description
docs(scope): short description
```

## Architecture Expectations

- Respect FSD layer boundaries (`app -> pages -> widgets -> features -> shared`).
- Prefer public slice entry points (`index.ts`) over deep imports.
- Keep `shared/` generic and reusable.

## Pull Request Checklist

- [ ] Lint, typecheck, tests, and build all pass.
- [ ] README or docs updated if behavior changed.
- [ ] No secrets or sensitive values committed.
- [ ] Screenshots or GIF attached for UI behavior changes when useful.
