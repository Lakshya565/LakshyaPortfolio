# Desk and Project Tree Redesign — Phased Implementation Plan

## Document purpose

This document is the focused implementation authority for replacing the rejected
SVG desk, replacing the case-study/archive project grid with a routed project tree,
and introducing Software, Hybrid, and Hardware as the portfolio's semantic work
modes.

It temporarily supersedes the desk, project-system, work-mode, and archive
presentation decisions in `portfolio-overview.md` and
`portfolio-implementation-phases.md`. Those master documents remain authoritative
for deployment, security, publication, and unrelated product decisions until they
are reconciled in Phase 7.

Creating or approving this plan does not authorize later phases. Work stops at
each approval gate.

## Approval and evidence protocol

Before each separately gated phase, Codex reports:

1. The exact objective, deliverables, and exclusions.
2. Current `git status` and overlapping user-owned work.
3. Files and public interfaces expected to change.
4. Decisions already locked by this roadmap.
5. Assumptions that could affect the result.
6. Likely failure modes and the containment strategy for each.
7. Proposed dependencies, generated assets, or registry changes.
8. Automated and manual acceptance checks.

After each phase, Codex reports:

1. The outcome before implementation detail.
2. Files changed and why.
3. Content-contract or public-interface changes.
4. Commands run and their exact results.
5. Visual or interaction evidence where applicable.
6. Remaining limitations, deferred input, and unresolved risk.
7. `git diff --check` status.
8. Confirmation that the next gated phase has not started.

Phase 1A and Phase 1B share one approval because they establish one foundation.
Every phase after Phase 1 requires separate approval.

## Non-negotiable invariants

- Do not commit, deploy, configure Vercel, add analytics, or publish the site.
- Preserve existing uncommitted work and report overlap before editing it.
- Do not fabricate responsibilities, outcomes, metrics, links, or technical decisions.
- Every project remains reachable without entering the interactive desk.
- `/work` remains the permanent desk-independent project index.
- The monitor remains an ordinary `/work` link without JavaScript.
- Keyboard navigation never depends on hover.
- Reduced motion preserves meaning while removing traveling and zooming movement.
- Green means Software, blue means Hybrid, purple means Hardware, and warm amber
  means personal life.
- Generic controls do not borrow a work-mode color without work-mode meaning.
- Generated art may include real logos and marks where they carry meaning — tool
  and stack attribution above all. Copied artwork (series frames, character art)
  is still out, because that is someone else's drawing rather than an identifier.
- Authored prose uses “I” for verified individual work and “we” for shared outcomes.
- Uneven story depth is acceptable; invented depth is not.

## Dependency sequence

```text
Phase 1 — Content, routes, and semantic color foundation
        ↓
Phase 2 — Static accessible project tree
        ↓
Phase 3 — Intent hover, pinning, and reflow
        ↓
Phase 4 — Magic UI borders and branch beams
        ↓
Phase 5 — 3D desk artwork generation and approval
        ↓
Phase 6 — Desk integration
        ↓
Phase 7 — Cleanup, documentation reconciliation, and final audit
```

The order validates data before presentation, presentation before interaction,
interaction before decoration, and artwork before integration.

## Phase 1 — Content, routes, and semantic color foundation

**Status:** Complete on 2026-08-10. The ten-route content contract and semantic
color foundation passed the Phase 1 automated gate.

### Objective

Establish the final project taxonomy and route contract before building the tree.
At completion, all ten projects are routed case studies and the site has an
unambiguous three-color work-mode system.

### Why this phase happens first

The current implementation distinguishes five case studies from five archives
and uses `systems`, `physical`, and `hybrid`. Building the tree against those
contracts would create immediate rework. Color tokens also belong here because
later components must be designed against final semantics rather than temporary
green/purple styling.

### Phase 1A — Project contract and routes

- Replace `ProjectWorkMode` with `software | hardware | hybrid`.
- Map Cisco, RepoFrame, and NuCurrent to Software.
- Map SmartLift, BackBuddy, and RiseNRun to Hardware.
- Map QuackTA, Lucky Arduino, Neurify, and AgriSense to Hybrid.
- Remove the case-study/archive discriminated union, presentation field, archive
  priority, nullable case-study key, and archive-only routing data.
- Make every stable project slug a valid case-study key.
- Give every project common links, metrics, assets, and videos arrays without
  hardcoded media limits.
- Generate `/projects/<slug>` for all ten published projects.
- Include all ten in static parameters, metadata, previous/next navigation,
  validation, tests, and release validation.
- Keep `/work` as the complete project index until Phase 2 replaces its presentation.

