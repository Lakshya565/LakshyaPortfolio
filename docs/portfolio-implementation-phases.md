# Lakshya Agarwal Portfolio — Implementation Phases

## Document purpose

This document translates [`portfolio-overview.md`](./portfolio-overview.md) into gated work packages. Each phase defines its objective, prerequisite decisions, detailed work, validation, exclusions, and exit gate.

This plan is not implementation authorization. Begin only the phase Lakshya explicitly approves. Do not silently continue, deploy hosted resources, connect a domain, incur cost, add analytics, or publish content without separate permission.

> **Current redesign authority:** The desk and project-system work originally
> described in Phase 5 and its downstream visual assumptions are superseded by
> [`desk-project-tree-redesign-phases.md`](./desk-project-tree-redesign-phases.md).
> This master roadmap will be reconciled after the redesign passes its final audit.

## Delivery rules

### One approved phase at a time

Complete and report the approved phase before starting another. If later evidence exposes an earlier flaw, propose a narrow correction rather than continuing on a known-bad foundation.

### Vertical evidence over broad scaffolding

Each phase should produce the smallest end-to-end proof needed. Avoid empty component trees, generic repository abstractions, speculative tables, and tooling that has no current consumer.

### Representative content throughout

Do not wait until Phase 8 to test realistic titles, long prose, confidential gaps, missing sections, diagrams, and metrics. Use sanitized representative fixtures from Phase 1 onward. Final public wording remains an editorial gate.

### Quality is continuous

Typing, linting, tests, accessibility, responsive behavior, secrets review, and failure states belong in the phase introducing the behavior. Phase 9 is the final audit, not the first quality pass.

### Evidence-based reports

Every phase completion report states:

- What changed and why.
- Files created or modified.
- Commands/checks run and their outcomes.
- Assumptions made.
- Known limitations and deferred work.
- Decisions required before the next phase.

## Dependency sequence

```text
0 Next.js repository foundation
  -> 1 Local content system and validation
    -> 2 Static project routing and content rendering proof
      -> 3 Usable frontend shell
        -> 4 Case-study renderer and media
          -> 5 Interactive project environment
            -> 6 Navigation transitions
              -> 7 Cohesive visual design
                -> 8 Final public content
                  -> 9 Release-quality audit
                    -> 10 Production deployment and handoff
```

The sequence deliberately proves content and static routes before investing in
the isometric desk. All primary routes must remain prerenderable throughout.

## Phase 0 — Next.js repository foundation

### Objective

Create a reproducible single-application Next.js foundation, pin the static-first architecture, and prove that production builds require no runtime data service.

### Decisions before installation

- npm for dependency management in the existing Windows workflow.
- Node.js 24.x, pinned through `.nvmrc` and the package engine declaration.
- Vitest for focused unit tests; browser/end-to-end tooling is deferred until an interactive route needs it.
- Tailwind CSS 4 plus global semantic CSS variables; the final visual system remains deferred.

Record the static-content decision under `docs/decisions/`. Pin the Node version in repository configuration, not README prose alone. Do not add containers, a workspace orchestrator, or backend scaffolding.

### Work

#### Repository hygiene

- Inspect branch/status and preserve existing work.
- Add root ignore rules for Next.js, editor, environment, build, test, and OS artifacts without excluding the lockfile or content.
- Add `.editorconfig` for encoding, newlines, indentation, and whitespace.
- Keep one dependency boundary under `web/`; avoid a monorepo orchestrator for a single app.

#### Application foundation

- Initialize `web/` as a strict TypeScript Next.js App Router project.
- Retain sensible generated conventions rather than immediately reorganizing everything.
- Add a semantic minimal layout/homepage without final art direction.
- Confirm a production build generates static output for the root route.
- Add `generateMetadata`/metadata defaults only as needed to prove the site identity contract.
- Establish server/client component boundaries with no unnecessary `use client` at the root.
- Add an initial content placeholder through a typed local module, not inline page copy.

#### Documentation and commands

- Expand README with prerequisites, install/start/check commands, ports, runtime pins, and troubleshooting.
- Document that the initial application has no secrets or runtime service configuration.
- Ensure PowerShell commands work in the primary Windows environment.
- Add only focused scripts for lint, type checking, tests, content validation placeholder, and production build.

