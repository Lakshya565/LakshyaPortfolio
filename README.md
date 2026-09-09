# My Personal Portfolio

A static-first personal portfolio showcasing software, AI, embedded, and hardware
projects through detailed case studies and an atmospheric sci-fi isometric desk.

Phases 0 through 7 establish the repository, validated content architecture,
ten static project routes, responsive shell, resilient sparse/rich renderer,
isometric desk experience, route continuity, and visual system. Phase 8 now has
an explicit input inventory; Phase 9 has a measured local audit and safe
discovery foundation; Phase 10 has an operating runbook. Final public content,
final-content/native-device verification, and production deployment remain gated.

## Public Link
https://lakshya-agarwal.vercel.app

## Architecture

- Next.js App Router with strict TypeScript.
- Version-controlled local content with build-time validation.
- Server Components by default; narrowly scoped Client Components only when interaction requires them.
- No runtime API, database, authentication, analytics, or secrets.
- Every published project prerenders at `/projects/<slug>` from explicit local MDX imports; unknown and unpublished slugs return 404.
- Manifest media, metrics, links, section outlines, and adjacent navigation are normalized into renderer-only data that excludes editorial control fields.
- The same restrictive MDX policy runs during validation and compilation. Development and production builds use Next's supported Webpack mode because Turbopack cannot serialize the local policy plugin without duplicating it.
- The homepage uses a hand-authored local isometric desk SVG with eight typed personal hotspot groups. Its monitor progressively opens the server-rendered project tree in a full-screen dialog, while the same tree remains directly available at `/work` without requiring the interaction.
- Route changes begin immediately; an interruptible 220ms transform/opacity entry runs only for pointer navigation, while keyboard and reduced-motion navigation remain instant. Focus moves to the arriving heading or fragment target.
- Vercel is a possible eventual host, but deployment is explicitly deferred while the frontend is reviewed and overhauled on localhost.

All project documentation is indexed in [`docs/README.md`](docs/README.md),
which names one authoritative document per subject. The shortest paths in:

- **Change a sentence on the site** — [`docs/editing-copy.md`](docs/editing-copy.md)
- **Add a project or case study** — [`docs/content-authoring.md`](docs/content-authoring.md)
- **Build, release, or the standing rules** — [`docs/operations.md`](docs/operations.md)
- **Touch the isometric scene** — [`docs/desk-artwork-handoff.md`](docs/desk-artwork-handoff.md)

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

Then start the local development server:

```powershell
npm.cmd run dev
```

Open `http://localhost:3000`. Leave `NEXT_PUBLIC_SITE_URL` unset for local
review so preview metadata remains non-indexable. Stop the server with
<kbd>Ctrl</kbd>+<kbd>C</kbd>. If port 3000 is already occupied, use
`npm.cmd run dev -- --port 3001` and open `http://localhost:3001`.

Local and preview builds need no environment variables and intentionally remain
non-indexable. During an approved production deployment, set the public
`NEXT_PUBLIC_SITE_URL` value to the assigned HTTPS origin exactly as documented
in `web/.env.example`. It is public configuration, not a secret; invalid,
localhost, or path-bearing values fail the build. Configuring it also switches
the prebuild content check to release mode, so placeholder content cannot become
indexable accidentally.

## Commands

Run these from `web/`:

| Command | Purpose |
|---|---|
| `npm.cmd run dev` | Start the local development server. |
| `npm.cmd run validate:content` | Validate the local site-content boundary. |
| `npm.cmd run validate:content:release` | Enforce machine-checkable publication readiness; currently passes. |
| `npm.cmd run lint` | Run ESLint. |
| `npm.cmd run typecheck` | Run TypeScript without emitting files. |
| `npm.cmd test` | Run focused unit tests once. |
| `npm.cmd run build` | Create the production build and report route rendering mode. |
| `npm.cmd run check` | Run validation, lint, type checking, and tests. |

Routine verification uses focused offline checks and a production build; it does
not require leaving a persistent development server running.

## Current structure

```text
web/
  app/                 Next.js routes and global styles
  content/             Canonical manifests and constrained MDX case studies
  components/          Shared site, project, About, and case-study renderers
  lib/content/         Content validation, normalization, and queries
  lib/metadata/        Metadata projections from canonical content
  scripts/             Repository validation entry points
  tests/               Focused unit tests
  types/               Shared content contracts
docs/
  decisions/           Architecture decision records
```

## Deferred inputs

The public GitHub, LinkedIn, and email values are configured. The signed-out
LinkedIn snapshot, supplied profile PDF, public repositories, and current
RepoFrame source have resolved copy for all ten projects. Any approved media,
the Cisco omission review, and the assigned Vercel URL
remain deferred. Release validation prevents placeholder assets from reaching
a production deployment; the current manifest intentionally omits temporary
media instead of publishing generic stand-ins.
