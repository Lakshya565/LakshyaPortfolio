/**
 * The desk scene as data.
 *
 * Modelled on Lakshya's actual desk: a corner surface with a shelf hutch built
 * on top, a monitor recessed into a centre alcove, stacked cubbies flanking it,
 * a crowded top shelf, and a row of small figures along the monitor's base.
 * Units are roughly centimetres, sized against the keyboard.
 *
 * Colour discipline: structure is near-black graphite. Collectibles use a warm
 * family — amber, orange, terracotta, cream — which keeps them lively while
 * leaving green, blue, and purple reserved for work-mode meaning and emissive
 * light. Warm also happens to be the personal-motif accent already in the
 * design system. Nothing here reproduces a real brand, logo, or character.
 */

import type { DeskHotspotKey } from "@/lib/desk/hotspots";
import {
  polygonFootprint,
  roundedFootprint,
  type Point2,
  type Size3,
  type Vec3,
} from "@/lib/desk/projection";

export const materials = {
  deskTop: "#3f4854",
  carcass: "#2f363f",
  carcassDark: "#20252c",
  /**
   * The frame has to sit well above the recess tone or the cubby grid vanishes
   * into a flat wall — dark-on-dark was the first version's failure.
   */
  shelfFace: "#4a5462",
  recess: "#0d1116",
  shell: "#272d35",
  shellDark: "#1f242b",
  keycap: "#39414b",
  light: "#c3c9d2",
  panel: "#2c333c",
  amber: "#d59a4c",
  amberDeep: "#a86f31",
  terracotta: "#b8613f",
  cream: "#ddd2bc",
  rose: "#b3616a",
  screen: "#0c1512",
  glow: "#4ad6a0",
  note: "#c9d15e",
} as const;

/** Warm-only palette for scenery, so no collectible steals a work-mode hue. */
const collectiblePalette = [
  materials.amber,
  materials.amberDeep,
  materials.terracotta,
  materials.cream,
  materials.rose,
  materials.shelfFace,
] as const;

type PartCommon = Readonly<{
  material: string;
  shadow?: number;
  emissive?: boolean;
}>;

export type BoxPart = PartCommon &
  Readonly<{
    shape?: "box";
    origin: Vec3;
    size: Size3;
    screen?: boolean;
  }>;

export type ExtrudePart = PartCommon &
  Readonly<{
    shape: "extrude";
    footprint: readonly Point2[];
    z: number;
    height: number;
  }>;

export type DeskPart = BoxPart | ExtrudePart;

export type DeskObject = Readonly<{
  id: string;
  hotspot?: DeskHotspotKey;
  tier?: "hero" | "detail";
  /**
   * Explicit paint order. Depth sorting alone cannot resolve a shelf: a board
   * must paint before the things resting on it and after the things one level
   * below, and the dividers must paint over everything they stand in front of.
   */
  order: number;
  parts: readonly DeskPart[];
}>;

function box(
  origin: Vec3,
  size: Size3,
  material: string,
  extra: Partial<BoxPart> = {},
): BoxPart {
  return { origin, size, material, ...extra };
}

function cylinder(
  center: Point2,
  radius: number,
  z: number,
  height: number,
  material: string,
  options: Readonly<{ segments?: number; shadow?: number; squash?: number }> = {},
): ExtrudePart {
  const { segments = 12, shadow, squash = 1 } = options;
  return {
    shape: "extrude",
    footprint: polygonFootprint(center, radius, radius * squash, segments),
    z,
    height,
    material,
    ...(shadow === undefined ? {} : { shadow }),
  };
}

function rounded(
  origin: Point2,
  width: number,
  depth: number,
  z: number,
  height: number,
  material: string,
  options: Readonly<{ radius?: number; shadow?: number }> = {},
): ExtrudePart {
  const { radius = 2, shadow } = options;
  return {
    shape: "extrude",
    footprint: roundedFootprint(origin, width, depth, radius),
    z,
    height,
    material,
    ...(shadow === undefined ? {} : { shadow }),
  };
}

