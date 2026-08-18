# Claude Code UI Handoff

## Read this first

The current interface is **not visually approved**. Lakshya's latest feedback is
that the UI quality is unacceptable. Treat the current desk illustration and
project-tree presentation as functional scaffolding, not as a design direction
that needs minor polish. Do not defend it, preserve its appearance by default,
or compound it with more decoration.

The next useful step is a visual reset with explicit art direction, low-fidelity
composition approval, and then one polished slice before broad implementation.
Do not begin another large UI rewrite until Lakshya approves the exact phase and
the proposed visual direction.

This repository has substantial **uncommitted** Phase 1 and Phase 2 work. Inspect
`git status` and `git diff` before editing. Do not reset, discard, commit, deploy,
or overwrite existing work unless Lakshya explicitly authorizes it.

## Product goal

Build a personal portfolio that feels authored by Lakshya rather than generated
from a generic portfolio template. The intended experience is:

1. A concise, personal homepage introduction.
2. A convincing three-dimensional desk or workbench scene with recognizable
   objects, a central monitor, keyboard, and mouse.
3. Small object hotspots that explain personal interests without becoming a
   sticker wall.
4. A monitor that remains a normal `/work` link without JavaScript and opens an
   immersive project view when enhanced.
5. A project tree rooted in Lakshya, branching into Hybrid, Software, and
   Hardware work.
6. Ten routed project stories with intentionally uneven depth based on the
   evidence available.

The site should feel atmospheric, sci-fi, technically precise, personal, dense
enough to feel finished, and fast enough to scroll without visible jank.

## Reference direction

- `https://www.guochen.design` is the clearest interaction and illustration
  reference. The important qualities are a coherent spatial scene, recognizable
  objects, restrained linework or 3D form, and informative hover/focus cards.
- `https://nitishgannu.netlify.app` is a reference for a concise landing page,
  strong central graphic, and personal character without excessive copy.
- Magic UI components are available through `https://magicui.design/docs/components`.
  Use them only when they support the semantic hierarchy and performance budget.
- Lakshya previously said he liked a concept called "C." Its exact definition is
  not preserved in the repository. Ask him or recover the original conversation
  before using that statement as design guidance.

Do not copy another designer's artwork, source, or visual identity. References
should inform composition and interaction quality, not produce a clone.

## What has been rejected

### Desk artwork

`web/public/media/site/lakshya-desk.svg` is a hand-authored placeholder and has
been explicitly rejected. The objects do not read as a coherent desk, their
perspective and scale do not agree, and the composition does not create the
immersive 3D effect Lakshya expected.

Do not spend significant time polishing that SVG. Preserve it only as a fallback
until a replacement asset is approved. A better path is one coherent illustration
or render created with a single camera, material, lighting, and perspective
system, followed by HTML hotspot overlays.

### Project presentation

The current static tree in `web/components/project-tree/project-tree.tsx` is
architecturally useful but visually unapproved. It uses native disclosure and
correct data grouping, but its card/connector treatment has not been reviewed in
a browser and should not be assumed to look good.

Likely visual problems to challenge rather than preserve:

- CSS lines can read as a diagram pasted onto cards instead of one coherent tree.
- Repeated grid textures can make every node feel equally noisy.
- The current root and nodes may still look like generic dashboard cards.
- The composition lacks a distinctive central visual idea beyond color coding.
- The typography and spacing have not received viewport-level art direction.
- The full-screen dialog still carries legacy `project-system-*` CSS naming and
  interaction code.
- The homepage still presents the rejected desk as the dominant visual.

## Locked semantic decisions

These are product semantics, not optional palette suggestions:

| Meaning | Label | Token | Current value |
| --- | --- | --- | --- |
| Software-led work | Software | `--accent-green` | `oklch(0.79 0.145 155)` |
| Software + physical system | Hybrid | `--accent-blue` | `oklch(0.79 0.12 235)` |
| Device/circuit-led work | Hardware | `--accent-purple` | `oklch(0.78 0.13 305)` |
| Personal life | Personal | `--accent-personal` | `oklch(0.82 0.11 75)` |
| Lakshya as a whole | Identity | Green → blue → purple | Static tri-color treatment |

