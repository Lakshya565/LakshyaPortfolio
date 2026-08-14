/**
 * Building blocks for the isometric scene.
 *
 * The scene is monochrome line art, following guochen.design exactly. His SVG
 * uses precisely two stroke colours — `#B6B6B6` for objects and `#EDEDED` for
 * the grid — with `fill="white"` so objects occlude the grid behind them, and
 * `stroke-linecap`/`stroke-linejoin="round"` with `stroke-miterlimit="1.5"` on
 * every path.
 *
 * Ours is the same technique inverted for a dark page: fills take the page
 * ground so objects still punch out the grid, and the two greys sit above it
 * rather than below white. There is no material system and no light model — a
 * part is either a solid face or a detail line. What we do have beyond Guo is
 * `palette`: an object that is a specific colour in life may take that colour,
 * because it is the fastest way to say what the object is.
 */

import type { Point2, Size3, Vec3 } from "@/lib/desk/projection";
import { polygonFootprint, roundedFootprint } from "@/lib/desk/projection";

/**
 * Four tones, mirroring Guo's four. Contrast cannot be inverted arithmetically —
 * a near-black ground compresses the low end, so the strokes sit further from
 * the ground than his do from white, or nothing would be visible at all.
 */
export const ink = {
  /**
   * Fill for every solid face, and for the field itself. Matches `--canvas` so
   * the scene bleeds into the page with no panel around it — Guo's sits directly
   * on his background, not inside a card.
   */
  ground: "#04060a",
  /** Object outlines. Guo's #B6B6B6. */
  line: "#9aa2b1",
  /** The isometric grid. Guo's #EDEDED. */
  grid: "#232833",
  /**
   * Interactive objects. Matches `--accent-green`, `oklch(0.79 0.145 155)`.
   *
   * This is the project tree's Software colour, chosen anyway at Lakshya's
   * explicit call — the shared hue does not imply that a desk object belongs to
   * a category. In this field colour means one thing: the object responds.
   */
  accent: "#62d691",
  /** Flat cast shadows. Guo's #E8E8E8 — one polygon, no stroke. */
  shadow: "#242a36",
  /**
   * Claude's orange, for the mark on the monitor screen.
   *
   * The one deliberate spot colour in the scene. It reads as a brand colour
   * rather than site chrome, which is why it survives the palette moving off
   * orange everywhere else.
   */
  claude: "#d97757",
} as const;

/**
 * Named colours for objects that are a specific colour in life.
 *
 * Each entry is a pair: `line` is the bright hue that carries the stroke, `wash`
 * is the same hue at a mid value for the fill. Use `hue()` for both, `hueLine()`
 * when only the outline should take the colour.
 *
 * **The washes are mid-tones, not tints.** They began near the ground, on the
 * theory that a dark fill lets the outline carry the object. Seen at the size
 * the scene is actually viewed — forty pixels — that made every fill read as
 * black: Kirby was a black ball with a pink edge and the matcha was a black cup.
 * A wash has to be far enough from `ink.ground` to name its own colour on its
 * own. It still sits well below `line`, so the outline keeps the drawing.
 *
 * This is where the scene departs from guochen.design, which is strictly two
 * greys. Lakshya's call: the annotated objects are things with real colours —
 * green filament, an Arduino, matcha — and drawing them grey was throwing away
 * the fastest way to say what they are.
 */
