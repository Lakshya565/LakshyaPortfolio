/**
 * Axonometric projection for the generated desk scene.
 *
 * The rejected hand-authored SVG failed because every object invented its own
 * vanishing directions. Here every vertex in the scene goes through one
 * `project()`, so perspective is correct by construction rather than by
 * redrawing. There is no light model: the scene is line art.
 *
 * World axes: `x` runs right-and-forward, `y` runs left-and-forward (depth),
 * `z` is up. The basis is 2:1 dimetric — a unit cube's top face is twice as
 * wide as it is tall, which stays crisp on screen and reads as a clean
 * "engineering" projection rather than a photographic one.
 */

export type Point = Readonly<{ x: number; y: number }>;

export type Vec3 = Readonly<{ x: number; y: number; z: number }>;

export type Size3 = Readonly<{ width: number; depth: number; height: number }>;

/**
 * Camera basis, matching guochen.design. His grid lines run at slope ±0.5 — true
 * 2:1 dimetric, where a unit cube's top face is exactly twice as wide as it is
 * tall — so `depth` is 0.5 rather than the shallower 0.38 the shaded build used.
 *
 * This reverses an earlier choice made when objects were shaded and needed tall
 * side faces to stay recognizable. Line art does not depend on that, and Guo's
 * angle is the reference.
 */
const camera = {
  horizontal: 1,
  depth: 0.5,
  height: 1,
} as const;

export function project(point: Vec3): Point {
  return {
    x: (point.x - point.y) * camera.horizontal,
    y: (point.x + point.y) * camera.depth - point.z * camera.height,
  };
}

export function toPath(points: readonly Point[]): string {
  const [first, ...rest] = points.map(
    (point) => `${round(point.x)} ${round(point.y)}`,
  );
  return `M${first}L${rest.join("L")}Z`;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * The three faces of a box that the camera can see. Hidden faces are never
 * emitted, which keeps the generated file small and prevents seams.
 */
export type BoxFaces = Readonly<{
  top: readonly Point[];
  left: readonly Point[];
  right: readonly Point[];
}>;

export function boxFaces(origin: Vec3, size: Size3): BoxFaces {
  const { x, y, z } = origin;
  const { width, depth, height } = size;
  const top = z + height;

  return {
    top: [
      project({ x, y, z: top }),
      project({ x: x + width, y, z: top }),
      project({ x: x + width, y: y + depth, z: top }),
      project({ x, y: y + depth, z: top }),
    ],
    // Faces the viewer down-and-left; catches the key light.
    left: [
      project({ x, y: y + depth, z: top }),
      project({ x: x + width, y: y + depth, z: top }),
      project({ x: x + width, y: y + depth, z }),
      project({ x, y: y + depth, z }),
    ],
    // Faces the viewer down-and-right; turned away from the key light.
    right: [
      project({ x: x + width, y, z: top }),
      project({ x: x + width, y: y + depth, z: top }),
      project({ x: x + width, y: y + depth, z }),
      project({ x: x + width, y, z }),
    ],
  };
}

/**
 * A soft rhombus on the surface an object rests on. Nothing in the scene is
 * allowed to float: this is the cheapest and most convincing grounding cue.
 */
export function contactShadow(
  origin: Vec3,
  size: Size3,
  spread = 1.5,
): readonly Point[] {
  const { x, y, z } = origin;
  const { width, depth } = size;
  // Offset away from the upper-left key light.
  const drift = spread * 0.35;

  return [
    project({ x: x - spread + drift, y: y - spread + drift, z }),
    project({ x: x + width + spread + drift, y: y - spread + drift, z }),
    project({ x: x + width + spread + drift, y: y + depth + spread + drift, z }),
    project({ x: x - spread + drift, y: y + depth + spread + drift, z }),
  ];
}

export type Point2 = Readonly<{ x: number; y: number }>;

export type ExtrudedFace = Readonly<{
  points: readonly Point[];
  /** -1 fully turned away from the key light, 1 fully facing it. */
  light: number;
}>;

export type Extrusion = Readonly<{
  top: readonly Point[];
  sides: readonly ExtrudedFace[];
}>;

/**
 * Extrudes a 2D footprint upward. This is what lets the scene hold objects that
 * are not cuboids — cups, the duck, a weight plate, rounded keycaps — while
 * still obeying the same projection and light rule as every box.
 *
 * Only faces turned toward the camera are emitted, so a cylinder costs half its
 * segments and no hidden geometry is ever drawn.
 *
 * `offset` shears the top face sideways and `scale` grows or shrinks it about
 * the footprint's centroid, which turns this one primitive into a wedge, a lamp
 * arm, a leaning book, a tilted screen, a cup, or a plant pot. Without them
 * every object has to be a vertical prism, and a landscape built only from
 * vertical prisms is exactly the pile of featureless cylinders this scene
 * started as.
 */
export type ExtrudeShaping = Readonly<{ offset?: Point2; scale?: number }>;

export function extrude(
  footprint: readonly Point2[],
  baseZ: number,
  height: number,
  shaping: ExtrudeShaping = {},
): Extrusion {
  const topZ = baseZ + height;
  const outward = footprintWinding(footprint);
  const sides: ExtrudedFace[] = [];
  const offset = shaping.offset ?? { x: 0, y: 0 };
  const scale = shaping.scale ?? 1;
  const centroid = centroidOf(footprint);
  const shift = (point: Point2): Point2 => ({
    x: centroid.x + (point.x - centroid.x) * scale + offset.x,
    y: centroid.y + (point.y - centroid.y) * scale + offset.y,
  });

  for (let index = 0; index < footprint.length; index += 1) {
    const start = footprint[index];
    const end = footprint[(index + 1) % footprint.length];
    const edge = { x: end.x - start.x, y: end.y - start.y };
    const normal = normalize({
      x: edge.y * outward,
      y: -edge.x * outward,
    });

    // The camera looks along +x +y, so a face is visible when its outward
    // normal has any component toward the viewer.
    if (normal.x + normal.y <= 0) {
      continue;
    }

    const topStart = shift(start);
    const topEnd = shift(end);

    sides.push({
      points: [
        project({ x: topStart.x, y: topStart.y, z: topZ }),
        project({ x: topEnd.x, y: topEnd.y, z: topZ }),
        project({ x: end.x, y: end.y, z: baseZ }),
        project({ x: start.x, y: start.y, z: baseZ }),
      ],
      light: normal.y,
    });
  }

  return {
    top: footprint.map((point) => project({ ...shift(point), z: topZ })),
    sides,
  };
}

export function centroidOf(footprint: readonly Point2[]): Point2 {
  return footprint.reduce(
    (total, point) => ({
      x: total.x + point.x / footprint.length,
      y: total.y + point.y / footprint.length,
    }),
    { x: 0, y: 0 },
  );
}

/** +1 when the footprint is wound so that (dy, -dx) points outward. */
function footprintWinding(footprint: readonly Point2[]): number {
  let area = 0;

  for (let index = 0; index < footprint.length; index += 1) {
    const start = footprint[index];
    const end = footprint[(index + 1) % footprint.length];
    area += start.x * end.y - end.x * start.y;
  }

  return area > 0 ? -1 : 1;
}

function normalize(vector: Point2): Point2 {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / length, y: vector.y / length };
}

