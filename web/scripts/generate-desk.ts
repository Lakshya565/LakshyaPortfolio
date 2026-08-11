/**
 * Generates the desk illustration from the typed scene description.
 *
 * Run explicitly (`npm.cmd run generate:desk`) rather than during the build: the
 * SVG stays a reviewable, committed asset, and the site never pays a generation
 * cost at request or build time.
 *
 * Also emits `lib/desk/scene-geometry.ts` so hotspot bounds and the monitor
 * screen's corners come from the artwork itself instead of hand-tuned
 * percentages that silently drift whenever the composition changes.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  boundsOf,
  boxFaces,
  contactShadow,
  extrude,
  faceTones,
  leftFaceQuad,
  project,
  shade,
  sideTone,
  toPath,
  type Bounds,
  type Point,
  type Point2,
} from "@/lib/desk/projection";
import {
  deskObjects,
  deskStructure,
  type DeskObject,
  type DeskPart,
} from "@/lib/desk/scene";

const outputAspect = 1;
const outputWidth = 1100;
const padding = 8;

type Emitted = Readonly<{ markup: string; points: readonly Point[] }>;

function emitPart(part: DeskPart): Emitted {
  const points: Point[] = [];
  const fragments: string[] = [];

  if (part.shape === "extrude") {
    const solid = extrude(part.footprint, part.z, part.height);
    const tones = faceTones(part.material);

    for (const face of solid.sides) {
      points.push(...face.points);
      fragments.push(
        `<path d="${toPath(face.points)}" fill="${
          part.emissive ? part.material : sideTone(part.material, face.light)
        }"/>`,
      );
    }

    points.push(...solid.top);
    fragments.push(
      `<path d="${toPath(solid.top)}" fill="${
        part.emissive ? part.material : tones.top
      }" stroke="${tones.edge}" stroke-width="0.5" stroke-opacity="0.45"/>`,
    );

    return { markup: fragments.join(""), points };
  }

  if (part.emissive) {
    const faces = boxFaces(part.origin, part.size);
    points.push(...faces.top);
    fragments.push(`<path d="${toPath(faces.top)}" fill="${part.material}"/>`);
    return { markup: fragments.join(""), points };
  }

  const tones = faceTones(part.material);
  const faces = boxFaces(part.origin, part.size);
  points.push(...faces.top, ...faces.left, ...faces.right);

  fragments.push(
    `<path d="${toPath(faces.right)}" fill="${tones.right}"/>`,
    `<path d="${toPath(faces.left)}" fill="${tones.left}"/>`,
    // The lit top edge is what stops flat faces from reading as paper cut-outs.
    `<path d="${toPath(faces.top)}" fill="${tones.top}" stroke="${tones.edge}" stroke-width="0.5" stroke-opacity="0.45"/>`,
  );

  if (part.screen) {
    const quad = leftFaceQuad(part.origin, part.size, 2.5);
    points.push(...quad);
    fragments.push(
      `<path d="${toPath(quad)}" fill="#0c1512" stroke="#4ad6a0" stroke-width="0.5" stroke-opacity="0.5"/>`,
    );
  }

  return { markup: fragments.join(""), points };
}

/**
 * Soft contact shadows without an SVG filter. The asset must stay passive and
 * cheap to paint — the homepage hero is the exact place the site's earlier
 * scroll problems came from — so the falloff is three stacked rings rather than
 * a Gaussian blur.
 */
const shadowRings = [
  { scale: 1, opacity: 0.1 },
  { scale: 0.62, opacity: 0.14 },
  { scale: 0.28, opacity: 0.2 },
] as const;

function emitShadow(part: DeskPart): Emitted | null {
  if (part.shadow === undefined) {
    return null;
  }

  const spread = part.shadow;
  const polygons = shadowRings.map(({ scale }) =>
    part.shape === "extrude"
      ? expandFootprint(part.footprint, spread * scale).map((point) =>
          project({ ...point, z: part.z }),
        )
      : contactShadow(part.origin, part.size, spread * scale),
  );

  return {
    markup: polygons
      .map(
        (polygon, index) =>
          `<path d="${toPath(polygon)}" fill="#05070a" opacity="${shadowRings[index].opacity}"/>`,
      )
      .join(""),
    points: polygons.flat(),
  };
}

