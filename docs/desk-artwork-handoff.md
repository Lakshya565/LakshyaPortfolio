# Desk Artwork Handoff

State as of **2026-08-16**, after the session that finished the last two motif
objects. Written for the next Claude session picking up the isometric scene.

## Read this first

The desk artwork is **done and committed**. `0459b38 assets FINALLY done` is on
`main` and pushed; the working tree is clean. Lakshya's own commit message is the
approval signal — the twelve motif objects, the four workspace objects, and the
scenery are finished and he has stopped iterating on them.

That means the default posture for artwork is now **do not touch**. Objects were
signed off one at a time over several sessions, and several of them look the way
they do because of a specific correction. Changing one "while you are in there"
undoes work that was paid for in review cycles.

`docs/claude-code-ui-handoff.md` is the older, broader handoff and is **stale in
three specific ways** — see the last section. It has not been edited; read this
document as the authority on the desk artwork and that one for the rest.

## What the scene actually is now

Not the rejected hand-authored SVG that the older handoff describes. The scene is
**typed data compiled to SVG**:

- `web/lib/desk/objects.ts` — one builder function per object, returning
  `DeskPart[]`. ~2300 lines, 19 exported builders.
- `web/lib/desk/parts.ts` — the shape helpers (`box`, `cylinder`, `face`, `slab`,
  `silhouette`, …) and the palette.
- `web/lib/desk/scene.ts` — placement: which builder stands for which hotspot and
  where it sits on the grid.
- `web/scripts/generate-desk.ts` — projects the data and writes
  `public/media/site/lakshya-desk-v2.svg`, `scene-geometry.ts`,
  `scene-markup.ts`, and `scene-catalog.ts`. **The generated files are committed**,
  so any edit to a builder needs `npm run generate:desk` before the change is
  visible anywhere.

There is no z-buffer and no light model. **Paint order is array order.** Occlusion
is achieved by putting the near thing later in the array. There are no shadows —
Lakshya asked for all of them to be removed.

`generate:desk` currently reports `Objects: 29, no overlaps beyond budget`, and
the budget is now zero — see the layout pass below.

## What this session changed

Two objects, plus the palette entries they needed. Everything else was untouched.

### `taekwondo` — the belt (30 × 31)

A coil lying flat with its loose end running out along `+y`, four gold rank
stripes near the tip.

- **The tail is painted after the roll**, so it crosses in front of the coil.
  This is also the depth-correct order: where the two overlap on screen the
  strap's `x + y` is about 21 against the roll's silhouette at 15. An earlier
  build painted it first and it passed *under* the coil.
- **The tail is built face by face, not with `slab`** — see the bug section
  below. Three faces: the broad `+x` wall that carries the stripes, the narrow
  top, and the `+y` cap at the tip.
- **Those three faces carry `stroke: "none"`.** Every outline is a separate open
  polyline. This is the trick that makes the join invisible: the strap and the
  roll share one fill, so an unstroked boundary between them cannot be seen and
  the webbing runs into the coil with no seam. Three open runs, all of which
  *stop* at the roll rather than closing across it.
- **The spiral ends at `outer − cloth`**, which is the strap's inner edge, so the
  outermost turn *becomes* the tail. An Archimedean spiral runs perpendicular to
  its radius, so at the `+x` rim it is already travelling along `+y` — the same
  direction the strap runs. Both curves meet at one point with one tangent.
- Every loose end of the outline lands on a line the roll already draws. At
  screen `X = 10.5` the roll's top rim is at `Y = −0.35` and its lower silhouette
  at `Y = 5.25`, which is exactly where the strap's two corners project. Nothing
  floats and nothing is cut off. If you move `outer`, `cloth`, or the tail's `x`,
  **you break all three of those coincidences at once.**
- Geometry: `outer = 10.5`, `width = 5.6`, `cloth = 0.9`, tail `y` from 0 to 25,
  spiral 3 turns from radius 1.8 to 9.6.

### `music` — the headphones (39 × 38)

Two cups on the shared `+x` axis with a hoop over the top, laid out in *screen*
space and mapped back into the cups' plane.

- **Anchored on hinges, not cup centres.** A hinge sits at screen offset
  `(0.62·cupR, −0.31·cupR)` from its cup's centre — on the cup's right edge,
  which is also its farthest point (proof below), and inside the rim so the cup
  covers the arm's end. Both hinges are the same offset, so the chord between the
  band's ends is unchanged and the whole hoop simply translates onto the pair's
  far side.
