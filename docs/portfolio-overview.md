# Lakshya Agarwal Portfolio — Product and Technical Overview

## Document purpose

This document defines the product, content strategy, architecture, contracts, quality requirements, and unresolved decisions for Lakshya Agarwal's portfolio. The ordered delivery plan lives in [`portfolio-implementation-phases.md`](./portfolio-implementation-phases.md).

This document is not authorization to implement or deploy the site. Work begins only after the open questions are resolved and a specific phase is explicitly approved.

## Product summary

Build a public, recruiting-focused portfolio for a UIUC Computer Engineering student whose work spans software, AI systems, embedded systems, and hardware design.

The site should communicate three ideas quickly:

1. Lakshya builds complete, technically credible systems rather than isolated demos.
2. His software and hardware work forms a coherent engineering identity rather than an unfocused project list.
3. He can explain the problem, constraints, decisions, personal contribution, and evidence behind each outcome.

The animated homepage should be memorable, but novelty must not obstruct basic portfolio use. The interactive project environment enhances ordinary links and routes; it never replaces them.

## Audience and visitor journeys

### Primary audiences

- Recruiters performing a fast screen, often on a phone or laptop.
- Engineers assessing technical depth and personal ownership.
- Hiring managers evaluating judgment, communication, and impact.
- Visitors opening a direct project link from a resume, application, or social profile.

### Fast recruiter scan

Within roughly 30–60 seconds, a visitor should find Lakshya's focus, education, two strongest projects, core skills, and contact links. The hero must not delay this path.

### Technical evaluation

A visitor should be able to open a project directly, understand its context and architecture, distinguish team output from Lakshya's contribution, inspect evidence or media, and follow relevant repository or demo links.

### Exploratory visit

A visitor may inspect the personal objects on the isometric desk and enter the
project system through its monitor. The ordinary `/work` route exposes the same
project system directly, so the desk never becomes a comprehension test.

### Direct-link visit

A visitor landing on `/projects/[slug]` receives a complete page with navigation, metadata, and related work. The route cannot depend on homepage state or a completed transition.

## Success criteria

The site succeeds when it:

- Establishes Lakshya's professional identity immediately.
- Gives Cisco Agentic Runbook Creator and RepoFrame clear priority.
- Makes personal contribution and technical tradeoffs explicit.
- Works on typical mobile hardware and slower connections.
- Works by keyboard, with assistive technology, and with reduced motion.
- Gives every public project a stable, shareable destination.
- Allows visual redesigns without rewriting canonical content contracts.
- Supports reproducible content changes without a CMS.
- Publishes no confidential, unapproved, or unverifiable claims.

Initial success should use qualitative review and technical budgets, not vanity analytics. Analytics are not part of the first build, but the decision remains reversible: a privacy-conscious tool may be evaluated after launch if there are concrete questions worth measuring.

## Product principles

### Content before spectacle

Visuals should reveal strong work, not compensate for thin content. A project without a clear problem, contribution, and result should remain unpublished.

### Progressive enhancement

Semantic headings, links, the `/work` route, and case-study routes form the
reliable base. Desk hotspots, the monitor dialog, and motion enhance that base
when the browser and user preferences permit.

### Replaceable presentation, stable content

Canonical copy and facts live outside React components. Animation, geometry, and layout coordinates are presentation details that should be replaceable without migrating core project records.

### Evidence over inflated claims

Metrics need context and provenance. If an outcome cannot be publicly verified or explained, use careful qualitative language or leave it unpublished.

### Small public attack surface

The site collects no visitor data, accepts no public writes, and serves only prerendered public routes and assets.

### Defined failure behavior

The UI must define what happens when the API is slow, content is empty, an image is missing, a project is unpublished, or animation cannot run. Failure should degrade to useful content rather than a blank screen.

## Decision register

