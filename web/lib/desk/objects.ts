/**
 * The object library, drawn as monochrome isometric line art.
 *
 * Following guochen.design: solid faces filled with the page ground so they
 * occlude the grid, interior detail as unfilled stroked paths, and anything
 * genuinely round — canopies, heads, the duck — drawn as a screen-space
 * silhouette rather than a projected solid, exactly as his cat, Totoro, and
 * tree canopies are.
 *
 * There are no materials and no shading. That removes the entire class of
 * problem the shaded build kept hitting: a shape either reads from its outline
 * or it does not.
 *
 * Parts are listed back-to-front within each builder, because the generator
 * paints an object's parts in array order.
 *
 * Real marks are allowed where they identify a tool or influence — the monitor
 * screen credits the stack this site is built with. Copied character art is not,
 * since that is someone else's drawing rather than an identifier.
 *
 * Colour is not decoration here. An object takes a hue from `palette` only when
 * the real thing has that colour and the colour is part of how you recognise it:
 * matcha is green, an Arduino is teal, the duck was printed in green filament.
 * Everything else stays in the two greys.
 */

import {
  box,
  circle,
  cylinder,
  detail,
  disc,
  face,
  groundShadow,
  hue,
  hueLine,
  ink,
  palette,
  pyramid,
  rounded,
  silhouette,
  slab,
  type DeskPart,
  type PaletteName,
} from "@/lib/desk/parts";
import { polygonFootprint, type Point2 } from "@/lib/desk/projection";

type At = Readonly<{ x: number; y: number; z: number }>;

/** Screen-space ellipse offsets, for silhouettes drawn against a world anchor. */
function ovalOffsets(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  segments = 20,
): readonly Point2[] {
  return Array.from({ length: segments }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2;
    return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry };
  });
}

/**
 * A flat filled circle lying in the ground plane — a rice bed, a lid, a coaster.
 *
 * Distinct from `disc`, which is a solid with a wall. This is the surface alone,
 * for stacking coloured layers on top of something that already has a body.
 */
function flatDisc(
  center: Point2,
  radius: number,
  z: number,
  options: Parameters<typeof face>[1] = {},
): DeskPart {
  return face(
    polygonFootprint(center, radius, radius, 24).map((point) => ({
      ...point,
      z,
    })),
    { smooth: true, ...options },
  );
}

/**
 * A disc whose axis runs along +x — a dumbbell plate, a wheel, a roller.
 *
 * `cylinder` only builds vertical axes, and squashing one to fake a horizontal
 * axis gives a coin lying down, not a wheel standing up. Here the cap is a real
 * circle in the y–z plane and the band between the two caps is that circle swept
 * along the axis.
 *
 * The sweep moves a point by `(Δx, Δx/2)` on screen, so the outline stops
 * turning where the rim is parallel to that — and working it through, the
 * extremes land at 3π/4 and −π/4, the very same tangent angles a vertical
 * cylinder has. One less thing that can be subtly wrong.
 */
function plate(
  center: Readonly<{ y: number; z: number }>,
  radius: number,
  fromX: number,
  toX: number,
  options: Parameters<typeof face>[1] = {},
  /**
   * How the two ends are finished.
   *
   * A bar running into a plate needs `farEnd: "flush"` and no near cap: its far
   * rim is buried in the plate's face and its near rim in the other plate's.
   * Drawing them anyway put a full rim curve across the left plate, which is
   * what made the grip look like it passed through the weight rather than into
   * it.
   */
  ends: Readonly<{ farEnd?: "round" | "flush"; capped?: boolean }> = {},
): readonly DeskPart[] {
  const { farEnd = "round", capped = true } = ends;
  const tangent = { left: (Math.PI * 3) / 4, right: -Math.PI / 4 };

  const rim = (x: number, angle: number) => ({
    x,
    y: center.y + Math.cos(angle) * radius,
    z: center.z + Math.sin(angle) * radius,
  });

  const arc = (x: number, from: number, to: number, steps = 14) =>
    Array.from({ length: steps + 1 }, (_, index) =>
      rim(x, from + ((to - from) * index) / steps),
    );

  // The band: the far cap's outer half, then the near cap's, which together
  // close the silhouette without either arc doubling back on itself. A flush far
  // end replaces that first arc with the chord between its two tangent points —
  // a straight edge that sits inside whatever the bar disappears into.
  const far =
    farEnd === "flush"
      ? [rim(fromX, tangent.left), rim(fromX, tangent.right)]
      : arc(fromX, tangent.left, tangent.right);

  return [
    face([...far, ...arc(toX, tangent.right + Math.PI * 2, tangent.left)], {
      smooth: true,
      ...options,
    }),
    // Only the +x cap faces the camera; the far one is culled by being drawn
    // over, exactly as the band is.
    ...(capped
      ? [face(arc(toX, 0, Math.PI * 2, 24), { smooth: true, ...options })]
      : []),
  ];
}

// ---------------------------------------------------------------------------
// Scenery
// ---------------------------------------------------------------------------

/**
 * Guo's trees are lollipops: a thin trunk with a small round canopy. Fourteen of
 * them are most of what makes his field read as a place rather than a shelf.
 */
export function tree(at: At, height = 22, canopy = 7): readonly DeskPart[] {
  return [
    groundShadow({ x: at.x, y: at.y }, canopy * 0.55, canopy * 0.55, at.z),
    cylinder({ x: at.x, y: at.y }, 1.1, at.z, height, { segments: 6 }),
    circle({ x: at.x, y: at.y, z: at.z + height }, canopy, { segments: 20 }),
  ];
}

/**
 * A person, at Guo's scale: a plain isometric-box silhouette with a circle for a
 * head, and deliberately no interior lines. They give the field its sense of
 * size — everything else is read against them.
 */
export function figure(at: At): readonly DeskPart[] {
  const half = 5;
  const body = 11;
  const rise = 3;

  return [
    groundShadow({ x: at.x, y: at.y }, 3.4, 3.4, at.z),
    // Hexagonal silhouette of a small upright box, drawn in one path.
    silhouette({ x: at.x, y: at.y, z: at.z }, [
      { x: half, y: -rise - body },
      { x: half, y: -rise },
      { x: 0, y: 0 },
      { x: -half, y: -rise },
      { x: -half, y: -rise - body },
      { x: 0, y: -rise - body - rise },
    ]),
    circle({ x: at.x, y: at.y, z: at.z }, 4, {
      segments: 18,
      cy: -rise - body - rise - 3.6,
    }),
  ];
}