export const palette = {
  /** Arduino's board teal. Their brand colour, not a stand-in. */
  arduino: { line: "#3fbfc9", wash: "#1c6a72" },
  /**
   * Printed silkscreen and labels, and the sushi plate. The brightest thing in
   * the palette — so "lift the wash toward the real colour" means lifting it
   * most of the way to white, not to a mid grey. Held at a mid value this turned
   * a white plate into a slate one, which is the same mistake as leaving a pink
   * Kirby black, just in the other direction.
   */
  silkscreen: { line: "#e6e2d6", wash: "#cdc8b9" },
  /**
   * Header strips, jacks, connector shells.
   *
   * A dimmer relative of `silkscreen`, and the difference is load-bearing: at
   * full brightness the headers outrank the board they sit on, and the object
   * stops reading as a board with parts and starts reading as parts on a tray.
   */
  connector: { line: "#a8a294", wash: "#4a463d" },
  /** Matcha. */
  matcha: { line: "#8ecf5c", wash: "#467a2c" },
  /** Thai tea, and the warmer of the two climbing holds. */
  thaiTea: { line: "#eb9a45", wash: "#8a5620" },
  /** Cup lids. */
  lid: { line: "#63a8ec", wash: "#2c5f96" },
  /** Straws, and anything else in kraft brown. */
  cocoa: { line: "#b07a4e", wash: "#6b4527" },
  /**
   * Tapioca pearls. Deliberately the one thing left dark, because that is both
   * true to life and necessary: they sit inside the tea, and a pearl at the
   * tea's own value is invisible.
   */
  pearl: { line: "#8a5f3e", wash: "#241509" },
  /** Salmon nigiri. */
  salmon: { line: "#f2896a", wash: "#a04a34" },
  /** Nori. */
  nori: { line: "#4f8a63", wash: "#2c5940" },
  /** Sushi rice. Warmer and a shade dimmer than silkscreen's printed white. */
  rice: { line: "#dcd3bd", wash: "#bdb49b" },
  /** Kirby. */
  kirbyPink: { line: "#f79ac4", wash: "#c96a99" },
  /** His eyes: dark navy under a bright rim, which is how they are drawn. */
  kirbyBlue: { line: "#5b86e0", wash: "#22366b" },
  /** His feet and cheeks. */
  kirbyRed: { line: "#e75f52", wash: "#9c332a" },
  /** The belt's rank stripes. */
  beltGold: { line: "#dbb45f", wash: "#8a6d28" },
  /**
   * Black webbing — the one entry that stays dark on purpose, because the belt's
   * colour *is* black and lifting it would make it a grey belt. It still clears
   * `ink.ground` enough to punch out the grid. The `line` is the sheen along a
   * fold, not the belt's colour: a genuinely black outline draws nothing here.
   */
  beltBlack: { line: "#c3c9d6", wash: "#16191f" },
  /** Climbing holds. */
  holdGreen: { line: "#5fc784", wash: "#2e7a4c" },
  holdBlue: { line: "#5aa8d8", wash: "#2a6488" },
  /** The duck's printed PLA. */
  filament: { line: "#57d18f", wash: "#2a7d55" },
  /** The Triforce's lit faces. */
  triforce: { line: "#f2c94c", wash: "#9c7a1c" },
  /**
   * Its receding faces. The one place in the palette where two entries are the
   * same hue at two values: a prism whose sides match its front reads as a flat
   * emblem, and the side faces are the only thing that can say otherwise. Unlike
   * the shading that used to sit on Kirby and the duck, this is a real face at a
   * real angle, not a contour painted onto a curve.
   */
  triforceSide: { line: "#b08d2e", wash: "#6a5212" },
  /** A lit LED. */
  led: { line: "#ff6b6b", wash: "#a52f2f" },
  /** The compass needle. North is red and south is white on every real one. */
  needleNorth: { line: "#e75f52", wash: "#a83329" },
  needleSouth: { line: "#e6e2d6", wash: "#7c786d" },
  /** A CRT that is switched on. */
  crtGlow: { line: "#7fd4e8", wash: "#1f5a6b" },
  /** Jumper wires. Outline-only, so the wash is never asked for. */
  wireWarm: { line: "#e8b34a", wash: "#7a5c1c" },
  wireCool: { line: "#5a8ed0", wash: "#28477a" },
} as const;

export type PaletteName = keyof typeof palette;

/** Bright outline over a dark wash of the same hue. */
export function hue(name: PaletteName): Readonly<{ stroke: string; fill: string }> {
  return { stroke: palette[name].line, fill: palette[name].wash };
}

/** Colour the outline and leave the fill alone — detail lines, rims, wires. */
export function hueLine(name: PaletteName): Readonly<{ stroke: string }> {
  return { stroke: palette[name].line };
}

