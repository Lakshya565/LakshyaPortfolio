/**
 * "WALK / THROUGH / MY WORKBENCH!", lying on the field.
 *
 * The one piece of writing in the scene. It occupies the block the layout has
 * been holding empty for three sessions — right of screen `x = 100` and above
 * screen `y = 80` — which is what the comments on `hotspotLayout` and
 * `treePlaces` in `scene.ts` exist to protect.
 *
 * A bitmap font rasterised onto the world lattice, **flat on the ground and
 * extruded upward**. A glyph's rows run along `+y` and its columns along `+x`,
 * so the letterform is a shape in the ground plane and what the camera reads is
 * the *top* of a slab, not a wall standing up out of the field. The letters lie
 * in the grid the same way the desk and the trees stand on it, and they take the
 * grid's shear with them — which is the whole point of the look.
 *
 * That inverts which face does which job. Upright, the reading face was `+y` and
 * the extrusion was the top and the right; lying down, the reading face is `+z`
 * and the extrusion is the two walls that hang off the near edges. The colours
 * follow the job, not the axis: the letterform is `ink.accent` flat and the
 * walls are `letteringSide`, exactly as before.
 *
 * Everything here is sized by one constraint that is not visual at all. Each
 * emitted face is one `<path>`, and `validate-portfolio-content.ts` fails the
 * build when the generated SVG passes 250 KB. This object is the single largest
 * thing in the scene by a wide margin, so hidden-face culling and run merging
 * are load-bearing rather than tidy. See the notes on each.
 */

import { face, hue, ink, type DeskPart } from "@/lib/desk/parts";
import type { Vec3 } from "@/lib/desk/projection";

/**
 * The side of one cell, in world units.
 *
 * Smaller than the 2.5 the upright wall used, and the reason is geometry rather
 * than taste. Standing up, a line of text ran along one screen axis and the
 * block was as wide as its longest line. Lying down, a line runs along `+x` and
 * the *lines* stack along `+y`, and those two are 90° apart in the world but
 * only 60° apart on screen — so the block is now a parallelogram whose width is
 * the longest line **plus** the whole stagger of the three lines. At 2.5 that
 * came to about 235 screen units against a reserved block of roughly 204, and
 * the phrase ran off into the frame's right edge.
 *
 * 2 fits with room to spare, and it is the other value that keeps every
 * coordinate an integer, so `project()` lands on halves at worst and the
 * generator writes `238` rather than `237.63`. Keep it on a fraction that
 * behaves: 2 and 2.5 both do, 2.17 does not.
 */
const cell = 2.25;

/**
 * How thick the slabs are, in world `z`.
 *
 * Equal to a cell, so a letter is exactly as deep as it is granular and the two
 * cannot drift apart. This is the same depth the upright wall had; only its
 * direction changed, from "back into the picture" to "up off the ground".
 */
const depth = cell;

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

/**
 * How far each line steps along `+y`, which is down-left on screen.
 *
 * This is the only thing separating one line from the next now. Upright, a line
 * dropped in `z` *and* stepped in `y`, and either one alone would have kept them
 * apart; flat on the ground there is no `z` to drop, so the whole leading is six
 * cells of bare field between one line's last row and the next line's first.
 *
 * Six, not three, and the difference is that world `y` is not screen distance.
 * A step of `g` along `+y` moves a line only `g / 2` down the screen, and the
 * line above is already hanging `depth` into that gap. Three cells measured
 * generously on paper and left about one screen unit of daylight — the lines
 * read as one block of texture rather than as three lines. See `lineClearance`,
 * which now checks the number that matters.
 */
const lineStep = (glyphHeight + 6) * cell;

const phrase = ["WALK", "THROUGH", "MY WORKBENCH!"] as const;

/**
 * One glyph, five rows, top row first. `#` is ink and `.` is air.
 *
 * Written as art rather than as bitmasks because the source has to *be* the
 * picture. A wrong bit in `0b10001` is invisible in review; a wrong `#...#` is
 * not. The tuple type is what makes a dropped row a compile error rather than a
 * letter that quietly loses its crossbar.
 *
 * "Top row first" is now the top of the letter as *read*, which lies toward
 * `−y` — up-right on screen. Rows advance along `+y`.
 */
type Glyph = readonly [string, string, string, string, string];

/**
 * Exactly the glyphs the phrase uses, and no more.
 *
 * Five by five is the smallest grid that fits the reserved block at a size
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
 * A row of the wrong length shifts every cell after it by a fraction of a cell,
 * which at eight pixels a cell looks like a slightly ugly letter rather than
 * like a bug. The same habit as the hotspot check at the bottom of `scene.ts`.
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
 * single bounding box and cannot see one line crossing another inside it. Flat
 * on the ground the invariant is simpler than it was standing up, because there
 * is only one axis in play: consecutive lines are `lineStep` apart in world `y`
 * and each occupies `glyphHeight` cells of it.
 *
 * **State it in screen units, not world ones.** The bare field between two lines
 * is `lineStep - glyphHeight * cell` in world `y`, which buys only half that
 * much screen `y`, and the line above hangs `depth` of wall into it. What is
 * left is the daylight a reader actually sees, and the first flat build got this
 * wrong by checking the world number and shipping one screen unit of gap.
 */
const lineClearance = (lineStep - glyphHeight * cell) / 2 - depth;

