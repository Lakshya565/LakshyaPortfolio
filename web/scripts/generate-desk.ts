/**
 * Generates the isometric scene from the typed scene description.
 *
 * Run explicitly (`npm.cmd run generate:desk`) rather than during the build: the
 * SVG stays a reviewable, committed asset, and the site never pays a generation
 * cost at request or build time.
 *
 * The output copies guochen.design's technique directly. Every path carries his
 * attribute set — a fill, one stroke colour, `stroke-miterlimit="1.5"`, and
 * round caps and joins — and the ground is his: two families of long diagonals
 * at the 2:1 isometric angle, faded out at the edges by gradient rects. There is
 * no light model, no per-face tone, and no material.
 *
 * Two things are still derived rather than hand-tuned, so they cannot drift away
 * from the artwork: hotspot bounds, and the guarantee that no two labelled
 * objects overlap on screen.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  boundsOf,
  boxFaces,
  centroidOf,
  contactShadow,
  ellipseArc,
  extrude,
  project,
  toOpenPath,
  toPath,
  toSegmentPath,
  toSmoothPath,
  type Bounds,
  type Point,
  type Point2,
} from "@/lib/desk/projection";
import {
  ink,
  type DomePart,
  type PyramidPart,
  type RoundPart,
} from "@/lib/desk/parts";
import {
  deskObjects,
  type DeskObject,
  type DeskPart,
} from "@/lib/desk/scene";

const outputWidth = 1444;
/** Guo's canvas is 1444×720. A fixed frame is what lets the grid fill it. */
const outputAspect = 1444 / 720;
const padding = 14;

/** Guo's stroke-width is 1 in a 1444-wide viewBox. Ours scales to match. */
function strokeWidth(viewWidth: number): number {
  return round(viewWidth / outputWidth);
}

type Emitted = Readonly<{ markup: string; points: readonly Point[] }>;

/**
 * Guo's exact attribute set, minus the fill, which varies.
 *
 * Carried once on a wrapper group rather than repeated on every path. It used to
 * sit on all 277 of them, which was roughly 19 KB of identical text in a 76 KB
 * file — and, more importantly, made per-object colour impossible, because an
 * attribute on the path always beats one inherited from its group.
 */
const strokeAttrs = `stroke="${ink.line}" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round"`;

/** Andrew's monotone chain. Footprints in this scene are convex. */
function convexHull(points: readonly Point[]): readonly Point[] {
  if (points.length < 3) {
    return points;
  }

  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const build = (source: readonly Point[]): Point[] => {
    const chain: Point[] = [];
    for (const point of source) {
      while (
        chain.length >= 2 &&
        cross(chain[chain.length - 2], chain[chain.length - 1], point) <= 0
      ) {
        chain.pop();
      }
      chain.push(point);
    }
    chain.pop();
    return chain;
  };

  return [...build(sorted), ...build([...sorted].reverse())];
}

type Painted = Pick<
  DeskPart,
  "outlineOnly" | "tone" | "smooth" | "accent" | "stroke" | "fill" | "open"
>;

function fillOf(part: Painted): string {
  if (part.tone === "shadow") {
    return ink.shadow;
  }
  // An unfilled path is unfilled whatever colour it was handed — this is Guo's
  // interior-detail style, and a fill would hide the faces underneath it.
  if (part.outlineOnly) {
    return "none";
  }
  return part.fill ?? part.accent ?? ink.ground;
}

/**
 * The stroke attribute, or nothing at all.
 *
 * Returning an empty string is the common case and the important one: the path
 * then inherits its colour from the object's group, which is what makes
 * per-object colour possible with a single attribute.
 */
function strokeOf(part: Painted): string {
  // Shadows must opt out explicitly now that stroke is inherited rather than
  // set per path — otherwise every shadow picks up an outline.
  if (part.tone === "shadow") {
    return ` stroke="none"`;
  }
  const colour = part.stroke ?? part.accent;
  return colour ? ` stroke="${colour}"` : "";
}

function paint(points: readonly Point[], part: Painted): string {
  // `smooth` is a closed Catmull-Rom loop, so it has nothing to say about an
  // open path; `open` wins where a caller has asked for both.
  const d = part.open
    ? toOpenPath(points)
    : part.smooth
      ? toSmoothPath(points)
      : toPath(points);
  return `<path d="${d}" fill="${fillOf(part)}"${strokeOf(part)}/>`;
}