type PartCommon = Readonly<{
  /** Cast-shadow spread in scene units. Omit for objects that sit on another. */
  shadow?: number;
  /**
   * Draw the outline without a fill. This is how Guo draws interior detail — the
   * pencil's facets are unfilled stroked paths laid over its filled faces.
   */
  outlineOnly?: boolean;
  /** Fill flat in the shadow tone with no stroke, like Guo's `cube-shadow`. */
  tone?: "shadow";
  /**
   * Draw a curve through the points instead of straight segments between them.
   *
   * Anything organic needs this. Without it a silhouette is a polygon, and a
   * polygon at object scale reads as a set of creases — which is exactly what
   * the first duck was. See `toSmoothPath`.
   */
  smooth?: boolean;
  /**
   * Fill and stroke this part in one colour. Shorthand for setting both.
   *
   * Kept for marks that are a single flat colour with no outline of their own —
   * the Claude squid on the monitor is the case it was written for.
   */
  accent?: string;
  /** Outline colour. Overrides the object group's stroke for this part alone. */
  stroke?: string;
  /** Fill colour. Overrides the page ground for this part alone. */
  fill?: string;
  /**
   * Leave the path open rather than closing it back to the first point.
   *
   * For anything that is a line rather than a shape: wires, surface arcs, folds.
   * A closed three-point arc renders as a filled sail, which is what the dev
   * board's jumper wires were until this existed.
   */
  open?: boolean;
}>;

export type BoxPart = PartCommon &
  Readonly<{
    shape?: "box";
    origin: Vec3;
    size: Size3;
  }>;

export type ExtrudePart = PartCommon &
  Readonly<{
    shape: "extrude";
    footprint: readonly Point2[];
    z: number;
    height: number;
    shaping?: Readonly<{ offset?: Point2; scale?: number }>;
  }>;

/**
 * An arbitrary polygon in 3D, projected through the same camera as everything
 * else. This is what lifts the scene out of "vertical prisms only": organic
 * shapes can be drawn vertex by vertex without any risk of the drift that sank
 * the first hand-authored desk, because every point still goes through
 * `project()`.
 */
export type FacePart = PartCommon &
  Readonly<{
    shape: "face";
    points: readonly Vec3[];
  }>;

/**
 * A shape drawn in screen space, anchored to a point in the world.
 *
 * Guo uses this constantly and it is not optional if we are copying him: his
 * tree canopies, his figures' heads, his cat and his Totoro are plain 2D circles
 * and silhouettes, not projected solids. A circle in the ground plane would
 * project to a flat ellipse and read as a coin lying down; a circle in screen
 * space reads as a ball. The anchor still goes through `project()`, so the shape
 * stays locked to its place in the scene.
 */
export type ScreenPart = PartCommon &
  Readonly<{
    shape: "screen";
    anchor: Vec3;
    /** Offsets from the projected anchor, in screen units. Y is down. */
    offsets: readonly Point2[];
  }>;

/**
 * A cylinder, cone or frustum with a genuinely round body.
 *
 * The old approach extruded an N-gon and then collapsed it to a convex hull,
 * which merged the rim, the wall and the base into one blob with no curve
 * anywhere — the reason every round object in the scene read as a flat sticker.
 * This is rendered as a real solid instead: a closed top ellipse, and a body
 * bounded by the two silhouette edges with true arcs along the front of the top
 * and bottom rims.
 *
 * `topScale` below 1 tapers to a cone; `squash` makes the footprint oval.
 */
export type RoundPart = PartCommon &
  Readonly<{
    shape: "round";
    center: Point2;
    radius: number;
    z: number;
    height: number;
    /** Radius multiplier at the top. 1 is a cylinder, 0 a cone. */
    topScale?: number;
    /** Footprint depth as a fraction of `radius`. */
    squash?: number;
    /** Shifts the top face sideways, for leaning forms. */
    topOffset?: Point2;
    /** Concentric rings drawn on the top face, as fractions of the radius. */
    rings?: readonly number[];
  }>;

/** A real pyramid: an apex over a base polygon, not a cone tapered to a point. */
export type PyramidPart = PartCommon &
  Readonly<{
    shape: "pyramid";
    base: readonly Point2[];
    z: number;
    height: number;
    /** Shifts the apex off centre. */
    apexOffset?: Point2;
  }>;