if (lineClearance < 3) {
  throw new Error(
    `lettering: only ${lineClearance} screen units of daylight between lines`,
  );
}

/** Whether a glyph cell is ink. Out of range is air, which is what culls edges. */
function isLit(glyph: Glyph, row: number, column: number): boolean {
  if (row < 0 || row >= glyphHeight || column < 0 || column >= glyphWidth) {
    return false;
  }
  return glyph[row][column] === "#";
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

/** How near a wall is to the camera. Screen depth is `x + y`; bigger is nearer. */
function nearness(part: DeskPart): number {
  if (part.shape !== "face") {
    return 0;
  }
  return Math.max(...part.points.map((point) => point.x + point.y));
}

/**
 * One glyph as a slab lying on the field: two walls and a lid.
 *
 * The camera looks along (1, 1, 1), so of the six faces of the solid only `+x`,
 * `+y` and `+z` are turned toward it — the same test `extrude` and `emitPyramid`
 * apply. Lying down, `+z` is the letterform and can never be occluded by the
 * glyph's own geometry, and the other two are walls that only exist where the
 * letter's edge is: `+x` is dropped when the cell to its right is lit, `+y` when
 * the cell below it in the bitmap is lit, because in both cases the neighbour's
 * own slab is pressed flat against it.
 *
 * What is left is merged along its own axis — every horizontal span of lit cells
 * in a row becomes one `+z` quad, every vertical span with nothing to its right
 * one `+x` wall, every horizontal span with nothing below it one `+y` wall. The
 * `+z` quads are drawn with `accent`, which fills *and* strokes in one colour,
 * so a letter's lid is a single unbroken green shape with no cell divisions in
 * it. The walls keep `letteringSide`'s outline, and they are the only place the
 * lattice still shows — which is what says the letters are solid and not paint
 * on the floor.
 *
 * **Walls first, then the lid, and that ordering is load-bearing.** Paint order
 * is array order and there is no depth buffer. A cell on the down-right diagonal
 * of another is nearer, and its lid covers part of that other cell's two walls;
 * emitting every wall in the glyph before every lid settles all of those at
 * once. The walls are additionally sorted far-to-near among themselves, which
 * costs nothing and removes the one case a lid cannot arbitrate — two walls from
 * different strokes of the same letter crossing over open field.
 */
function glyphParts(
  glyph: Glyph,
  originX: number,
  originY: number,
  baseZ: number,
): readonly DeskPart[] {
  const lid = { accent: ink.accent };
  const wall = hue("letteringSide");
  const top = baseZ + depth;
  const columnX = (column: number) => originX + column * cell;
  const rowY = (row: number) => originY + row * cell;

  const walls: DeskPart[] = [];
  const lids: DeskPart[] = [];

  for (let row = 0; row < glyphHeight; row += 1) {
    const near = rowY(row) + cell;
    const far = rowY(row);

    for (const [from, to] of runs(glyphWidth, (column) =>
      isLit(glyph, row, column),
    )) {
      lids.push(
        face(
          [
            { x: columnX(from), y: far, z: top },
            { x: columnX(to + 1), y: far, z: top },
            { x: columnX(to + 1), y: near, z: top },
            { x: columnX(from), y: near, z: top },
          ],
          lid,
        ),
      );
    }

    for (const [from, to] of runs(
      glyphWidth,
      (column) => isLit(glyph, row, column) && !isLit(glyph, row + 1, column),
    )) {
      walls.push(
        face(
          [
            { x: columnX(from), y: near, z: top },
            { x: columnX(to + 1), y: near, z: top },
            { x: columnX(to + 1), y: near, z: baseZ },
            { x: columnX(from), y: near, z: baseZ },
          ],
          wall,
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
      walls.push(
        face(
          [
            { x, y: rowY(from), z: top },
            { x, y: rowY(to) + cell, z: top },
            { x, y: rowY(to) + cell, z: baseZ },
            { x, y: rowY(from), z: baseZ },
          ],
          wall,
        ),
      );
    }
  }

  walls.sort((left, right) => nearness(left) - nearness(right));

  return [...walls, ...lids];
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
 * an edge that nothing else in the scene shares and the block read as a list;
 * centred, each line's midpoint sits on one axis running down-left, so "WALK" is
 * the nearest thing to the frame's top-right corner and the phrase steps away
 * from it evenly. It is also 20% shorter that way, because the short first line
 * no longer has to reach as far right as the long last one.
 *
 * Lines run *away* from the viewer's top right along `+y`, so they are emitted
 * far to near and the painter's order across lines comes free.
 *
 * Offsets are snapped to whole cells so the whole object stays on one lattice —
 * a half-cell offset on one line would put its coordinates on different
 * fractions from the rest and cost decimals in every path it owns.
 *
 * There is no cell-size parameter because there is one instance of this object
 * and no call site could justify a second value. See `cell`.
 */
export function lettering(at: Vec3): readonly DeskPart[] {
  return phrase.flatMap((line, index) => {
    const span = inkSpan(line);
    const centred =
      at.x - Math.round((span.start + span.end) / 2 / cell) * cell;
    const originY = at.y + index * lineStep;
    const parts: DeskPart[] = [];
    let pen = 0;

    for (const character of line) {
      if (character === " ") {
        pen += wordAdvance;
        continue;
      }

      parts.push(...glyphParts(font[character], centred + pen, originY, at.z));
      pen += glyphAdvance;
    }

    return parts;
  });
}