/** Guo has a plain cube in his field. It sets the isometric language. */
export function cube(at: At, size = 14): readonly DeskPart[] {
  return [
    box(
      { x: at.x, y: at.y, z: at.z },
      { width: size, depth: size, height: size },
      { shadow: size * 0.3 },
    ),
  ];
}

/**
 * The colophon object: what this site is built with.
 *
 * The screen carries abstract glyphs rather than words — at 46 units wide, real
 * text is unreadable, so the credits live in the popup and the screen only has
 * to say "this is a machine someone works on". The exception is the Claude mark,
 * which is drawn as its own thing in its own orange.
 */
export function monitor(at: At): readonly DeskPart[] {
  const width = 46;
  const panelHeight = 27;
  const panelZ = at.z + 12;
  const screenY = at.y + 8.1;

  /** A point on the screen's face, in screen-local (across, up) units. */
  const on = (across: number, up: number) => ({
    x: at.x + across,
    y: screenY,
    z: panelZ + up,
  });

  return [
    rounded({ x: at.x + 14, y: at.y + 2 }, 18, 10, at.z, 1.4, {
      radius: 3,
      shadow: 3,
    }),
    box(
      { x: at.x + 20, y: at.y + 4, z: at.z + 1.4 },
      { width: 6, depth: 5, height: 11 },
    ),
    box(
      { x: at.x, y: at.y + 4, z: panelZ },
      { width, depth: 4, height: panelHeight },
    ),
    // Screen inset.
    detail([on(3, 3), on(width - 3, 3), on(width - 3, panelHeight - 3), on(3, panelHeight - 3)]),
    // A window with a title bar, then ragged lines of code inside it.
    detail([on(6, 6), on(26, 6), on(26, 21), on(6, 21)]),
    detail([on(6, 18), on(26, 18)]),
    ...[
      { top: 15.5, length: 13 },
      { top: 13, length: 9 },
      { top: 10.5, length: 15 },
      { top: 8, length: 7 },
    ].map((line) => detail([on(8, line.top), on(8 + line.length, line.top)])),
    ...claudeMark(on, { across: width - 12, up: 13.5 }, 6.5),
  ];
}

/**
 * Claude's mark, drawn in the plane of whatever surface it sits on.
 *
 * A radial burst of tapered rays. Drawn in the screen's own plane rather than in
 * screen space, so it shears with the monitor like something displayed on it
 * instead of a sticker floating in front.
 *
 * This is an approximation built from the mark's construction — a ring of
 * alternating long and short spokes — not a trace of the original artwork.
 */
function claudeMark(
  on: (across: number, up: number) => Readonly<{ x: number; y: number; z: number }>,
  center: Readonly<{ across: number; up: number }>,
  radius: number,
): readonly DeskPart[] {
  const rays = 11;
  const spread = 0.17;
  const inner = radius * 0.14;

  return Array.from({ length: rays }, (_, index) => {
    const angle = (index / rays) * Math.PI * 2 - Math.PI / 2;
    const outer = radius * (index % 2 === 0 ? 1 : 0.82);
    const point = (a: number, r: number) =>
      on(center.across + Math.cos(a) * r, center.up + Math.sin(a) * r);

    return face(
      [
        point(angle - spread, inner),
        point(angle, outer),
        point(angle + spread, inner),
      ],
      { accent: ink.claude },
    );
  });
}

export function keyboard(at: At): readonly DeskPart[] {
  const width = 42;
  const depth = 15;

  return [
    rounded({ x: at.x, y: at.y }, width, depth, at.z, 1.6, {
      radius: 1.6,
      shadow: 2,
    }),
    ...Array.from({ length: 4 }, (_, row) =>
      detail([
        { x: at.x + 3, y: at.y + 2.6 + row * 3, z: at.z + 1.6 },
        { x: at.x + width - 3, y: at.y + 2.6 + row * 3, z: at.z + 1.6 },
      ]),
    ),
  ];
}

/**
 * A straight-post lamp. The first version had a leaning arm carrying an offset
 * shade, and in line art the arm read as a bent tube rather than an arm — with
 * no shading there is nothing to tell a cylinder from a pipe. Simple silhouettes
 * are the whole point of this style.
 */
export function deskLamp(at: At): readonly DeskPart[] {
  const postZ = at.z + 1.4;
  const postHeight = 19;
  const shadeZ = postZ + postHeight;

  return [
    disc({ x: at.x, y: at.y }, 6, at.z, 1.4, { shadow: 2.5 }),
    cylinder({ x: at.x, y: at.y }, 1.3, postZ, postHeight, { segments: 6 }),
    // Cone opening downward: `taper` scales the top, so it stays below 1.
    cylinder({ x: at.x, y: at.y }, 7.5, shadeZ, 7, { segments: 14, taper: 0.34 }),
  ];
}

/**
 * The Illinois marker, Guo's Taipei 101 equivalent: a square tower with a
 * pyramidal roof and a clock face, in the spirit of Altgeld. The Alma Mater was
 * the other candidate and was rejected — a statue will not read at this scale.
 */
export function clockTower(at: At): readonly DeskPart[] {
  const baseWidth = 12;
  const baseDepth = 10;
  const baseHeight = 19;
  const belfryWidth = 8;
  const belfryZ = at.z + baseHeight;
  const inset = (baseWidth - belfryWidth) / 2;

  // The clock face sits on the wall turned toward the camera. A circle drawn in
  // that vertical plane projects to a slanted ellipse, which is what makes it
  // read as mounted on the tower rather than floating in front of it.
  const faceY = at.y + baseDepth + 0.1;
  const faceX = at.x + baseWidth / 2;
  const faceZ = at.z + 12.5;
  const faceRadius = 3.6;

  const onFace = (angle: number, scale: number) => ({
    x: faceX + Math.cos(angle) * faceRadius * scale,
    y: faceY,
    z: faceZ + Math.sin(angle) * faceRadius * scale,
  });

  return [
    box(
      { x: at.x, y: at.y, z: at.z },
      { width: baseWidth, depth: baseDepth, height: baseHeight },
      { shadow: 3 },
    ),
    // Dial, then twelve ticks around it.
    face(
      Array.from({ length: 24 }, (_, index) =>
        onFace((index / 24) * Math.PI * 2, 1),
      ),
      { smooth: true },
    ),
    ...Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2;
      // The quarter-hours read longer, as they do on a real dial.
      const inner = index % 3 === 0 ? 0.62 : 0.76;
      return detail([onFace(angle, inner), onFace(angle, 0.9)]);
    }),
    box(
      { x: at.x + inset, y: at.y + inset, z: belfryZ },
      { width: belfryWidth, depth: baseDepth - inset * 2, height: 8 },
    ),
    // A real pyramid, with an apex and two visible triangular faces. It used to
    // be a four-segment cone tapered to almost nothing, which gave it a curved
    // base and read as a conical hat rather than a roof.
    // Wound to match the extruder's outward-normal convention, so the two faces
    // that survive culling are the pair turned toward the camera. The other
    // winding draws the back pair and the belfry shows straight through the roof.
    pyramid(
      [
        { x: at.x + baseWidth / 2 - 5.5, y: at.y + baseDepth / 2 - 4.5 },
        { x: at.x + baseWidth / 2 - 5.5, y: at.y + baseDepth / 2 + 4.5 },
        { x: at.x + baseWidth / 2 + 5.5, y: at.y + baseDepth / 2 + 4.5 },
        { x: at.x + baseWidth / 2 + 5.5, y: at.y + baseDepth / 2 - 4.5 },
      ],
      belfryZ + 8,
      9,
    ),
  ];
}