### Expected artifacts

```text
.editorconfig
.gitignore
.env.example
README.md
docs/decisions/0001-static-content-architecture.md
web/...
```

Generated details depend on current framework tooling; do not restructure without benefit.

### Verification

- Fresh dependency installation follows documented commands.
- Lint/type checks, focused tests, and production build pass.
- Build output confirms the root route is prerendered and requires no runtime content fetch.
- Static placeholder content renders through the local content boundary.
- Status contains no secrets, caches, or build output.

A persistent dev server or browser session is unnecessary unless explicitly requested; focused offline checks are sufficient.

### Exclusions

- Content inventory beyond one typed placeholder.
- Final design, fonts, project routes, desk interaction, and motion library.
- Case-study copy/media.
- Vercel project creation, preview deployment, or remote changes.

### Exit gate

Local setup is reproducible, the static-first decision is recorded, the production build is clean, and no backend/runtime dependency exists. Phase 1 requires new approval.

## Phase 1 — Local content model, MDX, and build validation

### Objective

Create the typed, version-controlled content system that represents both sparse and rich projects, links metadata to MDX narratives, and blocks invalid public content at build time.

### Decisions before work

- Final manifest/MDX organization and import strategy.
- Schema validation library versus TypeScript-only validation; recommendation is TypeScript plus runtime schema checks at the content boundary.
- Allowed MDX components and raw-HTML prohibition.
- Minimum public content required for featured and archive entries.
- Archive entries may launch as substantial public cards without MDX routes; featured/supporting projects receive full case-study routes.

### Work

#### Type system and manifest

- Define discriminated types for project kind, publication state, asset type, link type, accent token, metrics, skills, and About items.
- Define a singleton site manifest for identity and public social/contact links.
- Define the project manifest with stable slug, title, category, summary, role, dates, technology array, priority, links, assets, metrics, MDX module key, and display order.
- Enforce mutually exclusive featured/archive states and deterministic ordering.
- Keep project-system membership derived from publication and personal hotspot placement out of project records.

#### MDX boundary

- Configure local MDX support compatible with the App Router.
- Create a central MDX component map containing only reviewed editorial primitives.
- Disable or reject raw HTML and arbitrary imports.
- Define a documented heading/section convention while allowing optional sections.
- Keep case-study prose in project MDX, not manifest string blobs or visual components.

#### Representative content

- Add typed placeholder metadata for every intended public project.
- Create representative MDX for a minimal supporting case study and a rich featured case study; archive cards intentionally have no MDX route.
- Add long-title, empty-optional, multiple-metric, and asset-heavy fixtures.
- Add structured skills and About placeholders without resumes or a duplicate Cisco experience block.
- Add typed pending GitHub, LinkedIn, and email slots with `href: null`; release validation rejects the pending inputs until Lakshya supplies final values, while development builds remain usable.
- Mark unapproved/unfinished text so a production validation mode rejects it.

#### Validation tool

- Validate unique URL-safe slugs, manifest-to-MDX linkage, required fields, legal states, deterministic orders, safe links, local asset existence, alt text, and placeholder publication.
- Validate the personal-motif key set so Phase 5 can assign every motif to one typed desk hotspot.
- Prevent draft MDX/metadata from being included in public route lists or client bundles unnecessarily.
- Return nonzero status with project slug and violated rule.
- Test Windows paths while requiring site URLs to use forward slashes.

#### Documentation

- Document each content type, where copy belongs, how to add/update/remove a project, how draft/public filtering works, and how a content change reaches production through a new build.

### Verification

- TypeScript rejects malformed manifest data at development time.
- Runtime/build validation catches constraints TypeScript cannot prove, including missing files and duplicate slugs.
- Published minimal/rich fixtures pass; every intentionally invalid fixture fails with an actionable message.
- Draft content is excluded from published project enumeration.
- Local MDX compiles without arbitrary raw HTML/import behavior.
- A clean production build succeeds from repository content alone.

### Exclusions

- Final public copy/media.
- Full project-page renderer or final styling.
- Desk placement/visuals.
- Vercel deployment or hosted content system.

### Exit gate

The manifest/MDX contract is documented, validated, and proven by representative content. All remaining phases consume this boundary rather than inventing their own project data.

