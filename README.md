# Lakshya Agarwal Portfolio

A static-first personal portfolio showcasing software, AI, embedded, and hardware projects through detailed case studies and an eventual atmospheric sci-fi circuit interface.

Phases 0 through 3 establish the repository, validated local content foundation,
five statically generated case-study routes, and a conventionally navigable
responsive site shell. The interactive circuit scene and final visual polish
belong to later approved phases.

## Architecture

- Next.js App Router with strict TypeScript.
- Version-controlled local content with build-time validation.
- Server Components by default; narrowly scoped Client Components only when interaction requires them.
- No runtime API, database, authentication, analytics, or secrets.
- Published case studies prerender at `/projects/<slug>` from explicit local MDX imports; unknown and archive-only slugs return 404.
- Vercel is the intended host, but no hosted project has been created yet.

The decision and tradeoffs are recorded in [`docs/decisions/0001-static-content-architecture.md`](docs/decisions/0001-static-content-architecture.md). Product requirements and phase gates live in [`docs/portfolio-overview.md`](docs/portfolio-overview.md) and [`docs/portfolio-implementation-phases.md`](docs/portfolio-implementation-phases.md).

Content conventions and publication checks are documented in [`docs/content-authoring.md`](docs/content-authoring.md).

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
| `npm.cmd run validate:content:release` | Enforce final publication readiness; expected to fail while approved placeholders remain. |
| `npm.cmd run lint` | Run ESLint. |
| `npm.cmd run typecheck` | Run TypeScript without emitting files. |
| `npm.cmd test` | Run focused unit tests once. |
| `npm.cmd run build` | Create the production build and report route rendering mode. |
| `npm.cmd run check` | Run validation, lint, type checking, and tests. |

Phase 3 verification uses focused offline checks and a production build; it does
not require starting a persistent development server.

## Current structure

```text
web/
  app/                 Next.js routes and global styles
  content/             Canonical manifests and constrained MDX case studies
  lib/content/         Content validation, normalization, and queries
  lib/metadata/        Metadata projections from canonical content
  scripts/             Repository validation entry points
  tests/               Focused unit tests
  types/               Shared content contracts
docs/
  decisions/           Architecture decision records
```

## Deferred inputs

The public GitHub, LinkedIn, and email values are now configured. Final Cisco
omissions and the assigned Vercel URL remain deferred. Release validation still
prevents placeholder project content and media from reaching a production
deployment.