// ---------------------------------------------------------------------------
// Hotspot objects — one per motif group
// ---------------------------------------------------------------------------

/**
 * maker-origin: fifty-plus Arduino builds documented in public.
 *
 * The board, a breadboard, jumper wires and a lit LED. This deliberately
 * reverses the earlier trim to one object per hotspot: a bare board reads as a
 * tile, and what makes it read as *electronics* is having something wired to it.
 * The trim was right in general and wrong here.
 *
 * The first attempt at a wired build failed for a different reason — everything
 * was drawn the same grey at twenty screen units and came out a dotted tray
 * beside a plate. With the board in Arduino teal, the breadboard in white and
 * the wires in their own colours, the same arrangement separates.
 */
export function devBoard(at: At): readonly DeskPart[] {
  const width = 26;
  const depth = 18;
  const boardHeight = 1;
  const boardZ = at.z + boardHeight;

  return [
    rounded({ x: at.x, y: at.y }, width, depth, at.z, boardHeight, {
      radius: 1,
      shadow: 1.8,
      ...hue("arduino"),
    }),
    // Two full-length header strips. These are the board's signature, and the
    // first attempt made them too shallow to register — at 1.4 units tall they
    // read as specks on a tray. Standing tall and running the length of the
    // board, they are what makes this a dev board rather than a slab.
    ...[1.6, depth - 3.8].map((row) =>
      box(
        { x: at.x + 3, y: at.y + row, z: boardZ },
        { width: width - 7, depth: 2.2, height: 2.4 },
        hue("connector"),
      ),
    ),
    // USB-B and barrel jacks, standing proud of the near end.
    box(
      { x: at.x - 3.5, y: at.y + 3, z: boardZ },
      { width: 7.5, depth: 7, height: 5 },
      hue("connector"),
    ),
    box(
      { x: at.x - 3, y: at.y + 11.5, z: boardZ },
      { width: 6, depth: 5, height: 4 },
      hue("connector"),
    ),
    // The Arduino mark, silkscreened between the headers: two overlapping loops.
    // The full logo carries a plus and a minus inside them, and at this size
    // those turned the mark into a pair of spectacles — the loops alone still
    // read as the infinity, and stop competing with the board.
    ...[-1.9, 1.9].map((offset) =>
      face(
        polygonFootprint(
          { x: at.x + 9 + offset, y: at.y + depth / 2 },
          2.4,
          2.4,
          16,
        ).map((point) => ({ ...point, z: boardZ + 0.02 })),
        { outlineOnly: true, smooth: true, ...hueLine("silkscreen") },
      ),
    ),
    // The silkscreened dash border. Drawn as separate ticks along the board's own
    // top plane rather than as a stroke-dasharray, because the generated SVG is
    // deliberately free of presentation attributes the scene cannot reason about.
    ...[0, 1].flatMap((side) =>
      Array.from({ length: 7 }, (_, step) => {
        const x = at.x + 3.2 + step * 2.9;
        const y = at.y + (side === 0 ? 0.9 : depth - 0.9);
        return face(
          [
            { x, y, z: boardZ + 0.02 },
            { x: x + 1.5, y, z: boardZ + 0.02 },
          ],
          { outlineOnly: true, open: true, ...hueLine("silkscreen") },
        );
      }),
    ),
    // The breadboard, tucked in directly behind the board so the two read as one
    // build. Set off to the side it looked like a separate white tray.
    rounded({ x: at.x + 3, y: at.y - 12 }, 19, 9, at.z, 2.4, {
      radius: 0.8,
      shadow: 1.6,
      ...hue("silkscreen"),
    }),
    // The centre channel, which is the one mark that says breadboard.
    face(
      [
        { x: at.x + 5, y: at.y - 7.5, z: at.z + 2.42 },
        { x: at.x + 20, y: at.y - 7.5, z: at.z + 2.42 },
      ],
      { outlineOnly: true, open: true, ...hueLine("connector") },
    ),
    // Two rails of holes, one either side of the channel. Eight columns rather
    // than a real breadboard's sixty: at this size the full grid turns the top
    // face into grey noise, and the point is only that the rails are perforated.
    ...[-2.6, 2.6].flatMap((row) =>
      Array.from({ length: 8 }, (_, step) => {
        const x = at.x + 5.4 + step * 2;
        const y = at.y - 7.5 + row;
        return face(
          [
            { x, y, z: at.z + 2.42 },
            { x: x + 0.5, y, z: at.z + 2.42 },
          ],
          { outlineOnly: true, open: true, ...hueLine("connector") },
        );
      }),
    ),
    // A small green component seated across the channel, and a lit LED beside it.
    box(
      { x: at.x + 7.4, y: at.y - 9.6, z: at.z + 2.4 },
      { width: 3.4, depth: 4.2, height: 1.8 },
      hue("holdGreen"),
    ),
    cylinder({ x: at.x + 15, y: at.y - 5.4 }, 1.1, at.z + 2.4, 2.4, {
      segments: 12,
      ...hue("led"),
    }),
    // Three jumper wires from the board's back header to the breadboard. Each
    // rises clear between its endpoints, because a wire drawn as a straight
    // segment reads as a strut.
    ...[
      { colour: "wireWarm", fromX: 6, toX: 6.4, lift: 3.4 },
      { colour: "led", fromX: 9, toX: 9.4, lift: 2.8 },
      { colour: "wireCool", fromX: 12, toX: 14.6, lift: 2.4 },
    ].map(({ colour, fromX, toX, lift }) =>
      face(
        Array.from({ length: 11 }, (_, step) => {
          const t = step / 10;
          const start = { x: at.x + fromX, y: at.y + 1.6 };
          const end = { x: at.x + toX, y: at.y - 5.4 };
          return {
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t,
            z: at.z + 3.4 + Math.sin(Math.PI * t) * lift,
          };
        }),
        { outlineOnly: true, open: true, ...hueLine(colour as PaletteName) },
      ),
    ),
  ];
}