/** Seeded so the committed SVG is byte-stable across regenerations. */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A crowd of small silhouettes. Density is what makes the shelves read as
 * collected-over-years rather than styled, but only the eight cubbies are
 * interactive — this is scenery.
 */
function clutter(
  options: Readonly<{
    seed: number;
    x: number;
    width: number;
    y: number;
    depth: number;
    z: number;
    count: number;
    maxHeight?: number;
    scale?: number;
  }>,
): readonly DeskPart[] {
  const { seed, x, width, y, depth, z, count, maxHeight = 9, scale = 1 } = options;
  const random = createRandom(seed);
  const step = width / count;

  return Array.from({ length: count }, (_, index) => {
    const material =
      collectiblePalette[Math.floor(random() * collectiblePalette.length)];
    const radius = (1.5 + random() * 2.2) * scale;
    const height = (3 + random() * maxHeight) * scale;
    const center = {
      x: x + step * (index + 0.5) + (random() - 0.5) * step * 0.3,
      y: y + depth * (0.3 + random() * 0.4),
    };

    return random() > 0.45
      ? cylinder(center, radius, z, height, material, {
          segments: 8,
          squash: 0.85,
        })
      : rounded(
          { x: center.x - radius, y: center.y - radius },
          radius * 2,
          radius * 1.7,
          z,
          height,
          material,
          { radius: radius * 0.5 },
        );
  });
}

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------

const deskWidth = 190;
// Shortened from a real desk height: at this camera the legs would otherwise
// take a third of the frame, and the reference photos barely show them.
const deskTopZ = 46;
const surface = deskTopZ + 4;

const hutchBackY = 4;
/**
 * Kept shallow deliberately. At full desk depth each upright's side face became
 * a large panel that blanketed the cubby beside it, hiding the contents — and a
 * real hutch over a desk is shallow anyway.
 */
const hutchFrontY = 22;
const hutchDepth = hutchFrontY - hutchBackY;

const leftTower = { start: 0, end: 58 } as const;
const rightTower = { start: 132, end: 190 } as const;

const shelfLevels = [
  { base: surface, top: surface + 34 },
  { base: surface + 38, top: surface + 72 },
] as const;

const topShelfZ = surface + 76;

/** Corner desk: a hexagon, so the front reads as an angled corner surface. */
const deskFootprint: readonly Point2[] = [
  { x: 0, y: 0 },
  { x: deskWidth, y: 0 },
  { x: deskWidth, y: 58 },
  { x: 150, y: 96 },
  { x: 44, y: 96 },
  { x: 0, y: 58 },
];

export const deskStructure: readonly DeskPart[] = [
  box({ x: 10, y: 8, z: 0 }, { width: 7, depth: 7, height: deskTopZ }, materials.carcassDark),
  box({ x: 172, y: 8, z: 0 }, { width: 7, depth: 7, height: deskTopZ }, materials.carcassDark),
  box({ x: 52, y: 82, z: 0 }, { width: 7, depth: 7, height: deskTopZ }, materials.carcassDark),
  box({ x: 134, y: 82, z: 0 }, { width: 7, depth: 7, height: deskTopZ }, materials.carcassDark),
  {
    shape: "extrude",
    footprint: deskFootprint,
    z: deskTopZ,
    height: 4,
    material: materials.deskTop,
    shadow: 3,
  },
];

// ---------------------------------------------------------------------------
// Hutch
// ---------------------------------------------------------------------------

const cubbyColumns = [
  { key: "climbing", x: leftTower.start + 3, width: 24, level: 1 },
  { key: "gym", x: leftTower.start + 31, width: 24, level: 1 },
  { key: "leadership", x: leftTower.start + 3, width: 24, level: 0 },
  { key: "maker", x: leftTower.start + 31, width: 24, level: 0 },
  { key: "anime", x: rightTower.start + 3, width: 24, level: 1 },
  { key: "quackta", x: rightTower.start + 31, width: 24, level: 1 },
  { key: "food-favorites", x: rightTower.start + 3, width: 24, level: 0 },
  { key: "shared-food", x: rightTower.start + 31, width: 24, level: 0 },
] as const satisfies readonly Readonly<{
  key: DeskHotspotKey;
  x: number;
  width: number;
  level: 0 | 1;
}>[];