## Phase 2 — Static project routes and content rendering proof

### Objective

Prove the complete local-content path by statically generating every published project route, route metadata, and 404 behavior before building the full visual system.

### Decisions before work

- Exact project route naming and slug-change policy.
- How MDX modules are registered/imported without accepting arbitrary paths.
- Whether route metadata uses a default social image until project-specific images exist.
- Whether strict static export is desired or ordinary Next.js prerendering on Vercel is sufficient; recommendation is ordinary prerendering unless static export adds a concrete benefit.

### Work

#### Content loading

- Create a server-only content registry that maps known manifest module keys to MDX imports.
- Normalize optional metadata once before components receive it.
- Preserve meaningful zeros and remove whitespace-only optional text.
- Keep internal source/approval notes out of rendered props and serialized client data.
- Add helpers for published projects, one project by slug, featured/archive groups, and adjacent/related work.

#### Static project routing

- Implement `/projects/[slug]` with `generateStaticParams` from published manifest entries.
- Disable runtime generation for unknown parameters and use the branded not-found route.
- Render a minimal semantic project header plus MDX body without final design.
- Ensure direct loads and refreshes need no homepage state.

#### Metadata

- Generate title, description, canonical path, and initial social metadata from the same project record.
- Use safe fallbacks for missing project-specific social images.
- Exclude drafts from sitemap/route enumeration when those files are later added.

#### Build contract

- Make content validation a prerequisite of the production build.
- Confirm all route generation occurs from local files with no network access.
- Fail unknown MDX module keys explicitly instead of silently rendering empty pages.
- Document the output and what will or will not invoke runtime Vercel compute.

### Verification

- Unit tests cover published filtering, sorting, normalization, and lookup.
- Every published slug is emitted by `generateStaticParams` exactly once.
- Draft and internal fields do not appear in built public pages.
- Unknown/unpublished slugs resolve to 404.
- Minimal and rich MDX projects prerender successfully.
- Metadata matches project content and uses no development origin.
- Production build completes with network access unnecessary for content.

An early Vercel preview may verify static behavior but requires explicit hosted-mutation approval. Local completion does not require it.

### Exclusions

- Final visual design and complete case-study components.
- Runtime route handlers, server actions, databases, or API endpoints.
- Remote deployment.

### Exit gate

Every published content record produces a static, directly reachable project page with correct metadata and no runtime data dependency.

## Phase 3 — Usable frontend shell and static hierarchy

### Objective

Deliver a complete conventionally navigable portfolio skeleton before custom desk or major motion work.

### Decisions before work

- Initial semantic colors, spacing, typography, focus, and breakpoints.
- Mobile navigation behavior.
- Homepage hierarchy when a project has limited archive content.

### Work

#### Typed content boundary

- Consume only the Phase 2 content registry and normalized view data.
- Keep component-specific projections small and explicit.
- Do not import raw manifest internals independently across components.

#### Routes and shell

- Build root layout, default metadata, skip link, navigation, footer, and responsive containers.
- Create/refine `/`, `/work`, `/about`, `/projects/[slug]`, loading/error boundaries where client behavior needs them, and not-found routes.
- Make direct routes and refresh independent of homepage state.
- Add active navigation and accessible mobile menu behavior.

#### Static composition

- Render identity, About, and contact on the homepage; render featured,
  supporting, and archive work through one semantic project system at `/work`.
- Keep `/work` as permanent desk-independent navigation.
- Source canonical content from the validated local registry; leave true UI labels in code.
- Exercise long titles, missing dates/images, and uneven description length.

#### States and base visual system

- Distinguish empty content, 404, broken optional media, and client-interaction failure states.
- Avoid blank labeled regions when collections are empty.
- Establish a dark semantic token layer with readable contrast and visible focus.
- Do not add final hero art or decorative motion.

### Verification

- Type, lint, unit/component checks, and production build pass.
- Every route renders from representative fixtures.
- Direct links, navigation, refresh, and history behave normally.
- Keyboard order and focus are logical.
- Narrow layouts do not produce page overflow.
- All content/failure shapes render intentionally.
- Prerendered source contains meaningful headings and links.

### Exclusions