/**
 * quackta: rubber-duck debugging turned into a physical teaching assistant.
 *
 * Drawn as a screen-space silhouette. Eleven attempts to build a duck from
 * projected solids all failed the same way — the body and head are adjacent
 * masses of the same tone and fuse into one cone no matter how they are
 * proportioned. A profile has no such problem, and it is precisely how Guo draws
 * his cat and his Totoro.
 *
 * Not a rubber duck: this one was printed in green PLA with a hollow belly, and
 * the opening in its flank is where the wing mounted and where the board and
 * wiring went in. That opening is the most specific thing about the object, so
 * it is drawn with the electronics visible inside rather than closed up — a
 * plain green duck would say nothing that the yellow one did not.
 */
export function duck(at: At): readonly DeskPart[] {
  const anchor = { x: at.x, y: at.y, z: at.z };

  return [
    groundShadow({ x: at.x, y: at.y }, 8, 8, at.z),
    // One continuous profile: tail, back, head, bill, breast, belly. Smoothed,
    // because the previous version's flat segments were the whole complaint —
    // it drew a duck-shaped polygon rather than a duck.
    silhouette(
      anchor,
      [
        { x: -18, y: -16 },
        { x: -12, y: -13 },
        { x: -6, y: -17 },
        { x: 1, y: -20 },
        { x: 2, y: -26 },
        { x: 5, y: -31 },
        { x: 10, y: -32 },
        { x: 15, y: -29 },
        { x: 16, y: -26 },
        { x: 23, y: -24 },
        { x: 15, y: -21 },
        { x: 13, y: -18 },
        { x: 12, y: -12 },
        { x: 9, y: -4 },
        { x: 3, y: -1 },
        { x: -6, y: -1 },
        { x: -13, y: -4 },
        { x: -17, y: -9 },
      ],
      { smooth: true, ...hue("filament") },
    ),
    // The far side of the body, in the darker wash. A single filled silhouette
    // is a flat duck no matter how good the outline is; this crescent along the
    // upper back is the one thing that says the body has a round side turning
    // away from the light.
    silhouette(
      anchor,
      [
        { x: -16, y: -14 },
        { x: -11, y: -12 },
        { x: -5, y: -16 },
        { x: 1, y: -19.5 },
        { x: 2, y: -25.5 },
        { x: 6, y: -30 },
        { x: 9, y: -31.5 },
        { x: 4, y: -28 },
        { x: 0, y: -23 },
        { x: -3, y: -17.5 },
        { x: -10, y: -14.5 },
      ],
      { smooth: true, ...hue("filamentShade") },
    ),
    // The cutaway in the flank. Filled with the page ground rather than a colour
    // so it reads as a hole into a hollow body — anything lighter here and it
    // becomes a sticker on the outside.
    silhouette(anchor, ovalOffsets(-3, -11, 7.4, 5.8), {
      smooth: true,
      stroke: palette.filament.line,
      fill: ink.ground,
    }),
    // The module seated inside, with its own header strip.
    silhouette(
      anchor,
      [
        { x: -7.6, y: -13.2 },
        { x: 1.6, y: -13.2 },
        { x: 1.6, y: -9.4 },
        { x: -7.6, y: -9.4 },
      ],
      hue("arduino"),
    ),
    silhouette(
      anchor,
      [
        { x: -7, y: -12.6 },
        { x: 1, y: -12.6 },
      ],
      { outlineOnly: true, open: true, ...hueLine("silkscreen") },
    ),
    // Three jumper wires leaving the module and routing down into the belly.
    // Each is a curve with a visible endpoint rather than a stub, and every one
    // stays inside the cavity's rim.
    ...[
      { colour: "wireWarm", from: -6, bend: -1.6 },
      { colour: "led", from: -3.4, bend: 0.4 },
      { colour: "wireCool", from: -0.8, bend: 1.8 },
    ].map(({ colour, from, bend }) =>
      silhouette(
        anchor,
        Array.from({ length: 7 }, (_, step) => {
          const t = step / 6;
          return {
            x: from + bend * t + Math.sin(Math.PI * t) * 1.1,
            y: -9.4 + t * 4.4,
          };
        }),
        { outlineOnly: true, open: true, ...hueLine(colour as PaletteName) },
      ),
    ),
    circle(anchor, 1.4, { segments: 12, cx: 11, cy: -27 }),
  ];
}

/**
 * taekwondo: a fourth-degree black belt, tied.
 *
 * The arrangement is a broad loop at the rear, a compact knot in front of it,
 * and two tails running out toward the viewer. It is built as a ring of webbing
 * lying on the grid rather than a belt worn upright, and that choice is the
 * whole reason this version works: a knot with a strap running out to both sides
 * and two tails hanging below is anatomically a torso with arms and legs, and
 * every upright attempt read as a creature no matter how the proportions were
 * tuned. The symmetry was the problem, not the drawing.
 *
 * Lying down, the loop is unmistakably a loop, the knot sits off-centre on its
 * near rim, and the tails run off to one side — nothing left to mistake for a
 * body. Cloth thickness comes from real extruded solids throughout; every piece
 * has a top face and a wall.
 */