function hutchCarcass(): readonly DeskObject[] {
  const uprights = [
    leftTower.start,
    leftTower.start + 28,
    leftTower.end - 2,
    rightTower.start,
    rightTower.start + 28,
    rightTower.end - 2,
  ];

  return [
    {
      id: "hutch-back",
      order: 10,
      parts: [
        box(
          { x: 0, y: hutchBackY, z: surface },
          { width: deskWidth, depth: 3, height: topShelfZ - surface },
          materials.carcass,
        ),
      ],
    },
    // Shelf boards paint bottom-up, each just before the cubby resting on it.
    {
      id: "shelf-board-0",
      order: 20,
      parts: [
        box(
          { x: leftTower.start, y: hutchBackY, z: shelfLevels[0].top },
          // Proud of the uprights so the front lip catches light and the
          // horizontal division between cubby rows actually reads.
          { width: leftTower.end - leftTower.start, depth: hutchDepth + 3, height: 4 },
          materials.deskTop,
        ),
        box(
          { x: rightTower.start, y: hutchBackY, z: shelfLevels[0].top },
          { width: rightTower.end - rightTower.start, depth: hutchDepth + 3, height: 4 },
          materials.deskTop,
        ),
      ],
    },
    {
      id: "shelf-board-1",
      order: 40,
      parts: [
        box(
          { x: leftTower.start, y: hutchBackY, z: shelfLevels[1].top },
          // Proud of the uprights so the front lip catches light and the
          // horizontal division between cubby rows actually reads.
          { width: leftTower.end - leftTower.start, depth: hutchDepth + 3, height: 4 },
          materials.deskTop,
        ),
        box(
          { x: rightTower.start, y: hutchBackY, z: shelfLevels[1].top },
          { width: rightTower.end - rightTower.start, depth: hutchDepth + 3, height: 4 },
          materials.deskTop,
        ),
      ],
    },
    {
      id: "hutch-uprights",
      order: 60,
      parts: uprights.map((x) =>
        box(
          { x, y: hutchBackY, z: surface },
          { width: 2.5, depth: hutchDepth, height: topShelfZ - surface },
          materials.shelfFace,
        ),
      ),
    },
    {
      id: "top-shelf",
      order: 70,
      parts: [
        box(
          { x: -2, y: hutchBackY - 2, z: topShelfZ },
          { width: deskWidth + 4, depth: hutchDepth + 4, height: 4 },
          materials.carcass,
        ),
      ],
    },
    {
      id: "top-shelf-crowd",
      order: 80,
      parts: clutter({
        seed: 91,
        x: 2,
        width: deskWidth - 4,
        y: hutchBackY,
        depth: hutchDepth,
        z: topShelfZ + 4,
        count: 17,
        maxHeight: 11,
      }),
    },
  ];
}

function cubbyObjects(): readonly DeskObject[] {
  return cubbyColumns.map((cubby, index) => {
    const level = shelfLevels[cubby.level];

    return {
      id: `cubby-${cubby.key}`,
      hotspot: cubby.key,
      tier: cubby.level === 0 ? "hero" : "detail",
      // Contents paint straight after the board they rest on, and before the
      // board above, so the shelf above correctly crops what is inside.
      order: cubby.level === 0 ? 30 : 50,
      parts: [
        // The recess reads as a hole because it is markedly darker than the
        // frame around it, not because of any outline.
        box(
          { x: cubby.x, y: hutchBackY + 2, z: level.base },
          { width: cubby.width, depth: 2, height: level.top - level.base },
          materials.recess,
        ),
        ...clutter({
          seed: 300 + index * 17,
          x: cubby.x + 1.5,
          width: cubby.width - 3,
          y: hutchBackY + 5,
          depth: hutchDepth - 9,
          z: level.base,
          count: 5,
          maxHeight: 11,
          scale: 1.15,
        }),
      ],
    };
  });
}