- Full section renderer and media gallery.
- Desk illustration, monitor dialog, ambient animation, or route transitions.
- Final visual polish and complete public content.

### Exit gate

The portfolio is already useful as a straightforward website. Future animation may not become required navigation.

## Phase 4 — Case-study renderer and local media

**Implementation note:** The foundational Phase 4 renderer is complete. It uses
one typed normalization path for optional header facts, links, metrics, media,
video links, outlines, and adjacent case studies. The compiler and validator
share the same restricted MDX policy; project-specific final media and wording
remain correctly deferred to Phase 8.

### Objective

Build one resilient renderer that presents sparse and rich projects intentionally and safely handles Markdown and version-controlled media.

### Decisions before work

- Final approved MDX component set and section-navigation behavior.
- Supported Markdown/MDX editorial features.
- Image formats, path conventions, size/dimension guidance.
- Gallery and video scope.

### Work

#### Normalization

- Create a pure layer that trims manifest values, filters invalid links/assets, preserves zeros, and derives stable anchors/outline data from approved MDX headings.
- Treat an omitted MDX section as absent; do not create empty headings to satisfy a template.
- Reject duplicate heading anchors rather than guessing.
- Keep normalization testable without React.

#### Renderer primitives

- Build a header tolerant of missing role, dates, hero, repository, demo, or video.
- Render each project's MDX body through the shared editorial component map instead of project-specific page JSX.
- Show a local table of contents only when enough sections exist.
- Hide metric/link/gallery/technology containers when empty.
- Add related/next project navigation without assuming every project is featured.

#### Markdown safety

- Support only content features required by actual case studies.
- Disable raw HTML by default.
- Reject unsafe link protocols and unsupported embeds.
- Keep generated headings within the page outline.
- Make code, tables, lists, and long URLs responsive if supported.

#### Media

- Resolve validated `/media/...` paths through the frontend origin.
- Preserve intrinsic dimensions and prevent layout shifts.
- Support explicit hero, screenshot, diagram, hardware photo, gallery, and video-thumbnail types.
- Define video behavior separately from image handling, with repeatable videos
  and explicit optional thumbnail references rather than a fixed count or
  positional pairing.
- Let image and video grids adapt to collection size without project-specific
  layout branches.
- Make absence intentional; do not add generic placeholders everywhere.

#### Fixtures

- Minimal project: header plus overview/contribution, no media/metrics.
- Complete project: all sections, metrics, links, diagram, and gallery.
- Messy source: whitespace optionals, invalid filtered assets, and no links.
- Stress case: long title, long technology list, dense copy, and captions.

### Verification

- Unit tests cover whitespace, zeros, invalid paths, duplicate headings/anchors, and outline generation.
- No empty heading, divider, card, navigation link, metric panel, or gallery remains.
- Markdown security tests cover raw HTML and unsafe protocols.
- Every fixture renders with valid heading structure.
- Images use correct alt behavior and dimensions.
- Long content/media remain responsive.
- Build, types, lint, components, and focused accessibility checks pass.

### Exclusions

- Complete public copy/media.
- Bespoke layouts per project.
- Desk interaction, transitions, and remote media storage.

### Exit gate

At least one sparse and one rich project look intentional through the same safe renderer.

## Phase 5 — Isometric desk and project system

**Implementation note:** Concept C replaces the earlier circuit-board map. The
homepage uses a passive hand-authored isometric SVG, eight typed personal hotspot
groups covering nine motifs, and a semantic monitor link that progressively
opens a full-screen project-system dialog. The same server-rendered project
system is prerendered at `/work`.

### Objective

Add a memorable personal desk without making project discovery, archive
evidence, or case-study access depend on illustration geometry or client state.

### Decisions before work

- Keep project facts and project-system ordering in the content layer.
- Keep personal hotspot geometry in typed frontend configuration.
- Use one server-rendered project-system component in the dialog and `/work`.
- Preserve `/work` as the monitor's native-link and JavaScript-disabled fallback.
- Use a local passive SVG rather than WebGL, canvas, or a client-rendered scene graph.

### Work

#### Data and placement