/**
 * Where a projected circle's silhouette edges fall.
 *
 * On the ground plane the camera gives `screenX = (x - y)`, so around a circle
 * `screenX(t) = k + rx·cos t − ry·sin t`. That is stationary when
 * `−rx·sin t − ry·cos t = 0`, i.e. `tan t = −ry/rx`. For a circular footprint
 * that lands at 3π/4 and −π/4 — the two points where the side wall of a cylinder
 * meets its rim, and therefore where the outline stops being an arc and becomes
 * a straight edge. Getting these exactly right is what makes a cylinder look
 * like a cylinder instead of a blob.
 */
function tangentAngles(radiusX: number, radiusY: number) {
  const right = Math.atan2(-radiusY, radiusX);
  return { left: right + Math.PI, right };
}

/**
 * The near half of a rim, from the left silhouette point round to the right.
 *
 * Screen depth is `(x + y)`, so the front of the ring is at t = π/4; sweeping
 * downward from 3π/4 to −π/4 passes through it.
 */
function frontArc(
  center: Point2,
  radiusX: number,
  radiusY: number,
  z: number,
): readonly Point[] {
  const { left, right } = tangentAngles(radiusX, radiusY);
  return ellipseArc(center, radiusX, radiusY, z, left, right, 18);
}

function fullEllipse(
  center: Point2,
  radiusX: number,
  radiusY: number,
  z: number,
): readonly Point[] {
  return ellipseArc(center, radiusX, radiusY, z, 0, Math.PI * 2, 28);
}

function emitRound(part: RoundPart): Emitted {
  const radiusY = part.radius * (part.squash ?? 1);
  const topScale = part.topScale ?? 1;
  const offset = part.topOffset ?? { x: 0, y: 0 };
  const topCenter = {
    x: part.center.x + offset.x,
    y: part.center.y + offset.y,
  };
  const topZ = part.z + part.height;
  const topRadiusX = part.radius * topScale;
  const topRadiusY = radiusY * topScale;

  const baseFront = frontArc(part.center, part.radius, radiusY, part.z);
  const topFront = frontArc(topCenter, topRadiusX, topRadiusY, topZ);
  const topRing = fullEllipse(topCenter, topRadiusX, topRadiusY, topZ);

  // The wall: down the right silhouette edge, back along the front of the base,
  // and up the left edge. Both rims stay curved; the two side edges stay
  // straight, which is exactly the mix `toSegmentPath` exists for.
  const wall = toSegmentPath([
    { points: topFront, curved: true },
    { points: [...baseFront].reverse(), curved: true },
  ]);

  const markup = [
    `<path d="${wall}" fill="${fillOf(part)}"${strokeOf(part)}/>`,
    // A cone tapers to nothing, so its top ring would be a dot.
    topScale > 0.02
      ? `<path d="${toSegmentPath([{ points: topRing, curved: true }])}" fill="${fillOf(part)}"${strokeOf(part)}/>`
      : "",
    ...(part.rings ?? []).map(
      (scale) =>
        `<path d="${toSegmentPath([
          {
            points: fullEllipse(
              topCenter,
              topRadiusX * scale,
              topRadiusY * scale,
              topZ,
            ),
            curved: true,
          },
        ])}" fill="none"${strokeOf(part)}/>`,
    ),
  ].join("");

  return { markup, points: [...baseFront, ...topRing] };
}

/**
 * The direction the camera looks, in world space.
 *
 * `project` maps `(x, y, z)` to `(x − y, ½(x + y) − z)`, so the ray that
 * collapses to a single screen point is the one with `x = y = z`: the viewer
 * sits along (1, 1, 1). A face is therefore visible when its outward normal has
 * a positive dot product with that.
 *
 * `extrude` gets away with testing only `normal.x + normal.y` because its walls
 * are vertical, so their normals have no z component at all. A pyramid's faces
 * tilt upward, and the camera looks down as well as sideways — ignoring z there
 * culls faces that are plainly visible, which is what made the roof transparent.
 */
const viewDirection = { x: 1, y: 1, z: 1 } as const;