// ---------------------------------------------------------------------------
// Alcove and desk surface
// ---------------------------------------------------------------------------

const deskSurfaceObjects: readonly DeskObject[] = [
  {
    id: "monitor",
    order: 90,
    parts: [
      rounded({ x: 84, y: 14 }, 24, 13, surface, 2, materials.shellDark, {
        radius: 4,
        shadow: 2,
      }),
      box({ x: 92, y: 18, z: surface + 2 }, { width: 7, depth: 5, height: 13 }, materials.shell),
      box(
        { x: 62, y: 16, z: surface + 15 },
        { width: 66, depth: 5, height: 38 },
        materials.shell,
        { screen: true },
      ),
    ],
  },
  {
    id: "sticky-notes",
    order: 92,
    // Lying on the desk: on the hutch they either covered a cubby or landed on
    // the monitor, and neither placement survived a look at the render.
    parts: [
      box({ x: 30, y: 56, z: surface }, { width: 10, depth: 10, height: 0.4 }, materials.note),
      box({ x: 42, y: 62, z: surface }, { width: 9, depth: 9, height: 0.4 }, materials.note),
    ],
  },
  {
    id: "game-cases",
    order: 93,
    parts: Array.from({ length: 7 }, (_, index) =>
      box(
        { x: 138 + index * 3.4, y: 36, z: surface },
        { width: 2.6, depth: 11, height: 15 },
        collectiblePalette[index % collectiblePalette.length],
        index === 0 ? { shadow: 1.5 } : {},
      ),
    ),
  },
  {
    id: "figure-row",
    order: 94,
    parts: clutter({
      seed: 7,
      x: 62,
      width: 30,
      y: 36,
      depth: 8,
      z: surface,
      count: 4,
      maxHeight: 7,
      scale: 1.15,
    }),
  },
  {
    id: "speaker",
    order: 95,
    parts: [
      rounded({ x: 96, y: 36 }, 22, 10, surface, 12, materials.shellDark, {
        radius: 2,
        shadow: 1.5,
      }),
      cylinder({ x: 102, y: 41 }, 3.6, surface + 12, 0.6, materials.panel),
      cylinder({ x: 112, y: 41 }, 3.6, surface + 12, 0.6, materials.panel),
    ],
  },
  {
    id: "figure-row-right",
    order: 96,
    parts: clutter({
      seed: 23,
      x: 120,
      width: 14,
      y: 36,
      depth: 8,
      z: surface,
      count: 2,
      maxHeight: 7,
      scale: 1.15,
    }),
  },
  {
    id: "keyboard",
    order: 100,
    parts: [
      rounded({ x: 62, y: 58 }, 70, 18, surface, 2, materials.shellDark, {
        radius: 2,
        shadow: 2,
      }),
      rounded({ x: 65, y: 60 }, 64, 14, surface + 2, 1, materials.keycap, { radius: 1 }),
    ],
  },
  {
    id: "mouse",
    order: 101,
    parts: [
      cylinder({ x: 148, y: 66 }, 5.5, surface, 3.5, materials.shellDark, {
        squash: 1.4,
        shadow: 1.5,
      }),
    ],
  },
  {
    id: "bottle",
    order: 102,
    parts: [
      cylinder({ x: 172, y: 52 }, 6, surface, 24, materials.light, { shadow: 2 }),
      cylinder({ x: 172, y: 52 }, 4, surface + 24, 3, materials.panel),
    ],
  },
];

export const deskObjects: readonly DeskObject[] = [
  ...hutchCarcass(),
  ...cubbyObjects(),
  ...deskSurfaceObjects,
];

export const sceneMetrics = { deskWidth, deskTopZ, surface, topShelfZ } as const;
