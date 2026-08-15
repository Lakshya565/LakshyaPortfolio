/**
 * The scene as data: objects standing on an open isometric field.
 *
 * There is no desk and no slab. guochen.design — the reference this follows — has
 * neither: his objects sit directly on a grid, mixed with trees, small figures,
 * and a plain cube. Three earlier builds put a piece
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
  // Back rank, level with the workstation.
  { key: "colophon", build: objects.monitor, place: { x: 94, y: 2 } },
  { key: "shared-food", build: objects.twoCups, place: { x: 178, y: 8 } },
  // Middle rank.
  // Moved back and left when the breadboard arrived: the object grew a whole
  // second body behind the board, and it was crowding the duck.
  { key: "maker", build: objects.devBoard, place: { x: 20, y: 52 } },
  { key: "quackta", build: objects.duck, place: { x: 92, y: 62 } },
  { key: "climbing", build: objects.climbingHold, place: { x: 174, y: 54 } },
  { key: "gym", build: objects.dumbbell, place: { x: 228, y: 44 } },
  // Front rank, nearest the eye.
  { key: "anime", build: objects.animeScreen, place: { x: 6, y: 92 } },
  // The belt and the compass were one object and read as neither. They stay
  // neighbours so the leadership story still groups, but each is now its own
  // hotspot with room for its own hover field. The belt moved further out when
  // it became a tied one: a knot with two tails is twice the width of a coil.
  { key: "taekwondo", build: objects.belt, place: { x: 56, y: 140 } },
  { key: "scouting", build: objects.compass, place: { x: 98, y: 120 } },
  { key: "food-favorites", build: objects.sushiPlate, place: { x: 194, y: 102 } },
  // Both new, in the front-centre ground, which was the only gap left with room
  // for two objects that must not touch.
  { key: "kirby", build: objects.kirby, place: { x: 134, y: 128 } },
  { key: "triforce", build: objects.triforce, place: { x: 168, y: 132 } },
] as const satisfies readonly Readonly<{
  key: DeskHotspotKey;
  build: objects.ObjectBuilder;
  place: Placement;
}>[];

/**
 * The workspace objects. Not labelled — they carry scale, not meaning.
 *
 * Keyboard and mouse sit directly in front of the monitor rather than ninety
 * units south of it, which is where the keyboard used to be. A workstation is
 * the one cluster in the field that has to read as a group.
 */
const workspaceLayout = [
  { id: "desk-lamp", build: objects.deskLamp, place: { x: 14, y: 6 } },
  { id: "clock-tower", build: objects.clockTower, place: { x: 52, y: 0 } },
  { id: "keyboard", build: objects.keyboard, place: { x: 96, y: 28 } },
  { id: "mouse", build: objects.mouse, place: { x: 148, y: 32 } },
] as const;

/**
 * Scenery is framing, not content.
 *
 * This used to be eighteen trees, nine figures and two cubes — twenty-nine
 * scenery objects against twelve real ones, so the things a visitor is meant to
 * read were outnumbered better than two to one. Reviewed side by side in the
 * workbench the imbalance was impossible to miss.
 *
 * Now eight, four and one. They sit around the rim of the field and leave the
 * middle to the objects that mean something. Heights still vary: a stand of
 * identical lollipops reads as wallpaper rather than as planting.
 */
const treePlaces: readonly (Placement &
  Readonly<{ height: number; canopy: number }>)[] = [
  { x: -10, y: 24, height: 24, canopy: 7.5 },
  { x: 136, y: -16, height: 21, canopy: 6.5 },
  { x: 248, y: 2, height: 25, canopy: 8 },
  { x: 266, y: 76, height: 22, canopy: 7 },
  { x: -14, y: 128, height: 26, canopy: 8 },
  { x: 242, y: 142, height: 18, canopy: 6 },
  { x: 132, y: 156, height: 23, canopy: 7.5 },
  { x: 40, y: 156, height: 20, canopy: 6.5 },
];

/** The figures are the scale reference — everything else is read against them. */
const figurePlaces: readonly Placement[] = [
  { x: 210, y: 22 },
  { x: 130, y: 88 },
  { x: 250, y: 104 },
  { x: 100, y: 150 },
];

const cubePlaces: readonly Placement[] = [{ x: 158, y: 96 }];

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