function emitPyramid(part: PyramidPart): Emitted {
  const offset = part.apexOffset ?? { x: 0, y: 0 };
  const centroid = centroidOf(part.base);
  const apexWorld = {
    x: centroid.x + offset.x,
    y: centroid.y + offset.y,
    z: part.z + part.height,
  };
  const apex = project(apexWorld);
  const faces: string[] = [];
  const points: Point[] = [apex];

  for (let index = 0; index < part.base.length; index += 1) {
    const start = { ...part.base[index], z: part.z };
    const end = { ...part.base[(index + 1) % part.base.length], z: part.z };

    const u = { x: end.x - start.x, y: end.y - start.y, z: 0 };
    const v = {
      x: apexWorld.x - start.x,
      y: apexWorld.y - start.y,
      z: apexWorld.z - start.z,
    };
    let normal = {
      x: u.y * v.z - u.z * v.y,
      y: u.z * v.x - u.x * v.z,
      z: u.x * v.y - u.y * v.x,
    };

    // Orient outward without depending on the caller's winding: the normal must
    // point away from the solid's own centre.
    const away = {
      x: (start.x + end.x) / 2 - centroid.x,
      y: (start.y + end.y) / 2 - centroid.y,
    };
    if (normal.x * away.x + normal.y * away.y < 0) {
      normal = { x: -normal.x, y: -normal.y, z: -normal.z };
    }

    const facing =
      normal.x * viewDirection.x +
      normal.y * viewDirection.y +
      normal.z * viewDirection.z;
    if (facing <= 0) {
      continue;
    }

    const a = project(start);
    const b = project(end);
    points.push(a, b);
    faces.push(
      `<path d="${toPath([a, b, apex])}" fill="${fillOf(part)}"${strokeOf(part)}/>`,
    );
  }

  return { markup: faces.join(""), points };
}

function emitDome(part: DomePart): Emitted {
  const radiusY = part.radius * (part.squash ?? 1);
  const base = frontArc(part.center, part.radius, radiusY, part.z);
  const { left, right } = tangentAngles(part.radius, radiusY);
  const rimPoint = (angle: number) =>
    project({
      x: part.center.x + Math.cos(angle) * part.radius,
      y: part.center.y + Math.sin(angle) * radiusY,
      z: part.z,
    });
  const leftPoint = rimPoint(left);
  const rightPoint = rimPoint(right);
  const apex = project({ ...part.center, z: part.z + part.height });

  // The shell arcs from one silhouette point over the apex to the other.
  //
  // An earlier version assumed both silhouette points sat at the same screen
  // height and swept a half-ellipse between them. That only holds for a circular
  // footprint: squash the base and the chord tilts, which flattened the dome
  // into a disc. Interpolating along the chord and bulging toward the projected
  // apex works whatever the footprint, because it is stated in terms of the
  // three points that are actually known.
  const mid = {
    x: (leftPoint.x + rightPoint.x) / 2,
    y: (leftPoint.y + rightPoint.y) / 2,
  };
  const bulge = { x: apex.x - mid.x, y: apex.y - mid.y };

  const shell = Array.from({ length: 17 }, (_, index) => {
    const t = index / 16;
    const lift = 4 * t * (1 - t);
    return {
      x: leftPoint.x + (rightPoint.x - leftPoint.x) * t + bulge.x * lift,
      y: leftPoint.y + (rightPoint.y - leftPoint.y) * t + bulge.y * lift,
    };
  });

  const markup = `<path d="${toSegmentPath([
    { points: shell, curved: true },
    { points: [...base].reverse(), curved: true },
  ])}" fill="${fillOf(part)}"${strokeOf(part)}/>`;

  return { markup, points: [...base, ...shell] };
}

function emitPart(part: DeskPart): Emitted {
  if (part.shape === "round") {
    return emitRound(part);
  }

  if (part.shape === "pyramid") {
    return emitPyramid(part);
  }

  if (part.shape === "dome") {
    return emitDome(part);
  }

  if (part.shape === "face") {
    const points = part.points.map(project);
    return { markup: paint(points, part), points };
  }

  if (part.shape === "screen") {
    const origin = project(part.anchor);
    const points = part.offsets.map((offset) => ({
      x: origin.x + offset.x,
      y: origin.y + offset.y,
    }));
    return { markup: paint(points, part), points };
  }

  if (part.shape === "extrude") {
    const solid = extrude(part.footprint, part.z, part.height, part.shaping);
    const points = [...solid.sides.flatMap((side) => side.points), ...solid.top];

    // A round solid is drawn as one silhouette plus its top face, never as its
    // individual side facets. In line art every facet edge gets stroked, and a
    // fourteen-segment cone came out looking like an open umbrella. Low-sided
    // prisms keep their faces, because a wedge's interior edge is real.
    if (part.footprint.length > 6) {
      return {
        markup: [paint(convexHull(points), part), paint(solid.top, part)].join(""),
        points,
      };
    }

    return {
      markup: [
        ...solid.sides.map((side) => paint(side.points, part)),
        paint(solid.top, part),
      ].join(""),
      points,
    };
  }

  // Three visible faces, painted back to front. This is exactly the shape of
  // Guo's `cube` group: top rhombus, then the two side faces.
  const faces = boxFaces(part.origin, part.size);
  const points = [...faces.right, ...faces.left, ...faces.top];

  return {
    markup: [
      paint(faces.right, part),
      paint(faces.left, part),
      paint(faces.top, part),
    ].join(""),
    points,
  };
}

