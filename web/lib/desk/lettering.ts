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

import { face, hue, ink, type DeskPart } from "@/lib/desk/parts";
import type { Vec3 } from "@/lib/desk/projection";

/**
 * The side of one cube, in world units.
 *
 * Sized against the reserved block rather than chosen: the phrase is 76 cells
 * wide and 44 tall once centred, and the block it has to sit in is about 204 by
 * 118 screen units. Both divide out near 2.68, and 2.5 leaves a margin on each
 * side without wasting the space.
 *
 * Growing this is nearly free in bytes — the path count comes from the letters,
 * not their size — but it is not free in decimals. Every coordinate is a
 * multiple of 2.5, so `project()` lands on quarters at worst and the generator
 * writes `237.5` rather than `237.63`. Keep it on a fraction that behaves: 2.5
 * and 2 both do, 2.68 does not.
 */
const cell = 2.5;

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

/** Whether a glyph cell is ink. Out of range is air, which is what culls edges. */
function isLit(glyph: Glyph, row: number, column: number): boolean {
  if (row < 0 || row >= glyphHeight || column < 0 || column >= glyphWidth) {
    return false;
  }
  return glyph[row][column] === "#";
}

/** World `z` of a bitmap row's floor. Row 0 is the top, so `z` falls as `r` rises. */
function rowZ(baseZ: number, row: number): number {
  return baseZ + (glyphHeight - 1 - row) * cell;
}

/** Maximal spans of consecutive indices that pass `test`, as `[from, to]` pairs. */
function runs(length: number, test: (index: number) => boolean): [number, number][] {
  const found: [number, number][] = [];
  let start: number | null = null;

  for (let index = 0; index < length; index += 1) {
    if (test(index)) {
      start ??= index;
    } else if (start !== null) {
      found.push([start, index - 1]);
      start = null;
    }
  }
  if (start !== null) {
    found.push([start, length - 1]);
  }

  return found;
}

/**
 * One glyph, as a handful of merged quads rather than a pile of cubes.
 *
 * The camera looks along (1, 1, 1), so of the six faces of a cube only `+x`,
 * `+y` and `+z` are turned toward it — the same test `extrude` and `emitPyramid`
 * apply. Two of those three are then dropped whenever a lit neighbour is pressed
 * against them: a cube directly above shares its underside with this one's `+z`
 * exactly, and a cube directly to `+x` shares its `-x` with this one's `+x`.
 *
 * What is left is merged along its own axis. Every horizontal span of cells in a
 * row becomes **one** `+y` quad; every horizontal span with nothing above it
 * becomes one `+z` quad; every vertical span with nothing to its right becomes
 * one `+x` quad. That is what turns each letter into a single solid instead of a
 * stack of cubes: the divisions between neighbouring cubes were never real edges
 * of the shape, only edges of the boxes it was built from. The lines that
 * survive are the ones that outline the letter's actual form — the steps in its
 * silhouette, and the inside corners where a stem meets a crossbar.
 *
 * It also costs a quarter fewer paths than drawing them cube by cube, which is
 * what paid for the larger `cell`.
 *
 * **Sides first, then fronts, and that ordering is load-bearing.** Paint order
 * is array order and there is no depth buffer. The only place two of these quads
 * overlap is where a cube on the up-right diagonal of another covers half of its
 * top and half of its right face — the two share an edge, so neither culling nor
 * merging can remove it, and the diagonal cube is always the nearer of the pair
 * (`x + z` is greater by two cells). Its `+y` face therefore has to be painted
 * after. Emitting every side quad in the glyph before every front quad satisfies
 * that for all of them at once. Nothing else overlaps: faces in one plane tile,
 * and cells on the same anti-diagonal meet exactly at an edge.
 *
 * Vertex order matches `boxFaces`: `+y` is its `left`, `+x` its `right`, `+z`
 * its `top`.
 */
