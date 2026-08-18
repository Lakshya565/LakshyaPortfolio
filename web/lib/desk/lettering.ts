/**
 * "WALK / THROUGH / MY WORKBENCH!" as a wall of cubes.
 *
 * The one piece of writing in the scene. It stands in the block the layout has
 * been holding empty for three sessions — right of screen `x = 100` and above
 * screen `y = 80` — which is what the comments on `hotspotLayout` and
 * `treePlaces` in `scene.ts` exist to protect.
 *
 * A bitmap font rasterised onto the world lattice: every lit cell of a glyph
 * becomes one cube, and the cubes stand in a vertical wall one cell deep. The
 * cube divisions are the point of the style, so they are never merged away.
 *
 * Everything here is sized by one constraint that is not visual at all. Each
 * emitted face is one `<path>`, and `validate-portfolio-content.ts` fails the
 * build when the generated SVG passes 250 KB. This object is 616 faces of a
 * ~1100-path file — the single largest thing in the scene by a wide margin —
 * so the two levers that keep it affordable, hidden-face culling and an integer
 * lattice, are load-bearing rather than tidy. See the notes on each.
 */

import { face, hue, type DeskPart } from "@/lib/desk/parts";
import type { Vec3 } from "@/lib/desk/projection";

/**
 * The side of one cube, in world units.
 *
 * **Two is not a tuning knob.** It is the largest cell that fits the reserved
 * block, and it is an integer — which matters more than it looks. Every glyph
 * lands on multiples of this, so `project()` returns whole numbers and the
 * generator writes `M238 -30L242 -28` rather than `M237.6 -29.55L241.3 -28.63`.
 * That is about eight bytes on each of 616 paths, roughly 5 KB, and 5 KB is a
 * fifth of the headroom this object leaves behind. Move it off the integers and
 * the file grows for nothing anyone can see.
 */
const cell = 2;

/** Glyph cells across and down. See `font` for why five is as small as it goes. */
const glyphWidth = 5;
const glyphHeight = 5;

/** Five cells of ink plus one of letterspace. */
const glyphAdvance = (glyphWidth + 1) * cell;

/**
 * A space is narrower than a letter slot.
 *
 * At a full `glyphAdvance` the gap in "MY WORKBENCH!" read as a missing letter
 * rather than as a word break — six empty columns between Y and W is wider than
 * any letter in the font is.
 */
const wordAdvance = 4 * cell;

/** How far each line drops, in world `z`. */
const lineLeading = 5 * cell;

/**
 * How far each line steps along `+y`, which is down-left on screen.
 *
 * The lines get longer as they go down, and the field opens up toward the
 * bottom left. Indenting each line the other way — down-left — means the
 * longest line starts furthest left and finishes 21 units clear of the frame's
 * right edge instead of running into it.
 */
const lineIndent = 4 * cell;

const phrase = ["WALK", "THROUGH", "MY WORKBENCH!"] as const;

/**
 * One glyph, five rows, top row first. `#` is a cube and `.` is air.
 *
 * Written as art rather than as bitmasks because the source has to *be* the
 * picture. A wrong bit in `0b10001` is invisible in review; a wrong `#...#` is
 * not. The tuple type is what makes a dropped row a compile error rather than a
 * letter that quietly loses its crossbar.
 */
type Glyph = readonly [string, string, string, string, string];

/**
 * Exactly the glyphs the phrase uses, and no more.
 *
 * Five by five is the smallest grid that fits the reserved block at a cube size
 * anyone can see, and it is genuinely tight for some of these. `W` is the worst:
 * five columns cannot hold two V shapes that both close, so it spends the outer
 * columns on stems, the centre on a peak that only exists on rows 2 and 3, and
 * steps its feet inward on the last row. Its top two rows are identical to `H`,
 * `M`, `N` and `U` — the whole letter is decided by three cells. `M`, `N` and
 * `G` are only slightly better off. Six or seven rows would fix all four, and
 * would also push the file to 98% of its size budget, so the letters lose.
 */
