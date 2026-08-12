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
 * Nothing here reproduces a real brand, logo, character, or insignia.
 */

import {
  box,
  circle,
  cylinder,
  detail,
  disc,
  groundShadow,
  rounded,
  silhouette,
  wedge,
  type DeskPart,
} from "@/lib/desk/parts";
import type { Point2 } from "@/lib/desk/projection";

type At = Readonly<{ x: number; y: number; z: number }>;

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

export function monitor(at: At): readonly DeskPart[] {
  const width = 46;
  const panelHeight = 27;
  const panelZ = at.z + 12;

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
    // Screen inset, drawn as a detail line on the panel's front wall.
    detail([
      { x: at.x + 3, y: at.y + 8.1, z: panelZ + 3 },
      { x: at.x + width - 3, y: at.y + 8.1, z: panelZ + 3 },
      { x: at.x + width - 3, y: at.y + 8.1, z: panelZ + panelHeight - 3 },
      { x: at.x + 3, y: at.y + 8.1, z: panelZ + panelHeight - 3 },
    ]),
  ];
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

/** maker-origin: fifty-plus Arduino builds documented in public. */
export function devBoard(at: At): readonly DeskPart[] {
  const boardZ = at.z + 0.9;

  return [
    rounded({ x: at.x + 1, y: at.y }, 20, 9, at.z, 2.2, {
      radius: 0.8,
      shadow: 1.6,
    }),
    // Centre channel and tie-point rows: the marks that say "breadboard".
    detail([
      { x: at.x + 2, y: at.y + 4.5, z: at.z + 2.2 },
      { x: at.x + 20, y: at.y + 4.5, z: at.z + 2.2 },
    ]),
    ...[1.8, 7.2].map((row) =>
      detail([
        { x: at.x + 2, y: at.y + row, z: at.z + 2.2 },
        { x: at.x + 20, y: at.y + row, z: at.z + 2.2 },
      ]),
    ),
    rounded({ x: at.x, y: at.y + 11 }, 18, 10, at.z, 0.9, {
      radius: 0.6,
      shadow: 1.6,
    }),
    box({ x: at.x + 1.5, y: at.y + 13, z: boardZ }, { width: 6, depth: 4, height: 2 }),
    box({ x: at.x + 10, y: at.y + 13.5, z: boardZ }, { width: 4.5, depth: 4.5, height: 1.3 }),
    ...Array.from({ length: 7 }, (_, index) =>
      box(
        { x: at.x + 1.5 + index * 2.2, y: at.y + 19, z: boardZ },
        { width: 1, depth: 1, height: 1.5 },
      ),
    ),
    // Jumper wires bridging back to the breadboard.
    ...[0, 1, 2].map((index) =>
      cylinder({ x: at.x + 4 + index * 4.2, y: at.y + 12.5 }, 0.6, boardZ + 0.8, 5, {
        segments: 5,
        lean: { x: 0.3, y: -2.6 },
      }),
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
    silhouette(anchor, [
      { x: -15, y: -10 },
      { x: -10.5, y: -14.5 },
      { x: -4, y: -16.5 },
      { x: 1, y: -16.5 },
      { x: 2, y: -19.5 },
      { x: 3.5, y: -24 },
      { x: 7.5, y: -27 },
      { x: 11.5, y: -25 },
      { x: 13, y: -21 },
      { x: 18.5, y: -20 },
      { x: 20, y: -17.5 },
      { x: 13.5, y: -16.5 },
      { x: 12, y: -14.5 },
      { x: 12.5, y: -10 },
      { x: 10, y: -4 },
      { x: 6, y: -1 },
      { x: -4, y: 0 },
      { x: -11.5, y: -3.5 },
    ]),
    // Wing, then eye. Both interior detail, in Guo's unfilled-path style.
    silhouette(
      anchor,
      [
        { x: -6.5, y: -11 },
        { x: -1.5, y: -13.5 },
        { x: 3, y: -11.5 },
        { x: 0.5, y: -6.5 },
        { x: -5, y: -7.5 },
      ],
      { outlineOnly: true },
    ),
    circle(anchor, 1.5, { segments: 12, cx: 9.5, cy: -23 }),
  ];
}

/** taekwondo + scouting: a fourth-degree belt, and an Eagle Scout's compass. */
export function beltAndCompass(at: At): readonly DeskPart[] {
  const rollAt = { x: at.x + 6, y: at.y + 4 };
  const rollHeight = 6;
  const compassAt = { x: at.x + 28, y: at.y + 5 };

  return [
    cylinder(rollAt, 6, at.z, rollHeight, { segments: 16, shadow: 2 }),
    // Spiral hint on the roll's top face.
    detail([
      { x: rollAt.x - 3.4, y: rollAt.y, z: at.z + rollHeight },
      { x: rollAt.x, y: rollAt.y - 3.4, z: at.z + rollHeight },
      { x: rollAt.x + 3.4, y: rollAt.y, z: at.z + rollHeight },
      { x: rollAt.x, y: rollAt.y + 3.4, z: at.z + rollHeight },
    ]),
    // The trailing end lying flat, with the four rank stripes across it.
    rounded({ x: at.x + 10, y: at.y + 1.4 }, 14, 5, at.z, 1.2, {
      radius: 0.8,
      shadow: 1.2,
    }),
    ...Array.from({ length: 4 }, (_, index) =>
      detail([
        { x: at.x + 15 + index * 2.1, y: at.y + 1.6, z: at.z + 1.2 },
        { x: at.x + 15 + index * 2.1, y: at.y + 6, z: at.z + 1.2 },
      ]),
    ),
    // Compass: a case with its lid standing open behind it.
    cylinder({ x: compassAt.x, y: compassAt.y - 3.4 }, 4.4, at.z + 1.6, 0.6, {
      segments: 14,
      lean: { x: 0, y: -3.4 },
    }),
    cylinder(compassAt, 4.4, at.z, 1.6, { segments: 14, shadow: 1.5 }),
    disc(compassAt, 3.6, at.z + 1.6, 0.3, { segments: 14 }),
    wedge(
      [
        { x: compassAt.x - 1.2, y: compassAt.y - 0.8 },
        { x: compassAt.x + 1.2, y: compassAt.y - 0.8 },
        { x: compassAt.x, y: compassAt.y + 2.8 },
      ],
      at.z + 1.9,
      0.4,
    ),
  ];
}

/** shared-food: good matcha, boba, and unhurried time with people. */
export function twoCups(at: At): readonly DeskPart[] {
  const bobaAt = { x: at.x, y: at.y };
  const matchaAt = { x: at.x + 11, y: at.y + 3.5 };
  const bobaHeight = 12;

  return [
    cylinder(bobaAt, 4, at.z, bobaHeight, {
      segments: 14,
      taper: 1.2,
      shadow: 1.8,
    }),
    // Pearls: a detail line around the base, where they settle.
    detail([
      { x: bobaAt.x - 4, y: bobaAt.y, z: at.z + 2.6 },
      { x: bobaAt.x, y: bobaAt.y + 4, z: at.z + 2.6 },
      { x: bobaAt.x + 4, y: bobaAt.y, z: at.z + 2.6 },
    ]),
    disc(bobaAt, 4.9, at.z + bobaHeight, 0.9, { segments: 14 }),
    cylinder({ x: bobaAt.x + 1, y: bobaAt.y }, 0.8, at.z + bobaHeight, 8, {
      segments: 5,
      lean: { x: 1.6, y: -0.8 },
    }),
    cylinder(matchaAt, 4.2, at.z, 6.5, {
      segments: 14,
      taper: 1.15,
      shadow: 1.8,
    }),
    disc(matchaAt, 4.4, at.z + 6.5, 0.4, { segments: 14 }),
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

/** climbing: bouldering, and one stubborn route. */
export function chalkAndHold(at: At): readonly DeskPart[] {
  const bagHeight = 6;
  const holdAt = { x: at.x + 15, y: at.y + 1 };

  return [
    cylinder({ x: at.x, y: at.y }, 5.6, at.z, bagHeight, {
      segments: 12,
      taper: 0.92,
      shadow: 1.8,
    }),
    disc({ x: at.x, y: at.y }, 6, at.z + bagHeight, 1.8, { segments: 12 }),
    disc({ x: at.x, y: at.y }, 4.2, at.z + bagHeight + 1.8, 0.4, { segments: 10 }),
    // The hold: irregular and angular, tapering back to an overhanging lip.
    {
      shape: "extrude",
      footprint: [
        { x: holdAt.x - 7.5, y: holdAt.y - 4 },
        { x: holdAt.x - 1.5, y: holdAt.y - 6.5 },
        { x: holdAt.x + 7, y: holdAt.y - 2 },
        { x: holdAt.x + 5, y: holdAt.y + 5 },
        { x: holdAt.x - 4.5, y: holdAt.y + 4.5 },
      ],
      z: at.z,
      height: 9,
      shadow: 1.5,
      shaping: { scale: 0.42, offset: { x: 1.8, y: 3.2 } },
    },
    circle({ x: holdAt.x, y: holdAt.y, z: at.z + 9 }, 1.2, { segments: 10 }),
  ];
}

/** gym: time under the bar. A hex dumbbell, because hex heads sit flat. */
export function dumbbell(at: At): readonly DeskPart[] {
  const headRadius = 4.4;
  const headHeight = 6.5;
  const span = 12;

  return [
    cylinder({ x: at.x, y: at.y }, headRadius, at.z, headHeight, {
      segments: 6,
      shadow: 1.8,
    }),
    box(
      { x: at.x, y: at.y - 1.3, z: at.z + headHeight * 0.45 },
      { width: span, depth: 2.6, height: 2.6 },
    ),
    cylinder({ x: at.x + span, y: at.y }, headRadius, at.z, headHeight, {
      segments: 6,
      shadow: 1.8,
    }),
  ];
}

/** anime: ambitious stories and strategic rivalries. Blank spines, by policy. */
export function bookStack(at: At): readonly DeskPart[] {
  const volumeHeight = 2.6;
  const count = 4;

  return [
    ...Array.from({ length: count }, (_, index) =>
      rounded(
        { x: at.x + (index % 2) * 0.9, y: at.y + index * 0.5 },
        12,
        8.5,
        at.z + index * volumeHeight,
        volumeHeight,
        { radius: 0.5, ...(index === 0 ? { shadow: 2 } : {}) },
      ),
    ),
    // Page edge on each volume's open side.
    ...Array.from({ length: count }, (_, index) =>
      detail([
        {
          x: at.x + (index % 2) * 0.9 + 1,
          y: at.y + index * 0.5 + 8.2,
          z: at.z + index * volumeHeight + 1.3,
        },
        {
          x: at.x + (index % 2) * 0.9 + 11,
          y: at.y + index * 0.5 + 8.2,
          z: at.z + index * volumeHeight + 1.3,
        },
      ]),
    ),
    // One volume left standing against the stack.
    rounded({ x: at.x + 13.5, y: at.y + 2 }, 2.8, 8.5, at.z, 10, {
      radius: 0.5,
      shadow: 1.5,
      lean: { x: 2.2, y: 0 },
    }),
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
