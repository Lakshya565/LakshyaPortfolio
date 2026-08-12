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
 * rather than below white. There are no materials, no light model, and no per
 * object hues — a part is either a solid face or a detail line.
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
  /** Flat cast shadows. Guo's #E8E8E8 — one polygon, no stroke. */
  shadow: "#242a36",
} as const;

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

export type DeskPart = BoxPart | ExtrudePart | FacePart | ScreenPart;

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

export function cylinder(
  center: Point2,
  radius: number,
  z: number,
  height: number,
  options: SolidOptions & Readonly<{ segments?: number; squash?: number }> = {},
): ExtrudePart {
  const { segments = 12, squash = 1, shadow, outlineOnly } = options;

  return {
    shape: "extrude",
    footprint: polygonFootprint(center, radius, radius * squash, segments),
    z,
    height,
    ...(shadow === undefined ? {} : { shadow }),
    ...(outlineOnly ? { outlineOnly } : {}),
    ...shapingOf(options),
  };
}

export function rounded(
  origin: Point2,
  width: number,
  depth: number,
  z: number,
  height: number,
  options: SolidOptions & Readonly<{ radius?: number }> = {},
): ExtrudePart {
  const { radius = 2, shadow, outlineOnly } = options;

  return {
    shape: "extrude",
    footprint: roundedFootprint(origin, width, depth, radius),
    z,
    height,
    ...(shadow === undefined ? {} : { shadow }),
    ...(outlineOnly ? { outlineOnly } : {}),
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
  const { shadow, outlineOnly } = options;

  return {
    shape: "extrude",
    footprint: points,
    z,
    height,
    ...(shadow === undefined ? {} : { shadow }),
    ...(outlineOnly ? { outlineOnly } : {}),
    ...shapingOf(options),
  };
}

/** A flat disc — plates, canopies, lids, coasters. */
export function disc(
  center: Point2,
  radius: number,
  z: number,
  height: number,
  options: SolidOptions & Readonly<{ segments?: number; squash?: number }> = {},
): ExtrudePart {
  return cylinder(center, radius, z, height, { segments: 14, ...options });
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

/** A true circle in screen space — a ball, not a coin lying flat. */
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
    rest,
  );
}