/** Grows a footprint about its centroid and drifts it away from the key light. */
function expandFootprint(
  footprint: readonly Point2[],
  spread: number,
): readonly Point2[] {
  const centroid = footprint.reduce(
    (total, point) => ({
      x: total.x + point.x / footprint.length,
      y: total.y + point.y / footprint.length,
    }),
    { x: 0, y: 0 },
  );
  const drift = spread * 0.35;

  return footprint.map((point) => {
    const dx = point.x - centroid.x;
    const dy = point.y - centroid.y;
    const length = Math.hypot(dx, dy) || 1;
    return {
      x: point.x + (dx / length) * spread + drift,
      y: point.y + (dy / length) * spread + drift,
    };
  });
}

function partAnchor(part: DeskPart): Point2 {
  if (part.shape === "extrude") {
    return part.footprint.reduce(
      (total, point) => ({
        x: total.x + point.x / part.footprint.length,
        y: total.y + point.y / part.footprint.length,
      }),
      { x: 0, y: 0 },
    );
  }

  return { x: part.origin.x, y: part.origin.y };
}

/**
 * Explicit paint order first, depth as the tie-break. A shelf cannot be resolved
 * by depth alone: a board has to paint before what rests on it and after what
 * sits one level below.
 */
function compareObjects(left: DeskObject, right: DeskObject): number {
  if (left.order !== right.order) {
    return left.order - right.order;
  }

  const leftAnchor = partAnchor(left.parts[0]);
  const rightAnchor = partAnchor(right.parts[0]);
  return leftAnchor.x + leftAnchor.y - (rightAnchor.x + rightAnchor.y);
}

function partPoints(part: DeskPart): readonly Point[] {
  if (part.shape === "extrude") {
    const solid = extrude(part.footprint, part.z, part.height);
    return [...solid.top, ...solid.sides.flatMap((face) => face.points)];
  }

  const faces = boxFaces(part.origin, part.size);
  return [...faces.top, ...faces.left, ...faces.right];
}

function toViewBox(bounds: Bounds) {
  const width = bounds.maxX - bounds.minX + padding * 2;
  const height = bounds.maxY - bounds.minY + padding * 2;
  const targetWidth = Math.max(width, height * outputAspect);
  const targetHeight = targetWidth / outputAspect;
  const originX = bounds.minX - padding - (targetWidth - width) / 2;
  const originY = bounds.minY - padding - (targetHeight - height) / 2;

  return { originX, originY, width: targetWidth, height: targetHeight };
}

function toPercentBounds(
  points: readonly Point[],
  view: ReturnType<typeof toViewBox>,
) {
  const bounds = boundsOf(points);
  const asPercent = (value: number, origin: number, span: number) =>
    Math.round(((value - origin) / span) * 10000) / 100;

  const xPercent = asPercent(bounds.minX, view.originX, view.width);
  const yPercent = asPercent(bounds.minY, view.originY, view.height);

  return {
    xPercent,
    yPercent,
    widthPercent:
      asPercent(bounds.maxX, view.originX, view.width) - xPercent,
    heightPercent:
      asPercent(bounds.maxY, view.originY, view.height) - yPercent,
  };
}