export function belt(at: At): readonly DeskPart[] {
  const black = { stroke: palette.beltBlack.line, fill: palette.beltBlack.wash };
  const cloth = 2.2;
  const outer = 13;
  const inner = 7.4;
  const topZ = at.z + cloth;
  const knotZ = topZ;
  const knotHeight = 3.6;
  const tailZ = topZ - 0.6;

  return [
    // The rear loop: an outer wall and top face, with the hole punched through
    // it. A ring has no primitive of its own, so the opening is the page ground
    // laid back over the top face and rimmed — which is all the eye needs, since
    // the far inner wall is the only part of the hole that would ever show.
    cylinder({ x: at.x, y: at.y }, outer, at.z, cloth, {
      segments: 24,
      shadow: 2.2,
      ...black,
    }),
    flatDisc({ x: at.x, y: at.y }, inner, topZ + 0.01, {
      stroke: palette.beltBlack.line,
      fill: ink.ground,
    }),
    // A short arc of the far inner wall, so the hole has a depth to it.
    face(
      Array.from({ length: 9 }, (_, step) => {
        const angle = Math.PI * (1.08 + (step / 8) * 0.84);
        return {
          x: at.x + Math.cos(angle) * inner,
          y: at.y + Math.sin(angle) * inner,
          z: at.z + 0.3,
        };
      }),
      { outlineOnly: true, open: true, stroke: palette.beltBlack.line },
    ),
    // Two tails, at slightly different angles so neither reads as the other's
    // mirror. Each is a parallelogram rather than a free quadrilateral: a tail
    // that tapers makes its own rank stripes taper with it, and four bars of
    // four different lengths read as a mistake rather than as a rank.
    ...[
      { origin: { x: -3.4, y: 9 }, run: { x: 4.6, y: 15.4 }, width: { x: 5.2, y: 1.2 }, lift: 0 },
      { origin: { x: 2.6, y: 8.4 }, run: { x: 12.4, y: 8.6 }, width: { x: 5.4, y: -0.6 }, lift: cloth * 0.5 },
    ].map(({ origin, run, width, lift }) =>
      slab(
        [
          { x: at.x + origin.x, y: at.y + origin.y },
          { x: at.x + origin.x + width.x, y: at.y + origin.y + width.y },
          {
            x: at.x + origin.x + width.x + run.x,
            y: at.y + origin.y + width.y + run.y,
          },
          { x: at.x + origin.x + run.x, y: at.y + origin.y + run.y },
        ],
        tailZ + lift,
        cloth,
        black,
      ),
    ),
    // The four rank stripes, across the near tail and following its own axis
    // rather than the grid's.
    ...Array.from({ length: 4 }, (_, index) => {
      const t = 0.48 + index * 0.13;
      const originX = at.x + 2.6 + 12.4 * t;
      const originY = at.y + 8.4 + 8.6 * t;
      return face(
        [
          { x: originX + 0.7, y: originY - 0.1, z: tailZ + cloth * 1.5 + 0.02 },
          { x: originX + 4.7, y: originY - 0.5, z: tailZ + cloth * 1.5 + 0.02 },
        ],
        { outlineOnly: true, open: true, ...hueLine("beltGold") },
      );
    }),
    // The knot, last and highest, so both tails and the loop run behind it.
    rounded({ x: at.x - 4.5, y: at.y + 4 }, 11, 9, knotZ, knotHeight, {
      radius: 2.6,
      ...black,
    }),
    // One crease across the knot's top face, which is what keeps it from
    // reading as a pebble.
    face(
      [
        { x: at.x - 3, y: at.y + 8.2, z: knotZ + knotHeight + 0.02 },
        { x: at.x + 5, y: at.y + 5.4, z: knotZ + knotHeight + 0.02 },
      ],
      { outlineOnly: true, open: true, stroke: palette.beltBlack.line },
    ),
  ];
}

/**
 * scouting: an Eagle Scout's compass.
 *
 * Also its own object. The lid, case, dial and needle previously merged into one
 * lump at the size it was drawn; the lid is gone and the remaining three parts
 * are spaced in depth so each keeps its own outline.
 */
export function compass(at: At): readonly DeskPart[] {
  const center = { x: at.x, y: at.y };
  const caseHeight = 5;
  const dialZ = at.z + caseHeight;

  return [
    cylinder(center, 7.5, at.z, caseHeight, {
      segments: 18,
      shadow: 1.8,
      rings: [0.8],
    }),
    // The case seam, on the side wall rather than across the top face — it runs
    // round the body of a real compass, so it has to follow the wall's curve and
    // stop at the two silhouette edges. Cutting it across the dial instead was
    // the tell that this was a lid drawn from the front.
    face(
      Array.from({ length: 13 }, (_, step) => {
        const angle = -Math.PI / 4 + (step / 12) * Math.PI;
        return {
          x: center.x + Math.cos(angle) * 7.5,
          y: center.y + Math.sin(angle) * 7.5,
          z: at.z + caseHeight * 0.45,
        };
      }),
      { outlineOnly: true, open: true },
    ),
    // Needle: a long thin diamond across the dial, the one mark that says
    // compass rather than tin.
    face([
      { x: center.x - 0.9, y: center.y - 0.9, z: dialZ + 0.1 },
      { x: center.x + 3.6, y: center.y - 3.6, z: dialZ + 0.1 },
      { x: center.x + 0.9, y: center.y + 0.9, z: dialZ + 0.1 },
      { x: center.x - 3.6, y: center.y + 3.6, z: dialZ + 0.1 },
    ]),
  ];
}

/**
 * shared-food: good matcha, boba, and unhurried time with people.
 *
 * Two cups, deliberately overlapping into one still life — "shared" needs the
 * pair, so this is the one hotspot that keeps a second object, drawn as a single
 * grouped composition rather than two separated things.
 *
 * Both are screen-space profiles now. As projected round solids their convex
 * hulls merged with their own cast shadows and they appeared to melt into the
 * floor; a profile with an explicit base curve sits on the ground instead.
 */
export function twoCups(at: At): readonly DeskPart[] {
  /**
   * One drink: a tapered body, a sealed lid with real rim thickness, a straw
   * through it, and pearls settled in the bottom.
   *
   * Built from projected solids rather than screen-space profiles. The profiles
   * were a stopgap from when round solids had no curved base and appeared to
   * melt into the floor; now that a cylinder has a genuine lower arc, a cup can
   * just be a cup — and the lid gains a top face and a wall it never had.
   */
  const cup = (
    offset: Point2,
    scale: number,
    tea: PaletteName,
  ): readonly DeskPart[] => {
    const center = { x: at.x + offset.x, y: at.y + offset.y };
    const base = 5.4 * scale;
    const body = 13 * scale;
    const flare = 1.28;
    const lidZ = at.z + body;
    const lidRadius = base * flare + 0.9 * scale;

    return [
      cylinder(center, base, at.z, body, {
        segments: 24,
        taper: flare,
        shadow: 1.8,
        ...hue(tea),
      }),
      // Pearls first, then the lid: they sit inside the cup, so the body's own
      // outline has to stay in front of them at the sides.
      ...[
        { dx: -0.52, dy: 0.1 },
        { dx: 0.04, dy: -0.34 },
        { dx: 0.5, dy: 0.16 },
        { dx: -0.22, dy: 0.5 },
        { dx: 0.28, dy: 0.62 },
      ].map((spot) =>
        circle({ x: center.x, y: center.y, z: at.z }, 1.5 * scale, {
          segments: 12,
          cx: spot.dx * base * 1.5,
          cy: -3.2 * scale + spot.dy * 2.4 * scale,
          ...hue("pearl"),
        }),
      ),
      // The straw, leaning out through the lid.
      cylinder(
        { x: center.x + 1.4 * scale, y: center.y - 1.2 * scale },
        0.85 * scale,
        lidZ,
        11 * scale,
        { segments: 10, lean: { x: 1.6, y: -1.4 }, ...hue("cocoa") },
      ),
      // The sealed lid: a short cylinder, so it has a top face and a rim wall
      // instead of being a flat cap.
      cylinder(center, lidRadius, lidZ, 1.7 * scale, {
        segments: 24,
        ...hue("lid"),
      }),
    ];
  };

  return [
    // Far drink first, then the near one, so the near cup's wall occludes it.
    ...cup({ x: 9, y: -7 }, 0.86, "matcha"),
    ...cup({ x: -3, y: 3 }, 1, "thaiTea"),
  ];
}