Generic navigation, links, focus rings, buttons, and neutral UI should not borrow
a project color without semantic meaning. Color must always be paired with a
visible branch or category label.

Project membership and intended order:

| Branch | Projects, highest priority first |
| --- | --- |
| Hybrid, left on desktop | QuackTA; Lucky Arduino Collection; Neurify; AgriSense |
| Software, center on desktop | Cisco Agentic Runbook Creator; RepoFrame; NuCurrent Inventory System |
| Hardware, right on desktop | SmartLift Sleeve; BackBuddy; RiseNRun Wi-Fi Alarm Clock |

There is no longer a Case Study versus Archive distinction. All ten projects have
routes under `/projects/<slug>`. Story length may vary; editorial depth must never
be confused with project quality.

## Personal visual vocabulary

The desk may include small, recognizable references to:

- Arduino or breadboard work.
- QuackTA through an original debugging duck.
- Fourth-degree taekwondo and Master Instructor experience through four belt
  stripes or another restrained symbol.
- Eagle Scout leadership through an abstract compass.
- Climbing/bouldering through a hold and chalk bag.
- Gym time through a small weight plate or dumbbell.
- Shared matcha/boba and good food through paired drinks and subtle food objects.
- Sushi, froyo, orange cheese snacks, Thai food, and Indian food.
- Anime interests through original panels inspired by walls, strategy, and
  football geometry. Do not copy character art or frames from a series — that is
  someone else's drawing. Logos and marks that identify a real tool or influence
  are fine.

Relationship wording should remain public and indirect: "people I care about."
Do not name or directly depict Lakshya's girlfriend without new approval.

Personal objects must remain visually quieter than project navigation. They
should reward exploration, not compete with the monitor.

## Recommended visual workflow

1. Ask for permission before starting a dev server or browser session.
2. Capture the current homepage, `/work`, one detailed project, and one concise
   project at mobile and desktop widths.
3. Present a short, candid UI audit with screenshots and a single hierarchy map.
4. Produce two or three desk compositions as images or wireframes before changing
   hotspot code. Each composition must use one camera and coherent object scale.
5. Get explicit approval of the desk composition and project-tree visual language.
6. Implement one representative vertical slice: homepage hero, approved desk
   asset, monitor affordance, and one branch with one expanded node.
7. Test that slice for performance, accessibility, text zoom, and touch before
   scaling it across the site.
8. Only then continue the approved phase sequence.

Do not attempt another complex desk using many unrelated hand-authored SVG objects.
For a static immersive result, a high-quality rendered illustration with semantic
HTML overlays is likely the best cost/performance tradeoff. If Lakshya wants real
camera movement or editable 3D geometry, propose a small Three.js/React Three Fiber
prototype with a strict performance budget before committing the whole homepage
to WebGL. A GitHub repository or Blender source from a reference designer is useful
only if its license and reuse boundaries are clear.

## Current phase state

The active roadmap is `docs/desk-project-tree-redesign-phases.md`.

- Phase 1 is implemented: unified project contract, ten routes, verified short
  stories, and Software/Hybrid/Hardware semantic colors.
- Phase 2 is implemented architecturally: typed tree adapter, root, three branches,
  ten native `<details>` nodes, static connectors, and `/work` integration.
- Phase 2 has **not** received localhost visual approval.
- Phase 3 has not started: no intent-hover, pinning, or branch state.
- Phase 4 has not started: no Rainbow Button borders or Animated Beam connectors.
- Phase 5 has not started: no approved 3D desk artwork.
- Phases 6 and 7 have not started.

Do not start Phase 3 or later without explicit permission. Given the rejected UI,
it is reasonable to propose revisiting the visual assumptions of Phase 2 before
adding interaction.

## Intended project-tree interaction

The current Phase 2 behavior is deliberately simple:

- The root shows Lakshya's name and one-liner and links to `/about`.
- Desktop branch order is Hybrid, Software, Hardware.
- Mobile DOM order is the same.
- Nodes use native `<details>` and `<summary>` so disclosure works without a
  client component.
- Closed nodes show category and title.
- Open nodes show one first-person summary, role/date, at most three technology
  badges plus `+N`, and one project link.
- Opening a node naturally pushes lower nodes down.

If Phase 3 is approved, hover must be intent-based rather than instantaneous:

- Fine-pointer hover delay around 120 ms.
- Cancel on early exit and use a short close grace period.
- Click/tap pins a node.
- At most one pinned or previewed node per branch.
- Keyboard activation is immediate and never waits for hover timing.
- Expansion reflows intrinsically; do not animate height, margin, or padding.
- No information may exist only on hover.

If Phase 4 is approved:

- The root may use a green-blue-purple Rainbow Button-style border.
- Project nodes should derive a border treatment rather than becoming nested
  buttons.
- Software borders/beams are green, Hybrid blue, Hardware purple.
- Borders animate only for hover, focus-within, or pinned state.
- Use one traveling beam per branch at most, with a static path beneath it.
- Pause beams offscreen, when the dialog is closed, when the document is hidden,
  and under reduced motion.
- Avoid large blurred glow and continuous animation across every card.

## Desk interaction contract

The desk behavior currently lives in:

- `web/components/desk/isometric-desk.tsx`
- `web/components/desk/desk-experience.tsx`
- `web/lib/desk/hotspots.ts`

The monitor is always a real `/work` link. JavaScript progressively intercepts an
ordinary click to zoom and open a dialog. Modified clicks keep normal link
behavior. Keyboard and reduced-motion activation open immediately. Closing the
dialog restores monitor focus, and browser Back closes the hash-backed dialog.

Desktop hotspots use Radix popovers. Coarse pointers receive a mobile drawer.
Whatever artwork replaces the SVG must preserve keyboard access, readable focus,
touch parity, and the `/work` fallback.

The current 600 ms monitor zoom should be reassessed; it may feel slow. Do not add
more motion until the scene and transition are measured in a browser.

## Performance and accessibility constraints

- The site was previously too laggy to scroll comfortably. Avoid fixed animated
  backgrounds, `backdrop-filter`, continuous multi-element animation, pointer
  tracking, and large blurred layers.
- Server Components are the default. Add a client boundary only for behavior that
  cannot be expressed with native HTML/CSS.
- Do not animate layout properties. Prefer transform and opacity when motion has
  an explanatory or feedback purpose.
- Keyboard actions should feel immediate.
- Gate pointer hover behavior behind `(hover: hover) and (pointer: fine)`.
- Reduced motion must preserve hierarchy through static paths and borders.
- Verify 320 px mobile, tablet, 1440 px desktop, 200% text enlargement, long
  titles, touch, keyboard, visible focus, reduced motion, and JavaScript-disabled
  navigation.
- Do not invent Lighthouse or trace results. Run the tools or report that the
  measurement was not performed.

## Content and publication constraints

- Content is local and version-controlled under `web/content/`.
- Project records live in `web/content/projects.ts`.
- Long and concise project stories live in `web/content/case-studies/`.
- The shared contract lives in `web/types/content.ts`.
- Validation lives in `web/lib/content/validate-portfolio-content.ts`.
- All authored prose should use first-person individual ownership (`I`) and
  team-aware shared outcomes (`we`). Do not fabricate technical decisions,
  metrics, links, or ownership.
- Cisco information is approved for public release in principle, but wording is
  still subject to Lakshya's omission review.
- The site intentionally launches without project media. Assets and videos must
  remain dynamically sized and data-driven when added later.
- ~~Do not add resumes to the portfolio.~~ **Reversed on 2026-08-17 at Lakshya's explicit request.** One resume is now
  published at `/lakshya-agarwal-resume.pdf` and linked from the header, hero,
  and footer. See `docs/editing-copy.md`. No *other* private document may be
  added without a new decision.