/**
 * How a declared `shadow: n` becomes geometry. These two numbers are the entire
 * shadow model for derived shadows, and they exist as constants so the answer to
 * "why is that shadow so big" is one line rather than four call sites.
 *
 * `GROW` — how far the patch reaches past the footprint, as a fraction of `n`.
 * It used to be the whole of `n` on every side, which made every shadow larger
 * than its object and turned a grounding cue into a halo.
 * `DRIFT` — how far it slides along `+x`/`+y`, away from the upper-left light.
 * This is what makes the patch visible, so it is now the larger of the two.
 */
const SHADOW_GROW = 0.3;
const SHADOW_DRIFT = 0.45;

/**
 * One flat polygon, no stroke — Guo's `cube-shadow` is a single `#E8E8E8`
 * diamond. The previous build stacked three rings to fake a soft falloff, which
 * has no place in line art.
 *
 * `stroke="none"` is not optional. Stroke is inherited from the object group, so
 * without it a shadow picks up whatever colour that object draws in: the desk
 * lamp's came out ringed in `ink.line`, and every interactive object's — the
 * monitor most visibly — came out ringed in accent green. A shadow is a fill.
 */
function emitShadow(part: DeskPart): Emitted | null {
  if (
    part.shadow === undefined ||
    part.shape === "face" ||
    part.shape === "screen"
  ) {
    return null;
  }

  const grow = part.shadow * SHADOW_GROW;
  const drift = part.shadow * SHADOW_DRIFT;

  // Round forms cast a round shadow, drawn as a real ellipse. A polygonal
  // shadow under a curved object is a tell, and this scene has enough of those.
  if (part.shape === "round" || part.shape === "dome") {
    const radiusY = part.radius * (part.squash ?? 1);
    const polygon = fullEllipse(
      { x: part.center.x + drift, y: part.center.y + drift },
      part.radius + grow,
      radiusY + grow,
      part.z,
    );

    return {
      markup: `<path d="${toSegmentPath([{ points: polygon, curved: true }])}" fill="${ink.shadow}" stroke="none"/>`,
      points: polygon,
    };
  }

  const polygon =
    part.shape === "pyramid"
      ? expandFootprint(part.base, grow, drift).map((point) =>
          project({ ...point, z: part.z }),
        )
      : part.shape === "extrude"
        ? expandFootprint(part.footprint, grow, drift).map((point) =>
            project({ ...point, z: part.z }),
          )
        : contactShadow(part.origin, part.size, grow, drift);

  return {
    markup: `<path d="${toPath(polygon)}" fill="${ink.shadow}" stroke="none"/>`,
    points: polygon,
  };
}

/** Grows a footprint about its centroid and drifts it away from the key light. */
function expandFootprint(
  footprint: readonly Point2[],
  grow: number,
  drift: number,
): readonly Point2[] {
  const centroid = centroidOf(footprint);

  return footprint.map((point) => {
    const dx = point.x - centroid.x;
    const dy = point.y - centroid.y;
    const length = Math.hypot(dx, dy) || 1;
    return {
      x: point.x + (dx / length) * grow + drift,
      y: point.y + (dy / length) * grow + drift,
    };
  });
}

// ---------------------------------------------------------------------------
// Ground
// ---------------------------------------------------------------------------

type View = Readonly<{
  originX: number;
  originY: number;
  width: number;
  height: number;
}>;

/**
 * Guo's grid: two families of long diagonals at slope ±0.5 — the 2:1 isometric
 * angle — drawn well past the canvas and clipped by it. Ours are generated in
 * screen space for the same reason his are: the grid is a property of the
 * picture plane, not of any object in the scene.
 */