/**
 * food-favorites: sushi, and the rest of a long rotation.
 *
 * Maki, which is the shape that actually works here: a roll is a cylinder with
 * concentric rings of nori, rice and filling, and every one of those is a real
 * curve now. The old version stacked two rounded slabs per piece and the
 * generator's convex hull left a flat triangular facet hanging off each one —
 * the artifacts under the sushi that Lakshya marked.
 */
export function sushiPlate(at: At): readonly DeskPart[] {
  const plateZ = at.z + 0.8;
  const rollRadius = 3.2;
  const rollHeight = 3;
  const rollTopZ = plateZ + rollHeight;

  const rolls: readonly Point2[] = [
    { x: at.x - 3.6, y: at.y - 2.6 },
    { x: at.x + 1.4, y: at.y - 3.8 },
    { x: at.x + 2.2, y: at.y + 1.8 },
  ];

  return [
    disc({ x: at.x, y: at.y }, 9.5, at.z, 0.8, {
      segments: 18,
      shadow: 2,
      ...hue("silkscreen"),
    }),
    // Each roll: a nori wall, a bed of rice on top, and the filling at the
    // centre. Three flat circles rather than rings, so each layer can carry its
    // own colour instead of all sharing the cylinder's stroke.
    ...rolls.flatMap((center) => [
      cylinder(center, rollRadius, plateZ, rollHeight, {
        segments: 20,
        ...hue("nori"),
      }),
      flatDisc(center, rollRadius * 0.82, rollTopZ + 0.01, hue("rice")),
      flatDisc(center, rollRadius * 0.36, rollTopZ + 0.02, hue("salmon")),
    ]),
    // Chopsticks resting across the rim.
    ...[0, 1.6].map((offset) =>
      box(
        { x: at.x - 8 + offset, y: at.y + 5 + offset, z: plateZ },
        { width: 15, depth: 0.7, height: 0.7 },
        hue("cocoa"),
      ),
    ),
  ];
}

/**
 * climbing: bouldering, and one stubborn route.
 *
 * The hold alone — the chalk bag is gone. A hold is by far the more distinctive
 * of the two, and pairing them meant neither got enough size to read.
 *
 * Drawn as a screen-space profile because a hold is organic: the old version
 * extruded an angular footprint with a hard taper and came out an unreadable
 * wedge. The bolt hole is what settles it as climbing gear rather than a rock.
 */
export function climbingHold(at: At): readonly DeskPart[] {
  const width = 22;
  const depth = 3;
  const height = 26;
  // Holds hang on the face turned toward the camera.
  const wallY = at.y + depth;

  /**
   * Holds are filled in their own colours, and that is what makes them holds.
   * Unfilled they read as bolt holes punched through the panel — three dark
   * openings rather than three things bolted on. Real holds are moulded in
   * bright resin precisely so a climber can pick a route out at a glance.
   */
  const hold = (
    across: number,
    up: number,
    size: number,
    colour: PaletteName,
    offsets: readonly Point2[],
  ) => {
    const anchor = { x: at.x + across, y: wallY, z: at.z + up };
    const scaled = offsets.map((point) => ({
      x: point.x * size,
      y: point.y * size,
    }));

    // The hold twice: a darker copy pushed down-right, then the hold itself over
    // it. That sliver of offset is the whole difference between something bolted
    // onto the panel and something painted on it.
    return [
      silhouette(
        anchor,
        scaled.map((point) => ({ x: point.x + 1.1, y: point.y + 0.9 })),
        {
          smooth: true,
          stroke: palette[colour].wash,
          fill: palette[colour].wash,
        },
      ),
      silhouette(anchor, scaled, { smooth: true, ...hue(colour) }),
    ];
  };

  return [
    box(
      { x: at.x, y: at.y, z: at.z },
      { width, depth, height },
      { shadow: 2 },
    ),
    // A hold on its own reads as a pebble — the first attempt came out a blob
    // with what looked like an eye, and near-identical to the mouse. Bolted to a
    // wall panel there is no ambiguity about what it is.
    ...hold(6, 19, 1, "holdGreen", [
      { x: -4, y: -2.5 },
      { x: -1, y: -4.5 },
      { x: 3, y: -3 },
      { x: 4, y: 1 },
      { x: 0, y: 3 },
      { x: -4, y: 1.5 },
    ]),
    ...hold(15, 12, 0.85, "thaiTea", [
      { x: -4.5, y: -1.5 },
      { x: -1, y: -4 },
      { x: 4, y: -2 },
      { x: 4, y: 2 },
      { x: -1, y: 3.5 },
      { x: -4.5, y: 2 },
    ]),
    ...hold(7, 5.5, 0.7, "holdBlue", [
      { x: -4, y: -3 },
      { x: 2, y: -4 },
      { x: 4.5, y: 0 },
      { x: 1, y: 3.5 },
      { x: -4, y: 2 },
    ]),
  ];
}

/**
 * gym: time under the bar.
 *
 * Three real solids on a horizontal axis. The previous version was one flat
 * screen-space outline — an H with a couple of tick marks — and it read flat
 * because it *was* flat: there was no projection in it anywhere.
 *
 * The axis runs along +x, which projects down and to the right, so the dumbbell
 * lies across the grid the way a dropped one does. Far plate, bar, near plate,
 * in that order, because screen depth grows with x and each solid has to be able
 * to paint over the one behind it.
 */
