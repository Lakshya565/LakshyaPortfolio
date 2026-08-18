/**
 * The scene as data: objects standing on an open isometric field.
 *
 * There is no desk and no slab. guochen.design — the reference this follows — has
 * neither: his objects sit directly on a grid, mixed with trees and small
 * figures. Three earlier builds put a piece
 * of furniture under everything (a corner desk, then a shelf hutch, then a bare
 * slab) and each one fought the composition rather than helping it.
 *
 * Units are roughly centimetres, sized against the keyboard.
 */

import { deskHotspotKeys, type DeskHotspotKey } from "@/lib/desk/hotspots";
import { lettering } from "@/lib/desk/lettering";
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
 * The workstation moves as one object.
 *
 * The monitor, the keyboard and the mouse are three entries in two different
 * tables — the monitor is a labelled hotspot, the other two are unlabelled
 * scale — so nothing in the type system stops a later layout pass from dragging
 * one of them across the field and leaving the others behind. That is exactly
 * what happened once: separating their screen boxes pushed the keyboard a
 * quarter-width off the monitor's centre line and parked the mouse beyond it,
 * and the group stopped reading as a desk.
 *
 * So only this anchor carries a position. The keyboard and mouse are stated as
 * offsets from it and can only move with it. **Retune the anchor, not the
 * offsets** — the offsets encode the arrangement, and they are the part that is
 * meant to be permanent.
 */
const workstation = { x: 68, y: 48 } as const;

function atWorkstation(dx: number, dy: number): Placement {
  return { x: workstation.x + dx, y: workstation.y + dy };
}

/**
 * One object per motif group. The keys and their grouping are owned by
 * `hotspots.ts`; this table only decides which shape stands for each and where
 * it sits, and is checked against that contract below.
 *
 * The thirteen motifs are spread across the whole field rather than packed into
 * the middle of it, and the spacing is the point: no two of their screen boxes
 * come within about fifteen units of each other, where the tightest pairs used
 * to run four or five. The field grew from 448 × 239 screen units to about
 * 525 × 264 to pay for it, which costs roughly 8% of the scale everything
 * renders at — the frame is fitted to the objects, so dispersing them zooms the
 * picture out. That is the trade, and it is why the gaps were opened by using
 * the empty left and bottom of the grid rather than by pushing everything
 * outward evenly.
 *
 * The one region deliberately left out of the spread is the block right of
 * screen `x = 100` and above screen `y = 80`, reserved for 3D lettering. Only
 * three motifs stand right of `x = 100` at all, and all three sit well below it.
 */
const hotspotLayout = [
  // Back rank. The monitor's own place is the workstation anchor, so the
  // keyboard and mouse below follow it wherever it goes.
  { key: "colophon", build: objects.monitor, place: workstation },
  // Far out on +x, and pushed down until its top cleared screen y = 80: at the
  // height that reads best on this rank the cups were standing in the lettering.
  { key: "shared-food", build: objects.twoCups, place: { x: 203, y: 28 } },
  // Middle rank.
  // Moved back and left when the breadboard arrived: the object grew a whole
  // second body behind the board, and it was crowding the duck.
  { key: "maker", build: objects.devBoard, place: { x: -20, y: 100 } },
  { key: "quackta", build: objects.duck, place: { x: 55, y: 135 } },
  // `y += 30` off the middle rank — 30 screen units left and 15 down, which is
  // what a move along +y buys. It also takes the panel's nearest motif from 16
  // units to 46, the widest clearance any motif in the scene has.
  { key: "climbing", build: objects.climbingHold, place: { x: 195, y: 95 } },
  { key: "gym", build: objects.dumbbell, place: { x: 270, y: 60 } },
  // Front rank, nearest the eye.
  // Out on the far left rim. The screen is 24 units wide against the belt's 30
  // and the dev board's 45, so it is the one motif that can hold a corner
  // without the two objects inboard of it looking crowded.
  { key: "anime", build: objects.animeScreen, place: { x: -48, y: 138 } },
  // The belt and the compass were one object and read as neither. They stay
  // neighbours so the leadership story still groups, but each is now its own
  // hotspot with room for its own hover field. The belt moved further out when
  // it became a tied one: a knot with two tails is twice the width of a coil.
  { key: "taekwondo", build: objects.belt, place: { x: 20, y: 220 } },
  { key: "scouting", build: objects.compass, place: { x: 55, y: 205 } },
  { key: "food-favorites", build: objects.sushiPlate, place: { x: 200, y: 190 } },
  { key: "music", build: objects.headphones, place: { x: 143, y: 168 } },
  // Nudged out from the compass when Kirby's arms and feet were turned to follow
  // their own directions — tilting an ellipse widens its bounding box.
  { key: "kirby", build: objects.kirby, place: { x: 113, y: 208 } },
  { key: "triforce", build: objects.triforce, place: { x: 135, y: 265 } },
] as const satisfies readonly Readonly<{
  key: DeskHotspotKey;
  build: objects.ObjectBuilder;
  place: Placement;
}>[];