- **The cups are swapped, deliberately, at Lakshya's request.** The far cup shows
  its outer housing and one inset trim ring; the near cup shows the ear pad and
  the recessed opening. Physically this reads as both cups swivelled the same way
  on their hinges — the flat-folded pose. It is **no longer** the two pads facing
  each other, which is how a pair sits on a head. An older spec required
  "cushion openings face inward"; that requirement is superseded. Do not restore
  it without asking.
- **No pivot discs on either cap.** They were removed on purpose: at this size a
  small dark oval near a cup's rim reads as a dent, not a hinge.
- Geometry: `cupR = 7`, `cupThick = 3.2`, `span = 18`, `lift = 7`, `flare = 1.5`,
  band half-thickness 1.6, yoke half-width 1.15 with its tip 12% of the way back
  from the hinge toward the band end, pad at `0.79·cupR` standing 1.9 proud,
  opening `0.44·cupR`, far trim ring `0.7·cupR`.
- The padded lining runs 4%–96% of the band's sweep. Held to the crown only, it
  read as a highlight sticker — a mark that starts and stops in mid-air is a
  reflection, not a material.

### Palette (`web/lib/desk/parts.ts`)

- `headphone` lifted `#243c4a` → `#33505d`. The housing has to be the **light**
  half of the pair; at the old value it was a shade off the foam and the cup's
  three contours had no tonal story between them.
- `earPad` added: `{ line: "#7f9aab", wash: "#1e3140" }`. Foam is the darkest
  part of a headphone, and getting that order backwards was the single biggest
  reason the cups read as a stack of rings.
- `beltBlack` was lifted to `#282c34` in the previous session and **removed from
  the `intentionallyDark` exemption list** in `web/tests/desk-objects.test.ts`.
  Only `pearl` is exempt now. Do not put anything back on that list to make a
  test pass — the exemption is what hid a real failure for weeks.

## The layout pass, later the same day

Lakshya asked for two things: no object overlapping any other, and the whole
field moved slightly down-left to open the top right for 3D lettering he plans
to add. **No artwork changed** — every builder in `objects.ts` is untouched and
every object's own dimensions in `/lab` are identical. This was `scene.ts`
placement only, plus the budget change below.

### Translating the scene does nothing — read this before moving anything

`toViewBox` fits the frame to the bounds of everything drawn. Add the same
offset to all 29 objects and the frame follows them exactly, so the rendered
image is unchanged, pixel for pixel. "Move the objects down-left" is only
meaningful *relative to something that stays*.

What stays is the rim scenery. The objects moved down-left and the trees did not
follow. Two of them are load-bearing:

- **`(-58, 48)` sets the frame's top.** Nothing else reaches above screen
  `y = −38`; the next highest is the clock tower at `−18.5`.
- **`(243, -23)` sets the frame's right.** Nothing else reaches past screen
  `x = 272`; the next is the dumbbell at `230`.

Both stand alone with no neighbour near them, and that isolation is the point.
Move either one inward and the frame collapses onto the objects, taking the
reserved space with it. The reserved block is everything right of screen
`x = 100` and above screen `y = 80` — about 203 × 132 units in a 585 × 292
frame, the top-right third of the width and not quite half the height. Only
three motifs stand right of `x = 100` at all and every one of them is below it;
the right anchor tree is the only object of any kind up there, and it clears
`y = 80` by three and a half units.

Two of the scenery moves were made purely to break rows: three thin objects had
lined up along the bottom at the same height, and three more stacked up the left
edge at the same screen `x`. Both read as fence palings rather than planting,
which is the same failure the file's own comment about identical lollipops
describes.

### Dispersion, and what it costs

A second pass spread the thirteen motifs across the whole field. The measure
that was actually tuned is **the clearance from each motif's screen box to its
nearest other motif**, and the floor is now about 16 units where the tightest
pairs used to be 4 or 5. Scenery is exempt: a tree beside a figure is a scene,
and holding scenery to the same 16 units would empty the middle of the field.

