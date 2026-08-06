# ADR 0001: Static local content architecture

- Status: Accepted
- Date: 2026-08-06

## Context

The portfolio is a public, read-only site with no accounts, visitor writes, admin interface, or requirement for content to change independently of a deployment. The original draft proposed Next.js, FastAPI, Supabase, and three hosting providers. That architecture would introduce runtime availability, cold-start, cross-origin, permission, migration, and deployment coordination concerns without improving the primary visitor experience.

## Decision

Build the portfolio as one Next.js App Router application under `web/` and host it on Vercel when deployment is authorized.

Canonical content will be version-controlled and loaded locally. Phase 0 establishes a typed site-content boundary. Phase 1 will expand it into a typed project manifest plus constrained local MDX case studies with build-time validation. Known public routes will be prerendered; no runtime database, API, route handler, or server action will provide portfolio content.

Use npm for dependency management, Node.js 24.x, TypeScript strict mode, ESLint, Tailwind CSS for the initial styling system, and Vitest for focused unit tests. Browser/end-to-end tooling is deferred until an interactive route exists.

## Consequences

### Benefits

- Primary content has no runtime network dependency or backend cold start.
- Content and code changes are reviewed together through git history.
- Invalid public content can fail the build before reaching visitors.
- The deployment surface is one application and one provider.
- The visual layer can evolve without changing a service contract.

### Tradeoffs

- Every content change requires a build and deployment.
- Nontechnical browser-based editing is unavailable.
- Content validation and manifest-to-MDX linkage are repository responsibilities.
- A future CMS would require a new architecture decision and migration plan.

## Reconsider when

Revisit this decision only if content must be edited by nontechnical collaborators, published independently of code deployments, reused by multiple consumers, or personalized at request time.