/**
 * A dome — half an ellipsoid sitting on the ground.
 *
 * A sphere's silhouette really is a circle in screen space, so the volume has to
 * come from somewhere else: here it is the curved ground contact, drawn as the
 * front arc of the base ellipse. Stacked tapering rings were tried in v3 and
 * produced a wedding cake; do not revisit them.
 */
export type DomePart = PartCommon &
  Readonly<{
    shape: "dome";
    center: Point2;
    radius: number;
    z: number;
    height: number;
    squash?: number;
  }>;

export type DeskPart =
  | BoxPart
  | ExtrudePart
  | FacePart
  | ScreenPart
  | RoundPart
  | PyramidPart
  | DomePart;

export type DeskObject = Readonly<{
  id: string;
  hotspot?: string;
  tier?: "hero" | "detail";
  /** Scenery may sit close to its neighbours; hotspot objects may not overlap. */
  scenery?: boolean;
  /** Explicit paint order, low first. Ties break on depth. */
  order: number;
  parts: readonly DeskPart[];
}>;

// ---------------------------------------------------------------------------
// Shape helpers
// ---------------------------------------------------------------------------

export function box(
  origin: Vec3,
  size: Size3,
  options: PartCommon = {},
): BoxPart {
  return { origin, size, ...options };
}

type SolidOptions = PartCommon &
  Readonly<{ taper?: number; lean?: Point2 }>;

/**
 * The paint fields, forwarded onto a part.
 *
 * `cylinder`, `rounded` and `wedge` build their parts field by field rather than
 * spreading their options, because most of what they are handed is geometry that
 * has to be turned into something else. That meant every one of them silently
 * dropped any presentation option it did not name — which is exactly how a part
 * ends up ignoring the colour it was given, with nothing to show for it. Naming
 * the paint fields in one place is what stops that from recurring per helper.
 */
function paintOf(options: PartCommon): PartCommon {
  const { shadow, outlineOnly, tone, smooth, accent, stroke, fill, open } =
    options;

  return {
    ...(shadow === undefined ? {} : { shadow }),
    ...(outlineOnly ? { outlineOnly } : {}),
    ...(tone === undefined ? {} : { tone }),
    ...(smooth ? { smooth } : {}),
    ...(accent === undefined ? {} : { accent }),
    ...(stroke === undefined ? {} : { stroke }),
    ...(fill === undefined ? {} : { fill }),
    ...(open ? { open } : {}),
  };
}

function shapingOf(options: SolidOptions): Pick<ExtrudePart, "shaping"> {
  const { taper, lean } = options;
  if (taper === undefined && lean === undefined) {
    return {};
  }
  return {
    shaping: {
      ...(taper === undefined ? {} : { scale: taper }),
      ...(lean === undefined ? {} : { offset: lean }),
    },
  };
}

/**
 * A cylinder, cone or frustum.
 *
 * `segments` is accepted and ignored: the body is drawn with real arcs now, so
 * there is no facet count to choose. The parameter stays because every caller in
 * `objects.ts` passes it and dropping it would be a large, meaningless diff.
 */
export function cylinder(
  center: Point2,
  radius: number,
  z: number,
  height: number,
  options: SolidOptions &
    Readonly<{ segments?: number; squash?: number; rings?: readonly number[] }> = {},
): RoundPart {
  const { squash, taper, lean, rings } = options;

  return {
    shape: "round",
    center,
    radius,
    z,
    height,
    ...(taper === undefined ? {} : { topScale: taper }),
    ...(squash === undefined ? {} : { squash }),
    ...(lean === undefined ? {} : { topOffset: lean }),
    ...(rings === undefined ? {} : { rings }),
    ...paintOf(options),
  };
}

/** A real pyramid: apex over a base polygon. */
export function pyramid(
  base: readonly Point2[],
  z: number,
  height: number,
  options: PartCommon & Readonly<{ apexOffset?: Point2 }> = {},
): PyramidPart {
  return { shape: "pyramid", base, z, height, ...options };
}

/** Half an ellipsoid on the ground — mouse shells, heads, soft bodies. */
export function dome(
  center: Point2,
  radius: number,
  z: number,
  height: number,
  options: PartCommon & Readonly<{ squash?: number }> = {},
): DomePart {
  return { shape: "dome", center, radius, z, height, ...options };
}