| Area | Current direction | Status | Rationale or caution |
|---|---|---|---|
| Product | Fully public portfolio | Accepted | No private or personalized behavior is required. |
| Authentication | None | Accepted | It adds risk and maintenance without visitor value. |
| Admin/CMS | None | Accepted | Version-controlled manifest and MDX files are enough initially. |
| Visitor collection | No forms, accounts, tracking, or stored messages | Accepted | Contact uses external links and `mailto:`. |
| Frontend | Next.js, TypeScript, App Router | Accepted | Supports typed routes, metadata, server rendering, and isolated interaction. |
| Runtime backend | None | Accepted | The portfolio is read-only and can be fully generated from local content. |
| Database | None | Accepted | Version-controlled content is simpler, reviewable, and sufficient at this scale. |
| Media | Versioned under `web/public/media` | Accepted initially | Simple; revisit only if repository size or workflow becomes painful. |
| Hosting | Vercel | Accepted | Prerendered pages and static assets avoid a runtime origin and backend cold starts. |
| Homepage | Hand-authored isometric desk | Accepted | Personal hotspots enhance the page; the monitor retains a normal `/work` fallback. |
| Work index | Shared project system at `/work` and in the monitor dialog | Accepted | One server-rendered component prevents the enhanced and fallback views from drifting. |
| Project routes | `/projects/[slug]` | Accepted | Stable slugs support sharing and indexing. |
| Theme | Dark-only with green and purple accents | Accepted | Exact palette, fonts, and art direction remain open. |
| Case studies | Shared renderer with optional ordered sections | Accepted | Consistent without forcing empty content. |
| Public writes | None | Accepted | The deployed site exposes no mutation surface. |
| Desk hotspots | Eight typed placement groups covering nine personal motifs | Accepted | Geometry is presentation data and never contains canonical project facts. |
| Content format | Typed manifest plus constrained local MDX | Accepted | Structured metadata stays validated while long-form case studies remain pleasant to author. |
| Resumes | Not published on the site | Accepted | Case studies should tell a deeper story instead of duplicating application documents. |
| Initial projects | Every listed project appears publicly | Accepted with quality gate | Thin archive entries may need compact presentation rather than empty full case studies. |
| Scene direction | Atmospheric sci-fi isometric workbench | Accepted as the base concept | The local SVG and hotspot geometry remain replaceable presentation. |

## Scope

### Included

- Homepage hero with an isometric desk, eight personal hotspot groups, and a monitor entry into the project system.
- One shared project system for featured work and archives, rendered in the homepage dialog and at `/work`.
- Stable project case-study routes.
- Structured, build-time validated local content with no runtime data service.
- Version-controlled images, diagrams, and project media.
- Responsive design, accessibility, reduced motion, SEO, and social metadata.
- Reproducible content, validation, test, and deployment workflows.

### Excluded from the initial product

- Authentication, user accounts, and private content.
- Admin dashboard or browser-based CMS.
- Contact form or stored visitor messages.
- Comments, reactions, or other public writes.
- Analytics and behavioral tracking in the initial release. A later privacy review may approve a narrowly scoped tool.
- Blog, newsletter, or recurring editorial system.
- WebGL, 3D engine, or physics-heavy scene.
- Theme switcher or light mode.
- Deployed AI generation.
- Unapproved Cisco material, screenshots, diagrams, metrics, names, or logs.

Adding an excluded feature later should trigger a fresh architecture and security review rather than being hidden in an unrelated phase.

## Information architecture

### Public routes

| Route | Responsibility | Data behavior |
|---|---|---|
| `/` | Hero, personal desk, project-system dialog entry, About preview, contact | Generated at build time from the local content manifest. |
| `/work` | Complete static project system and archive permalinks | Prerendered from every published project; requires no dialog or client state. |
| `/projects/[slug]` | Complete project case study | Prerendered by stable slug; unknown and unpublished slugs resolve to 404. |
| `/about` | Personal background, education, skills, activities, and interests | Renders structured groups in an intentional narrative order. |
| `/404` | Branded not-found state | Offers routes back to work, About, and home. |

