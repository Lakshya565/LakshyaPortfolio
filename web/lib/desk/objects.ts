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
 */

import {
  box,
  circle,
  cylinder,
  detail,
  disc,
  face,
  groundShadow,
  ink,
  rounded,
  silhouette,
  type DeskPart,
} from "@/lib/desk/parts";
import { polygonFootprint, type Point2 } from "@/lib/desk/projection";

type At = Readonly<{ x: number; y: number; z: number }>;

/** A ring lying flat on a surface — coils, dial faces, rims. */
function ring(center: Point2, radius: number, z: number): DeskPart {
  return detail(
    polygonFootprint(center, radius, radius, 16).map((point) => ({
      ...point,
      z,
    })),
  );
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

  return [
    box(
      { x: at.x, y: at.y, z: at.z },
      { width: baseWidth, depth: baseDepth, height: baseHeight },
      { shadow: 3 },
    ),
    // Clock face, proud of the front wall so it catches an outline of its own.
    box(
      { x: at.x + 3.2, y: at.y + baseDepth - 0.4, z: at.z + 10 },
      { width: 5.5, depth: 0.6, height: 5.5 },
    ),
    box(
      { x: at.x + inset, y: at.y + inset, z: belfryZ },
      { width: belfryWidth, depth: baseDepth - inset * 2, height: 8 },
    ),
    cylinder(
      { x: at.x + baseWidth / 2, y: at.y + baseDepth / 2 },
      7.5,
      belfryZ + 8,
      8.5,
      { segments: 4, taper: 0.04 },
    ),
  ];
}

// ---------------------------------------------------------------------------
// Hotspot objects — one per motif group
// ---------------------------------------------------------------------------

/**
 * maker-origin: fifty-plus Arduino builds documented in public.
 *
 * The board alone. The previous version put a breadboard, a board, and three
 * jumper wires under one label, and at twenty screen units each the result read
 * as a dotted tray beside a plate. What identifies a dev board is its
 * silhouette: two header strips down the long edges and two chunky connectors
 * hanging off one end. Everything else is texture nobody can resolve.
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
    }),
    // Two full-length header strips. These are the board's signature, and the
    // first attempt made them too shallow to register — at 1.4 units tall they
    // read as specks on a tray. Standing tall and running the length of the
    // board, they are what makes this a dev board rather than a slab.
    ...[1.6, depth - 3.8].map((row) =>
      box(
        { x: at.x + 3, y: at.y + row, z: boardZ },
        { width: width - 7, depth: 2.2, height: 2.4 },
      ),
    ),
    // USB-B and barrel jacks, standing proud of the near end.
    box(
      { x: at.x - 3.5, y: at.y + 3, z: boardZ },
      { width: 7.5, depth: 7, height: 5 },
    ),
    box(
      { x: at.x - 3, y: at.y + 11.5, z: boardZ },
      { width: 6, depth: 5, height: 4 },
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
      { smooth: true },
    ),
    // Wing and eye, in Guo's unfilled-path style for interior detail.
    silhouette(
      anchor,
      [
        { x: -8, y: -11 },
        { x: -3, y: -14 },
        { x: 3, y: -12 },
        { x: 2, y: -6 },
        { x: -5, y: -6 },
      ],
      { outlineOnly: true, smooth: true },
    ),
    circle(anchor, 1.4, { segments: 12, cx: 11, cy: -27 }),
  ];
}

/**
 * taekwondo: a fourth-degree belt, coiled.
 *
 * Its own object now. The old version paired a roll with a trailing flat strip,
 * and that combination read — accurately, per review — as a phallus. A coil with
 * no tail is symmetric, unmistakable, and shows the rank stripes on the wrap
 * where they are actually legible.
 */