function glyphQuads(
  glyph: Glyph,
  originX: number,
  y: number,
  baseZ: number,
): readonly DeskPart[] {
  const front = { accent: ink.accent };
  const side = hue("letteringSide");
  const near = y + cell;
  const columnX = (column: number) => originX + column * cell;

  const tops: DeskPart[] = [];
  const rights: DeskPart[] = [];
  const fronts: DeskPart[] = [];

  for (let row = 0; row < glyphHeight; row += 1) {
    const top = rowZ(baseZ, row) + cell;
    const floor = rowZ(baseZ, row);

    for (const [from, to] of runs(
      glyphWidth,
      (column) => isLit(glyph, row, column) && !isLit(glyph, row - 1, column),
    )) {
      tops.push(
        face(
          [
            { x: columnX(from), y, z: top },
            { x: columnX(to + 1), y, z: top },
            { x: columnX(to + 1), y: near, z: top },
            { x: columnX(from), y: near, z: top },
          ],
          side,
        ),
      );
    }

    for (const [from, to] of runs(glyphWidth, (column) =>
      isLit(glyph, row, column),
    )) {
      fronts.push(
        face(
          [
            { x: columnX(from), y: near, z: top },
            { x: columnX(to + 1), y: near, z: top },
            { x: columnX(to + 1), y: near, z: floor },
            { x: columnX(from), y: near, z: floor },
          ],
          front,
        ),
      );
    }
  }

  for (let column = 0; column < glyphWidth; column += 1) {
    const x = columnX(column + 1);

    for (const [from, to] of runs(
      glyphHeight,
      (row) => isLit(glyph, row, column) && !isLit(glyph, row, column + 1),
    )) {
      rights.push(
        face(
          [
            { x, y, z: rowZ(baseZ, from) + cell },
            { x, y: near, z: rowZ(baseZ, from) + cell },
            { x, y: near, z: rowZ(baseZ, to) },
            { x, y, z: rowZ(baseZ, to) },
          ],
          side,
        ),
      );
    }
  }

  return [...tops, ...rights, ...fronts];
}

/**
 * Where a line's ink actually starts and ends, in world `x` from its own pen
 * origin. Used to centre it.
 *
 * Measured rather than counted, because the advance and the ink are not the same
 * width. "MY WORKBENCH!" ends on an exclamation mark whose only lit column is
 * the middle one, so centring on the advance would push the whole line one and a
 * half cells right of where it looks centred.
 */
function inkSpan(line: string): Readonly<{ start: number; end: number }> {
  let pen = 0;
  let start = Number.POSITIVE_INFINITY;
  let end = Number.NEGATIVE_INFINITY;

  for (const character of line) {
    if (character === " ") {
      pen += wordAdvance;
      continue;
    }

    const glyph = font[character];
    for (let row = 0; row < glyphHeight; row += 1) {
      for (let column = 0; column < glyphWidth; column += 1) {
        if (glyph[row][column] === "#") {
          start = Math.min(start, pen + column * cell);
          end = Math.max(end, pen + (column + 1) * cell);
        }
      }
    }
    pen += glyphAdvance;
  }

  return { start, end };
}

/**
 * The whole phrase, as one object's worth of parts.
 *
 * `at` is the block's centre column on the ground, not its corner. **The three
 * lines are centred on it, not left-aligned.** Left-aligned, the words hung off
 * a vertical edge that nothing else in the scene shares and the block read as a
 * list; centred, each line's midpoint sits on one line running down-left, so
 * "WALK" is the nearest thing to the frame's top-right corner and the phrase
 * steps away from it evenly. It is also 20% shorter that way, because the short
 * first line no longer has to reach as far right as the long last one.
 *
 * Offsets are snapped to whole cells so the whole object stays on one lattice —
 * a half-cell offset on one line would put its coordinates on different
 * fractions from the rest and cost decimals in every path it owns.
 *
 * There is no cell-size parameter because there is one instance of this object
 * and no call site could justify a second value. See `cell`.
 */
export function lettering(at: Vec3): readonly DeskPart[] {
  const lastLine = phrase.length - 1;

  return phrase.flatMap((line, index) => {
    const span = inkSpan(line);
    const centred =
      at.x - Math.round((span.start + span.end) / 2 / cell) * cell;
    const y = at.y + index * lineIndent;
    const baseZ = at.z + (lastLine - index) * lineLeading;
    const parts: DeskPart[] = [];
    let pen = 0;

    for (const character of line) {
      if (character === " ") {
        pen += wordAdvance;
        continue;
      }

      parts.push(...glyphQuads(font[character], centred + pen, y, baseZ));
      pen += glyphAdvance;
    }

    return parts;
  });
}