export function dumbbell(at: At): readonly DeskPart[] {
  const plateRadius = 6.5;
  const plateWidth = 4;
  const barRadius = 1.9;
  const reach = 9;
  // Plates rest on the ground, so the axis sits one radius up.
  const axis = { y: at.y, z: at.z + plateRadius };

  return [
    groundShadow({ x: at.x, y: at.y }, 15, 5, at.z),
    ...plate(axis, plateRadius, at.x - reach - plateWidth, at.x - reach),
    // The far collar, seated against the inside of the far plate.
    ...plate(axis, barRadius * 1.7, at.x - reach, at.x - reach + 1.6),
    ...plate(axis, barRadius, at.x - reach, at.x + reach, {}, {
      farEnd: "flush",
      capped: false,
    }),
    // Knurling. Full half-circumference rings read as a screw thread rather than
    // a grip, so these are short ticks over the crown of the bar only — texture
    // at a glance, which is all knurling ever is at this size.
    ...[-4.5, -2.25, 0, 2.25, 4.5].map((offset) =>
      face(
        Array.from({ length: 4 }, (_, step) => {
          const angle = Math.PI * (1.12 + (step / 3) * 0.33);
          return {
            x: at.x + offset,
            y: axis.y + Math.cos(angle) * barRadius,
            z: axis.z + Math.sin(angle) * barRadius,
          };
        }),
        { outlineOnly: true, open: true },
      ),
    ),
    // The near collar, then the near plate over it.
    ...plate(axis, barRadius * 1.7, at.x + reach - 1.6, at.x + reach),
    ...plate(axis, plateRadius, at.x + reach, at.x + reach + plateWidth),
    // The hub on the near plate's outer face — the one mark that says the plate
    // is bored for a bar rather than being a solid puck.
    face(
      Array.from({ length: 25 }, (_, step) => {
        const angle = (step / 24) * Math.PI * 2;
        return {
          x: at.x + reach + plateWidth + 0.02,
          y: axis.y + Math.cos(angle) * barRadius * 1.15,
          z: axis.z + Math.sin(angle) * barRadius * 1.15,
        };
      }),
      { outlineOnly: true, smooth: true },
    ),
  ];
}

/**
 * anime: ambitious stories and strategic rivalries.
 *
 * A screen paused mid-episode, and nothing else. Earlier versions kept two book
 * volumes beside it as a nod to reading, and they did what blank slabs always do
 * here — read as blank slabs. The paused frame carries the motif on its own; the
 * volumes were only ever competing with it for the same few pixels.
 */
export function animeScreen(at: At): readonly DeskPart[] {
  const width = 20;
  const depth = 15;
  const height = 15;
  const screenY = at.y + depth;
  const bodyZ = at.z + 1.6;

  const on = (across: number, up: number) => ({
    x: at.x + across,
    y: screenY + 0.1,
    z: bodyZ + up,
  });

  return [
    // Feet, then a deep boxy body. Made chunky on purpose: the desk monitor is a
    // wide thin panel on a stand, and these two must not read as the same thing.
    ...[2, width - 5].map((across) =>
      box(
        { x: at.x + across, y: at.y + 3, z: at.z },
        { width: 3, depth: 4, height: 1.6 },
      ),
    ),
    box(
      { x: at.x, y: at.y, z: bodyZ },
      { width, depth, height },
      { shadow: 2 },
    ),
    detail([on(2.5, 2.5), on(width - 2.5, 2.5), on(width - 2.5, height - 2.5), on(2.5, height - 2.5)]),
    // A play triangle. Four blank volumes read as a stack of books, which is
    // exactly what the previous version was accused of; a paused frame says
    // "watching" in a way no arrangement of paper can.
    face([
      on(width / 2 - 2.5, height / 2 - 3.5),
      on(width / 2 + 3.5, height / 2),
      on(width / 2 - 2.5, height / 2 + 3.5),
    ]),
  ];
}

/**
 * A mouse.
 *
 * The shell alone is just a dome, and a dome reads as a hat. What identifies a
 * mouse is the split between the two buttons and the wheel sitting in it, so
 * both are drawn on the surface of the shell rather than left to the outline.
 *
 * The long axis runs in +y, away from the viewer, so the buttons are at the far
 * end where fingers would actually reach.
 */
export function mouse(at: At): readonly DeskPart[] {
  const radius = 5;
  const squash = 1.5;
  // Low and barely tapered: a tall flared wall reads as a bowl, and the top
  // surface is where everything that identifies a mouse actually lives.
  const height = 2.3;
  const taper = 0.85;
  const topZ = at.z + height;
  const topRadiusX = radius * taper;
  const topRadiusY = radius * squash * taper;

  /**
   * A point on the flat top face.
   *
   * The first attempt domed the shell and computed the buttons on the true
   * ellipsoid surface. The dome's outline is a parabolic approximation, so those
   * points projected *outside* the shape they were meant to sit on — the wheel
   * floated off the top edge. A frustum's top face is a genuinely projected
   * ellipse, so anything placed in that plane is inside the outline by
   * construction.
   */
  const onTop = (dx: number, dy: number) => ({
    x: at.x + dx * topRadiusX,
    y: at.y + dy * topRadiusY,
    z: topZ,
  });

  return [
    cylinder({ x: at.x, y: at.y }, radius, at.z, height, {
      squash,
      taper,
      shadow: 1.6,
    }),
    // The seam between the two buttons, running the length of the top face.
    detail([onTop(0, -0.9), onTop(0, 0.05)]),
    // Where the buttons stop and the palm rest begins.
    detail([onTop(-0.78, 0.05), onTop(0.78, 0.05)]),
    // The wheel, sitting in the seam.
    silhouette(onTop(0, -0.42), [
      { x: -0.7, y: -1.5 },
      { x: 0.7, y: -1.5 },
      { x: 0.7, y: 0.3 },
      { x: -0.7, y: 0.3 },
    ], { smooth: true }),
  ];
}

/**
 * kirby: the puffball that took over a desk.
 *
 * A sphere's silhouette genuinely is a circle in screen space, so the body is
 * one — the same reasoning behind Guo's tree canopies and figures' heads, and
 * the reason a projected solid would be wrong here rather than merely harder.
 *
 * Drawn from shape language rather than traced: a pink circle, two tall ovals,
 * two red feet. Everything about him that reads at this size is a primitive.
 */