The global navigation exposes Work, About, GitHub, LinkedIn, and Email. External
links need clear labels and safe new-tab behavior. Work points to `/work`; mobile
users never need to interact with the desk to find projects or contact details.

### Working homepage order

1. Identity and concise introduction.
2. Isometric personal desk with eight hotspot groups.
3. Monitor entry into the shared project system, with Cisco and RepoFrame first.
4. About and personal-background preview.
5. Contact calls to action.

This composition may evolve. The content manifest should describe records and priority without hard-coding the homepage's exact component layout.

## Content strategy

### Working headline

> I'm Lakshya, a Computer Engineering student at UIUC. I like building at the overlap of software, AI, and hardware—from full-stack developer tools to physical systems that interact with the world.

This is manifest content, not component source, and needs a final editorial pass.

### Case-study editorial standard

Each featured case study should answer:

- What real problem or opportunity existed?
- Who was affected and which constraints mattered?
- What did the system do at a high level?
- What did Lakshya personally own or decide?
- Which alternatives were considered, and why was this approach chosen?
- What evidence supports the outcome?
- What failed, changed, or would be done differently now?

The base order is header, overview, problem, approach, contributions, architecture, results, media, and takeaways. Sections after the header are optional, but a featured public project should normally contain a substantive overview and contribution section.

### Project hierarchy

#### Primary highlights

- **Cisco Agentic Runbook Creator:** Explain the industrial troubleshooting problem, model workflow, privacy boundary, assembly/evaluation loop, and personal contribution. Every claim, diagram, and metric requires publication approval.
- **RepoFrame:** Explain repository ingestion, deterministic ranking and stack detection, bounded evidence retrieval, agentic audit behavior, and evidence-backed outputs. Claims must match current implementation rather than roadmap intent.

#### Supporting featured work

- NuCurrent inventory system.
- SmartLift Sleeve.
- QuackTA.

#### Archive candidates

- Lucky Arduino.
- BackBuddy.
- Neurify.
- AgriSense.
- COSMOS RiseNRun Wi-Fi alarm clock.
- Other projects with enough verified material to justify a page.

Archive status is not permission to publish a thin page. Incomplete items remain unpublished.

### About narrative

The About page should connect UIUC Computer Engineering, cross-disciplinary building, Taekwondo teaching, Eagle Scout experience, Camp Hi Sierra mentoring, and specific hobbies. It should not become a chronological autobiography or prose duplication of the resume.

## System architecture

### Static-first topology

```text
Version-controlled content and media
  | typed manifest + constrained MDX + validation
  v
Next.js build
  | prerenders home, About, and every known project slug
  v
Vercel deployment/CDN
  | static HTML, CSS, JavaScript, images, and metadata
  v
Browser
```

There is no runtime API, database, server action, or content fetch. Every public page is generated from repository content during the build and served from Vercel's CDN. This removes the backend cold-start concern and makes a failed content validation block the deployment rather than become a visitor-facing runtime error.

The site may still use client-side JavaScript for navigation enhancement, desk
hotspots, the monitor dialog, galleries, and motion. Those interactions must not
be required to obtain the project system or case-study content because `/work`
and every case-study route are prerendered.

### Content architecture

Use two complementary local formats:

- A typed TypeScript manifest for identity, social links, project metadata, skills, About items, publication state, ordering, metrics, asset descriptors, and cross-project relationships.
- One local MDX file per project for long-form case-study narrative. MDX is constrained to an allowlist of shared editorial components; project files should not import arbitrary application components.

This approach keeps metadata easy to validate and query while avoiding enormous TypeScript string literals for case studies. `generateStaticParams` enumerates every published slug at build time, and unknown slugs return 404 rather than invoking runtime rendering.

### Responsibilities

#### Content manifest and MDX