async function main() {
  const shadowMarkup: string[] = [];
  const bodyMarkup: string[] = [];
  const allPoints: Point[] = [];

  const structureParts = [...deskStructure];
  const orderedObjects = [...deskObjects].sort(compareObjects);

  for (const part of structureParts) {
    const shadow = emitShadow(part);
    if (shadow) {
      shadowMarkup.push(shadow.markup);
      allPoints.push(...shadow.points);
    }
    const emitted = emitPart(part);
    bodyMarkup.push(emitted.markup);
    allPoints.push(...emitted.points);
  }

  for (const object of orderedObjects) {
    for (const part of object.parts) {
      const shadow = emitShadow(part);
      if (shadow) {
        bodyMarkup.push(shadow.markup);
        allPoints.push(...shadow.points);
      }
      const emitted = emitPart(part);
      bodyMarkup.push(emitted.markup);
      allPoints.push(...emitted.points);
    }
  }

  const view = toViewBox(boundsOf(allPoints));

  const hotspots = orderedObjects
    .filter((object) => object.hotspot !== undefined)
    .map((object) => ({
      key: object.hotspot as string,
      tier: object.tier ?? "detail",
      bounds: toPercentBounds(
        object.parts.flatMap((part) => partPoints(part)),
        view,
      ),
    }));

  const monitorScreenPart = deskObjects
    .flatMap((object) => object.parts)
    .find((part) => part.shape !== "extrude" && part.screen === true);

  if (!monitorScreenPart || monitorScreenPart.shape === "extrude") {
    throw new Error("scene: no box part is marked as the monitor screen");
  }

  const screenCorners = leftFaceQuad(
    monitorScreenPart.origin,
    monitorScreenPart.size,
    2.5,
  ).map((corner) => ({
    xPercent: Math.round(((corner.x - view.originX) / view.width) * 10000) / 100,
    yPercent:
      Math.round(((corner.y - view.originY) / view.height) * 10000) / 100,
  }));

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${Math.round(outputWidth / outputAspect)}"`,
    ` viewBox="${round(view.originX)} ${round(view.originY)} ${round(view.width)} ${round(view.height)}"`,
    ` role="img" aria-labelledby="desk-title desk-description">`,
    `<title id="desk-title">Lakshya's workbench</title>`,
    `<desc id="desk-description">An axonometric desk with a monitor, keyboard, breadboard, a debugging duck, and a few personal objects.</desc>`,
    shadowMarkup.join(""),
    bodyMarkup.join(""),
    `</svg>`,
  ].join("");

  const geometry = [
    "// Generated by scripts/generate-desk.ts. Do not edit by hand.",
    "// Hotspot bounds and screen corners are derived from the artwork, so the",
    "// overlay geometry cannot drift away from the illustration.",
    "",
    "export const deskSceneGeometry = {",
    `  viewBox: { x: ${round(view.originX)}, y: ${round(view.originY)}, width: ${round(view.width)}, height: ${round(view.height)} },`,
    `  aspectRatio: ${Math.round(outputAspect * 10000) / 10000},`,
    "  monitorScreen: [",
    ...screenCorners.map(
      (corner) =>
        `    { xPercent: ${corner.xPercent}, yPercent: ${corner.yPercent} },`,
    ),
    "  ],",
    `  monitorScreenBounds: { xPercent: ${round(Math.min(...screenCorners.map((c) => c.xPercent)))}, yPercent: ${round(Math.min(...screenCorners.map((c) => c.yPercent)))}, widthPercent: ${round(Math.max(...screenCorners.map((c) => c.xPercent)) - Math.min(...screenCorners.map((c) => c.xPercent)))}, heightPercent: ${round(Math.max(...screenCorners.map((c) => c.yPercent)) - Math.min(...screenCorners.map((c) => c.yPercent)))} },`,
    "  hotspots: {",
    ...hotspots.map(
      (hotspot) =>
        `    "${hotspot.key}": { tier: "${hotspot.tier}", xPercent: ${hotspot.bounds.xPercent}, yPercent: ${hotspot.bounds.yPercent}, widthPercent: ${hotspot.bounds.widthPercent}, heightPercent: ${hotspot.bounds.heightPercent} },`,
    ),
    "  },",
    "} as const;",
    "",
  ].join("\n");

  const webRoot = process.cwd();
  const svgPath = join(webRoot, "public", "media", "site", "lakshya-desk-v2.svg");
  const geometryPath = join(webRoot, "lib", "desk", "scene-geometry.ts");

  await mkdir(dirname(svgPath), { recursive: true });
  await writeFile(svgPath, svg, "utf8");
  await writeFile(geometryPath, geometry, "utf8");

  console.log(`Wrote ${svgPath}`);
  console.log(`Wrote ${geometryPath}`);
  console.log(`Hotspots derived: ${hotspots.map((h) => h.key).join(", ")}`);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