export function belt(at: At): readonly DeskPart[] {
  const center = { x: at.x, y: at.y };
  const height = 7;
  const topZ = at.z + height;

  return [
    cylinder(center, 9, at.z, height, { segments: 18, shadow: 2 }),
    // Concentric wraps on the top face: what makes a disc read as coiled webbing.
    ring(center, 6.4, topZ),
    ring(center, 3.6, topZ),
    // The four rank stripes, crossing the outer wrap.
    ...Array.from({ length: 4 }, (_, index) => {
      const offset = -4.5 + index * 3;
      return detail([
        { x: center.x + offset, y: center.y - 8.2, z: topZ },
        { x: center.x + offset, y: center.y - 6.2, z: topZ },
      ]);
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
  const caseHeight = 5;
  const dialZ = at.z + caseHeight;

  return [
    cylinder(center, 7.5, at.z, caseHeight, { segments: 18, shadow: 1.8 }),
    ring(center, 6, dialZ),
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
  const anchor = { x: at.x, y: at.y, z: at.z };

  return [
    groundShadow({ x: at.x + 1, y: at.y }, 12, 7, at.z),
    // Matcha cup, behind and to the right.
    silhouette(
      anchor,
      [
        { x: 8, y: -1 },
        { x: 7.5, y: -10 },
        { x: 18.5, y: -10 },
        { x: 18, y: -1 },
        { x: 16, y: 0.5 },
        { x: 10, y: 0.5 },
      ],
      { smooth: true },
    ),
    silhouette(anchor, [
      { x: 6.6, y: -10 },
      { x: 19.4, y: -10 },
      { x: 19.4, y: -12 },
      { x: 6.6, y: -12 },
    ]),
    // Boba cup, in front: tapered, domed lid, straw.
    silhouette(anchor, [
      { x: 1.6, y: -18.5 },
      { x: 3.4, y: -26.5 },
      { x: 6.4, y: -26.5 },
      { x: 4.6, y: -18.5 },
    ]),
    silhouette(
      anchor,
      [
        { x: -7, y: -1 },
        { x: -8.5, y: -17 },
        { x: 8.5, y: -17 },
        { x: 7, y: -1 },
        { x: 4.5, y: 0.5 },
        { x: -4.5, y: 0.5 },
      ],
      { smooth: true },
    ),
    silhouette(
      anchor,
      [
        { x: -9.2, y: -17 },
        { x: -8.6, y: -20 },
        { x: 8.6, y: -20 },
        { x: 9.2, y: -17 },
      ],
      { smooth: true },
    ),
    // Pearls settled in the bottom.
    ...[
      { cx: -4.4, cy: -3 },
      { cx: -0.4, cy: -2.4 },
      { cx: 3.6, cy: -3 },
      { cx: -2.4, cy: -6 },
      { cx: 1.8, cy: -6.2 },
    ].map((spot) => circle(anchor, 1.7, { segments: 12, ...spot })),
  ];
}

/** food-favorites: sushi, and the rest of a long rotation. */
export function sushiPlate(at: At): readonly DeskPart[] {
  const plateZ = at.z + 0.8;

  return [
    disc({ x: at.x, y: at.y }, 9.5, at.z, 0.8, { segments: 18, shadow: 2 }),
    ...[-4.4, 1.6].map((offset) =>
      rounded(
        { x: at.x + offset - 3, y: at.y - 3.2 + offset * 0.5 },
        6.6,
        4.6,
        plateZ,
        2.4,
        { radius: 1.8 },
      ),
    ),
    ...[-4.4, 1.6].map((offset) =>
      rounded(
        { x: at.x + offset - 3.3, y: at.y - 3.5 + offset * 0.5 },
        7.2,
        5.2,
        plateZ + 2.4,
        1.2,
        { radius: 2 },
      ),
    ),
    // Chopsticks resting across the rim.
    ...[0, 1.6].map((offset) =>
      box(
        { x: at.x - 8 + offset, y: at.y + 5 + offset, z: plateZ },
        { width: 15, depth: 0.7, height: 0.7 },
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

  const hold = (across: number, up: number, size: number, offsets: readonly Point2[]) =>
    silhouette(
      { x: at.x + across, y: wallY, z: at.z + up },
      offsets.map((point) => ({ x: point.x * size, y: point.y * size })),
      { smooth: true },
    );

  return [
    box(
      { x: at.x, y: at.y, z: at.z },
      { width, depth, height },
      { shadow: 2 },
    ),
    // A hold on its own reads as a pebble — the first attempt came out a blob
    // with what looked like an eye, and near-identical to the mouse. Bolted to a
    // wall panel there is no ambiguity about what it is.
    hold(6, 19, 1, [
      { x: -4, y: -2.5 },
      { x: -1, y: -4.5 },
      { x: 3, y: -3 },
      { x: 4, y: 1 },
      { x: 0, y: 3 },
      { x: -4, y: 1.5 },
    ]),
    hold(15, 12, 0.85, [
      { x: -4.5, y: -1.5 },
      { x: -1, y: -4 },
      { x: 4, y: -2 },
      { x: 4, y: 2 },
      { x: -1, y: 3.5 },
      { x: -4.5, y: 2 },
    ]),
    hold(7, 5.5, 0.7, [
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
 * One symmetric profile rather than three projected solids. The old version
 * built two hex cylinders and a box bar; the bar sat at 45% of head height and
 * off-centre in depth, the far head painted over the near one, and the result
 * was visibly lopsided with edges missing. Drawn as a single outline the
 * symmetry is structural — it cannot drift.
 *
 * Left faceted on purpose: a plate-loaded dumbbell is angular, and smoothing
 * would turn it into a bone.
 */
export function dumbbell(at: At): readonly DeskPart[] {
  const anchor = { x: at.x, y: at.y, z: at.z };

  return [
    groundShadow({ x: at.x, y: at.y }, 11, 5, at.z),
    silhouette(anchor, [
      { x: -14, y: 0 },
      { x: -14, y: -13 },
      { x: -7, y: -13 },
      { x: -7, y: -9 },
      { x: 7, y: -9 },
      { x: 7, y: -13 },
      { x: 14, y: -13 },
      { x: 14, y: 0 },
      { x: 7, y: 0 },
      { x: 7, y: -4 },
      { x: -7, y: -4 },
      { x: -7, y: 0 },
    ]),
    // Knurling on the grip.
    ...[-3.5, 0, 3.5].map((offset) =>
      silhouette(
        anchor,
        [
          { x: offset, y: -8.4 },
          { x: offset, y: -4.6 },
        ],
        { outlineOnly: true },
      ),
    ),
  ];
}

/**
 * anime: ambitious stories and strategic rivalries.
 *
 * The old version was four blank slabs and read, correctly, as a stack of books
 * — because that is what it was. A volume needs cover art to be a manga volume
 * rather than a paperback, so this stands one up facing the camera and puts an
 * abstract composition on it: a diagonal sweep with speed lines, in the spirit
 * of the walls-and-strategy motif. Nothing copied from any series.
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
    // Two volumes stacked beside it, so the motif keeps its reading habit too.
    ...[0, 1].map((index) =>
      rounded(
        { x: at.x + width + 3, y: at.y + 4 },
        11,
        7.5,
        at.z + index * 2.2,
        2.2,
        { radius: 0.5, ...(index === 0 ? { shadow: 1.6 } : {}) },
      ),
    ),
  ];
}

/** Kept buildable but not currently placed — the field is at its budget. */
export function mouse(at: At): readonly DeskPart[] {
  return [
    cylinder({ x: at.x, y: at.y }, 4.6, at.z, 3.6, {
      segments: 14,
      squash: 1.45,
      taper: 0.55,
      shadow: 1.5,
    }),
  ];
}

export type ObjectBuilder = (at: At) => readonly DeskPart[];
export type { Point2 };