- Own canonical public copy and project facts.
- Use stable slugs and explicit publication/priority fields.
- Keep long-form narrative out of visual React components.
- Represent optional case-study sections without empty placeholders.
- Reference public assets using stable site-relative paths.
- Remain deterministic: identical repository content produces identical public pages.

#### Build-time content loader and validator

- Loads the manifest and known MDX modules without accepting arbitrary user paths.
- Validates unique slugs, record shapes, link schemes, asset paths, alt text, desk-hotspot coverage, section identifiers, and launch completeness.
- Produces normalized typed view data for pages/components.
- Fails the build with actionable errors when public content is invalid.
- Never becomes a browser bundle containing unpublished content unnecessarily.

#### Next.js application

- Owns routing, layout, visual design, metadata, responsive behavior, and accessible interaction.
- Prerenders all public routes from local content.
- Separates server components from narrowly scoped client components.
- Keeps desk/dialog code replaceable and independent of case-study content.
- Provides intentional not-found and client-interaction failure states.

#### Version-controlled media

- Uses durable paths and optimized assets under `public/media`.
- Keeps sensitive or unnecessarily large sources outside `public/`.
- Requires alt text and licensing/attribution notes where applicable.
- Is verified for existence and supported type during the build.

## Repository organization

```text
LakshyaPortfolio/
  web/
    app/
      about/
      work/
      projects/[slug]/
      layout.tsx
      page.tsx
      not-found.tsx
    components/
      case-study/
      desk/
      project-system/
      navigation/
      shared/
    lib/
      content/
        load-content.ts
        normalize-content.ts
        validate-content.ts
      desk/
        hotspots.ts
      metadata/
      motion/
    content/
      site.ts
      projects.ts
      about.mdx
      projects/
        cisco-agentic-runbook-creator.mdx
        repoframe.mdx
        ...
    public/media/
      profile/
      projects/[project-slug]/
    styles/
    types/
    tests/
  scripts/
  docs/
  README.md
```

Keep the repository single-application unless a real second deployable appears.
Content loading, validation, project-system rendering, desk presentation, and
motion remain separate responsibilities without manufacturing empty abstraction
layers.

## Content model and build contract

### Cross-cutting conventions

- Use the project slug as the stable public identity and filename key.
- Keep ordering explicit and deterministic with a slug fallback.
- Model publication as `draft` or `published` even though all listed projects are intended to launch; this prevents incomplete work from leaking during development.
- Use discriminated unions for constrained project, asset, section, and link types.
- Keep technology names as ordered string arrays unless a demonstrated need for global taxonomy appears.
- Use `null` only for meaningful scalar absence and empty arrays for no repeated items.
- Do not include runtime-only concepts such as database IDs or timestamps with no editorial value.

### Site manifest

`site.ts` contains the name, headline, introductions, education summary, public location wording, profile asset, GitHub, LinkedIn, email, and site-level metadata. It is a singleton export validated during the build.

### Project manifest

`projects.ts` exports typed records containing:

- `slug`, title, category/type, short description, role, dates, technologies, and accent token.
- Mutually exclusive featured, supporting, and archive priority states.
- Optional repository and live-demo links plus a repeatable case-study video list.
- Optional hero asset, metrics, gallery/diagram assets, captions, and per-video thumbnail references.
- Publication state and deterministic display order.
- The corresponding MDX module key.

Featured and archive are mutually exclusive. Every listed project is planned for public display, but archive projects may use a compact public entry until their full narrative meets the minimum case-study bar.

### Project MDX

Each case-study project has a dedicated MDX file containing its narrative sections. Archive-only projects remain substantial manifest-backed cards and intentionally have no detail route or MDX file. Use a consistent heading vocabulary—overview, problem, approach, contributions, architecture, results, media context, and takeaways—while allowing omissions.