Dispersing is not free, and the cost is not obvious. The frame is fitted to the
objects, so spreading them **zooms the whole picture out**: the field went from
448 × 239 screen units to 524 × 264, the frame from 535 to 585 wide, and
everything therefore renders about 8% smaller inside the same 1444px. Kirby is
around 75px across now against 90px before either pass. There is real headroom
left — the docs' own benchmark is that a 40px duck is unreadable — but it is not
unlimited, and it is why the gaps were opened by using the empty left and bottom
of the grid rather than by pushing every object outward evenly.

Keep the content's aspect near the frame's `1444/720`. `toViewBox` pads the
short axis to reach it, and padding is scale spent on nothing. At 524 × 264 the
content is within 1% of that ratio, so essentially none is being wasted.

### The workstation is one object

`scene.ts` now has a `workstation` anchor, and the keyboard and mouse are stated
as offsets from it through `atWorkstation` rather than as their own coordinates.
This is a fix for something that had already gone wrong once: the monitor is a
labelled hotspot and the other two are unlabelled scale, so they live in
different tables and nothing stopped a layout pass from moving one and leaving
the others. Separating their boxes for the zero-overlap rule pushed the keyboard
a quarter of its width off the monitor's centre line and parked the mouse past
it, and the group stopped reading as a desk.

The arrangement the offsets encode is an ordinary desk, and it is settled:

- **The keyboard sits in front of the monitor**, at `atWorkstation(4, 24)`.
- **The mouse is parallel to it** — literally the same world `y`, both at `+24`,
  so it rides the keyboard's own `+x` line instead of sitting behind it. It is
  `+58` along that line, leaving 7.9 screen units between the boxes: a hand's
  width, which is what the arrangement copies. **That 58 is the number to
  preserve.** Where the pair sits on the grid is the anchor's business.

**Retune the anchor, not the offsets.** Lakshya asked for this grouping
explicitly and asked that it stay that way.

### A grid square is 12 world units

Nothing in `scene.ts` says so, and it is the natural unit for placing a group by
eye against the grid rather than against other objects. `generate-desk.ts` draws
the grid in screen space at `view.width * 0.0205` apart, which is about 12. Work
the two families back through the projection and they are lines of constant
world `y` and constant world `x` at exactly 12-unit intervals — because
`screenY − ½·screenX = y` and `screenY + ½·screenX = x` on the ground plane. So
*n* grid squares along an axis is `12n`, and up-left is `−x`.

The keyboard and mouse most recently took `x − 24`: two squares up-left.

### The one overlap exemption

That move slid the keyboard back inside the monitor's screen box, reported at
13%. `overlapExemptions` in `generate-desk.ts` now names that single pair —
`colophon` / `keyboard` — and the budget stays at zero for the other 405.

It is a box artefact, not a collision, and it was **checked at 5× before being
waived**: the keyboard's right end and the monitor's stand base have clear
daylight between them, nothing is drawn over anything. That verification is the
price of an exemption. Adding a pair means naming two objects, saying why the
rectangle is the wrong instrument for them, and looking at the render — never
to make a move compile. Every tolerance previously granted here went on to hide
a real collision.

One dead end, recorded so it is not walked twice. An intermediate pass read
"move the keyboard up and left" literally and ran it 58 units along `-x` to the
monitor's upper left, which is the only direction that rises on screen. It
satisfies the geometry and it is wrong: with the monitor then standing between
the pair, the mouse could either sit close to the keyboard and touch the stand,
or clear the stand and strand itself 24 units out. **There is no good mouse
position when the keyboard is not in front of the monitor** — that is the tell
that the keyboard is in the wrong place, not the mouse.

Nothing unlabelled goes in the workstation's way either. A figure stood exactly
where the mouse belongs and had to be moved out to the open ground between the
sushi and the climbing panel; the left rim was the other candidate and is worse,
since it would have put two identical silhouettes at the same height.

### The overlap budget is now zero

`overlapBudget` in `generate-desk.ts` was `{ labelled: 0.02, scenery: 0.34 }` and
is now a single `0`. The scenery allowance was there so a mouse could sit beside
a keyboard, but what it actually bought was collisions: a figure standing inside
the boba cups at 24%, another inside the dumbbell at 5%, a tree growing out of
the compass — every one under budget and every one plainly wrong on screen.
The layout separates cleanly at zero, so the tolerance only ever hid defects.