export function kirby(at: At): readonly DeskPart[] {
  const anchor = { x: at.x, y: at.y, z: at.z };
  const oval = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    options: Parameters<typeof silhouette>[2] = {},
  ) =>
    silhouette(anchor, ovalOffsets(cx, cy, rx, ry), { smooth: true, ...options });

  // Turned a few degrees off straight-on, so the face sits left of centre and
  // the right of the body is the side turning away. A perfectly frontal Kirby is
  // a sticker; the offset is small but it is what buys the three-quarter read.
  const turn = 2.2;

  return [
    groundShadow({ x: at.x, y: at.y }, 12, 5, at.z),
    // Far arm first, so the body occludes its inner edge.
    oval(11, -10.5, 3.2, 4.2, {
      stroke: palette.kirbyPink.line,
      fill: palette.kirbyPink.wash,
    }),
    oval(0, -14, 11, 11, hue("kirbyPink")),
    // The receding side: a true crescent, built as an arc along the body's own
    // edge closed by the same arc shifted inward. Selecting a subset of the
    // body's points instead produced a broken polygon with a nub hanging off the
    // far side — a lune has to be drawn as a lune.
    silhouette(
      anchor,
      (() => {
        const steps = 14;
        const outer = Array.from({ length: steps + 1 }, (_, step) => {
          const angle = -Math.PI * 0.44 + (step / steps) * Math.PI * 0.88;
          return { x: Math.cos(angle) * 10.6, y: -14 + Math.sin(angle) * 10.6 };
        });
        return [
          ...outer,
          ...[...outer]
            .reverse()
            .map((point) => ({ x: point.x - 3.4, y: point.y - 0.5 })),
        ];
      })(),
      { smooth: true, ...hue("kirbyShade") },
    ),
    // Feet: real squashed cylinders standing on the grid, so each has a top face
    // and a wall. Flat ellipses read as painted-on shoes. Their offsets run along
    // (1, −1), the one ground direction that projects horizontally, so the pair
    // sits level rather than one foot appearing to stand uphill of the other.
    ...[-3.6, 4.2].map((offset, index) =>
      cylinder({ x: at.x + offset, y: at.y - offset }, 3.7, at.z, 2.2, {
        segments: 18,
        squash: 0.78,
        ...(index === 0
          ? hue("kirbyRed")
          : { stroke: palette.kirbyRed.line, fill: palette.kirbyRed.wash }),
      }),
    ),
    // Near arm, over the body.
    oval(-11 + turn, -11.5, 3.4, 4.4, hue("kirbyPink")),
    // Eyes: tall and narrow, which is the whole face. Round eyes make a bear.
    oval(-4.6 + turn, -18, 1.7, 3.6, hue("kirbyBlue")),
    oval(2.6 + turn, -18, 1.6, 3.4, hue("kirbyBlue")),
    // Cheeks, then a smile. Screen y grows downward, so the curve has to bow
    // toward +y — subtracting the bulge gave a very sad Kirby.
    oval(-8.6 + turn, -13.2, 2.1, 1.2, { outlineOnly: true, ...hueLine("kirbyRed") }),
    oval(6.6 + turn, -13.2, 1.9, 1.1, { outlineOnly: true, ...hueLine("kirbyRed") }),
    silhouette(
      anchor,
      Array.from({ length: 7 }, (_, step) => {
        const t = step / 6;
        return {
          x: -2.6 + turn + t * 5.2,
          y: -13.8 + Math.sin(Math.PI * t) * 1.4,
        };
      }),
      { outlineOnly: true, open: true, ...hueLine("kirbyRed") },
    ),
  ];
}

/**
 * triforce: three golden prisms.
 *
 * The Triforce is only the Triforce from the front — the arrangement *is* the
 * identity — so unlike everything else here it cannot be allowed to shear. Two
 * builds were tried and thrown away first: flat on the ground and extruded up,
 * which the 2:1 camera folded into a ribbon, and standing in the x–z plane,
 * where the base runs along +x and the whole figure looks like it is toppling
 * to the right.
 *
 * There is exactly one family of planes this camera does not shear. A direction
 * `(dx, dy, dz)` projects to `(dx − dy, ½(dx + dy) − dz)`, so it lands perfectly
 * horizontal when `dz = ½(dx + dy)` — and `(1, −1, 0)` satisfies that with room
 * to spare, moving two screen units across and none down. Paired with plain `z`
 * for the rise, that gives a vertical plane standing diagonally across the grid
 * whose contents project upright and unsquashed.
 *
 * Depth then runs along `(1, 1, 0)`, which projects straight down, so the
 * thickness shows along the two upper edges. Checking each face's outward normal
 * against `(1, 1, 1)`: the front cap and both slanted sides are visible, and the
 * base is not.
 */
export function triforce(at: At): readonly DeskPart[] {
  // `across` is measured in screen units and halved, since one unit along
  // (1,−1,0) is worth two of them.
  const half = 6.5;
  const rise = half * 2 * 0.866;
  const depth = 2.5;

  const point = (across: number, up: number, back: number) => ({
    x: at.x + across + back,
    y: at.y - across + back,
    z: at.z + up,
  });

  const prism = (originAcross: number, originUp: number): readonly DeskPart[] => {
    const corners: readonly Point2[] = [
      { x: originAcross, y: originUp },
      { x: originAcross + half, y: originUp },
      { x: originAcross + half / 2, y: originUp + rise },
    ];

    // Both slanted edges, each swept back into the third dimension. Held a
    // stop darker than the front cap: sides matching their own face is exactly
    // what makes a prism collapse back into a flat emblem.
    const sides = [
      [corners[1], corners[2]],
      [corners[2], corners[0]],
    ].map(([from, to]) =>
      face(
        [
          point(from.x, from.y, depth),
          point(to.x, to.y, depth),
          point(to.x, to.y, 0),
          point(from.x, from.y, 0),
        ],
        hue("triforceSide"),
      ),
    );

    return [
      ...sides,
      face(
        corners.map((corner) => point(corner.x, corner.y, depth)),
        hue("triforce"),
      ),
    ];
  };

  return [
    face(
      [
        point(-1, 0, -1),
        point(half * 2 + 1, 0, -1),
        point(half * 2 + 1, 0, depth + 1),
        point(-1, 0, depth + 1),
      ],
      { tone: "shadow" },
    ),
    // Bottom pair first, then the crown: screen depth here is `2·back + z`, so
    // the higher a prism sits the nearer it is, and the top one has to paint
    // over the two it rests on.
    ...prism(0, 0),
    ...prism(half, 0),
    ...prism(half / 2, rise),
  ];
}

export type ObjectBuilder = (at: At) => readonly DeskPart[];
export type { Point2 };