/**
 * The workspace objects. Not labelled — they carry scale, not meaning.
 *
 * A desk, laid out the way a desk is laid out: keyboard in front of the
 * monitor, mouse to its right on the same rank.
 *
 * **The mouse is parallel to the keyboard** — literally the same world `y`,
 * both at `+24`, so it rides the keyboard's own `+x` line rather than sitting
 * behind it. It is `+58` along that line, leaving 7.9 screen units between the
 * two boxes: a hand's width, which is what the arrangement copies. That 58 is
 * the part to preserve; the pair's position on the grid is the anchor's job.
 *
 * **Both offsets took `x − 24` — two isometric grid squares up-left.** A grid
 * square is 12 world units on a side, which is not obvious from anywhere in
 * this file: `generate-desk.ts` draws the grid in screen space at
 * `view.width * 0.0205` apart, and the two families work out to lines of
 * constant world `y` and constant world `x` at exactly 12-unit intervals. So a
 * whole number of grid squares along an axis is a multiple of 12, and that is
 * the unit to move this group in when it is being placed by eye against the
 * grid rather than against the objects.
 *
 * That move slides the keyboard back under the monitor's screen box, and the
 * overlap it reports is a box artefact rather than a collision — see the
 * workstation exemption in `generate-desk.ts`. The two shapes have clear
 * daylight between them in the drawing.
 *
 * An earlier pass had the keyboard out to the monitor's upper left and the
 * mouse stranded 24 units away under the stand. Do not go back to it.
 *
 * The lamp and the clock tower are not part of that group and are placed on
 * their own, out to the left along the top edge.
 */
const workspaceLayout = [
  { id: "desk-lamp", build: objects.deskLamp, place: { x: -15, y: 55 } },
  { id: "clock-tower", build: objects.clockTower, place: { x: 2, y: 22 } },
  { id: "keyboard", build: objects.keyboard, place: atWorkstation(4, 24) },
  { id: "mouse", build: objects.mouse, place: atWorkstation(62, 24) },
] as const;