- Include every published project in one deterministic project-system projection.
- Assign all nine personal motif records to eight hotspot groups exactly once.
- Validate normalized hotspot bounds, duplicate assignments, and missing motifs.
- Require `desk-monitor` and one `desk-<hotspot-key>` group in the local SVG.
- Keep canonical project and biography facts out of the SVG and placement module.

#### Semantic interaction

- Overlay real HTML controls rather than making raw SVG groups interactive.
- Keep the monitor as an ordinary `/work` link before enhancement.
- Support pointer, touch, focus, Escape, close, back/forward, and focus restoration.
- Preserve modified-click behavior on the monitor link.
- Move personal hotspot details into a conventional narrow-screen drawer/list.

#### Shared project system

- Render all ten published projects through one Server Component.
- Route case-study records to `/projects/<slug>`.
- Keep archive records substantial without inventing detail routes.
- Give archives stable `/work#project-<slug>` permalinks.
- Pass the server-rendered project system through the narrow client dialog shell.

#### SVG and motion safety

- Keep the desk SVG passive, local, decorative, and hidden from assistive technology.
- Reject scripts, event attributes, `foreignObject`, and remote/data references.
- Keep zoom/open motion interruptible and suppress it under reduced motion.
- Prevent layout shift and horizontal overflow at narrow sizes.

### Verification

- Eight hotspot groups cover all nine motifs exactly once.
- The required monitor/hotspot SVG group IDs exist and the SVG passes passive-asset checks.
- The project system renders five case studies and five archives in both contexts.
- Archive permalinks target `/work`; archive detail routes still return 404.
- Monitor fallback, keyboard/touch interaction, Escape, focus restoration, history, reduced motion, zoom, and reflow pass.
- Removing or disabling the dialog cannot remove `/work` or any case-study route.

### Exclusions

- WebGL, 3D physics, audio, autoplay video, and pointer lock.
- Separate project renderers for the dialog and `/work`.
- URL-addressable archive detail pages without enough case-study evidence.
- Final site-wide polish.

### Exit gate

The desk is enjoyable but disposable: replacing it cannot break `/work`, archive
permalinks, project routes, content contracts, or case studies.

## Phase 6 — Route and interaction transitions

**Implementation note:** Phase 6 uses a small arrival-side controller rather
than an overlay, exit delay, or shared-element clone. Pointer navigation gets an
interruptible 220ms transform/opacity entry after routing has begun. Keyboard
and reduced-motion navigation stay instant. Every path change restores focus to
the arriving `h1` or explicit fragment target, and direct loads require no
transition context.

### Objective

Connect project selections to case studies with fast coherent motion while preserving native navigation, history, direct URLs, and reduced-motion access.

### Decisions before work

- What relationship the transition communicates.
- Maximum acceptable perceived navigation delay.
- Whether shared-element complexity is justified.

### Work

- Add short route entry without hiding available content.
- Carry a constrained project accent when navigation context exists.
- Give direct URLs a complete standalone entry state.
- Start navigation promptly rather than waiting for decorative exit motion.
- Add section reveals only where they improve hierarchy.
- Make motion interruptible by repeated actions, history navigation, and route errors.
- Prevent layout shifts.
- Centralize duration/easing/reduced-motion variants.
- Restore focus sensibly and never trap it in departing content.

### Verification

- Monitor-dialog links and the ordinary `/work` route work with/without transition context.
- Direct navigation, reload, deep links, back/forward, and rapid navigation work.
- Errors cannot leave an opaque overlay or locked page.
- Reduced motion uses minimal or no transition.
- Keyboard focus arrives at a useful destination.
- Slow device/network simulation does not create prolonged blank content.
- No project-specific transition branch is required.

### Exclusions

- Cinematic loading screens and blocking exits.
- Experimental browser APIs without fallback.
- Motion applied indiscriminately to every scroll/component event.

### Exit gate

Motion adds continuity without changing correctness, time-to-content, or access. Replace brittle shared-element work with a simpler accent/fade if necessary.

## Phase 7 — Cohesive visual design

**Implementation note:** Phase 7 establishes an intentionally editable visual
foundation rather than pretending placeholder content supports a locked final
art direction. Semantic OKLCH/state tokens, local font stacks, widths, radii,
layers, and motion timings are centralized and documented. Homepage, desk,
case-study, About, contact, sparse/dense, hover, focus, active, and reduced-motion
states use the same system. Final font/art/media choices remain Phase 8 inputs.