export function rounded(
  origin: Point2,
  width: number,
  depth: number,
  z: number,
  height: number,
  options: SolidOptions & Readonly<{ radius?: number }> = {},
): ExtrudePart {
  const { radius = 2 } = options;

  return {
    shape: "extrude",
    footprint: roundedFootprint(origin, width, depth, radius),
    z,
    height,
    ...paintOf(options),
    ...shapingOf(options),
  };
}

/**
 * A prism over an arbitrary footprint — belt tails, ribbons, angled slabs.
 *
 * `rounded` only makes axis-aligned boxes and `wedge` only takes three points,
 * so anything running diagonally across the grid had nowhere to go. Keep the
 * footprint to six points or fewer: past that the generator collapses a solid
 * into its convex hull and the individual faces are lost.
 */
export function slab(
  footprint: readonly Point2[],
  z: number,
  height: number,
  options: SolidOptions = {},
): ExtrudePart {
  return {
    shape: "extrude",
    footprint,
    z,
    height,
    ...paintOf(options),
    ...shapingOf(options),
  };
}

/** A three-sided prism: beaks, roof gables, book wedges, ramps. */
export function wedge(
  points: readonly [Point2, Point2, Point2],
  z: number,
  height: number,
  options: SolidOptions = {},
): ExtrudePart {
  return {
    shape: "extrude",
    footprint: points,
    z,
    height,
    ...paintOf(options),
    ...shapingOf(options),
  };
}

/** A flat disc — plates, canopies, lids, coasters. */
export function disc(
  center: Point2,
  radius: number,
  z: number,
  height: number,
  options: SolidOptions &
    Readonly<{ segments?: number; squash?: number; rings?: readonly number[] }> = {},
): RoundPart {
  return cylinder(center, radius, z, height, options);
}

/** A filled polygon in 3D. */
export function face(
  points: readonly Vec3[],
  options: PartCommon = {},
): FacePart {
  return { shape: "face", points, ...options };
}

/** An unfilled polyline in 3D — Guo's interior detail lines. */
export function detail(points: readonly Vec3[]): FacePart {
  return { shape: "face", points, outlineOnly: true };
}

/**
 * An explicit cast shadow lying on the ground. Screen-space silhouettes cannot
 * derive one from a footprint they do not have, so they declare it directly.
 */
export function groundShadow(
  center: Point2,
  radiusX: number,
  radiusY: number,
  z = 0,
): FacePart {
  return {
    shape: "face",
    points: polygonFootprint(center, radiusX, radiusY, 16).map((point) => ({
      ...point,
      z,
    })),
    // Smoothed for the same reason `circle` is: sixteen segments around a small
    // footprint projects to a visibly angular blob, and a hard-cornered shadow
    // under a round object is the one thing in the scene with no excuse for it.
    smooth: true,
    tone: "shadow",
  };
}

/** An arbitrary silhouette drawn in screen space at a world anchor. */
export function silhouette(
  anchor: Vec3,
  offsets: readonly Point2[],
  options: PartCommon = {},
): ScreenPart {
  return { shape: "screen", anchor, offsets, ...options };
}

/**
 * A true circle in screen space — a ball, not a coin lying flat.
 *
 * Smoothed by default, and that default is not cosmetic. Callers pass a segment
 * count sized for the object's *scene* footprint, so a 1.4-unit eye or a
 * 1.5-unit pearl got twelve segments and came out a visible dodecagon the moment
 * anything was magnified. Curving through the points costs nothing and removes
 * the whole class of "small circles are polygons".
 */
export function circle(
  anchor: Vec3,
  radius: number,
  options: PartCommon &
    Readonly<{ segments?: number; cx?: number; cy?: number }> = {},
): ScreenPart {
  const { segments = 20, cx = 0, cy = 0, ...rest } = options;

  return silhouette(
    anchor,
    Array.from({ length: segments }, (_, index) => {
      const angle = (index / segments) * Math.PI * 2;
      return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
    }),
    { smooth: true, ...rest },
  );
}