function emitGrid(
  view: View,
  spacing = view.width * 0.0205,
  weight = strokeWidth(view.width),
): string {
  const left = view.originX - view.width * 0.1;
  const right = view.originX + view.width * 1.1;
  const lines: string[] = [];

  for (const slope of [0.5, -0.5]) {
    // A line is y = slope·x + c. Sweep c across every value that can cross the
    // frame, taken from the intercepts of the four corners.
    const intercepts = [
      view.originY - slope * left,
      view.originY - slope * right,
      view.originY + view.height - slope * left,
      view.originY + view.height - slope * right,
    ];
    const from = Math.floor(Math.min(...intercepts) / spacing) * spacing;
    const to = Math.ceil(Math.max(...intercepts) / spacing) * spacing;

    for (let c = from; c <= to; c += spacing) {
      lines.push(
        `<path d="M${round(left)} ${round(slope * left + c)}L${round(right)} ${round(slope * right + c)}"/>`,
      );
    }
  }

  return `<g stroke="${ink.grid}" stroke-width="${weight}" stroke-miterlimit="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none">${lines.join("")}</g>`;
}

/**
 * Four gradient rects fading the grid out at the frame edges, as Guo's
 * `fade-surf` group does. Gradients are passive markup — the SVG boundary test
 * bans `<filter>`, not `<linearGradient>`.
 */
function emitFade(view: View): Readonly<{ defs: string; markup: string }> {
  const fadeY = view.height * 0.195;
  const fadeX = view.width * 0.07;
  const stops = (id: string, x1: number, y1: number, x2: number, y2: number) =>
    `<linearGradient id="${id}" x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}" gradientUnits="userSpaceOnUse"><stop stop-color="${ink.ground}"/><stop offset="1" stop-color="${ink.ground}" stop-opacity="0"/></linearGradient>`;

  const top = view.originY;
  const bottom = view.originY + view.height;
  const leftX = view.originX;
  const rightX = view.originX + view.width;

  return {
    defs: [
      stops("fade-top", 0, top, 0, top + fadeY),
      stops("fade-bottom", 0, bottom, 0, bottom - fadeY),
      stops("fade-left", leftX, 0, leftX + fadeX, 0),
      stops("fade-right", rightX, 0, rightX - fadeX, 0),
    ].join(""),
    markup: [
      `<rect x="${round(leftX)}" y="${round(top)}" width="${round(view.width)}" height="${round(fadeY)}" fill="url(#fade-top)"/>`,
      `<rect x="${round(leftX)}" y="${round(bottom - fadeY)}" width="${round(view.width)}" height="${round(fadeY)}" fill="url(#fade-bottom)"/>`,
      `<rect x="${round(leftX)}" y="${round(top)}" width="${round(fadeX)}" height="${round(view.height)}" fill="url(#fade-left)"/>`,
      `<rect x="${round(rightX - fadeX)}" y="${round(top)}" width="${round(fadeX)}" height="${round(view.height)}" fill="url(#fade-right)"/>`,
    ].join(""),
  };
}

// ---------------------------------------------------------------------------
// Layout guarantees
// ---------------------------------------------------------------------------

type ScreenBox = Readonly<{ key: string; scenery: boolean; bounds: Bounds }>;

function overlapRatio(left: Bounds, right: Bounds): number {
  const width = Math.min(left.maxX, right.maxX) - Math.max(left.minX, right.minX);
  const height = Math.min(left.maxY, right.maxY) - Math.max(left.minY, right.minY);

  if (width <= 0 || height <= 0) {
    return 0;
  }

  const smaller = Math.min(
    (left.maxX - left.minX) * (left.maxY - left.minY),
    (right.maxX - right.minX) * (right.maxY - right.minY),
  );

  return smaller === 0 ? 0 : (width * height) / smaller;
}

/**
 * "Nothing overlaps" was the loudest complaint about the shelf-hutch desk, and
 * it is not something to re-judge by eye every time the layout moves. Two
 * labelled objects may not collide; scenery may sit close, because a mouse
 * beside a keyboard is correct.
 */
const overlapBudget = { labelled: 0.02, scenery: 0.34 } as const;