### Objective

Turn the functional site into a distinctive, restrained, developer-tool-focused portfolio while keeping content legible and interactions consistent.

### Decisions before work

- Confirmed art direction/metaphor.
- Font licensing, weights, and loading cost.
- Contrast-checked green/purple palette.
- Representative media, even if some is temporary.

### Work

#### Tokens

- Finalize semantic colors, type scale, spacing, radii, borders, shadows/glows, widths, layers, durations, and easing.
- Separate semantic state tokens from project accent tokens.
- Document hover, focus, selected, disabled, warning, and error use.

#### Homepage

- Refine hero typography and its relationship to the isometric desk.
- Turn basic cards into large editorial rows with contribution/evidence cues.
- Prioritize Cisco and RepoFrame through ordering and scale rather than animation overload.
- Keep archive quieter but discoverable.
- Integrate About and contact into the same visual language.

#### Case studies

- Refine reading measure, rhythm, diagrams, captions, metrics, and technology display.
- Allow controlled accent differences without bespoke templates.
- Ensure sparse projects do not look unfinished.

#### Responsive and state polish

- Design mobile intentionally instead of mechanically stacking desktop blocks.
- Test navigation density, labels, galleries, metrics, and contact actions.
- Keep blur/glow/gradient effects readable and performant.
- Complete hover, focus-visible, active, loading, empty, error, disabled, and reduced-motion states.
- Remove inconsistent one-off values and abandoned experiments.

### Verification

- Contrast passes for body, muted/accent text, controls, focus, and errors.
- Representative phone, tablet, laptop, and large desktop reviews pass.
- Site is readable with animation disabled.
- Font loading avoids severe layout shift.
- Sparse and dense fixtures retain clear hierarchy.
- Build, component tests, accessibility checks, snapshots, and performance profile pass.

### Exclusions

- New product features driven only by visual exploration.
- One-off project templates.
- Theme toggle/light mode.
- Publishing unapproved content.

### Exit gate

The visual system is coherent across all routes and states, not only the homepage hero.

## Phase 8 — Final content, media, and publication review

### Objective

Replace representative fixtures with accurate, specific, approved public content and optimized assets while preserving the validated component shapes.

### Decisions before work

- Final public project list.
- Lakshya's final Cisco omission list, requested during this phase despite the overall feature being approved for public discussion.
- Contact URLs and public identity details.
- Asset ownership and licensing.

### Work

#### Content inventory

- Track each project's source notes, dates, role, contribution, technologies, links, claims, metrics, media, approval, and gaps.
- Verify claims against repositories, existing private resumes as source material, demos, or other primary evidence without publishing the resume files themselves.
- Distinguish team achievements from personal ownership.
- Remove unsupported precision and roadmap features presented as complete.

#### Writing

- Write Cisco as approved public subject matter while excluding customer identifiers, proprietary source, credentials, internal logs, and any individual asset or metric not cleared for publication.
- Keep RepoFrame aligned with implemented behavior.
- Complete NuCurrent, SmartLift, and QuackTA with specific contribution/outcome.
- Publish archive pages only when they add evidence.
- Vary section length based on substance; do not fill every template slot.

#### Identity and About

- Edit the homepage headline for brevity and voice.
- Connect software, AI, hardware, teaching, leadership, and interests in the About narrative.
- Confirm education, dates, organizations, and titles.
- Replace generic claims with specific examples.

#### Media

- Select/crop/optimize profile, screenshot, hardware, diagram, and gallery assets.
- Create diagrams that explain architecture without revealing protected information.
- Add dimensions, descriptive filenames, alt text, captions, and any attribution.
- Remove privacy-sensitive embedded image metadata.
- Confirm video hosting behavior if used.

#### Public links

- Verify every repository, demo, video, GitHub, LinkedIn, and email link.
- Confirm the published resume is the intended document and resolves: `public/lakshya-agarwal-resume.pdf`, linked as a social link, checked by `validate-portfolio-content.ts`. Confirm no *other* resume route, PDF, navigation label, sitemap entry, or public asset exists.

#### Publication review

- Remove/unpublish placeholder markers.
- Run full content validation.
- Review every page in rendered context, not only manifest/MDX source.
- Perform a dedicated confidentiality and personal-data review.