/** Regular n-gon footprint: the basis for cups, plates, and rounded bodies. */
export function polygonFootprint(
  center: Point2,
  radiusX: number,
  radiusY: number,
  segments: number,
  rotation = 0,
): readonly Point2[] {
  return Array.from({ length: segments }, (_, index) => {
    const angle = rotation + (index / segments) * Math.PI * 2;
    return {
      x: center.x + Math.cos(angle) * radiusX,
      y: center.y + Math.sin(angle) * radiusY,
    };
  });
}

/** Rounded-rectangle footprint for softened slabs, keys, and bag shapes. */
export function roundedFootprint(
  origin: Point2,
  width: number,
  depth: number,
  radius: number,
  segmentsPerCorner = 4,
): readonly Point2[] {
  const r = Math.min(radius, width / 2, depth / 2);
  const corners: readonly Readonly<{ cx: number; cy: number; from: number }>[] = [
    { cx: origin.x + width - r, cy: origin.y + depth - r, from: 0 },
    { cx: origin.x + r, cy: origin.y + depth - r, from: Math.PI / 2 },
    { cx: origin.x + r, cy: origin.y + r, from: Math.PI },
    { cx: origin.x + width - r, cy: origin.y + r, from: (Math.PI * 3) / 2 },
  ];

  return corners.flatMap((corner) =>
    Array.from({ length: segmentsPerCorner + 1 }, (_, index) => {
      const angle = corner.from + (index / segmentsPerCorner) * (Math.PI / 2);
      return {
        x: corner.cx + Math.cos(angle) * r,
        y: corner.cy + Math.sin(angle) * r,
      };
    }),
  );
}

export type Bounds = Readonly<{
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}>;

export function boundsOf(points: readonly Point[]): Bounds {
  return points.reduce<Bounds>(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxX: Math.max(bounds.maxX, point.x),
      maxY: Math.max(bounds.maxY, point.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  );
}