function assertNoOverlaps(boxes: readonly ScreenBox[]): void {
  const problems: string[] = [];

  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const budget =
        boxes[i].scenery || boxes[j].scenery
          ? overlapBudget.scenery
          : overlapBudget.labelled;
      const ratio = overlapRatio(boxes[i].bounds, boxes[j].bounds);

      if (ratio > budget) {
        problems.push(
          `  ${boxes[i].key} / ${boxes[j].key}: ${Math.round(ratio * 100)}% (budget ${Math.round(budget * 100)}%)`,
        );
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `scene: objects overlap on screen — move them in scene.ts\n${problems.join("\n")}`,
    );
  }
}

// ---------------------------------------------------------------------------

function partAnchor(part: DeskPart): Point2 {
  if (part.shape === "round" || part.shape === "dome") {
    return part.center;
  }
  if (part.shape === "pyramid") {
    return centroidOf(part.base);
  }
  if (part.shape === "extrude") {
    return centroidOf(part.footprint);
  }
  if (part.shape === "face") {
    return centroidOf(part.points);
  }
  if (part.shape === "screen") {
    return { x: part.anchor.x, y: part.anchor.y };
  }
  return { x: part.origin.x, y: part.origin.y };
}

function compareObjects(left: DeskObject, right: DeskObject): number {
  if (left.order !== right.order) {
    return left.order - right.order;
  }

  const a = partAnchor(left.parts[0]);
  const b = partAnchor(right.parts[0]);
  return a.x + a.y - (b.x + b.y);
}

function partPoints(part: DeskPart): readonly Point[] {
  if (part.shape === "round" || part.shape === "dome" || part.shape === "pyramid") {
    return emitPart(part).points;
  }
  if (part.shape === "face") {
    return part.points.map(project);
  }
  if (part.shape === "screen") {
    const origin = project(part.anchor);
    return part.offsets.map((offset) => ({
      x: origin.x + offset.x,
      y: origin.y + offset.y,
    }));
  }
  if (part.shape === "extrude") {
    const solid = extrude(part.footprint, part.z, part.height, part.shaping);
    return [...solid.top, ...solid.sides.flatMap((side) => side.points)];
  }
  const faces = boxFaces(part.origin, part.size);
  return [...faces.top, ...faces.left, ...faces.right];
}

function toViewBox(bounds: Bounds): View {
  const width = bounds.maxX - bounds.minX + padding * 2;
  const height = bounds.maxY - bounds.minY + padding * 2;
  const targetWidth = Math.max(width, height * outputAspect);
  const targetHeight = targetWidth / outputAspect;

  return {
    originX: bounds.minX - padding - (targetWidth - width) / 2,
    originY: bounds.minY - padding - (targetHeight - height) / 2,
    width: targetWidth,
    height: targetHeight,
  };
}

function toPercentBounds(points: readonly Point[], view: View) {
  const bounds = boundsOf(points);
  const asPercent = (value: number, origin: number, span: number) =>
    Math.round(((value - origin) / span) * 10000) / 100;

  const xPercent = asPercent(bounds.minX, view.originX, view.width);
  const yPercent = asPercent(bounds.minY, view.originY, view.height);

  return {
    xPercent,
    yPercent,
    widthPercent: asPercent(bounds.maxX, view.originX, view.width) - xPercent,
    heightPercent: asPercent(bounds.maxY, view.originY, view.height) - yPercent,
  };
}

/**
 * Everything one object contributes, kept together so the scene and the
 * per-object catalog are built from the same emission rather than from two code
 * paths that could disagree about what an object looks like.
 */
type BuiltObject = Readonly<{
  key: string;
  id: string;
  scenery: boolean;
  /** Labelled objects are drawn in the accent: colour means "this responds". */
  interactive: boolean;
  tier: string;
  shadowMarkup: string;
  bodyMarkup: string;
  points: readonly Point[];
  bounds: Bounds;
}>;