Add concise verified MDX stories for Lucky Arduino, BackBuddy, Neurify,
AgriSense, and COSMOS RiseNRun. Each story should cover only defensible material:

1. What I was trying to build or learn.
2. My specific responsibility.
3. How the system worked at the supported level of detail.
4. The strongest known outcome or constraint.
5. A lesson or improvement only when supported by existing evidence.

A small story may contain two or three meaningful sections. It must not be
stretched into flagship length with generic process language.

Pause instead of inventing content when ownership, mechanisms, metrics, dates,
or link provenance conflict. A deliberately concise route is acceptable when all
rendered claims are verified.

### Phase 1B — Semantic color foundation

| Before | After |
| --- | --- |
| Systems green: `oklch(0.79 0.145 155)` | Software green: `oklch(0.79 0.145 155)` |
| Physical purple: `oklch(0.76 0.13 305)` | Hardware purple: `oklch(0.78 0.13 305)` |
| Hybrid mixes green and purple | Hybrid electric blue: `oklch(0.79 0.12 235)` |
| Generic controls frequently inherit green | Generic controls use neutral foreground/surface tokens |
| Page atmosphere has green and purple | Shared identity surfaces may use restrained green, blue, and purple |
| Personal amber: `oklch(0.82 0.11 75)` | Personal amber remains unchanged |

Create solid, faint, soft, border, text, and hover variants for all three modes.
Green appears only with Software meaning, blue with Hybrid meaning, purple with
Hardware meaning, and the tri-color sequence with Lakshya's combined identity.
Generic navigation, controls, social links, and focus treatment remain neutral.

Validate accents in sRGB. If a token clips, reduce chroma while retaining its
lightness and hue. Check normal text to WCAG AA and required graphical objects to
3:1. Never rely on hue without visible branch or category text.

### Phase 1 verification

```powershell
npm.cmd run validate:content
npm.cmd run validate:content:release
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
git diff --check
```

Verify exactly ten project routes, no runtime archive union, Lucky Arduino as
Hybrid, first-person validation, ten-project navigation, and neutral generic UI.

### Phase 1 exclusions

- No tree layout or tree adapter without a consumer.
- No node expansion behavior.
- No Magic UI installation or animation.
- No desk-art changes.
- No deletion of the current desk or project system.

### Phase 1 exit gate

The content contract, ten routes, brief stories, and semantic tokens must pass
together. A successful typecheck with missing content is insufficient.

## Phase 2 — Static accessible project tree

**Status:** Implemented locally on 2026-08-10. The automated gate passes; final
viewport inspection remains part of Lakshya's localhost review before Phase 3.

### Objective

Replace the current grid with the final semantic tree without automatic hover or
decorative animation. Reading order, branch balance, mobile structure, and native
navigation must work before motion is allowed.

### Data projection

Introduce a presentation-only `ProjectTreeData` adapter containing the root and
three typed branch arrays. Each project exposes normalized display data only:
slug, title, category, first-person summary, role, date, technologies, and route.
The tree must not reach into raw editorial content.

### Structure

- Root: Lakshya Agarwal, the existing one-liner, and `/about`.
- Desktop: Hybrid left, Software center, Hardware right.
- Mobile: root once, then complete Hybrid, Software, and Hardware branch groups.
- Sort projects by existing `displayOrder` within each branch.
- Use native `details` and `summary` for no-JavaScript disclosure.
- Collapsed nodes show category and title.
- Expanded nodes show one summary, role/date, at most three technologies plus
  overflow, and one route action.
- Use static CSS/SVG connectors that remain intelligible without decoration.

### Connector geometry (revised 2026-08-10)

The original left-hand bracket connectors were rejected on review: the runs left
whitespace between segments, the columns did not read as centered, and every
line ended in mid-air instead of meeting the node it described. The tree is now
built as **three vertical chains**.

- Each branch is a chain headed by a **branch node** — a rectangle labelled
  Hybrid, Software, or Hardware — with its project nodes stacked beneath it.
- Consecutive nodes are joined by exactly **one vertical connector, centered on
  the bottom edge of the node above and the top edge of the node below**. A
  connector must terminate flush against both rectangles; no floating ends.
- The root joins the three branch nodes with a rounded **elbow**: one trunk drops
  from the root's bottom-center to a horizontal rail, and three drops descend
  from the rail into each branch node's top-center. Corners are rounded so the
  join does not read as a spreadsheet grid.
- Connector centering is derived from the same layout that positions the cards,
  so expanding a node cannot desynchronise the geometry.

This shape exists to serve Phase 4: a single straight path per branch is what
makes one cheap traveling pulse possible.

### Verification and exit gate