### Verification

- Every featured project has useful overview, contribution, and evidence/result—or a documented editorial reason for omission.
- Every factual metric/claim has an internal source or approval.
- No placeholder, TODO, localhost URL, broken link, missing file, or empty published section remains.
- Images have accurate alt behavior and meet size budgets.
- Cisco exposes no unapproved identifiers, architecture, screenshots, logs, or metrics.
- Archive hierarchy remains secondary.
- Validator, frontend tests, type/lint checks, and build pass.

### Exclusions

- Publishing weak archive pages to inflate project count.
- Invented metrics or vague filler.
- Confidential originals/source files in `public/`.
- Unapproved production data/deployment changes.

### Exit gate

The repository contains a public release candidate approved for viewing. Production publication remains separately authorized.

**Input handoff note:** The repository now contains
`docs/content-inventory.md`, an explicit checklist for ownership, direct URLs,
Cisco omissions, and media. LinkedIn and repository evidence have resolved the
ten project records. Lakshya approved the current Cisco wording for local review
and chose an intentionally media-free initial candidate on 2026-08-09. The
Phase 8 exit gate now remains open only for local rendered/confidentiality review
and final ownership confirmation for linked evidence. No resume or profile PDF
is public, and production publication is not authorized.

## Phase 9 — Accessibility, performance, resilience, and SEO audit

### Objective

Validate the release candidate against measurable usability, performance, failure, discovery, and metadata requirements, fixing blockers without adding unrelated features.

### Work

#### Accessibility

- Audit landmarks, headings, names, roles, labels, and reading order.
- Complete keyboard flows through navigation, desk hotspots, the monitor dialog, `/work`, galleries, case studies, and contact links.
- Test focus visibility/restoration, menus, and skip navigation.
- Test OS-level reduced motion, zoom, text enlargement, reflow, touch targets, contrast, and screen-reader announcements.
- Use automated checks as support, followed by manual testing.

#### Performance

- Measure production builds with representative content and throttled mobile conditions.
- Analyze bundles and remove unnecessary client boundaries/dependencies.
- Inspect image format, dimensions, priority, caching, and layout stability.
- Profile animation CPU/GPU behavior and offscreen work.
- Confirm primary pages are prerendered and inspect client bundle size, hydration cost, and CDN-served asset behavior.
- Record current Core Web Vitals definitions, conditions, and release targets.

#### Resilience

- Test 404, malformed asset prevention, image failure, JavaScript-disabled fallback, and client-animation failure.
- Confirm primary content remains usable without any runtime service.
- Test direct routes and refresh under deployment-like routing.
- Ensure errors and logs reveal neither secrets nor drafts.

#### SEO/social

- Finalize route titles, descriptions, canonicals, Open Graph data, images, sitemap, and robots rules.
- Generate project metadata from canonical content with safe fallbacks.
- Add only accurate structured data.
- Exclude unpublished/error pages from indexing.
- Define redirects for any changed slug.

#### Browser/device matrix

- Test agreed current Chromium, Firefox, and WebKit support.
- Review touch interaction and a lower-power mobile profile.
- Verify SVG effects, filters, sticky navigation, and motion degrade acceptably.

### Release-audit artifact

Record the environment/build identifier, automated command results, manual matrix, performance measurements/conditions, resolved blockers, known limitations, and explicitly accepted risks.

### Exclusions

- Broad redesign or new CMS/auth/analytics/animation features.
- Relaxing accessibility because an effect is difficult to fix.
- Production deployment before approval.

### Exit gate

No known issue blocks content, confidentiality, navigation, keyboard use, reduced motion, mobile use, or indexing. Remaining limitations are documented and accepted.

**Implementation note:** The pre-release Phase 9 foundation now includes a
validated production-origin boundary, preview-safe indexing behavior, canonical
and published-route sitemap generation, a static social card, and
`docs/release-audit.md`. Local Chrome, Edge, Lighthouse, JavaScript-disabled,
reduced-motion, reflow, text-enlargement, 404, and dense/sparse route checks
resolved three accessibility issues. Disposable Firefox and WebKit audits also
passed the responsive, semantic, keyboard, motion, JavaScript-disabled, and 404
matrix without adding browser binaries to the repository. The exit gate remains
open until final content/media and production-origin checks are complete.