function buildObject(object: DeskObject): BuiltObject {
  const shadows: string[] = [];
  const bodies: string[] = [];
  const points: Point[] = [];

  // Shadows first within the group, so nothing casts over its own object.
  for (const part of object.parts) {
    const shadow = emitShadow(part);
    if (shadow) {
      shadows.push(shadow.markup);
      points.push(...shadow.points);
    }
  }

  for (const part of object.parts) {
    const emitted = emitPart(part);
    // A part declared `tone: "shadow"` is a shadow too, and belongs in the same
    // bucket as the ones `emitShadow` derives from a `shadow: n` spread.
    //
    // `emitShadow` only fires for solids that can have a footprint expanded, so
    // it skips `face` and `screen` parts by design — which is exactly what
    // `groundShadow()` produces, since a screen-space silhouette has no
    // footprint to derive one from. The result was that every hand-declared
    // shadow ended up in the body: `/lab`'s Shadows switch left the duck, Kirby,
    // the belt, the dumbbell and all fourteen trees still casting.
    (part.tone === "shadow" ? shadows : bodies).push(emitted.markup);
    points.push(...emitted.points);
  }

  return {
    key: object.hotspot ?? object.id,
    id: object.id,
    scenery: object.scenery === true,
    interactive: object.hotspot !== undefined,
    tier: object.tier ?? "detail",
    shadowMarkup: shadows.join(""),
    bodyMarkup: bodies.join(""),
    points,
    bounds: boundsOf(object.parts.flatMap(partPoints)),
  };
}

/**
 * Every object rendered alone, tightly cropped.
 *
 * This exists because the scene is reviewed at 1444px wide, where a duck is
 * forty pixels across and nobody — me included — can tell whether it reads. The
 * entries come from the same `BuiltObject` records the scene is assembled from,
 * so a tile can never show something the artwork does not.
 *
 * Shadow, body, and grid stay separate so the workbench can toggle them.
 */
function emitCatalog(built: readonly BuiltObject[], scene: View): string {
  const spacing = scene.width * 0.0205;
  const weight = strokeWidth(scene.width);

  const entries = built.map((item) => {
    const width = item.bounds.maxX - item.bounds.minX;
    const height = item.bounds.maxY - item.bounds.minY;
    const pad = Math.max(width, height) * 0.18 + 4;

    const view: View = {
      originX: item.bounds.minX - pad,
      originY: item.bounds.minY - pad,
      width: width + pad * 2,
      height: height + pad * 2,
    };

    return [
      "  {",
      `    key: ${JSON.stringify(item.key)},`,
      `    id: ${JSON.stringify(item.id)},`,
      `    scenery: ${item.scenery},`,
      `    interactive: ${item.interactive},`,
      `    stroke: ${JSON.stringify(item.interactive ? ink.accent : ink.line)},`,
      `    tier: ${JSON.stringify(item.tier)},`,
      `    width: ${round(width)},`,
      `    height: ${round(height)},`,
      `    viewBox: ${JSON.stringify(
        `${round(view.originX)} ${round(view.originY)} ${round(view.width)} ${round(view.height)}`,
      )},`,
      `    grid: ${JSON.stringify(emitGrid(view, spacing, weight))},`,
      `    shadow: ${JSON.stringify(item.shadowMarkup)},`,
      `    body: ${JSON.stringify(item.bodyMarkup)},`,
      "  },",
    ].join("\n");
  });

  return [
    "// Generated by scripts/generate-desk.ts. Do not edit by hand.",
    "// Each object rendered alone and tightly cropped, for the /lab workbench",
    "// and the contact sheet. Built from the same records as the scene itself.",
    "",
    `export const deskCatalogStrokeWidth = ${weight};`,
    "",
    "export const deskCatalog = [",
    ...entries,
    "] as const;",
    "",
    "export type DeskCatalogEntry = (typeof deskCatalog)[number];",
    "",
  ].join("\n");
}