const font: Readonly<Record<string, Glyph>> = {
  W: ["#...#", "#...#", "#.#.#", "#.#.#", ".#.#."],
  A: [".###.", "#...#", "#####", "#...#", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#####"],
  K: ["#...#", "#..#.", "###..", "#..#.", "#...#"],
  T: ["#####", "..#..", "..#..", "..#..", "..#.."],
  H: ["#...#", "#...#", "#####", "#...#", "#...#"],
  R: ["####.", "#...#", "####.", "#..#.", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", ".###."],
  U: ["#...#", "#...#", "#...#", "#...#", ".###."],
  G: [".###.", "#....", "#..##", "#...#", ".###."],
  M: ["#...#", "##.##", "#.#.#", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".###.", "..#..", "..#.."],
  B: ["####.", "#...#", "####.", "#...#", "####."],
  E: ["#####", "#....", "####.", "#....", "#####"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#"],
  C: [".###.", "#...#", "#....", "#...#", ".###."],
  "!": ["..#..", "..#..", "..#..", ".....", "..#.."],
};

/**
 * Fail at import rather than draw something wrong.
 *
 * A row of the wrong length shifts every cell after it by a fraction of a cube,
 * which at ten pixels a cube looks like a slightly ugly letter rather than like
 * a bug. The same habit as the hotspot check at the bottom of `scene.ts`.
 */
for (const [character, glyph] of Object.entries(font)) {
  if (glyph.length !== glyphHeight) {
    throw new Error(`lettering: glyph ${character} has ${glyph.length} rows`);
  }
  for (const row of glyph) {
    if (row.length !== glyphWidth || /[^#.]/.test(row)) {
      throw new Error(`lettering: glyph ${character} has a bad row "${row}"`);
    }
  }
}

for (const line of phrase) {
  for (const character of line) {
    if (character !== " " && font[character] === undefined) {
      throw new Error(`lettering: no glyph for "${character}"`);
    }
  }
}

/**
 * The lines must not collide with each other, and nothing else will catch it.
 *
 * All the lettering is one `DeskObject`, so the generator's overlap check sees a
 * single bounding box and cannot see one line crossing another inside it. The
 * geometry is simple enough to state as an invariant instead: on screen each
 * line is a strip of slope ½ and constant thickness `(glyphHeight + 1) · cell`,
 * and consecutive strips are offset by exactly `lineIndent + lineLeading`
 * wherever they overlap in `x`. The difference is the daylight between them.
 */
const lineClearance = lineIndent + lineLeading - (glyphHeight + 1) * cell;

if (lineClearance < 4) {
  throw new Error(
    `lettering: lines clear each other by only ${lineClearance} screen units`,
  );
}

/**
 * The faces of one cube that the camera can see and no neighbour is covering.
 *
 * The camera looks along (1, 1, 1), so of the six faces only `+x`, `+y` and `+z`
 * are turned toward it at all — the same test `extrude` and `emitPyramid` apply.
 * Of those three, two can be dropped whenever a lit neighbour is pressed against
 * them: a cube directly above shares its underside with this one's `+z` face
 * exactly, and a cube directly to `+x` shares its `-x` with this one's `+x`.
 * Drawing them anyway would be 206 extra paths across the phrase, all of them
 * hidden, and every one carrying a stroke that has to be painted over cleanly.
 *
 * The `+y` face is never dropped. It is the letterform — the flat side the wall
 * turns toward the viewer — and in a wall one cell deep nothing can stand in
 * front of it. It is also the only one filled in `lettering`; the extrusion
 * takes `letteringSide`. Filled alike they were unreadable, and the reason is
 * in the note on those two palette entries.
 *
 * Vertex order matches `boxFaces` exactly: `+y` is its `left`, `+x` its `right`,
 * `+z` its `top`. Same winding, so these read as ordinary cubes.
 */
function cubeFaces(
  origin: Vec3,
  showTop: boolean,
  showRight: boolean,
): readonly DeskPart[] {
  const { x, y, z } = origin;
  const far = { x: x + cell, y: y + cell, z: z + cell };
  const front = hue("lettering");
  const side = hue("letteringSide");

  return [
    face(
      [
        { x, y: far.y, z: far.z },
        { x: far.x, y: far.y, z: far.z },
        { x: far.x, y: far.y, z },
        { x, y: far.y, z },
      ],
      front,
    ),
    ...(showRight
      ? [
          face(
            [
              { x: far.x, y, z: far.z },
              { x: far.x, y: far.y, z: far.z },
              { x: far.x, y: far.y, z },
              { x: far.x, y, z },
            ],
            side,
          ),
        ]
      : []),
    ...(showTop
      ? [
          face(
            [
              { x, y, z: far.z },
              { x: far.x, y, z: far.z },
              { x: far.x, y: far.y, z: far.z },
              { x, y: far.y, z: far.z },
            ],
            side,
          ),
        ]
      : []),
  ];
}

/** Whether a glyph cell is ink. Out of range is air, which is what culls edges. */
function isLit(glyph: Glyph, row: number, column: number): boolean {
  if (row < 0 || row >= glyphHeight || column < 0 || column >= glyphWidth) {
    return false;
  }
  return glyph[row][column] === "#";
}

/**
 * One glyph's cubes, in paint order.
 *
 * Bottom row first and left column first, which is the order that makes the
 * scene's one drawing rule work. Paint order is array order and there is no
 * depth buffer, so anything nearer has to be emitted later — and "nearer" here
 * means larger `x + y + z`. Culling handles the cube directly above and the cube
 * directly right, but a cube on the *up-right diagonal* covers half of this
 * one's top and half of its right face and cannot be culled, because the two
 * only share an edge. Running rows bottom to top and columns left to right puts
 * every one of those diagonals later in the array, so they paint over cleanly.
 *
 * Reverse either loop and the covered halves are drawn last, which shows up as
 * stroke lines cutting through the faces standing in front of them.
 */
function glyphCubes(
  glyph: Glyph,
  originX: number,
  y: number,
  baseZ: number,
): readonly DeskPart[] {
  const parts: DeskPart[] = [];

  for (let row = glyphHeight - 1; row >= 0; row -= 1) {
    for (let column = 0; column < glyphWidth; column += 1) {
      if (!isLit(glyph, row, column)) {
        continue;
      }

      parts.push(
        ...cubeFaces(
          {
            x: originX + column * cell,
            y,
            z: baseZ + (glyphHeight - 1 - row) * cell,
          },
          !isLit(glyph, row - 1, column),
          !isLit(glyph, row, column + 1),
        ),
      );
    }
  }

  return parts;
}

/**
 * The whole phrase, as one object's worth of parts.
 *
 * `at` is where the block *stands*: the ground corner of the last line's first
 * cube. The two lines above are stacked from there, so moving the anchor moves
 * all three together and nothing can separate them — the same reasoning as the
 * `workstation` anchor in `scene.ts`.
 *
 * There is no cell-size parameter because there is one instance of this object
 * and no call site could justify a second value. See `cell`.
 */
export function lettering(at: Vec3): readonly DeskPart[] {
  const lastLine = phrase.length - 1;

  return phrase.flatMap((line, index) => {
    const y = at.y + index * lineIndent;
    const baseZ = at.z + (lastLine - index) * lineLeading;
    const parts: DeskPart[] = [];
    let pen = 0;

    for (const character of line) {
      if (character === " ") {
        pen += wordAdvance;
        continue;
      }

      parts.push(...glyphCubes(font[character], at.x + pen, y, baseZ));
      pen += glyphAdvance;
    }

    return parts;
  });
}