## Phase 10 — Production deployment and handoff

### Objective

Deploy the approved release safely, verify the entire production path, and leave a reproducible operating/content-update workflow.

### Explicit authorization required

Obtain permission before:

- Creating or changing the Vercel project.
- Adding provider environment variables.
- Changing DNS/custom domains.
- Enabling paid or metered services.
- Adding analytics or third-party scripts.
- Publishing final content.

Confirm account ownership, billing expectations, Vercel project name/URL, and rollback tolerance. The initial site should not require secrets.

### Work

#### Vercel project

- Connect the authorized repository and choose `web/` as the application root if the final structure requires it.
- Configure the pinned Node runtime and production build command.
- Set the public site origin used for canonical metadata to the assigned Vercel URL.
- Verify that primary routes are prerendered/CDN-served and do not invoke runtime functions.
- Confirm no secret or draft content appears in client bundles or build output.
- Add redirects for any changed slugs and defer a custom domain until one exists.

#### Production verification

- Verify every route, slug, social/contact link, media file, sitemap, robots rule, canonical, and social preview.
- Recheck desktop/mobile navigation, keyboard, reduced motion, desk hotspots, dialog behavior, and the `/work` fallback.
- Test JavaScript-disabled and client-animation failure behavior where practical.
- Inspect build/deployment logs for errors or private-content leakage.
- Confirm no localhost, preview, draft, or placeholder data appears.

#### Handoff

- Finalize local setup and architecture documentation.
- Document edit, validate, preview, approve, deploy, and verify steps.
- Document the public site-origin variable if used.
- Document rollback through git/Vercel deployment history.
- Add maintenance checks for dependencies, broken links, content accuracy, and eventual domain renewal.
- Document how analytics would be evaluated later without preselecting a vendor.

### Verification

- Assigned Vercel domain and HTTPS work.
- Primary pages and project routes are prerendered with no runtime content service.
- Draft/internal content does not appear in public output.
- Media returns with correct content types.
- Metadata and discovery files reference production.
- Production smoke matrix passes and is recorded.
- A future maintainer can follow rollback/update documentation.

### Exit gate

Completion requires production verification and handoff documentation; a provider reporting “deployed” is not sufficient.

**Preparation note:** `docs/operations.md` now documents the edit, approve,
configure, deploy, verify, rollback, and maintenance workflow. No Vercel project,
hosted variable, domain, analytics integration, or deployment was created.
Deployment is explicitly deferred while the frontend is reviewed and overhauled
on localhost.

## Cross-phase checklist

- Scope stayed within the approved phase.
- Existing user changes were preserved.
- No commit, push, hosted mutation, browser/dev-server session, analytics addition, or paid operation occurred without permission.
- New behavior covers relevant success, loading, empty, error, and edge cases.
- Types/schemas are explicit; no avoidable `any` or unvalidated dictionaries.
- Canonical content remains outside visual components.
- Publication filtering is enforced at the correct boundary.
- Accessibility and reduced motion were tested with the introducing feature.
- Responsive behavior used representative content.
- Tests, lint, types, and builds were run and reported honestly.
- Documentation matches current commands/decisions.
- Deferred work is named rather than hidden in vague TODOs.

## Deferred input checkpoints

- Phase 1 initially used typed pending contact slots; GitHub, LinkedIn, and email were resolved before Phase 3 and now use validated published records.
- Before Phase 8, request Lakshya's final Cisco omission list.
- During Phase 10, capture the assigned Vercel URL for canonical metadata.
- Cisco appears only as a case study, not as a duplicate standalone experience feature.
- Archive projects may launch as substantial public cards without full case-study routes.
- The isometric desk should remain atmospheric sci-fi while preserving readable labels, hotspot targets, and `/work` navigation.

After resolution, the first implementation instruction should be narrowly scoped:

> Implement Phase 0 only from `docs/portfolio-implementation-phases.md`, using the confirmed decisions in `docs/portfolio-overview.md`. Do not begin Phase 1, create a Vercel project, start final visual design, or publish project content. Report changed files, verification commands/results, assumptions, and decisions required before Phase 1.
