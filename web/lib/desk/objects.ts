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
  const width = 24;
  const depth = 16;
  const boardHeight = 1;
  const boardZ = at.z + boardHeight;
  // Headers sit inside the board's own outline. The previous pair were 2.4 units
  // tall and overhung both long edges, which turned the board's signature detail
  // into two grey curbs running past the thing they are mounted on. A header is
  // a socket strip: low, inset, and perforated.
  const headerHeight = 1.3;
  const headerDepth = 1.6;

  /** A row of pin holes along a header's top face. */
  const pins = (y: number, count: number, fromX: number) =>
    Array.from({ length: count }, (_, step) => {
      const x = at.x + fromX + step * 1.7;
      return face(
        [
          { x, y, z: boardZ + headerHeight + 0.02 },
          { x: x + 0.55, y, z: boardZ + headerHeight + 0.02 },
        ],
        { outlineOnly: true, open: true, ...hueLine("silkscreen") },
      );
    });

  // `+y` projects down and to the left, so larger y is *nearer* the camera. The
  // digital headers therefore go on the low-y edge, where nothing can cover
  // them; power and analog take the near edge. Getting this backwards is what
  // put the breadboard on top of the board last time.
  const digitalRow = at.y + 1;
  const powerRow = at.y + depth - 2.6;
  const breadboardY = at.y - 9;
  const breadboardZ = at.z + 2.4;
  const railY = breadboardY + 4.25;

  return [
    // The breadboard first and furthest back, overlapping the board's far edge
    // so the two read as one build rather than as a board and a separate white
    // tray beside it.
    rounded({ x: at.x + 3, y: breadboardY }, 18, 8.5, at.z, 2.4, {
      radius: 0.8,
      shadow: 1.6,
      ...hue("silkscreen"),
    }),
    // The centre channel, which is the one mark that says breadboard.
    face(
      [
        { x: at.x + 5, y: railY, z: breadboardZ + 0.02 },
        { x: at.x + 19, y: railY, z: breadboardZ + 0.02 },
      ],
      { outlineOnly: true, open: true, ...hueLine("connector") },
    ),
    // Two rails of holes, one either side of the channel. Eight columns rather
    // than a real breadboard's sixty: at this size the full grid turns the top
    // face into noise, and the point is only that the rails are perforated.
    ...[-2.4, 2.4].flatMap((row) =>
      Array.from({ length: 8 }, (_, step) => {
        const x = at.x + 5.4 + step * 1.8;
        return face(
          [
            { x, y: railY + row, z: breadboardZ + 0.02 },
            { x: x + 0.5, y: railY + row, z: breadboardZ + 0.02 },
          ],
          { outlineOnly: true, open: true, ...hueLine("connector") },
        );
      }),
    ),
    // A component seated across the channel, and a lit LED beside it.
    box(
      { x: at.x + 7, y: railY - 2, z: breadboardZ },
      { width: 3.2, depth: 4, height: 1.6 },
      hue("holdGreen"),
    ),
    cylinder({ x: at.x + 16, y: railY + 2.4 }, 1, breadboardZ, 2.2, {
      segments: 16,
      ...hue("led"),
    }),
    rounded({ x: at.x, y: at.y }, width, depth, at.z, boardHeight, {
      radius: 1,
      shadow: 1.8,
      ...hue("arduino"),
    }),
    // Digital headers along the far edge, power and analog along the near one —
    // the real Uno's arrangement, and the reason the two rows differ in length.
    ...[
      { y: digitalRow, from: 3.4, count: 10 },
      { y: powerRow, from: 2.2, count: 6 },
      { y: powerRow, from: 13.4, count: 5 },
    ].flatMap(({ y, from, count }) => [
      box(
        { x: at.x + from - 0.6, y, z: boardZ },
        { width: count * 1.7 + 0.4, depth: headerDepth, height: headerHeight },
        hue("connector"),
      ),
      ...pins(y + headerDepth / 2, count, from),
    ]),
    // USB-B and the barrel jack, kept wholly inside the board's outline. The
    // real ones do overhang, but drawn overhanging at this scale they detached
    // from the board and read as two grey crates parked beside it.
    box(
      { x: at.x + 0.8, y: at.y + 4.2, z: boardZ },
      { width: 5.4, depth: 5, height: 2.6 },
      hue("connector"),
    ),
    box(
      { x: at.x + 1, y: at.y + 10.6, z: boardZ },
      { width: 4.6, depth: 4, height: 2.2 },
      hue("connector"),
    ),
    // The microcontroller: a DIP package with its notch. This is the single mark
    // that says *there is a computer on this board*, and its absence is most of
    // why the last version read as an empty tray.
    box(
      { x: at.x + 13.5, y: at.y + 6, z: boardZ },
      { width: 7.5, depth: 3.4, height: 1.1 },
      hue("beltBlack"),
    ),
    face(
      [
        { x: at.x + 14.1, y: at.y + 6.6, z: boardZ + 1.12 },
        { x: at.x + 14.1, y: at.y + 8.8, z: boardZ + 1.12 },
      ],
      { outlineOnly: true, open: true, ...hueLine("connector") },
    ),
    // The Arduino mark: one continuous lemniscate. Two overlapping circles left
    // a lens where they crossed, and clipping them into two arcs to avoid it
    // just turned the mark into a pair of loose squiggles. The curve
    // `(cos t, sin t·cos t) / (1 + sin²t)` is the figure eight itself, so there
    // is nothing to cross and nothing to clip.
    face(
      Array.from({ length: 41 }, (_, step) => {
        const t = (step / 40) * Math.PI * 2;
        const k = 1 + Math.sin(t) ** 2;
        return {
          x: at.x + 8 + (Math.cos(t) / k) * 4.4,
          y: at.y + 8 + ((Math.sin(t) * Math.cos(t)) / k) * 4.4,
          z: boardZ + 0.02,
        };
      }),
      { outlineOnly: true, smooth: true, ...hueLine("silkscreen") },
    ),
    // Three jumper wires, each from a pin on the digital header to a hole in the
    // breadboard's near rail. Both ends land on a solid: a wire that starts in
    // mid-air over a header reads as a scratch, which is what the last set did.
    ...[
      { colour: "wireWarm", fromX: 4.2, toX: 6.3, lift: 3.2 },
      { colour: "led", fromX: 7.6, toX: 9.9, lift: 2.6 },
      { colour: "wireCool", fromX: 11, toX: 13.5, lift: 2.2 },
    ].map(({ colour, fromX, toX, lift }) =>
      face(
        Array.from({ length: 13 }, (_, step) => {
          const t = step / 12;
          const startZ = boardZ + headerHeight;
          const endZ = breadboardZ;
          return {
            x: at.x + fromX + (toX - fromX) * t,
            y: digitalRow + headerDepth / 2 + (railY - 2.4 - digitalRow) * t,
            z: startZ + (endZ - startZ) * t + Math.sin(Math.PI * t) * lift,
          };
        }),
        { outlineOnly: true, open: true, smooth: true, ...hueLine(colour as PaletteName) },
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
    // The cutaway in the flank. Filled with the page ground rather than a colour
    // so it reads as a hole into a hollow body — anything lighter here and it
    // becomes a sticker on the outside.
    silhouette(anchor, ovalOffsets(-3, -11, 7.6, 6), {
      smooth: true,
      stroke: palette.filament.line,
      fill: ink.ground,
    }),
    // The module seated inside, with its own header strip along the top edge.
    silhouette(
      anchor,
      [
        { x: -7.4, y: -14 },
        { x: 1.4, y: -14 },
        { x: 1.4, y: -10.6 },
        { x: -7.4, y: -10.6 },
      ],
      hue("arduino"),
    ),
    silhouette(
      anchor,
      [
        { x: -6.8, y: -13.4 },
        { x: 0.8, y: -13.4 },
      ],
      { outlineOnly: true, open: true, ...hueLine("silkscreen") },
    ),
    // The terminal block the wiring lands on, at the floor of the cavity.
    //
    // Its whole job is to give the three wires somewhere to end. They used to
    // run down from the module and simply stop, and a line that stops in mid-air
    // does not read as a wire — it reads as a scratch on the drawing.
    silhouette(
      anchor,
      [
        { x: -6.6, y: -7.4 },
        { x: 0.6, y: -7.4 },
        { x: 0.6, y: -5.6 },
        { x: -6.6, y: -5.6 },
      ],
      hue("connector"),
    ),
    // Three jumper wires, each leaving a pin on the module and landing on the
    // block. Both endpoints sit inside a solid, so neither end is loose.
    ...[
      { colour: "wireWarm", from: -5.6, to: -5.2, bend: -1.2 },
      { colour: "led", from: -3, to: -3, bend: 0.9 },
      { colour: "wireCool", from: -0.4, to: -0.8, bend: 1.4 },
    ].map(({ colour, from, to, bend }) =>
      silhouette(
        anchor,
        Array.from({ length: 9 }, (_, step) => {
          const t = step / 8;
          return {
            x: from + (to - from) * t + Math.sin(Math.PI * t) * bend,
            y: -10.6 + t * 4.4,
          };
        }),
        { outlineOnly: true, open: true, ...hueLine(colour as PaletteName) },
      ),
    ),
    // The eye. Dark against the lifted body wash, which is what makes it an eye
    // rather than a bump — it used to be a twelve-sided outline with the page
    // ground showing through, and at magnification that is a punched hole.
    circle(anchor, 1.5, {
      cx: 11,
      cy: -27,
      stroke: palette.filament.line,
      fill: ink.ground,
    }),
  ];
}

/**
 * taekwondo: a fourth-degree black belt, rolled.
 *
 * This is the fifth arrangement and the previous four are worth recording so
 * none of them comes back. A coil with a trailing strip read as something
 * obscene. A bare coil read as a tin. A knot with a strap running out to both
 * sides and two tails hanging below is anatomically a torso with arms and legs,
 * and every upright attempt read as a creature no matter how the proportions
 * were tuned — the symmetry was the problem, not the drawing. Laying that same
 * arrangement flat fixed the creature and produced a frying pan.
 *
 * A belt is rolled when it is not being worn, so this is a roll: a disc on a
 * horizontal axis, spiral layers on the face turned toward the camera, and the
 * loose end running out onto the grid carrying the four rank stripes. The face
 * is what says *rolled cloth* rather than *wheel*, and the stripes are what say
 * fourth degree.
 *
 * `plate()` does the solid — the same helper the dumbbell uses, for the same
 * reason: `cylinder` only builds vertical axes, and a squashed one gives a coin
 * lying down rather than a roll standing on edge.
 */
export function belt(at: At): readonly DeskPart[] {
  const black = { stroke: palette.beltBlack.line, fill: palette.beltBlack.wash };
  const outer = 9.5;
  const width = 5.5;
  const axis = { y: at.y, z: at.z + outer };
  const faceX = at.x + width;
  const cloth = 1.6;

  /** An arc on the roll's near face, at `radius`, spanning `from` to `to`. */
  const layer = (radius: number, from: number, to: number) =>
    face(
      // Thirty-three points, not seventeen: these arcs sweep most of a full turn,
      // so at seventeen each segment covers twenty degrees and the spiral comes
      // out visibly faceted even with `smooth` on.
      Array.from({ length: 33 }, (_, step) => {
        const angle = from + ((to - from) * step) / 32;
        return {
          x: faceX + 0.03,
          y: axis.y + Math.cos(angle) * radius,
          z: axis.z + Math.sin(angle) * radius,
        };
      }),
      { outlineOnly: true, open: true, smooth: true, ...hueLine("beltBlack") },
    );

  return [
    groundShadow({ x: at.x + width / 2, y: at.y }, outer * 1.15, outer * 0.42, at.z),
    // The roll itself: band plus the cap turned toward the camera.
    ...plate(axis, outer, at.x, faceX, black),
    // Three layers spiralling in. Each starts and ends at a different angle and
    // sits a little off centre, because concentric closed rings are a roll of
    // tape — a spiral is what tells you this is a long strip wound up.
    layer(7.1, -0.35, Math.PI * 1.75),
    layer(4.8, 0.15, Math.PI * 1.6),
    layer(2.4, 0.5, Math.PI * 1.45),
    // The loose end, running out of the bottom of the roll toward the viewer.
    // Drawn after the roll: the run nearest the camera passes in front of it,
    // which is what makes the strip continue *out from under* the coil rather
    // than start beside it.
    slab(
      [
        { x: at.x + 0.7, y: at.y + 4 },
        { x: faceX - 0.7, y: at.y + 4 },
        { x: faceX - 1.6, y: at.y + 19 },
        { x: at.x + 1.6, y: at.y + 19 },
      ],
      at.z,
      cloth,
      black,
    ),
    // The four rank stripes, across the loose end. Each spans the full width of
    // the strip at its own point along the run, so all four read as one rank
    // rather than as four marks of different lengths.
    ...Array.from({ length: 4 }, (_, index) => {
      const t = 0.52 + index * 0.11;
      const inset = 0.7 + 0.9 * t;
      const y = at.y + 4 + 15 * t;
      return face(
        [
          { x: at.x + inset + 0.5, y, z: at.z + cloth + 0.02 },
          { x: faceX - inset - 0.5, y, z: at.z + cloth + 0.02 },
        ],
        { outlineOnly: true, open: true, ...hueLine("beltGold") },
      );
    }),
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
  const radius = 10;
  const caseHeight = 4.6;
  const dialZ = at.z + caseHeight;

  /** A point on the dial face, at `scale` of the radius and `angle` around it. */
  const onDial = (angle: number, scale: number, lift = 0.1) => ({
    x: center.x + Math.cos(angle) * radius * scale,
    y: center.y + Math.sin(angle) * radius * scale,
    z: dialZ + lift,
  });

  // North points back and left, so the needle runs along the grid rather than
  // straight up the screen — a needle that projects vertically reads as a hand
  // on a clock instead of an arrow lying on a dial.
  const north = Math.PI * 1.25;

  return [
    // No `rings` here. A ring on the top face draws a second ellipse exactly
    // concentric with the silhouette, and stacked with the wall seam below it
    // the whole object came out as three parallel curves — a stack of pancakes.
    cylinder(center, radius, at.z, caseHeight, { segments: 24, shadow: 2 }),
    // The case seam, on the side wall rather than across the top face — it runs
    // round the body of a real compass, so it has to follow the wall's curve and
    // stop at the two silhouette edges. Cutting it across the dial instead was
    // the tell that this was a lid drawn from the front.
    face(
      Array.from({ length: 13 }, (_, step) => {
        const angle = -Math.PI / 4 + (step / 12) * Math.PI;
        return {
          x: center.x + Math.cos(angle) * radius,
          y: center.y + Math.sin(angle) * radius,
          z: at.z + caseHeight * 0.62,
        };
      }),
      { outlineOnly: true, open: true, smooth: true },
    ),
    // Bezel ticks. Twelve of them, the cardinals longer, drawn inside the rim
    // rather than as a ring on it — this is the mark that says the dial is
    // graduated, and it costs nothing that a concentric circle was costing.
    ...Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2;
      const inner = index % 3 === 0 ? 0.74 : 0.83;
      return face([onDial(angle, inner), onDial(angle, 0.92)], {
        outlineOnly: true,
        open: true,
      });
    }),
    // The needle, as two halves meeting at the pivot: red north, white south.
    // A single grey diamond is a play button, and that is exactly how the last
    // one read. The colour split is the oldest convention there is on a compass
    // and it does all the work here.
    face(
      [
        onDial(north, 0.62),
        onDial(north + Math.PI / 2, 0.14),
        onDial(north + Math.PI, 0.06),
        onDial(north - Math.PI / 2, 0.14),
      ],
      hue("needleNorth"),
    ),
    face(
      [
        onDial(north + Math.PI, 0.62),
        onDial(north + Math.PI / 2, 0.14),
        onDial(north, 0.06),
        onDial(north - Math.PI / 2, 0.14),
      ],
      hue("needleSouth"),
    ),
    // The pivot, over the join, so the two halves read as one needle turning on
    // a pin rather than as two loose triangles.
    face(
      Array.from({ length: 13 }, (_, step) => {
        const angle = (step / 12) * Math.PI * 2;
        return onDial(angle, 0.09, 0.2);
      }),
      { smooth: true, ...hue("connector") },
    ),
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
    // The lid clears the cup's rim by a lip, not by a brim. At `+0.9` it stood
    // proud of the cup all the way round and the drink came out looking like a
    // paint can — a sealed boba lid is heat-pressed flush to the rim.
    const lidRadius = base * flare + 0.25 * scale;

    return [
      cylinder(center, base, at.z, body, {
        segments: 24,
        taper: flare,
        shadow: 1.8,
        ...hue(tea),
      }),
      // Pearls first, then the lid: they sit inside the cup, so the body's own
      // outline has to stay in front of them at the sides. Settled low, because
      // that is where tapioca goes and because a pearl floating at mid-height
      // reads as a bubble in the drink rather than a solid in it.
      ...[
        { dx: -0.56, dy: 0.86 },
        { dx: -0.19, dy: 0.62 },
        { dx: 0.2, dy: 0.9 },
        { dx: 0.55, dy: 0.66 },
        { dx: -0.02, dy: 1.06 },
      ].map((spot) =>
        circle({ x: center.x, y: center.y, z: at.z }, 1.4 * scale, {
          cx: spot.dx * base * 1.35,
          cy: -2.6 * scale - spot.dy * 2.2 * scale + 3.4 * scale,
          ...hue("pearl"),
        }),
      ),
      // The sealed lid, then the straw through it. Drawing the straw first put
      // it behind the lid, so it appeared to stop at the rim rather than pass
      // into the cup.
      cylinder(center, lidRadius, lidZ, 1.5 * scale, {
        segments: 24,
        ...hue("lid"),
      }),
      cylinder(
        { x: center.x + 1.4 * scale, y: center.y - 1.2 * scale },
        0.85 * scale,
        lidZ + 0.6 * scale,
        10.5 * scale,
        { segments: 14, lean: { x: 1.6, y: -1.4 }, ...hue("cocoa") },
      ),
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
  const width = 16;
  const depth = 2.6;
  const height = 24;
  // Holds bolt to the face turned toward the camera.
  const wallY = at.y + depth;

  /**
   * One hold: a moulded blob standing off the panel, with a bolt through it.
   *
   * The projecting edge is a real one. The previous version drew the same
   * outline twice, the lower copy in a darker fill, and offsetting a shape from
   * itself does not read as depth — it reads as print misregistration, which is
   * exactly what three of them at once looked like. Here the near face is
   * anchored `stand` units off the wall in `+y`, so the two outlines diverge by
   * a genuine projection rather than by a constant nudge, and the strip between
   * them closes as the hold's side.
   */
  const hold = (
    across: number,
    up: number,
    size: number,
    stand: number,
    colour: PaletteName,
    offsets: readonly Point2[],
  ) => {
    const scaled = offsets.map((point) => ({
      x: point.x * size,
      y: point.y * size,
    }));
    const root = { x: at.x + across, y: wallY, z: at.z + up };
    const crown = { x: at.x + across, y: wallY + stand, z: at.z + up };

    return [
      // The footprint on the panel, in the deeper wash — the part of the base
      // that the crown does not cover.
      silhouette(root, scaled, {
        smooth: true,
        stroke: palette[colour].line,
        fill: palette[colour].wash,
      }),
      // The crown, standing proud. Barely smaller, so what shows of the base is
      // an even rim of thickness. Taper it harder and the base reappears as a
      // second whole shape behind the first, which is the misregistered-print
      // look this was meant to get rid of.
      silhouette(
        crown,
        scaled.map((point) => ({ x: point.x * 0.94, y: point.y * 0.94 })),
        { smooth: true, ...hue(colour) },
      ),
      // The bolt. A fixed radius rather than one scaled off the hold — every
      // bolt through a climbing hold is the same size, and scaling it by `size`
      // put the smaller hold's bolt at 0.28 square units, which the degenerate
      // silhouette test correctly refused as sub-pixel at scene scale.
      circle(crown, 0.9, hue("connector")),
    ];
  };

  return [
    box(
      { x: at.x, y: at.y, z: at.z },
      { width, depth, height },
      { shadow: 2 },
    ),
    // Two holds, not three, and the panel cut down to a frame around them. At
    // 25×39 with three small blobs the object was mostly blank slab, and the
    // blank slab is what the eye reads first.
    ...hold(8, 16.5, 1.5, 1.2, "holdGreen", [
      { x: -4, y: -2.5 },
      { x: -1, y: -4.5 },
      { x: 3, y: -3 },
      { x: 4, y: 1 },
      { x: 0, y: 3 },
      { x: -4, y: 1.5 },
    ]),
    ...hold(8, 6, 1, 1, "holdBlue", [
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

  /**
   * An arc across the visible half of the bar, at `x`.
   *
   * A point on the bar's surface faces the camera when its normal
   * `(0, cos a, sin a)` has a positive dot with the view direction `(1, 1, 1)` —
   * that is, when `cos a + sin a > 0`, which is the range `(−π/4, 3π/4)`. The
   * previous knurling ticks ran from `1.12π` to `1.45π`, squarely on the far
   * side, and showed through the bar's own outline. Everything drawn on a
   * cylinder has to be clipped to that range or it appears inside the solid.
   */
  const onBar = (x: number, from: number, to: number, steps: number) =>
    Array.from({ length: steps + 1 }, (_, step) => {
      const angle = from + ((to - from) * step) / steps;
      return {
        x,
        y: axis.y + Math.cos(angle) * barRadius,
        z: axis.z + Math.sin(angle) * barRadius,
      };
    });

  const visible = { from: -Math.PI / 4, to: (Math.PI * 3) / 4 };
  const grip = 5.2;

  return [
    groundShadow({ x: at.x, y: at.y }, 15, 5, at.z),
    // No collars. They were two more concentric rims stacked on a face that
    // already had the plate's own rim and the bar's flush end on it, and that
    // pile-up is the whole reason the far plate looked like a mistake.
    ...plate(axis, plateRadius, at.x - reach - plateWidth, at.x - reach),
    ...plate(axis, barRadius, at.x - reach, at.x + reach, {}, {
      farEnd: "flush",
      capped: false,
    }),
    // Knurling as a bounded section: a rim line where the grip starts and
    // another where it stops, with short ticks strictly between them. Scattered
    // ticks with no boundary read as scratches on the bar; the two rims are what
    // turn the same marks into a texture that was machined on purpose.
    ...[-grip, grip].map((offset) =>
      face(onBar(at.x + offset, visible.from, visible.to, 12), {
        outlineOnly: true,
        open: true,
        smooth: true,
      }),
    ),
    // Five short dashes over the crown, not seven long ones. Ticks that sweep
    // most of the visible half turn the bar into a coil spring — the marks have
    // to stay short enough to read as texture rather than as windings.
    ...Array.from({ length: 5 }, (_, index) =>
      face(
        onBar(
          at.x - grip + ((index + 1) * (grip * 2)) / 6,
          Math.PI * 0.16,
          Math.PI * 0.34,
          3,
        ),
        { outlineOnly: true, open: true, smooth: true },
      ),
    ),
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
  // The front housing is shallow and the tube tapers back behind it. As one
  // 15-deep cube with a rectangle drawn on the front, this was a microwave: a
  // box that deep has no reason to be a screen, and nothing about it said the
  // screen was on.
  const front = 5;
  const height = 14;
  const screenY = at.y + front;
  // The set stands on its own base. Two 1.6-high feet under a housing this deep
  // were almost entirely hidden behind the front face, and what did show was two
  // stray ticks poking out at the bottom corners.
  const bodyZ = at.z;
  const inset = 2.2;

  const on = (across: number, up: number) => ({
    x: at.x + across,
    y: screenY + 0.1,
    z: bodyZ + up,
  });

  return [
    // The tube: a tapered box behind the housing, which is what makes this a CRT
    // and not a flat panel. It also stops it reading as the colophon monitor,
    // which is a thin panel on a stand.
    slab(
      [
        { x: at.x + 2.5, y: at.y },
        { x: at.x + width - 2.5, y: at.y },
        { x: at.x + width - 0.5, y: at.y + front },
        { x: at.x + 0.5, y: at.y + front },
      ],
      bodyZ + 2.5,
      height - 5,
      { shadow: 2 },
    ),
    box({ x: at.x, y: at.y + 1, z: bodyZ }, { width, depth: front - 1, height }),
    // The screen, lit. A dark rectangle inset in a grey box is an appliance door
    // — the glow is the whole difference between a television and a microwave.
    // The bottom inset is larger than the others to leave the control strip its
    // own band; matched all round, the knobs sat on top of the picture.
    face(
      [
        on(inset, inset + 2.6),
        on(width - inset, inset + 2.6),
        on(width - inset, height - inset),
        on(inset, height - inset),
      ],
      hue("crtGlow"),
    ),
    // The paused frame, wholly inside the screen rather than straddling its
    // edge, which is where it sat before.
    face(
      [
        on(width / 2 - 2, height / 2 - 1.4),
        on(width / 2 + 2.6, height / 2 + 0.6),
        on(width / 2 - 2, height / 2 + 2.6),
      ],
      { stroke: palette.crtGlow.line, fill: ink.ground },
    ),
    // Two knobs on the strip below the screen — the detail that dates it.
    ...[width - 6.5, width - 3.5].map((across) =>
      face(
        ovalOffsets(0, 0, 0.75, 0.75, 14).map((point) => ({
          x: at.x + across + point.x,
          y: screenY + 0.12,
          z: bodyZ + 2.1 + point.y,
        })),
        { smooth: true, ...hue("connector") },
      ),
    ),
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
      // A tighter spread than most objects get. The mouse is the smallest solid
      // in the scene, so the usual 1.6 put a dark halo all the way round it and
      // the pair read as a mouse sitting in a puddle.
      shadow: 0.8,
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
 * **Everything is drawn back to front, and the paint order is the drawing.**
 * Arms and feet go down *before* the body so the body's own fill erases their
 * inner halves and only the outer lobes survive. That is the difference between
 * limbs attached to a ball and ellipses stuck on one. The previous version drew
 * the near arm last: its full outline landed across the cheek, and the feet were
 * cylinders standing clear of the body with a visible gap under it, which read
 * as two hockey pucks parked beneath a balloon.
 *
 * There is deliberately no shading. A dark crescent for the receding side was
 * tried and it drew a scythe straight through his right eye. On a form whose
 * whole silhouette is a circle there is no contour to shade that is not simply a
 * line across the face.
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

  const bodyY = -12;
  const bodyR = 11;
  // Features sit a shade left of centre, so he is turned very slightly toward
  // the camera's left rather than staring dead ahead.
  const turn = -0.8;

  return [
    groundShadow({ x: at.x, y: at.y }, 13, 5, at.z),
    // Feet, then arms — both behind the body. Each is placed so its inner half
    // falls inside the body circle and gets painted over.
    ...[-7.6, 7.6].map((cx) => oval(cx, -2.4, 5.4, 3.1, hue("kirbyRed"))),
    ...[
      { cx: -11.2, cy: -11 },
      { cx: 11.2, cy: -11 },
    ].map(({ cx, cy }) => oval(cx, cy, 3.8, 5, hue("kirbyPink"))),
    oval(0, bodyY, bodyR, bodyR, hue("kirbyPink")),
    // Eyes: tall and narrow, which is the whole face — round eyes make a bear.
    // Each carries a highlight in its upper third, the single most identifying
    // mark he has and the one thing the first version left out.
    ...[
      { cx: -4.2 + turn, rx: 1.9, ry: 4 },
      { cx: 2.8 + turn, rx: 1.8, ry: 3.8 },
    ].flatMap(({ cx, rx, ry }) => [
      oval(cx, -15.6, rx, ry, hue("kirbyBlue")),
      oval(cx, -17.8, rx * 0.68, ry * 0.4, {
        stroke: palette.silkscreen.line,
        fill: palette.silkscreen.line,
      }),
    ]),
    // Cheeks, filled rather than outlined. As unfilled ellipses they read as two
    // small red rings — a donut on each side of his face, not a blush.
    oval(-8.6 + turn, -10.4, 2.2, 1.3, hue("kirbyRed")),
    oval(7 + turn, -10.4, 2, 1.2, hue("kirbyRed")),
    // The smile. Screen y grows downward, so the curve has to bow toward +y —
    // subtracting the bulge gave a very sad Kirby.
    silhouette(
      anchor,
      Array.from({ length: 9 }, (_, step) => {
        const t = step / 8;
        return {
          x: -2.4 + turn + t * 4.8,
          y: -10.6 + Math.sin(Math.PI * t) * 1.5,
        };
      }),
      { smooth: true, outlineOnly: true, open: true, ...hueLine("kirbyRed") },
    ),
  ];
}

/**
 * triforce: three golden prisms standing on the grid.
 *
 * Three builds were thrown away before this one, and the last of them is worth
 * recording because it looked correct in the source and was wrong on screen.
 * That version put the emblem in the one plane this camera does not shear — a
 * direction `(dx, dy, dz)` projects horizontally when `dz = ½(dx + dy)`, which
 * `(1, −1, 0)` satisfies — and so the Triforce stood perfectly upright and
 * unsqueezed. The trouble is that plane's normal is `(1, 1, 0)`, which projects
 * to `(0, +1)`: **straight down**. Depth had nowhere to go but behind the shape
 * that cast it, and the result was a front view with a one-pixel lip on two
 * edges.
 *
 * So the emblem stands in the **x–z plane** instead, like anything else that
 * stands on this desk. `+x` projects to `(1, ½)`, so the base rides a grid line
 * and the figure leans with the grid rather than fighting it. Depth runs along
 * `−y`, which projects to `(1, −½)` — up and to the right, where it is fully
 * visible. That is a genuine face normal, so this is a real right prism with no
 * oblique fudge in it.
 *
 * Checking each outward normal against the view direction `(1, 1, 1)`: the front
 * cap at `+y` and both slanted sides face the camera; the base at `−z` does not.
 */
export function triforce(at: At): readonly DeskPart[] {
  const half = 11;
  const rise = half * 0.866;
  // Thickness. Held to about a sixth of the emblem's width: at a third it stops
  // being a Triforce with depth and becomes a solid wedge that happens to have
  // notches, because the two side faces then outweigh the three front caps.
  const depth = 3.4;

  /** A point on the emblem, `back` units along −y into the prism's thickness. */
  const point = (across: number, up: number, back: number) => ({
    x: at.x + across,
    y: at.y - back,
    z: at.z + up,
  });

  const prism = (originAcross: number, originUp: number): readonly DeskPart[] => {
    const corners: readonly Point2[] = [
      { x: originAcross, y: originUp },
      { x: originAcross + half, y: originUp },
      { x: originAcross + half / 2, y: originUp + rise },
    ];

    // The two slanted edges, each swept back along −y. Held a stop darker than
    // the front cap: sides matching their own face is exactly what makes a
    // prism collapse back into a flat emblem.
    const sides = [
      [corners[1], corners[2]],
      [corners[2], corners[0]],
    ].map(([from, to]) =>
      face(
        [
          point(from.x, from.y, 0),
          point(to.x, to.y, 0),
          point(to.x, to.y, depth),
          point(from.x, from.y, depth),
        ],
        hue("triforceSide"),
      ),
    );

    return [
      // Sides first, then the front cap over them — the cap is the nearest face
      // on the prism, and it has to close the two side quads' front edges.
      ...sides,
      face(
        corners.map((corner) => point(corner.x, corner.y, 0)),
        hue("triforce"),
      ),
    ];
  };

  return [
    // The footprint on the grid: the whole figure is `half * 2` across and
    // `depth` deep, so the shadow is that rectangle rather than a blob.
    face(
      [
        point(-0.5, 0, -0.5),
        point(half * 2 + 0.5, 0, -0.5),
        point(half * 2 + 0.5, 0, depth + 0.5),
        point(-0.5, 0, depth + 0.5),
      ],
      { tone: "shadow" },
    ),
    // Bottom pair first, then the crown, which rests on both and must paint
    // over them. Within the pair the right one is nearer the camera.
    ...prism(0, 0),
    ...prism(half, 0),
    ...prism(half / 2, rise),
  ];
}

export type ObjectBuilder = (at: At) => readonly DeskPart[];
export type { Point2 };