The one separation worth knowing about is the workstation's. **A box drawn round
a monitor already contains the near edge of its own desk**, so the monitor,
keyboard and mouse cannot have touching boxes and stay a cluster. The keyboard
therefore sits 2 units clear below the monitor rather than under its front edge,
and the group is held together by centring and by the gap to everything else —
see the workstation section above.

If a future object genuinely needs to sit inside another's box, raise the budget
deliberately and name the pair. Do not widen it to make a move compile.

## The lettering

`lib/desk/lettering.ts` fills the reserved block with "WALK / THROUGH / MY
WORKBENCH!" — a 5×5 bitmap font rasterised onto the world lattice as cubes,
standing in a wall one cell deep. One `DeskObject`, id `lettering`, anchored at
`(48, -60)`. Screen box x 90..238, y −36..76.

**It is one object on purpose.** The overlap budget is zero between objects, so
per-word objects would collide with each other, and `desk-objects.test.ts`
requires every catalog entry to satisfy `0.35 < width/height < 3`. One object
answers both; the whole block is 1.32.

`y = -60` puts it a long way back, so `depthOrder` gives it −120 — the lowest in
the scene. It paints first and sits behind everything, which is what a backdrop
should do.

### It is drawn filled, and that is not a style choice

The first build gave every cube face `ink.ground` like every other solid in the
scene. **The words were unreadable.** With no figure and no ground, twenty-six
cube outlines per glyph dissolve into a lattice and the letterform disappears
into it — legible in the geometry, invisible in the picture. It is the clearest
case yet of the rule at the bottom of this file: geometric fit is not visual fit,
and the only way it was found was by rendering it and looking.

Two palette entries fix it. `lettering` fills the `+y` face — the letterform —
and `letteringSide` fills the extrusion. Both take `ink.accent` as their line.
The precedent for two values of one hue is `triforce` / `triforceSide`: a real
face at a real angle, not shading painted onto a curve. Both faces of the
extrusion take the *same* value; two would be a light model, and the scene does
not have one.

`letteringSide` is squeezed. It has to sit clearly below the face and still clear
`ink.ground` by the test's 1.4. At `#0e2b1e` it looked right and failed at 1.34.
`#123a28` clears at 1.60 and is still a 2.7× step below the face.

### Culling and paint order

Only `+x`, `+y`, `+z` face the camera. Of those, `+z` is dropped when the cell
above is lit and `+x` when the cell to the right is lit — they are exactly
covered. `+y` is never dropped; nothing in a one-cell wall can stand in front of
the letterform. That takes 822 faces down to **616**.

**The loops run rows bottom-to-top and columns left-to-right, and that is
load-bearing.** A cube on the up-right diagonal covers half of this one's top and
half of its right face and cannot be culled, because the two only share an edge.
Running the loops this way puts every such diagonal later in the array, so it
paints over cleanly. Reverse either and strokes cut through the faces in front of
them.

### Why the cell is 2 and the font is 5×5

Not taste — bytes. `s = 2` is the largest cell that fits the block *and* is an
integer, so every projected coordinate is whole and the generator writes
`M238 -30` rather than `M237.6 -29.55`. That is about 8 bytes on each of 616
paths. 5×7 forces `s ≈ 1.85`, costs those bytes, adds 35% more cells, and lands
at 98% of the size cap.

`W`, `M`, `N` and `G` are weak at 5×5 — `W`'s top two rows are identical to `H`,
`M`, `N` and `U`, so three cells carry the whole letter. Checked at 5× and
accepted. Six rows would fix them and blow the budget.

### The budget, which is now the tight one

| | before | after |
|---|---:|---:|
| `lakshya-desk-v2.svg` | 180,782 | **225,960 — 90.4% of the 250 KB cap** |
| paths | 484 | 1,100 |
| `scene-markup.ts` (ships inline on the hero) | 182,952 | 231,744 |

`validate-content` fails the build above 250 KB, so there is about 24 KB left for
everything else the artwork might ever gain. **The lever, if it is ever
breached:** merge collinear runs of `+x` faces per column and `+z` faces per row
— 464 paths, roughly 34 KB, SVG near 215 KB. Not taken, because it strips the
cube divisions from the sides while leaving them on the front, which is the
opposite of what the lettering is for.

`scene-markup.ts` has no budget and no test, and it is the one a visitor actually
downloads. Repetitive path data gzips well, but `docs/release-audit.md` was
already stale before this and is worth re-running.

### What it does not do