async function main() {
  const orderedObjects = [...deskObjects].sort(compareObjects);
  const built = orderedObjects.map(buildObject);
  const allPoints: Point[] = built.flatMap((item) => [...item.points]);

  // One group per object, as Guo's `<g id="pencil">` is — this is what lets the
  // page hover the object itself rather than a rectangle floated over it.
  const groups = built.map(
    (item) =>
      `<g data-object="${item.key}"${item.interactive ? ` stroke="${ink.accent}"` : ""}>${item.shadowMarkup}${item.bodyMarkup}</g>`,
  );

  const screenBoxes: ScreenBox[] = built.map((item) => ({
    key: item.key,
    scenery: item.scenery,
    bounds: item.bounds,
  }));

  // A single NaN coordinate poisons the scene's bounds and every derived
  // viewBox, and the artwork still renders — just wrong, and silently. Caught
  // once already, from a zero-length arc dividing by its own segment count.
  for (const box of screenBoxes) {
    if (!Object.values(box.bounds).every(Number.isFinite)) {
      throw new Error(
        `scene: ${box.key} produced non-finite bounds — a shape is dividing by zero or projecting an undefined point`,
      );
    }
  }

  assertNoOverlaps(screenBoxes);

  const view = toViewBox(boundsOf(allPoints));
  const fade = emitFade(view);

  const hotspots = orderedObjects
    .filter((object) => object.hotspot !== undefined)
    .map((object) => ({
      key: object.hotspot as string,
      tier: object.tier ?? "detail",
      bounds: toPercentBounds(object.parts.flatMap(partPoints), view),
    }));

  const viewBox = `${round(view.originX)} ${round(view.originY)} ${round(view.width)} ${round(view.height)}`;
  const inner = [
    `<defs>${fade.defs}</defs>`,
    `<rect x="${round(view.originX)}" y="${round(view.originY)}" width="${round(view.width)}" height="${round(view.height)}" fill="${ink.ground}"/>`,
    emitGrid(view),
    fade.markup,
    // One wrapper carries the stroke set for every object; interactive groups
    // override just the colour.
    `<g ${strokeAttrs}>${groups.join("")}</g>`,
  ].join("");

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${Math.round(outputWidth / outputAspect)}"`,
    ` viewBox="${viewBox}" fill="none" stroke-width="${strokeWidth(view.width)}"`,
    ` role="img" aria-labelledby="desk-title desk-description">`,
    `<title id="desk-title">Things on my desk</title>`,
    `<desc id="desk-description">An isometric line drawing of a workspace: a monitor showing code, a keyboard and mouse, a teal dev board, a rubber duck, a coiled martial-arts belt, a compass, two drinks, a plate of sushi, a climbing wall panel with coloured holds, a dumbbell, a screen paused mid-episode, a clock tower, and scattered trees and figures.</desc>`,
    inner,
    `</svg>`,
  ].join("");

  const geometry = [
    "// Generated by scripts/generate-desk.ts. Do not edit by hand.",
    "// Hotspot bounds are derived from the artwork, so the overlay geometry",
    "// cannot drift away from the illustration.",
    "",
    "export const deskSceneGeometry = {",
    `  viewBox: { x: ${round(view.originX)}, y: ${round(view.originY)}, width: ${round(view.width)}, height: ${round(view.height)} },`,
    `  aspectRatio: ${Math.round(outputAspect * 10000) / 10000},`,
    "  hotspots: {",
    ...hotspots.map(
      (hotspot) =>
        `    "${hotspot.key}": { tier: "${hotspot.tier}", xPercent: ${hotspot.bounds.xPercent}, yPercent: ${hotspot.bounds.yPercent}, widthPercent: ${hotspot.bounds.widthPercent}, heightPercent: ${hotspot.bounds.heightPercent} },`,
    ),
    "  },",
    "} as const;",
    "",
  ].join("\n");

  // Inlined by the page so each object is a real element that can respond to
  // hover. The standalone SVG stays the reviewable committed artifact.
  const markupModule = [
    "// Generated by scripts/generate-desk.ts. Do not edit by hand.",
    "// Inlined into the page so every object is a hoverable element.",
    "",
    `export const deskSceneViewBox = ${JSON.stringify(viewBox)};`,
    "",
    `export const deskSceneStrokeWidth = ${strokeWidth(view.width)};`,
    "",
    `export const deskSceneMarkup = ${JSON.stringify(inner)};`,
    "",
  ].join("\n");

  const catalogModule = emitCatalog(built, view);

  const webRoot = process.cwd();
  const svgPath = join(webRoot, "public", "media", "site", "lakshya-desk-v2.svg");
  const geometryPath = join(webRoot, "lib", "desk", "scene-geometry.ts");
  const markupPath = join(webRoot, "lib", "desk", "scene-markup.ts");
  const catalogPath = join(webRoot, "lib", "desk", "scene-catalog.ts");

  await mkdir(dirname(svgPath), { recursive: true });
  await writeFile(svgPath, svg, "utf8");
  await writeFile(geometryPath, geometry, "utf8");
  await writeFile(markupPath, markupModule, "utf8");
  await writeFile(catalogPath, catalogModule, "utf8");

  console.log(`Wrote ${svgPath}`);
  console.log(`Wrote ${geometryPath}`);
  console.log(`Wrote ${markupPath}`);
  console.log(`Wrote ${catalogPath}`);
  console.log(`Objects: ${screenBoxes.length}, no overlaps beyond budget`);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