MDX files may use only the approved `Callout` editorial component. Images,
diagrams, and video thumbnails come from the validated project asset manifest
instead of ad hoc MDX components. MDX must not import navigation, desk,
project-system, layout, data-fetching, or arbitrary interactive components. This
keeps content portable and prevents case studies from becoming bespoke
applications.

### Skills and About

Skills and short education, leadership, community, and interest records remain
structured TypeScript data because they are repeated and order-sensitive.
`about.mdx` holds the longer personal narrative. Employment context belongs in
the relevant project case study rather than a duplicate experience collection.

### Metrics and assets

Metrics contain label, display value, optional context, and internal source note. Internal review notes are excluded from rendered output. Assets contain type, a project-namespaced `/media/projects/<slug>/...` path, alt text, optional caption, and required intrinsic width and height. Case studies accept arbitrary-length image and video collections; each video has its own HTTPS destination and optional validated thumbnail reference. Remote media is excluded initially except explicit outbound video/demo links.

### Desk-hotspot placement

`lib/desk/hotspots.ts` assigns all nine personal motif keys to eight hotspot
groups with normalized percentage bounds. Project-system membership does not use
geometry: every published project appears in deterministic manifest order. The
passive local SVG exposes `desk-monitor` and one `desk-<hotspot-key>` group per
definition so artwork and semantic overlays can be checked together.

### Build-time validation

The validator checks:

- Manifest and MDX schema/type compatibility.
- Unique, URL-safe slugs and matching MDX modules.
- Publication and priority invariants.
- Required metadata and minimum launch content.
- Known link schemes and absence of localhost URLs.
- Existing media paths, supported types, dimensions where required, and alt text.
- Complete, unique personal-motif assignment and normalized hotspot bounds.
- No draft or internal-only content imported into public route lists.
- No placeholder markers in a production build.

Validation runs before or as part of `next build`; invalid public content fails the build with the project slug and violated rule.

### Static route generation

- `/`, `/about`, and not-found content are prerendered.
- `generateStaticParams` returns every published case-study slug; archive-only projects have no detail route.
- Dynamic project parameters outside that list resolve to 404.
- Metadata and social images derive from the same manifest used by the page.
- Content changes require a new deployment, which is acceptable for this portfolio and makes publication reviewable through git history.

### Implementation references