The scene is `aria-hidden`, so the words reach no screen reader, and at a 375px
phone the field renders at about a quarter scale where a cube is under three
pixels. `components/desk/isometric-desk.tsx` carries an `sr-only` paragraph with
the phrase for both reasons. **If the lettering leaves the scene, that goes with
it.**

The frame did not move — the block sits inside the existing bounds on every side,
and `scene-geometry.ts` regenerated with a zero diff. Nothing else rescaled.

## The one unfixed bug you will hit

**`footprintWinding` in `web/lib/desk/projection.ts` returns the inward
orientation, so `extrude` keeps the wall faces that point *away* from the
camera.**

Work it through with a CCW unit square `(0,0), (1,0), (1,1), (0,1)`: the shoelace
area is `+2`, the function returns `−1`, and the bottom edge's normal comes out
`(0, +1)` when the true outward normal is `(0, −1)`. Same inversion for a CW
footprint. The helper normalises winding by design, so **reversing your own
footprint changes nothing.**

For the belt tail this drew the `−x` wall and the `y = 0` end cap — the two
hidden faces — putting a 0.9 × 5.6 cap on the roll's wall at the exit, which was
most of the clutter Lakshya complained about. The fix applied was local: build
that one object's faces by hand.

**It was not fixed at the source, on purpose.** The sign is shared by every
extruded solid in the scene, including nine approved objects and every `slab`,
`wedge`, and `pyramid`. For a plain box the two back walls and the two front
walls give a similar silhouette and there is no shading to give it away, which is
why it survived this long. Fixing it properly means re-reviewing every extruded
object in `/lab` — a real piece of work that needs Lakshya's go-ahead, not a
one-character diff. If he ever asks for it, that is the scope.

## Projection facts worth not re-deriving

`project(p) = (x − y, ½(x + y) − z)`. View direction `(1,1,1)`; larger `x + y + z`
is nearer. `+x` → down-right, `+y` → down-left and nearer, `+z` → straight up.

- **Two bearings are degenerate.** `(1, 1)` projects straight down and `(1, −1)`
  horizontally. They are perpendicular to each other, so choosing either for a
  radius forces the other on the tangent, and a flat rectangle built on both is
  an axis-aligned screen rectangle with zero isometric cue. This is why the belt
  leaves the `+x` rim along `+y`.
- **Screen → plane, for `y = const`:** `x = at.x + sx`, `z = at.z + sx/2 − sy`.
  This is how the headphone arch is laid out in screen space and pushed back into
  the scene.
- **A circular arc in a vertical world plane cannot project to a symmetric arch.**
  Screen height goes as `½R·cosθ − R·sinθ`, so the apex sits at `tan θ = −2`,
  about `0.45R` off the chord's midpoint. The arch looked drunk until it was built
  as a true circle *on screen* instead. Keep that header comment.
- **Cap-plane inversion**, for a disc in the y–z plane: a world offset `(dy, dz)`
  lands at screen `(−dy, dy/2 − dz)`; inverting, a wanted screen offset `(sx, sy)`
  needs `dy = −sx` and `dz = −sx/2 − sy`. A point is inside the cup iff
  `sx² + (sx/2 + sy)² ≤ R²`.
- **A cup's rightmost point is also its farthest.** Along the ray `(t, −t/2)·R`
  the `(sx/2 + sy)` term cancels, making it the cup's horizontal screen axis with
  `t = 1` on the rim; and since `dy = −sx`, moving right means moving to smaller
  `y`. Lakshya asked for "rightmost" and "farthest from the viewer" as if they
  were two constraints — they are one point.
- **Tangency survives affine projection.** A line touching the footprint circle at
  one world point touches the screen ellipse at that same point.

## Drawing traps in this file