Verify exact membership/order, all ten links, native disclosure, mobile DOM order,
long titles, 200% text, keyboard operation, and non-color labels. Do not begin
Phase 3 until the static tree is complete and understandable.

## Phase 3 — Intent hover, pinning, and reflow

### Objective

Add automatic preview without hover jitter, hover-only information, or unstable
branch geometry.

Each branch tracks a temporary preview and a pinned project. The visible node is
the preview when present, otherwise the pin. Fine-pointer hover waits about 120ms,
cancels on early exit, and uses a short close grace period. Click or tap pins a
node; another click transfers or removes the pin. One project per branch may be
expanded, allowing up to three across the tree.

Keyboard activation remains immediate. Escape closes the focused state without
moving focus unexpectedly. Expansion changes intrinsic height immediately;
height, padding, and margin are not tweened. Pointer-triggered content may fade in
over 120–160ms, while keyboard-triggered content appears immediately.

Test pointer movement into expanded content, rapid adjacent hovers, pinned-state
restoration, touch-generated hover, long summaries, JavaScript failure, and focus
movement between branches. Phase 4 cannot begin until reflow is stable.

## Phase 4 — Magic UI borders and animated branch beams

### Objective

Add purposeful work-mode motion to the stable tree without recreating the site's
earlier scrolling problems.

Inspect and install local source for Magic UI Rainbow Button through the
configured shadcn registry. Map generated colors to local tokens and remove
duplicated themes or unjustified dependencies.

- Use Rainbow Button `asChild` for the root `/about` link with a green-blue-purple
  sequence.
- Derive a non-button border treatment for project nodes to avoid nested controls.
- Software cards use green tones, Hybrid blue tones, Hardware purple tones.
- Project borders animate only on hover, focus-within, or pinned state.
- Remove or greatly reduce expensive blurred glow.
- Reduced motion retains static semantic paths and borders.

### Beam approach (decided 2026-08-10)

**Do not use Magic UI Animated Beam here.** It measures a `from` and a `to` DOM
node, draws a re-measured SVG between them, and animates it with Motion. For a
root, three branch nodes, and ten project nodes that is roughly thirteen measured
beams animating at once — the exact pattern the release notes blame for the
site's earlier scroll problems — and every expanded node forces a re-measure.

The revised chain geometry removes the need for it. Each branch is a straight
vertical run at a position the layout already controls, so the beam is:

- One static path plus **one traveling pulse per branch: three pulses total**,
  implemented as a local CSS gradient or `stroke-dashoffset` animation over an
  SVG path. No measurement, no Motion, no client component.
- The intended sequence is root → split at the rail → down each chain through
  every node → last node → loop.
- The loop is **strictly budgeted**: hard-paused when the tree is offscreen, when
  the document is hidden, when the dialog is closed, and under reduced motion.
  Visibility gating is the one piece that may justify a small client boundary
  (an `IntersectionObserver` toggling a class), not the animation itself.
- Animate only transform, opacity, or gradient/dash offset. Never layout.

Keep Motion as a dependency only with measured justification.

The exit gate requires no decoration-related long task over 50ms, no persistent
dropped frames, accurate paths after expansion, and idle card borders that do not
animate.

## Phase 5 — 3D desk artwork generation and approval

### Objective

Produce and explicitly approve the final desk artwork before adapting any hotspot
or homepage code. This phase changes artwork only.

### Art direction

**Revised 2026-08-10.** The homepage hero now places a selected-work rail beside
the desk, so the desk occupies a narrower column and is recomposed for a squarer
**~4:3** frame rather than a wide strip. The artwork is generated from a typed
projection module rather than hand-authored paths; see "Production method" below.

- Squarer ~4:3 stylized diorama sized for the hero's desk column.
- One three-quarter, slightly top-down camera and vanishing system.
- Central monitor occupying roughly one-third of useful width.
- Keyboard below, mouse beside it, and quieter object clusters on both sides.
- Matte graphite desk, restrained sci-fi room, soft upper-left key light, cool
  fill, plausible contact shadows, and subtle tri-color emissive light.
- Recognizable Arduino/breadboard, debugging duck, climbing hold and chalk bag,
  paired drinks, compact food tray, weight, abstract anime panels, belt stripes,
  and compass keepsake.
- No plaques, floating props, extra objects, or watermarks. Logos and marks are
  allowed where they identify a real tool or influence; copied artwork is not.

### Production method (decided 2026-08-10)

The rejected SVG failed because it is hand-authored quadrilaterals in which every
object invented its own vanishing directions — there is no shared projection, no
unit cube, no light rule, and no contact shadows. Editing those paths cannot
converge. The replacement is **generated from code**, so perspective, scale,
lighting, and grounding are properties of the system rather than things redrawn
by hand:

- `web/lib/desk/projection.ts` — 2:1 dimetric axis vectors, a `project(x, y, z)`
  to screen space, a `box()` helper emitting the three visible faces of a unit
  cube, the mechanical light rule, and `contactShadow()`.
- `web/lib/desk/scene.ts` — every object as position, size, and material in scene
  units, sized against the keyboard as the human-scale reference.
- `web/scripts/generate-desk.ts` — emits the SVG plus a typed geometry module
  containing each hotspot's bounds and the monitor screen's four corner points,
  so hotspots derive from the artwork instead of hand-tuned percentages.

Shading is **flat faces plus contact shadows**: one solid tone per face from the
light rule, a soft contact shadow under every object, and a 1px lit top edge.
Realism comes from correct geometry and grounding, not rendering tricks. Gradient
shading is a possible later pass, deliberately excluded from the first version so
composition can be judged without rendering noise.

Object density is tiered: four hero objects that read instantly (monitor,
Arduino/breadboard, debugging duck, paired drinks) and four subtle rewards
(climbing hold and chalk bag, weight plate, belt stripes with compass, abstract
anime panels). The eight-group/nine-motif hotspot contract is unchanged; only
visual prominence differs.

Colour discipline: near-monochrome graphite, with green, blue, and purple
appearing only as emissive light such as screen glow and LEDs — never as paint
on an object's faces.

Keep the rejected SVG until the replacement is approved. The final phase report
includes the render, dimensions, represented objects, known imperfections, and
content-safety inspection. Explicit visual approval is required before Phase 6.

## Phase 6 — Desk asset and monitor integration

### Objective

Integrate the approved render while preserving responsive behavior, accessible
hotspots, history behavior, and the `/work` fallback.

- Preserve the master and create optimized responsive derivatives.
- Use intrinsic dimensions to prevent layout shift.
- Create an intentional mobile crop rather than shrinking desktop hotspots.
- Map typed desktop hotspots to recognizable object clusters.
- Retain accessible hover/focus popovers and mobile drawer parity.
- Overlay a real `/work` monitor link and HTML exploration prompt.
- Use a restrained pointer zoom; keyboard and reduced motion open immediately.
- Restore monitor focus on close and preserve Back/hash and modified-click behavior.
- Keep the old SVG until this phase passes.

**Monitor behavior (decided 2026-08-10).** The screen becomes a real HTML
surface rather than a trigger for a generic overlay: a panel positioned by a CSS
`matrix3d` derived from the screen-corner points exported by the generator,
containing the actual project tree. Zooming scales the camera toward the monitor
while the panel un-skews to face the viewer, so the motion explains itself.
`foreignObject` is not an option — the desk SVG must stay a passive asset with no
embedded HTML. Transform and opacity only, one animated element, no
`backdrop-filter`. Without JavaScript the monitor stays an ordinary `/work` link;
keyboard and reduced motion skip the zoom and land on the flat readable state.
This replaces the current 600ms zoom into a full-screen dialog.

Test desktop placement, tablet/mobile crops, drawer parity, keyboard, focus return,
Back behavior, no-JavaScript navigation, reduced motion, layout shift, and image
source selection.

## Phase 7 — Cleanup, documentation reconciliation, and final audit

### Objective

Remove superseded code only after the replacement passes, reconcile the master
documentation, and audit the redesign as one system.

Search all imports before removing the old SVG, grid/archive implementation,
archive adapters, dot-pattern distinction, stale work-mode selectors, unused
registry code, and duplicate tokens. Report recoverability for material assets.

Reconcile the overview, master phases, visual system, content authoring,
operations, and release-audit documents. Remove temporary supersession notices
only once the master documents describe the ten routes, semantic colors, tree,
diorama, hover/pin behavior, three beams, dynamic media, and `/work` fallback.

Run the complete validation suite, production build, Knip, selector audit, and
`git diff --check`. With separate local-browser permission at preflight, audit
320px through 1440px, 200% text, keyboard, touch, reduced motion, JavaScript off,
home, dialog, `/work`, detailed and concise stories, About, and 404.

Target Lighthouse Performance ≥95 and Accessibility 100 on home, `/work`, and a
representative project. Report tooling limitations rather than inventing scores.
The final editorial audit rechecks first-person ownership, Cisco wording, sparse
story quality, relationship wording, and generated-art safety.

## Deferred work

- Vercel deployment and custom domain setup.
- Analytics.
- Final project photography and video.
- Unrelated About-page redesign.
- Claims not present in current sources.
- WebGL or an editable Blender implementation.
- Cisco wording changes beyond separately reviewed edits.
