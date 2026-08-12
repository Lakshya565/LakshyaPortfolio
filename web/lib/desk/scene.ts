/**
 * The scene as data: objects standing on an open isometric field.
 *
 * There is no desk and no slab. guochen.design — the reference this follows — has
 * neither: his objects sit directly on a grid with their own cast shadows, mixed
 * with trees, small figures, and a plain cube. Three earlier builds put a piece
 * of furniture under everything (a corner desk, then a shelf hutch, then a bare
 * slab) and each one fought the composition rather than helping it.
 *
 * Units are roughly centimetres, sized against the keyboard.
 */

import { deskHotspotKeys, type DeskHotspotKey } from "@/lib/desk/hotspots";
import * as objects from "@/lib/desk/objects";
import type { DeskObject, DeskPart } from "@/lib/desk/parts";

export type { BoxPart, DeskObject, DeskPart, ExtrudePart } from "@/lib/desk/parts";

/** Everything rests on z = 0. The ground is the grid itself. */
const ground = 0;

type Placement = Readonly<{ x: number; y: number }>;

function at(placement: Placement) {
  return { ...placement, z: ground };
}

/**
 * One object per motif group. The keys and their grouping are owned by
 * `hotspots.ts`; this table only decides which shape stands for each and where
 * it sits, and is checked against that contract below.
 */
const hotspotLayout = [
  { key: "maker", build: objects.devBoard, place: { x: 30, y: 52 } },
  { key: "quackta", build: objects.duck, place: { x: 92, y: 56 } },
  { key: "leadership", build: objects.beltAndCompass, place: { x: 66, y: 104 } },
  { key: "shared-food", build: objects.twoCups, place: { x: 190, y: 14 } },
  { key: "food-favorites", build: objects.sushiPlate, place: { x: 216, y: 104 } },
  { key: "climbing", build: objects.chalkAndHold, place: { x: 160, y: 52 } },
  { key: "gym", build: objects.dumbbell, place: { x: 232, y: 50 } },
  { key: "anime", build: objects.bookStack, place: { x: 16, y: 100 } },
] as const satisfies readonly Readonly<{
  key: DeskHotspotKey;
  build: objects.ObjectBuilder;
  place: Placement;
}>[];

/** The workspace objects. Not labelled — they carry scale, not meaning. */
const workspaceLayout = [
  { id: "desk-lamp", build: objects.deskLamp, place: { x: 18, y: 10 } },
  { id: "clock-tower", build: objects.clockTower, place: { x: 60, y: 6 } },
  { id: "monitor", build: objects.monitor, place: { x: 100, y: 6 } },
  { id: "keyboard", build: objects.keyboard, place: { x: 128, y: 100 } },
] as const;

/**
 * Guo's field carries fourteen trees, seven figures, and a cube alongside his
 * labelled objects, and that population is most of why it reads as a place. The
 * figures also give the scene its scale: everything else is read against them.
 */
const treePlaces: readonly (Placement &
  Readonly<{ height: number; canopy: number }>)[] = [
  // Heights vary the way Guo's do. A stand of identical lollipops reads as a
  // pattern rather than as planting.
  { x: 4, y: 22, height: 24, canopy: 7.5 },
  { x: 28, y: 0, height: 17, canopy: 5.5 },
  { x: 154, y: 0, height: 21, canopy: 6.5 },
  { x: 214, y: 0, height: 15, canopy: 5 },
  { x: 262, y: 6, height: 25, canopy: 8 },
  { x: 14, y: 92, height: 19, canopy: 6 },
  { x: 276, y: 74, height: 22, canopy: 7 },
  { x: 2, y: 128, height: 26, canopy: 8 },
  { x: 214, y: 140, height: 18, canopy: 6 },
  { x: 60, y: 136, height: 23, canopy: 7.5 },
  { x: 264, y: 132, height: 16, canopy: 5.5 },
  { x: 34, y: 160, height: 27, canopy: 8.5 },
  { x: 130, y: 158, height: 20, canopy: 6.5 },
  { x: 292, y: 34, height: 20, canopy: 6.5 },
  // The lower-left of the frame is low-x, high-y ground. Without planting it
  // reads as a corner the scene forgot about.
  { x: 2, y: 150, height: 21, canopy: 6.5 },
  { x: 30, y: 178, height: 25, canopy: 8 },
  { x: 74, y: 194, height: 18, canopy: 6 },
  { x: 118, y: 202, height: 23, canopy: 7 },
];

const figurePlaces: readonly Placement[] = [
  { x: 240, y: 16 },
  { x: 206, y: 74 },
  { x: 104, y: 96 },
  { x: 118, y: 126 },
  { x: 246, y: 122 },
  { x: 66, y: 154 },
  { x: 178, y: 150 },
  { x: 48, y: 184 },
  { x: 152, y: 196 },
];

const cubePlaces: readonly Placement[] = [
  { x: 172, y: 28 },
  { x: 96, y: 166 },
];

/**
 * The four objects a recruiter should read first. `tier` only changes
 * prominence — the eight-group, nine-motif contract in `hotspots.ts` is
 * untouched.
 */
const heroKeys: ReadonlySet<string> = new Set([
  "maker",
  "quackta",
  "leadership",
  "shared-food",
]);

/**
 * Paint order is depth order: nothing in the scene stacks on anything but the
 * ground, so sorting by `x + y` puts far objects behind near ones.
 */
function depthOrder(place: Placement): number {
  return Math.round((place.x + place.y) * 10);
}

function scenery(
  id: string,
  build: objects.ObjectBuilder,
  place: Placement,
): DeskObject {
  return {
    id,
    scenery: true,
    order: depthOrder(place),
    parts: build(at(place)),
  };
}

export const deskObjects: readonly DeskObject[] = [
  ...treePlaces.map((place, index) =>
    scenery(
      `tree-${index}`,
      (anchor) => objects.tree(anchor, place.height, place.canopy),
      place,
    ),
  ),
  ...figurePlaces.map((place, index) =>
    scenery(`figure-${index}`, objects.figure, place),
  ),
  ...cubePlaces.map((place, index) =>
    scenery(`cube-${index}`, (anchor) => objects.cube(anchor), place),
  ),
  ...workspaceLayout.map((item) => scenery(item.id, item.build, item.place)),
  ...hotspotLayout.map((item) => ({
    id: `motif-${item.key}`,
    hotspot: item.key,
    tier: (heroKeys.has(item.key) ? "hero" : "detail") as "hero" | "detail",
    order: depthOrder(item.place),
    parts: item.build(at(item.place)) as readonly DeskPart[],
  })),
];

/** Every hotspot the overlay expects must have an object standing for it. */
const laidOut = new Set<string>(hotspotLayout.map((item) => item.key));
for (const key of deskHotspotKeys) {
  if (!laidOut.has(key)) {
    throw new Error(`scene: hotspot ${key} has no object in the layout`);
  }
}