/**
 * Scenery is framing, not content.
 *
 * This used to be eighteen trees, nine figures and two cubes — twenty-nine
 * scenery objects against twelve real ones, so the things a visitor is meant to
 * read were outnumbered better than two to one. Reviewed side by side in the
 * workbench the imbalance was impossible to miss.
 *
 * Now eight trees and four figures, and no cubes at all: the last one stood in
 * the middle of the field, which is the one place nothing meaningless should be,
 * and a pair of headphones took its slot. Trees and figures sit around the rim
 * and leave the centre to the objects that mean something. Heights still vary: a
 * stand of identical lollipops reads as wallpaper rather than as planting.
 *
 * The rim is now also load-bearing, and this is the part that is easy to undo by
 * accident. `toViewBox` fits the frame to the bounds of everything drawn, so the
 * empty quarter reserved at the top right only exists while two trees hold the
 * edges it is measured from: the one at `(-58, 48)` sets the frame's top, and
 * the one at `(243, -23)` sets its right. Neither has a neighbour anywhere near
 * it — that isolation is deliberate, not an oversight. Move either one inward
 * and the frame shrinks onto the objects, taking the reserved space with it.
 *
 * The right anchor is also the one tree allowed to stand above screen `y = 80`
 * out on +x, and it clears it by three and a half units. Nothing else in the
 * scene enters that block at all: it is kept clear for the 3D lettering.
 *
 * Since the motifs were dispersed, scenery does more than frame — several
 * pieces now stand in gaps the motifs opened up, which is what stops the wider
 * field from reading as empty. They are still allowed to sit closer to each
 * other than two motifs may, because a tree beside a figure is a scene and two
 * unrelated objects a few units apart is a collision.
 */
const treePlaces: readonly (Placement &
  Readonly<{ height: number; canopy: number }>)[] = [
  // Top edge anchor. Left of the workstation, alone above everything.
  { x: -58, y: 48, height: 25, canopy: 8 },
  { x: -60, y: 180, height: 24, canopy: 7.5 },
  { x: 43, y: 288, height: 22, canopy: 7 },
  { x: 123, y: 288, height: 26, canopy: 8 },
  { x: 215, y: 235, height: 21, canopy: 6.5 },
  { x: 265, y: 145, height: 18, canopy: 6 },
  { x: 328, y: 113, height: 23, canopy: 7.5 },
  // Right edge anchor, and the only object still out on the far +x rim.
  { x: 243, y: -23, height: 20, canopy: 6.5 },
];

/**
 * The figures are the scale reference — everything else is read against them.
 *
 * Two of the four now stand inside the field rather than around it. Spreading
 * the motifs left holes in the middle big enough to look like omissions, and a
 * figure is the one thing that can fill one without competing: it is 10 units
 * wide, unlabelled, and drawn in the same grey as the trees.
 */
const figurePlaces: readonly Placement[] = [
  { x: -13, y: 203 },
  { x: 100, y: 150 },
  // Down in the open ground between the sushi, the mouse and the climbing
  // panel. It used to stand at (150, 80), which put it exactly where the mouse
  // belongs once the keyboard came back in front of the monitor — nothing
  // unlabelled goes in the workstation's way. The left rim was the other
  // candidate and is worse: it would have stood level with the figure already
  // there, and two identical silhouettes at the same height read as a fence.
  { x: 203, y: 148 },
  // Kept well clear of the belt, whose loose end runs 28 units out along +y. An
  // earlier placement passed the overlap check — scenery used to be allowed a
  // third of its own box — while the tail's tip corner sat inside this figure's
  // silhouette. That budget is now zero and the case cannot recur.
  { x: 278, y: 113 },
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

/**
 * Where the lettering stands, and why it is first in the array.
 *
 * This is the block `hotspotLayout` and `treePlaces` have been keeping empty.
 * The anchor is the phrase's **centre column**, not a corner — all three lines
 * are centred on it — so nudging it moves the whole block without changing how
 * the lines sit against each other.
 *
 * Screen box x 70..255, y −30..79. It clears the monitor by 8 on the left, the
 * cups by 8 below, and stops 17 short of the right anchor tree. It also stays 8
 * below the frame's top edge, which the tree at `(-58, 48)` sets: pushing past
 * that would grow the frame and shrink every other object in the scene.
 *
 * `y = -70` is a long way back, which is the point: `depthOrder` gives it the
 * lowest order in the scene, so it paints before everything else. It is a
 * backdrop standing behind the field, not an object standing among the objects.
 */
const letteringPlace = { x: 115, y: -70 } as const;

export const deskObjects: readonly DeskObject[] = [
  scenery("lettering", lettering, letteringPlace),
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
