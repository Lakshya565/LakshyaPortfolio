# Lakshya Agarwal Portfolio

A static-first personal portfolio showcasing software, AI, embedded, and hardware projects through detailed case studies and an eventual atmospheric sci-fi circuit interface.

Phase 0 establishes the repository and application foundation. The current page is intentionally minimal; project content, case-study routes, and the interactive circuit scene belong to later approved phases.

## Architecture

- Next.js App Router with strict TypeScript.
- Version-controlled local content with build-time validation.
- Server Components by default; narrowly scoped Client Components only when interaction requires them.
- No runtime API, database, authentication, analytics, or secrets.
- Vercel is the intended host, but no hosted project has been created yet.

The decision and tradeoffs are recorded in [`docs/decisions/0001-static-content-architecture.md`](docs/decisions/0001-static-content-architecture.md). Product requirements and phase gates live in [`docs/portfolio-overview.md`](docs/portfolio-overview.md) and [`docs/portfolio-implementation-phases.md`](docs/portfolio-implementation-phases.md).

## Prerequisites

- Node.js 24.x
- npm 11.x

The repository includes `.nvmrc`, and `web/package.json` declares the supported Node major version.

## Install

From PowerShell:

```powershell
cd web
npm.cmd install
```

The initial application needs no environment variables. Do not create an `.env` file unless a later approved phase introduces a documented public configuration value.

## Commands

Run these from `web/`:

| Command | Purpose |
|---|---|
| `npm.cmd run dev` | Start the local development server. |
| `npm.cmd run validate:content` | Validate the local site-content boundary. |
| `npm.cmd run lint` | Run ESLint. |
| `npm.cmd run typecheck` | Run TypeScript without emitting files. |
| `npm.cmd test` | Run focused unit tests once. |
| `npm.cmd run build` | Create the production build and report route rendering mode. |
| `npm.cmd run check` | Run validation, lint, type checking, and tests. |

Phase 0 verification does not require starting the development server or opening a browser.

## Current structure

```text
web/
  app/                 Next.js routes and global styles
  content/             Canonical local portfolio content
  lib/content/         Content validation and access
  scripts/             Repository validation entry points
  tests/               Focused unit tests
  types/               Shared content contracts
docs/
  decisions/           Architecture decision records
```

## Deferred inputs

The GitHub URL, LinkedIn URL, public email, final Cisco omissions, and assigned Vercel URL are intentionally deferred. The planning documents record when they must be requested. Temporary values must never reach a production deployment.