- Do not deploy to Vercel, add analytics, configure a domain, or publish anything
  without new authorization.

## Technical architecture

- Next.js 16 App Router, React 19, TypeScript, React Server Components.
- Tailwind CSS v4 with the main visual system in `web/app/globals.css`.
- shadcn configuration: Radix/Nova, semantic CSS variables, Lucide icon setting.
- Existing local primitives include Button, Badge, Card, Dialog, Drawer, Popover,
  Grid Pattern, and Dot Pattern.
- The Magic UI registry is configured as `@magicui` in `web/components.json`.
- There is no runtime API, database, authentication, analytics, or content CMS.
- Project routes and MDX are statically generated.

Relevant local design guidance, if available in Claude's environment:

- `C:\Users\itsla\.agents\skills\emil-design-eng\SKILL.md`
- `C:\Users\itsla\.agents\skills\shadcn\SKILL.md`
- `C:\Users\itsla\.agents\skills\better-colors\SKILL.md`

Use those as design/implementation constraints, not as a substitute for visual
judgment or user approval.

## Important files

| Area | Files |
| --- | --- |
| Active redesign authority | `docs/desk-project-tree-redesign-phases.md` |
| Content rules | `docs/content-authoring.md`, `docs/content-inventory.md` |
| Visual tokens | `docs/visual-system.md`, `web/app/globals.css` |
| Project content | `web/content/projects.ts`, `web/content/case-studies/` |
| Types and projection | `web/types/content.ts`, `web/lib/content/page-data.ts` |
| Current tree | `web/components/project-tree/project-tree.tsx` |
| Work route | `web/app/work/page.tsx` |
| Desk interaction | `web/components/desk/desk-experience.tsx` |
| Desk wrapper | `web/components/desk/isometric-desk.tsx` |
| Rejected desk asset | `web/public/media/site/lakshya-desk.svg` |
| UI tests | `web/tests/content-components.test.tsx`, `web/tests/page-data.test.ts`, `web/tests/desk-architecture.test.ts` |

`web/app/globals.css` is already large. Before adding another large visual system,
consider extracting feature-scoped styles through the project's accepted CSS
organization rather than stacking more stale selectors in one file. Do not make
that refactor casually while visual direction is still unsettled.

## Current worktree and last verification

The working tree contains the combined uncommitted Phase 1 and Phase 2 changes,
including new project MDX files, the new project-tree component, and removal of
the old project-system grid component. Preserve the entire diff until Lakshya
decides what to keep.

The last automated verification passed:

```text
Development content validation: passed
Release content validation: passed
ESLint: passed
TypeScript: passed
Vitest: 9 files, 64 tests passed
Next.js production build: passed
Static pages generated: 19
Project routes generated: 10
git diff --check: passed
```

No local browser or viewport review was performed after Phase 2. Do not call the
current visual result validated.

## Local commands

From `C:\Users\itsla\LakshyaPortfolio\web`:

```powershell
npm.cmd run dev
npm.cmd run validate:content
npm.cmd run validate:content:release
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Ask Lakshya before starting the development server or opening a browser. Do not
commit or deploy after validation unless separately instructed.

## Questions to settle before another visual implementation

1. Should the desk be a polished static render with hotspots, or does Lakshya
   want true realtime 3D interaction strongly enough to accept the performance,
   accessibility, and implementation cost?
2. Can Lakshya provide the reference designer's repository, Blender/Figma source,
   or a licensed asset pack, and what reuse license applies?
3. What exactly was concept "C" that Lakshya liked?
4. Which two or three desk objects must read instantly at first glance, and which
   can remain hidden rewards?
5. Should the project tree feel like a circuit schematic, a skill tree, a
   filesystem, or a physical monitor UI? Pick one primary metaphor.
6. Is the current three-column branch order still locked after seeing it rendered?
7. Should the tree be visible directly in the monitor frame, or only after the
   monitor expands?

The critical lesson from the current state is to validate one coherent visual
composition before implementing the entire system around it.
