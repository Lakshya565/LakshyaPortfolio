# Desk and Project Tree Redesign — Phased Implementation Plan

## Document purpose

This document is the focused implementation authority for replacing the rejected
SVG desk, replacing the case-study/archive project grid with a routed project tree,
and introducing Software, Hybrid, and Hardware as the portfolio's semantic work
modes.

It temporarily supersedes the desk, project-system, work-mode, and archive
presentation decisions in [`portfolio-overview.md`](portfolio-overview.md), which
remains authoritative for product decisions this plan does not touch.
[`operations.md`](operations.md) is authoritative for deployment, security, and
publication.

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

## Phases 1 and 2 — complete

**Phase 1** (ten-route content contract and the semantic Software/Hybrid/Hardware
colour foundation) and **Phase 2** (the static, accessible project tree) both
landed on 2026-08-10 and passed their automated gates. Their full specifications
were removed once they shipped; `git log` has them if the original wording is
ever needed.

What survives them is not in this document: the routes and colours are enforced
by `web/lib/content/` and the test suite, and the tree's structure is in
`web/components/project-tree/`. The invariants above still bind every later phase.

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

Reconcile the overview, visual system, content authoring, and operations
documents. Remove temporary supersession notices
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