- [Next.js App Router MDX guide](https://nextjs.org/docs/app/guides/mdx) for local MDX, shared components, and App Router integration.
- [Next.js `generateStaticParams` reference](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) for build-time project route enumeration.
- [Vercel CDN overview](https://vercel.com/docs/cdn) for serving prerendered pages without invoking an origin.

## Frontend architecture

### Rendering strategy

Use server components for content-heavy route composition and metadata. The
project system remains server-rendered when passed into the narrow client dialog
shell. Use client components only for dialog/popover state, animation,
galleries, menus, and other browser-only interaction.

All known pages and project slugs are prerendered at build time. No page should opt into request-time rendering unless a future requirement proves static generation insufficient.

### Layers

1. Typed content schema and manifest.
2. Build-time content loading and validation.
3. Normalized view models for routes/components.
4. Static route generation and metadata.
5. Presentational content components.
6. Narrow interactive islands.
7. Motion utilities and reduced-motion policy.
8. Design tokens and responsive primitives.

### Component boundaries

- Shell: shared navigation, social links, skip link, route-arrival focus, and global layout.
- Home: static introduction plus the isometric desk and a progressively enhanced monitor link.
- Desk: passive local SVG, eight typed personal hotspot groups, and no canonical project facts in geometry.
- Project system: one server-rendered component shared by the monitor dialog and static `/work` route.
- Case study: one renderer composed from header facts, normalized media, MDX narrative, optional outline, and adjacent navigation.
- About/contact: static narrative and reusable education, leadership, and social-link primitives.

Components accept typed data and semantic variants. Project type must not produce a sprawling collection of project-specific layouts.

### Optional-content rules

- Trim text before testing presence.
- Remove empty headings, navigation anchors, and dividers after filtering.
- Filter invalid/unpublished media before gallery layout.
- Hide metric, technology, link, and gallery containers when arrays are empty.
- Preserve intentional numeric zero values.
- Render a coherent project header even without dates, role, hero image, or external links.
- Centralize normalization instead of scattering conditional checks through JSX.

### Failure behavior

- Invalid content fails during development/build rather than reaching visitors.
- Unknown project slugs use the branded 404.
- Broken client-side animation or hydration leaves static links and content usable.
- Broken images do not collapse layout or expose implementation details.
- A failed optional third-party embed shows a labeled outbound link or nothing, never a broken primary page.

## Interactive desk and project system

### Desk behavior

The hand-authored SVG is decorative and passive. Eight positioned semantic
hotspots reveal the nine typed personal motifs with keyboard, pointer, and touch
support. At narrow sizes the same information moves into a conventional drawer
or list rather than relying on tiny targets over scaled artwork.

The monitor is an ordinary `/work` link before enhancement. When supported, its
client handler opens a full-screen dialog containing the same server-rendered
`ProjectSystem` used by `/work`. Modified clicks retain normal link behavior;
Escape, close, history navigation, and focus restoration remain deterministic.

### Project-system behavior

Every published project appears in manifest order. Case studies link to their
static routes. Archive records expand in place, expose verified external
evidence, and use `/work#project-<slug>` as their permanent destination without
inventing empty detail routes. Grid/dot texture and work-mode color always have
visible text equivalents.

The desk illustration and dialog treatment remain replaceable. Removing either
cannot remove `/work`, case-study routes, archive evidence, or canonical project
facts.

### Page transitions

Transitions may connect a selected node or row to its case study, but routing begins promptly and browser history remains native. Shared-element effects are optional and can be brittle; a short accent/fade continuation may deliver most of the benefit.

### Reduced motion

When reduced motion is requested:

- Stop ambient loops and parallax.
- Replace large transforms with short fades or no animation.
- Preserve perceptible focus and selection feedback.
- Avoid autoplay video and animated backgrounds.
- Keep links immediately usable.

Reduced motion is part of component design and tests, not a late override.

## Visual system

The product is dark-only. Define semantic CSS variables for page/surface backgrounds, primary/muted text, borders, green and purple accents, gradients, focus, success, warning, and error. Components consume semantic tokens rather than raw hex values.

Accent colors must meet contrast requirements wherever they carry meaning. Neon-looking colors are not automatically suitable for text. Typography may use a distinctive display face, but body copy, metrics, and technical captions need high legibility. Final fonts require licensing and load-performance review.

## Content and media workflow

Without a dashboard, publication is an intentional repository operation:

1. Edit the typed manifest and/or affected MDX file.
2. Add optimized media under its stable path.
3. Run type and content validation.
4. Preview affected statically generated routes locally.
5. Review wording, links, alt text, and confidentiality.
6. Commit/push/deploy only through an explicitly approved process.
7. Verify the new Vercel deployment and public routes.

Validation should check:

- Unique URL-safe slugs.
- Required title, summary, overview, and contribution for featured work.
- Legal publication/featured/archive states.
- Existing local media paths.
- Alt text for meaningful images and an explicit decorative-image convention.
- Complete eight-group coverage for all nine personal desk motifs.
- Safe link schemes and no production localhost URLs.
- No empty published sections after trimming.
- Deterministic ordering and duplicate-order warnings.
- Safe Markdown and no accidentally published placeholder text.

The manifest is the complete source of truth. Removing a published record removes it from future builds, so deletion requires a deliberate diff review and, for changed slugs, a redirect decision.

## Security and privacy

### Static publication boundary

With no runtime API or database, the primary security boundary is what enters the deployed bundle and `public/` directory. Draft/internal material must not be imported by public routes, copied into build output, or committed under a public asset path.

### Configuration and dependencies

- The initial site should require no secrets.
- Public site-origin configuration may be used for canonical metadata, but it is not sensitive.
- Do not introduce server actions, route handlers, API keys, or environment secrets for convenience.
- Disable arbitrary MDX imports and raw HTML; expose only an approved component map.
- Validate external link protocols and add safe external-link attributes.
- Pin and routinely review dependencies.
- Keep source assets containing private metadata or confidential details outside `public/`.

### Optional analytics boundary

Analytics are deferred. If later considered, first define the actual questions it should answer, data collected, cookies/fingerprinting behavior, retention, consent requirements, script cost, and privacy policy impact. Prefer the smallest privacy-preserving option; “dynamic” does not mean loading an unspecified tracker by default.

### Publication review

The Cisco feature is approved for public discussion according to the current project decision. Still review individual assets and claims: shipping to customers does not by itself authorize customer names, internal diagrams, logs, credentials, proprietary source, or metrics that were never publicly cleared. Production validation rejects placeholder markers, and only intentionally public contact data is included.

## Accessibility requirements

- Skip link and semantic landmarks.
- One meaningful `h1` per route and logical heading order.
- Complete keyboard navigation without custom traps.
- Visible focus indicators with sufficient contrast.
- A semantic `/work` link underlying the monitor trigger.
- Complete static work navigation at `/work` without dialog state.
- Meaningful alt text/captions and empty alt for decorative imagery.
- No information conveyed only by color, hover, or motion.
- Adequate touch targets.
- Tested zoom, text scaling, reflow, and narrow viewports.
- Useful, non-noisy loading/error announcements.

Accessibility work begins with each component and is re-audited before release.

## Performance expectations

- Prerender meaningful homepage and project content.
- Keep the hero useful before animation JavaScript hydrates.
- Lazy-load below-fold media and noncritical interaction code.
- Optimize raster assets and include intrinsic dimensions.
- Prefer CSS/SVG for modest ambient effects; avoid large canvas loops.
- Pause offscreen motion and avoid per-frame React state updates.
- Keep all primary content local so rendering has no network waterfall.
- Test on throttled mobile-class hardware, not only a development desktop.

Use the prevailing Core Web Vitals definitions when implementation begins and record measured budgets in the release audit rather than hard-coding potentially stale metrics in this plan.

## SEO and metadata

- Unique title/description for every public route.
- Canonical absolute URLs from validated production configuration.
- Social metadata/images for home and featured projects.
- Sitemap containing published routes only.
- Robots rules excluding preview, unpublished, and error pages.
- Structured data only where it accurately represents the person and work.
- Stable slugs; changes require redirects.

## Testing strategy

### Content and frontend

- Unit tests for normalization and optional-content rules.
- Schema/build tests for slugs, publication state, manifest-to-MDX linkage, asset paths, and desk-hotspot coverage.
- Component tests for semantics and keyboard behavior.
- Route tests for minimal, maximal, draft-excluded, and 404 states.
- Focused end-to-end coverage for direct URLs, dialog/history behavior, hotspot interaction, reduced motion, and `/work` fallback.

### Content and visual quality

- Automated path, alt-text, slug, link, and Markdown validation.
- Responsive review at representative narrow, medium, and wide viewports.
- Visual regression only for stable high-value layouts; do not freeze early experiments.
- Manual animation, reduced-motion, claim, and confidentiality review.

Every phase has proportionate verification. Quality is not deferred to Phase 9.

## Deployment and operations

### Environments

At minimum distinguish local and production. Add preview/staging only if it does not leak drafts or create disproportionate operational burden.

### Safe deployment flow

1. Validate content, types, tests, and production build locally.
2. Review the content/asset diff, especially deletions, changed slugs, and Cisco material.
3. Create a Vercel preview only with explicit authorization.
4. Verify the preview, then promote/deploy the approved revision.
5. Add redirects when stable public slugs change.

### Operational expectations

- Build and deployment logs contain no private content beyond ordinary filenames/errors.
- Git history and prior Vercel deployments provide the primary content/code rollback path.
- A changed or deleted slug is treated as a public compatibility change.
- Hosted changes, domains, analytics, and paid services always need explicit approval.

## Definition of done

The first public release is complete when:

- The homepage communicates identity and featured work immediately.
- The isometric desk enhances discovery and the monitor has a complete `/work` fallback.
- Cisco and RepoFrame have approved, accurate, prominent case studies.
- Every project has a stable direct route and intentional sparse-content behavior.
- Canonical content is external to visual components and reproducible.
- Local content is typed, build-validated, and prerendered with no runtime data dependency.
- Routes work on mobile, by keyboard, without hover, and with reduced motion.
- Media is optimized, described, and confidentiality-safe.
- SEO and social previews are correct.
- Setup, content updates, deployment, verification, and rollback are documented.
- Production contains no draft/internal content, development configuration, or secrets.

## Risks and deliberate pushback

### Static content trades runtime flexibility for reliability

Content changes require a new build and deployment. That is intentional for this portfolio: updates are infrequent, reviewed in git, and visitors avoid runtime content failures. Revisit the decision only if nontechnical editing or independent publication becomes a real need.

### Illustration before visual language is risky

Locking the desk illustration before typography, spacing, contrast, and layout
primitives creates rework. The SVG and hotspot geometry therefore remain
replaceable presentation rather than content infrastructure.

### Real content cannot wait until Phase 8

Placeholder-only schemas fail against long titles, confidential gaps, uneven evidence, and mixed media. Representative sanitized content must exercise earlier phases; Phase 8 is final editorial completion.

### Desk placement must remain presentation data

Hotspot coordinates are not personal or project facts. Keeping them in a typed
desk module makes illustration changes isolated frontend work.

### “No hard-coded content” needs a boundary

Biography and project copy belong outside components. Navigation labels, empty-state messages, button copy, and scene configuration are product code. Moving every string to PostgreSQL would make maintenance worse.

### Public does not mean every project needs an equally large page

All listed projects will appear publicly, but forcing a full case-study template onto thin archive material can weaken the overall impression. Older projects may launch as substantial archive cards with meaningful summaries, roles, technologies, and available evidence rather than empty full case-study routes.

## Confirmed decisions

- Use a static-first Next.js App Router site with no FastAPI, Supabase, or runtime content API.
- Host on Vercel when deployment is authorized; a Vercel-provided domain is sufficient initially.
- Store desk-hotspot placement in typed frontend configuration and keep every published project in the shared project system.
- Treat the Cisco feature as approved public subject matter, with an asset/claim-level confidentiality review.
- Publish neither software nor hardware/embedded resumes on the portfolio.
- Include every listed project publicly at launch.
- Allow older projects to launch as substantial archive cards without full case-study routes.
- Defer analytics while keeping a later privacy-conscious addition possible.
- Present Cisco only as a project case study; employment context belongs inside that page rather than a duplicate experience feature.
- Let Lakshya make the final Cisco omission decisions during the publication review while retaining the automated checks against obvious private material.
- Use an atmospheric sci-fi isometric desk whose monitor opens the shared project system, with `/work` as the permanent fallback.

## Deferred inputs required from Lakshya

These values are intentionally deferred and must be requested before final content/publication work:

- Final Cisco omissions, including any customer names, metrics, screenshots, diagrams, repositories, or technical details Lakshya chooses not to publish.
- Vercel production URL after the project is created, for canonical metadata and social previews.

The public contact inputs were resolved before Phase 3: GitHub is
`https://github.com/Lakshya565`, LinkedIn is
`https://www.linkedin.com/in/lakshya-agarwal-b43515317/`, and email is
`lakshya6@illinois.edu`.

Temporary placeholders may exist only in development content. They must be visibly marked and production validation must prevent placeholder URLs or email addresses from shipping.