- **Catmull-Rom (`smooth: true`) overshoots its control points.** Two arcs meeting
  in a square corner grow a barb; a two-point chord bows into a rounded nose (the
  dumbbell's old "baguette"). The headband is sampled every four degrees and left
  unsmoothed for exactly this reason.
- **`plate()` emits two parts, a body silhouette *and* a cap.** Stack two plates
  close together and you get three or four arcs within a couple of units on the
  cup's upper-left, which pile into an onion. The counter-intuitive fix is to pull
  the inner plate *in* and push it *further* proud, not to nestle it.
- **A wash's contrast against the page is load-bearing for thin objects.**
  `tests/desk-objects.test.ts` requires every wash to clear `ink.ground`
  (`#04060a`) by a ratio above 1.4 — a luminance floor near 0.0225. A large
  outlined object survives a dark wash because it reads on its silhouette; a thin
  strap is almost all fill and comes out as an empty frame.
- **A stroke has no width in the drawing's own terms.** Four gold strokes on a
  belt read as four rods standing in a row. Filled quads read as markings, and the
  charcoal between them becomes material.
- **Geometric fit is not visual fit.** Several parts here were arithmetically
  correct and looked wrong, and the only way that was ever discovered was by
  screenshotting and looking.

## How to verify

From `C:\Users\itsla\LakshyaPortfolio\web`, with the dev server already running
(`/lab` 404s in production by design):

```powershell
npm.cmd run generate:desk   # must report no overlaps beyond budget
npm.cmd run shot -- taekwondo music gym
npm.cmd run check           # validate:content + lint + typecheck + test
npm.cmd run build
npx.cmd tsx scripts/contact-sheet.ts --path / --name scene-final --width 1800
```

Last run: **83 tests in 10 files passed**, build succeeded, 19 static pages.

`npm run shot -- <key>` writes `web/.desk-review/obj-<key>.png` at 3×, which is
the only way to judge an object. The contact sheet confirms the code did what was
intended; it cannot show whether the drawing is any good. **Read every PNG before
reporting anything** — Lakshya has called this out more than once.

Bare `/` as a `--path` argument must go through the **PowerShell** tool. The Bash
tool rewrites it into the Git-for-Windows install root.

For sub-object detail there is no committed tool. Copy `scripts/shot-object.mjs`
into the scratchpad and replace the `clip` with a fraction of the tile's
bounding box at `scale: 8` — that is how the belt's join was diagnosed, and it
showed a filled slot that was invisible at 3×.

### Debug passes

Recolouring parts and re-shooting is cheap and has caught things reasoning did
not. Both of these were run and then reverted this session: the belt's three
faces in magenta (which is how the phantom end cap was found), and a three-colour
coil/tail/stripe pass to prove the two pieces touch with no background gap.
**Always revert the colours before reporting.**

## Standing constraints

Unchanged, and none of them expired with the artwork:

- **No deploying to Vercel, no analytics, no domain, no publishing** without new
  authorization. Committing and pushing is Lakshya's call, not a default.
- **No resumes on the site** — no route, PDF, nav label, sitemap entry, or public
  asset. Private resumes and LinkedIn PDFs are editorial source only and must
  never be copied into `public/`.
- **Cisco is approved subject matter in principle, but the omission review is
  still owed.** No customer identifiers, internal diagrams, logs, credentials, or
  uncleared metrics. This has been outstanding for several sessions.
- **Never fabricate** responsibilities, outcomes, metrics, links, or technical
  decisions. Never invent Lighthouse or trace numbers — run the tool or say the
  measurement was not performed.
- Relationship wording stays public and indirect ("people I care about"). Do not
  name or depict Lakshya's girlfriend without new approval.
- Copied character artwork is excluded. **Kirby is the one exception** and was
  explicitly authorised.
- The Software / Hybrid / Hardware colours and the ten-project branch membership
  are locked product semantics.

## What the older handoff gets wrong

`docs/claude-code-ui-handoff.md` still says:

1. **"Substantial uncommitted Phase 1 and Phase 2 work."** No longer true — the
   tree is clean and everything is on `main`.
2. **The desk is a rejected hand-authored SVG at `lakshya-desk.svg`.** Superseded.
   The scene is generated data and the artwork has been through a full rebuild and
   a per-object review.
3. **"Vitest: 9 files, 64 tests."** It is 10 files and 83 tests.

Its content rules, locked semantics, performance constraints, and publication
constraints are all still current. Its list of open questions about visual
direction is largely answered by the scene as built.

## Open items

- **The 3D lettering.** The top-right block described in the layout pass is
  reserved and empty, waiting for it. Nothing has been drawn or specified yet.
- **The Cisco omission review.** The oldest outstanding item on the project.
- Phases 3 and later of `docs/desk-project-tree-redesign-phases.md` have not
  started and are gated on Lakshya's explicit approval.
- The `footprintWinding` orientation, above — a known defect with a known blast
  radius, deliberately left alone.
