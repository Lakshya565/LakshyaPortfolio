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
 * Real marks are allowed where they identify a tool or influence — the monitor
 * screen credits the stack this site is built with. Copied character art is not,
 * since that is someone else's drawing rather than an identifier.
 *
 * Colour is not decoration here. An object takes a hue from `palette` only when
 * the real thing has that colour and the colour is part of how you recognise it:
 * matcha is green, an Arduino is teal, the duck was printed in green filament.
 * Everything else stays in the two greys.
 */

import {
  box,
  circle,
  cylinder,
  detail,
  disc,
  face,
  hue,
  hueLine,
  ink,
  palette,
  pyramid,
  rounded,
  silhouette,
  slab,
  type DeskPart,
  type PaletteName,
} from "@/lib/desk/parts";
import { polygonFootprint, type Point2 } from "@/lib/desk/projection";

type At = Readonly<{ x: number; y: number; z: number }>;

/** Screen-space ellipse offsets, for silhouettes drawn against a world anchor. */
function ovalOffsets(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  segments = 20,
  /**
   * Rotation in screen space, radians, positive turning `+x` toward `+y`.
   *
   * Limbs need this. An axis-aligned ellipse reads as a shape stuck on a form;
   * the same ellipse turned to follow the limb's direction reads as the limb.
   */
  tilt = 0,
): readonly Point2[] {
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);

  return Array.from({ length: segments }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2;
    const x = Math.cos(angle) * rx;
    const y = Math.sin(angle) * ry;
    return { x: cx + x * cos - y * sin, y: cy + x * sin + y * cos };
  });
}

/**
 * A flat filled circle lying in the ground plane — a rice bed, a lid, a coaster.
 *
 * Distinct from `disc`, which is a solid with a wall. This is the surface alone,
 * for stacking coloured layers on top of something that already has a body.
 */
function flatDisc(
  center: Point2,
  radius: number,
  z: number,
  options: Parameters<typeof face>[1] = {},
): DeskPart {
  return face(
    polygonFootprint(center, radius, radius, 24).map((point) => ({
      ...point,
      z,
    })),
    { smooth: true, ...options },
  );
}

/**
 * A disc whose axis runs along +x — a dumbbell plate, a wheel, a roller.
 *
 * `cylinder` only builds vertical axes, and squashing one to fake a horizontal
 * axis gives a coin lying down, not a wheel standing up. Here the cap is a real
 * circle in the y–z plane and the band between the two caps is that circle swept
 * along the axis.
 *
 * The sweep moves a point by `(Δx, Δx/2)` on screen, so the outline stops
 * turning where the rim is parallel to that — and working it through, the
 * extremes land at 3π/4 and −π/4, the very same tangent angles a vertical
 * cylinder has. One less thing that can be subtly wrong.
 */
function plate(
  center: Readonly<{ y: number; z: number }>,
  radius: number,
  fromX: number,
  toX: number,
  options: Parameters<typeof face>[1] = {},
  /**
   * How the two ends are finished.
   *
   * A bar running into a plate needs `farEnd: "flush"` and no near cap: its far
   * rim is buried in the plate's face and its near rim in the other plate's.
   * Drawing them anyway put a full rim curve across the left plate, which is
   * what made the grip look like it passed through the weight rather than into
   * it.
   */
  ends: Readonly<{ farEnd?: "round" | "flush"; capped?: boolean }> = {},
): readonly DeskPart[] {
  const { farEnd = "round", capped = true } = ends;
  const tangent = { left: (Math.PI * 3) / 4, right: -Math.PI / 4 };

  const rim = (x: number, angle: number) => ({
    x,
    y: center.y + Math.cos(angle) * radius,
    z: center.z + Math.sin(angle) * radius,
  });

  const arc = (x: number, from: number, to: number, steps = 14) =>
    Array.from({ length: steps + 1 }, (_, index) =>
      rim(x, from + ((to - from) * index) / steps),
    );

  // The band: the far cap's outer half, then the near cap's, which together
  // close the silhouette without either arc doubling back on itself. A flush far
  // end replaces that first arc with the chord between its two tangent points —
  // a straight edge that sits inside whatever the bar disappears into.
  // Two points, not a densified run. Interior points along the chord were tried
  // to stop the smoothing bowing the bar's buried end into a rounded boss; they
  // made it far worse. The last chord point's tangent then runs along the chord,
  // and the curve leaving it into the far arc — a jump of the whole bar's length
  // in `x` — overshoots into a visible barb. Two endpoints let the smoothing
  // ease straight into the arc, which is the shape that actually reads.
  const far =
    farEnd === "flush"
      ? [rim(fromX, tangent.left), rim(fromX, tangent.right)]
      : arc(fromX, tangent.left, tangent.right);

  return [
    face([...far, ...arc(toX, tangent.right + Math.PI * 2, tangent.left)], {
      smooth: true,
      ...options,
    }),
    // Only the +x cap faces the camera; the far one is culled by being drawn
    // over, exactly as the band is.
    ...(capped
      ? [face(arc(toX, 0, Math.PI * 2, 24), { smooth: true, ...options })]
      : []),
  ];
}

// ---------------------------------------------------------------------------
// Scenery
// ---------------------------------------------------------------------------

/**
 * Guo's trees are lollipops: a thin trunk with a small round canopy. Fourteen of
 * them are most of what makes his field read as a place rather than a shelf.
 */
export function tree(at: At, height = 22, canopy = 7): readonly DeskPart[] {
  return [
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

/**
 * music: a pair of over-ear headphones, set down on the grid.
 *
 * This replaces the plain cube that used to stand here. The cube was borrowed
 * from Guo's field, where it sets the isometric language for a scene that is
 * otherwise all soft objects — but every other thing on this grid means
 * something, and one shape that meant nothing was the odd one out rather than
 * the anchor.
 *
 * Both cups are `plate()` discs on the shared `+x` axis, which is what real
 * over-ears are: two discs on one line with a hoop over the top. `+x` projects
 * down-right, so the pair separates on the diagonal and the near cup shows its
 * outer housing while the far cup shows its pad — the same three-quarter read a
 * photograph of them gives.
 *
 * The band is a flat ribbon in the cups' own centre plane. It needs no thickness
 * in `y`: a plane of constant `y` projects to a full region here, so a zero-depth
 * ribbon is a shape rather than an edge, and giving it depth would only add
 * outlines competing with the two discs that carry the object.
 *
 * That ribbon is laid out in *screen* coordinates and mapped back into the plane,
 * which is the one unusual thing in this file and the fix for a band that read as
 * tilted at a strange angle. A circular arc in a vertical world plane cannot
 * project to a symmetric arch here. Screen height along the arc goes as
 * `½R·cosθ − R·sinθ`, so its highest point sits at `tan θ = −2` rather than at
 * the top of the circle — about `0.45R` to one side of the midpoint between the
 * two ends. The arch came out visibly lopsided, leaning toward its higher cup,
 * and no change of radius or sweep could move the apex back, because the lean is
 * the projection and not the arc.
 *
 * The plane `y = at.y` maps to the screen one-to-one, though, and inverts in
 * closed form: `x = at.x + sx`, `z = at.z + sx/2 − sy`. So the arch is built as a
 * true circle through both cup centres *on screen* and pushed back through that
 * inverse. What lands in the scene is still an honest planar object standing in
 * the cups' plane — just not a circular one, which is exactly right, since the
 * thing that has to look circular is the drawing.
 */
export function headphones(at: At): readonly DeskPart[] {
  const shell = hue("headphone");
  const metal = hue("steel");
  const cupR = 6.4;
  const cupThick = 3.2;
  /** Distance between the two cups' near faces, along the shared axis. */
  const span = 19;
  const axis = { y: at.y, z: at.z + cupR };
  const farX = at.x;
  const nearX = at.x + span;

  /** A circle drawn on a cup's `+x` cap — pad openings, housing plates. */
  const onCap = (x: number, radius: number, options: Parameters<typeof face>[1]) =>
    face(
      Array.from({ length: 25 }, (_, step) => {
        const angle = (step / 24) * Math.PI * 2;
        return {
          x,
          y: axis.y + Math.cos(angle) * radius,
          z: axis.z + Math.sin(angle) * radius,
        };
      }),
      { smooth: true, ...options },
    );

  /** Back out of screen space into the cups' plane. See the header. */
  const inPlane = (sx: number, sy: number) => ({
    x: at.x + sx,
    y: at.y,
    z: at.z + sx / 2 - sy,
  });

  /**
   * Where a cup's centre lands on screen, as an offset from the anchor.
   *
   * Both cups sit at the same height, so both satisfy `sy = sx/2 − cupR`; the
   * arch is fitted to these two points rather than to any world-space centre.
   */
  const capScreen = (dx: number) => ({ sx: dx, sy: dx / 2 - cupR });
  const from = capScreen(-cupThick / 2);
  const to = capScreen(span + cupThick / 2);

  // A circle through both cup centres, bulging `rise` above their chord. A rise
  // close to the half-chord makes the arch very nearly a semicircle, which is
  // what a headband is.
  const rise = 12;
  const chord = { sx: to.sx - from.sx, sy: to.sy - from.sy };
  const chordLength = Math.hypot(chord.sx, chord.sy);
  const half = chordLength / 2;
  const bandR = (half ** 2 + rise ** 2) / (2 * rise);
  // The chord's normal, pointing toward the top of the screen.
  const up = { sx: chord.sy / chordLength, sy: -chord.sx / chordLength };
  const hub = {
    sx: (from.sx + to.sx) / 2 - up.sx * (bandR - rise),
    sy: (from.sy + to.sy) / 2 - up.sy * (bandR - rise),
  };
  const bearing = (point: { sx: number; sy: number }) =>
    Math.atan2(point.sy - hub.sy, point.sx - hub.sx);
  const startAt = bearing(from);
  const endAt = bearing(to);
  // Increasing from the far cup to the near one runs over the top of the screen.
  const sweepFrom = startAt > endAt ? startAt - Math.PI * 2 : startAt;
  const sweep = endAt - sweepFrom;
  /** How far past each cup centre the band runs, so its ends are buried. */
  const bite = 0.25;

  /**
   * A slice of the headband, between two screen radii and two bearings.
   *
   * The band and its two sliders are the same figure at different extents, so
   * one helper builds all three and there is no chance of the sliders sitting
   * off the band they are supposed to be clamped around.
   */
  const arcBand = (
    inner: number,
    outer: number,
    fromAngle: number,
    toAngle: number,
    options: Parameters<typeof face>[1],
  ) => {
    const steps = Math.max(5, Math.round((toAngle - fromAngle) / 0.07));
    const at3 = (radius: number, angle: number) =>
      inPlane(
        hub.sx + Math.cos(angle) * radius,
        hub.sy + Math.sin(angle) * radius,
      );
    const run = (radius: number, a: number, b: number) =>
      Array.from({ length: steps + 1 }, (_, step) =>
        at3(radius, a + ((b - a) * step) / steps),
      );

    // Sampled every four degrees and left unsmoothed. Curving through these
    // points put a barb on the band's upper end: the two arcs meet in a square
    // corner, and Catmull-Rom rounding that corner overshoots outward — far
    // enough to escape the cup that was supposed to be hiding the joint. It is
    // the same failure as the dumbbell's flush chord, and the same answer. At
    // four degrees a polyline is already smoother than the stroke is wide.
    return face(
      [...run(outer, fromAngle, toAngle), ...run(inner, toAngle, fromAngle)],
      options,
    );
  };

  /** A slider, centred at `along` of the way round the arch. */
  const slider = (along: number) =>
    arcBand(
      bandR - 1.5,
      bandR + 1.5,
      sweepFrom + sweep * along - 0.12,
      sweepFrom + sweep * along + 0.12,
      metal,
    );

  return [
    // The hoop, first, so both cups paint over the ends.
    arcBand(bandR - 1.3, bandR + 1.3, sweepFrom - bite, endAt + bite, shell),
    // The sliders, where a real pair adjusts. Two pale marks on a dark hoop are
    // most of what separates headphones from a handle. Placed symmetrically
    // *along the arch* rather than at mirrored world angles: a cup's silhouette
    // reaches about seven units in every direction, and at 30% in from each end
    // both sliders clear their own cup by a comfortable margin.
    slider(0.29),
    slider(0.71),
    // Far cup. Its `+x` cap is the ear side, so it gets the pad: a metal ring
    // around an opening back in the shell colour.
    ...plate(axis, cupR, farX - cupThick, farX, shell),
    onCap(farX + 0.02, cupR * 0.78, metal),
    onCap(farX + 0.04, cupR * 0.5, shell),
    // Near cup. Its `+x` cap is the outer housing, which is a plate, not a pad —
    // so one disc and a small ring rather than the far cup's two.
    ...plate(axis, cupR, nearX, nearX + cupThick, shell),
    onCap(nearX + cupThick + 0.02, cupR * 0.74, metal),
    onCap(nearX + cupThick + 0.04, cupR * 0.38, {
      outlineOnly: true,
      ...hueLine("headphone"),
    }),
  ];
}

/**
 * The colophon object: what this site is built with.
 *
 * The screen carries abstract glyphs rather than words — at 46 units wide, real
 * text is unreadable, so the credits live in the popup and the screen only has
 * to say "this is a machine someone works on". The exception is the Claude mark,
 * which is drawn as its own thing in its own orange.
 */
export function monitor(at: At): readonly DeskPart[] {
  const width = 46;
  const panelHeight = 27;
  const panelZ = at.z + 12;
  const screenY = at.y + 8.1;

  /** A point on the screen's face, in screen-local (across, up) units. */
  const on = (across: number, up: number) => ({
    x: at.x + across,
    y: screenY,
    z: panelZ + up,
  });

  return [
    rounded({ x: at.x + 14, y: at.y + 2 }, 18, 10, at.z, 1.4, {
      radius: 3,
    }),
    box(
      { x: at.x + 20, y: at.y + 4, z: at.z + 1.4 },
      { width: 6, depth: 5, height: 11 },
    ),
    box(
      { x: at.x, y: at.y + 4, z: panelZ },
      { width, depth: 4, height: panelHeight },
    ),
    // Screen inset.
    detail([on(3, 3), on(width - 3, 3), on(width - 3, panelHeight - 3), on(3, panelHeight - 3)]),
    // A window with a title bar, then ragged lines of code inside it.
    detail([on(6, 6), on(26, 6), on(26, 21), on(6, 21)]),
    detail([on(6, 18), on(26, 18)]),
    ...[
      { top: 15.5, length: 13 },
      { top: 13, length: 9 },
      { top: 10.5, length: 15 },
      { top: 8, length: 7 },
    ].map((line) => detail([on(8, line.top), on(8 + line.length, line.top)])),
    ...claudeMark(on, { across: width - 12, up: 13.5 }, 6.5),
  ];
}

/**
 * Claude's mark, drawn in the plane of whatever surface it sits on.
 *
 * A radial burst of tapered rays. Drawn in the screen's own plane rather than in
 * screen space, so it shears with the monitor like something displayed on it
 * instead of a sticker floating in front.
 *
 * This is an approximation built from the mark's construction — a ring of
 * alternating long and short spokes — not a trace of the original artwork.
 */
function claudeMark(
  on: (across: number, up: number) => Readonly<{ x: number; y: number; z: number }>,
  center: Readonly<{ across: number; up: number }>,
  radius: number,
): readonly DeskPart[] {
  const rays = 11;
  const spread = 0.17;
  const inner = radius * 0.14;

  return Array.from({ length: rays }, (_, index) => {
    const angle = (index / rays) * Math.PI * 2 - Math.PI / 2;
    const outer = radius * (index % 2 === 0 ? 1 : 0.82);
    const point = (a: number, r: number) =>
      on(center.across + Math.cos(a) * r, center.up + Math.sin(a) * r);

    return face(
      [
        point(angle - spread, inner),
        point(angle, outer),
        point(angle + spread, inner),
      ],
      { accent: ink.claude },
    );
  });
}

export function keyboard(at: At): readonly DeskPart[] {
  const width = 42;
  const depth = 15;

  return [
    rounded({ x: at.x, y: at.y }, width, depth, at.z, 1.6, {
      radius: 1.6,
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
    disc({ x: at.x, y: at.y }, 6, at.z, 1.4),
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

  // The clock face sits on the wall turned toward the camera. A circle drawn in
  // that vertical plane projects to a slanted ellipse, which is what makes it
  // read as mounted on the tower rather than floating in front of it.
  const faceY = at.y + baseDepth + 0.1;
  const faceX = at.x + baseWidth / 2;
  const faceZ = at.z + 12.5;
  const faceRadius = 3.6;

  const onFace = (angle: number, scale: number) => ({
    x: faceX + Math.cos(angle) * faceRadius * scale,
    y: faceY,
    z: faceZ + Math.sin(angle) * faceRadius * scale,
  });

  return [
    box(
      { x: at.x, y: at.y, z: at.z },
      { width: baseWidth, depth: baseDepth, height: baseHeight },
    ),
    // Dial, then twelve ticks around it.
    face(
      Array.from({ length: 24 }, (_, index) =>
        onFace((index / 24) * Math.PI * 2, 1),
      ),
      { smooth: true },
    ),
    ...Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2;
      // The quarter-hours read longer, as they do on a real dial.
      const inner = index % 3 === 0 ? 0.62 : 0.76;
      return detail([onFace(angle, inner), onFace(angle, 0.9)]);
    }),
    box(
      { x: at.x + inset, y: at.y + inset, z: belfryZ },
      { width: belfryWidth, depth: baseDepth - inset * 2, height: 8 },
    ),
    // A real pyramid, with an apex and two visible triangular faces. It used to
    // be a four-segment cone tapered to almost nothing, which gave it a curved
    // base and read as a conical hat rather than a roof.
    // Wound to match the extruder's outward-normal convention, so the two faces
    // that survive culling are the pair turned toward the camera. The other
    // winding draws the back pair and the belfry shows straight through the roof.
    pyramid(
      [
        { x: at.x + baseWidth / 2 - 5.5, y: at.y + baseDepth / 2 - 4.5 },
        { x: at.x + baseWidth / 2 - 5.5, y: at.y + baseDepth / 2 + 4.5 },
        { x: at.x + baseWidth / 2 + 5.5, y: at.y + baseDepth / 2 + 4.5 },
        { x: at.x + baseWidth / 2 + 5.5, y: at.y + baseDepth / 2 - 4.5 },
      ],
      belfryZ + 8,
      9,
    ),
  ];
}

// ---------------------------------------------------------------------------
// Hotspot objects — one per motif group
// ---------------------------------------------------------------------------

/**
 * maker-origin: fifty-plus Arduino builds documented in public.
 *
 * The board, a breadboard, jumper wires and a lit LED. This deliberately
 * reverses the earlier trim to one object per hotspot: a bare board reads as a
 * tile, and what makes it read as *electronics* is having something wired to it.
 * The trim was right in general and wrong here.
 *
 * The first attempt at a wired build failed for a different reason — everything
 * was drawn the same grey at twenty screen units and came out a dotted tray
 * beside a plate. With the board in Arduino teal, the breadboard in white and
 * the wires in their own colours, the same arrangement separates.
 */
export function devBoard(at: At): readonly DeskPart[] {
  const width = 24;
  const depth = 16;
  const boardHeight = 1;
  const boardZ = at.z + boardHeight;
  // Headers sit inside the board's own outline. The previous pair were 2.4 units
  // tall and overhung both long edges, which turned the board's signature detail
  // into two grey curbs running past the thing they are mounted on. A header is
  // a socket strip: low, inset, and perforated.
  const headerHeight = 1.3;
  const headerDepth = 1.6;

  /** A row of pin holes along a header's top face. */
  const pins = (y: number, count: number, fromX: number) =>
    Array.from({ length: count }, (_, step) => {
      const x = at.x + fromX + step * 1.7;
      return face(
        [
          { x, y, z: boardZ + headerHeight + 0.02 },
          { x: x + 0.55, y, z: boardZ + headerHeight + 0.02 },
        ],
        { outlineOnly: true, open: true, ...hueLine("silkscreen") },
      );
    });

  // `+y` projects down and to the left, so larger y is *nearer* the camera. The
  // digital headers therefore go on the low-y edge, where nothing can cover
  // them; power and analog take the near edge. Getting this backwards is what
  // put the breadboard on top of the board last time.
  const digitalRow = at.y + 1;
  const powerRow = at.y + depth - 2.6;
  const breadboardDepth = 8.5;
  const breadboardHeight = 2.4;
  // Butted against the board's far face rather than floating behind it. At
  // `at.y - 9` the two were separated by a visible sliver of ground and the
  // breadboard's right end hung past the board's corner into empty air, which is
  // what stopped the pair reading as one build.
  const breadboardY = at.y - breadboardDepth;
  const breadboardZ = at.z + breadboardHeight;
  const railY = breadboardY + 4.25;

  return [
    // The breadboard first and furthest back.
    //
    // A plain `box`, not a `rounded` extrusion. Rounded corners on a solid this
    // small turned the two ends into soft wedges, and a breadboard is the most
    // rectangular object on any desk — three flat faces meeting at hard corners
    // is the whole of what it looks like.
    box(
      { x: at.x + 3, y: breadboardY, z: at.z },
      { width: 18, depth: breadboardDepth, height: breadboardHeight },
      hue("silkscreen"),
    ),
    // The centre channel, which is the one mark that says breadboard.
    face(
      [
        { x: at.x + 5, y: railY, z: breadboardZ + 0.02 },
        { x: at.x + 19, y: railY, z: breadboardZ + 0.02 },
      ],
      { outlineOnly: true, open: true, ...hueLine("connector") },
    ),
    // Two rails of holes, one either side of the channel. Eight columns rather
    // than a real breadboard's sixty: at this size the full grid turns the top
    // face into noise, and the point is only that the rails are perforated.
    ...[-2.4, 2.4].flatMap((row) =>
      Array.from({ length: 8 }, (_, step) => {
        const x = at.x + 5.4 + step * 1.8;
        return face(
          [
            { x, y: railY + row, z: breadboardZ + 0.02 },
            { x: x + 0.5, y: railY + row, z: breadboardZ + 0.02 },
          ],
          { outlineOnly: true, open: true, ...hueLine("connector") },
        );
      }),
    ),
    // A component seated across the channel, and a lit LED beside it.
    box(
      { x: at.x + 7, y: railY - 2, z: breadboardZ },
      { width: 3.2, depth: 4, height: 1.6 },
      hue("holdGreen"),
    ),
    cylinder({ x: at.x + 16, y: railY + 2.4 }, 1, breadboardZ, 2.2, {
      segments: 16,
      ...hue("led"),
    }),
    rounded({ x: at.x, y: at.y }, width, depth, at.z, boardHeight, {
      radius: 1,
      ...hue("arduino"),
    }),
    // Digital headers along the far edge, power and analog along the near one —
    // the real Uno's arrangement, and the reason the two rows differ in length.
    ...[
      { y: digitalRow, from: 3.4, count: 10 },
      { y: powerRow, from: 2.2, count: 6 },
      { y: powerRow, from: 13.4, count: 5 },
    ].flatMap(({ y, from, count }) => [
      box(
        { x: at.x + from - 0.6, y, z: boardZ },
        { width: count * 1.7 + 0.4, depth: headerDepth, height: headerHeight },
        hue("connector"),
      ),
      ...pins(y + headerDepth / 2, count, from),
    ]),
    // USB-B and the barrel jack, kept wholly inside the board's outline. The
    // real ones do overhang, but drawn overhanging at this scale they detached
    // from the board and read as two grey crates parked beside it.
    box(
      { x: at.x + 0.8, y: at.y + 4.2, z: boardZ },
      { width: 5.4, depth: 5, height: 2.6 },
      hue("connector"),
    ),
    box(
      { x: at.x + 1, y: at.y + 10.6, z: boardZ },
      { width: 4.6, depth: 4, height: 2.2 },
      hue("connector"),
    ),
    // The microcontroller: a DIP package with its notch. This is the single mark
    // that says *there is a computer on this board*, and its absence is most of
    // why the last version read as an empty tray.
    box(
      { x: at.x + 13.5, y: at.y + 6, z: boardZ },
      { width: 7.5, depth: 3.4, height: 1.1 },
      hue("beltBlack"),
    ),
    face(
      [
        { x: at.x + 14.1, y: at.y + 6.6, z: boardZ + 1.12 },
        { x: at.x + 14.1, y: at.y + 8.8, z: boardZ + 1.12 },
      ],
      { outlineOnly: true, open: true, ...hueLine("connector") },
    ),
    // The Arduino mark: one continuous lemniscate. Two overlapping circles left
    // a lens where they crossed, and clipping them into two arcs to avoid it
    // just turned the mark into a pair of loose squiggles. The curve
    // `(cos t, sin t·cos t) / (1 + sin²t)` is the figure eight itself, so there
    // is nothing to cross and nothing to clip.
    //
    // Silkscreen is printed on bare board, so the mark has to sit in bare board:
    // the only clear span is between the USB shell's right edge and the DIP's
    // left one. At its old width it ran straight across the USB connector, which
    // read as the mark floating over the port rather than being under it.
    face(
      Array.from({ length: 41 }, (_, step) => {
        const t = (step / 40) * Math.PI * 2;
        const k = 1 + Math.sin(t) ** 2;
        return {
          x: at.x + 9.6 + (Math.cos(t) / k) * 2.7,
          y: at.y + 8.2 + ((Math.sin(t) * Math.cos(t)) / k) * 2.7,
          z: boardZ + 0.02,
        };
      }),
      { outlineOnly: true, smooth: true, ...hueLine("silkscreen") },
    ),
    // Three jumper wires, each from a pin on the digital header to a hole in the
    // breadboard's near rail. Both ends land on a solid: a wire that starts in
    // mid-air over a header reads as a scratch, which is what the last set did.
    ...[
      { colour: "wireWarm", fromX: 4.2, toX: 6.3, lift: 3.2 },
      { colour: "led", fromX: 7.6, toX: 9.9, lift: 2.6 },
      { colour: "wireCool", fromX: 11, toX: 13.5, lift: 2.2 },
    ].map(({ colour, fromX, toX, lift }) =>
      face(
        Array.from({ length: 13 }, (_, step) => {
          const t = step / 12;
          const startZ = boardZ + headerHeight;
          const endZ = breadboardZ;
          return {
            x: at.x + fromX + (toX - fromX) * t,
            y: digitalRow + headerDepth / 2 + (railY - 2.4 - digitalRow) * t,
            z: startZ + (endZ - startZ) * t + Math.sin(Math.PI * t) * lift,
          };
        }),
        { outlineOnly: true, open: true, smooth: true, ...hueLine(colour as PaletteName) },
      ),
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
 *
 * Not a rubber duck: this one was printed in green PLA with a hollow belly, and
 * the opening in its flank is where the wing mounted and where the board and
 * wiring went in. That opening is the most specific thing about the object, so
 * it is drawn with the electronics visible inside rather than closed up — a
 * plain green duck would say nothing that the yellow one did not.
 */
export function duck(at: At): readonly DeskPart[] {
  const green = hue("filament");

  // Body, head and beak all run along +x, which projects down and to the right —
  // so the duck faces the camera's right and the `+x` faces of head and body are
  // both turned toward the viewer. Its flank is the `+y` face, the widest
  // unobstructed surface on the object and therefore where the cavity goes.
  // The body is wider than it is tall and the head is a clear step smaller, set
  // forward so a good span of the body's top face still shows behind it. Made
  // the same size and stacked square, the two cubes read as one tower.
  const body = { x: 0, y: 0, z: 5, width: 14, depth: 13, height: 11 };
  const head = { x: 8, y: 2.5, size: 8 };
  const flankY = at.y + body.y + body.depth;
  const headZ = at.z + body.z + body.height;
  const headTop = body.z + body.height + head.size;
  const faceX = at.x + head.x + head.size;

  /** A rectangle lying on the flank, in the body's own x–z coordinates. */
  const onFlank = (
    x0: number,
    z0: number,
    x1: number,
    z1: number,
    lift: number,
    options: Parameters<typeof face>[1] = {},
  ) =>
    face(
      [
        { x: at.x + x0, y: flankY + lift, z: at.z + z0 },
        { x: at.x + x1, y: flankY + lift, z: at.z + z0 },
        { x: at.x + x1, y: flankY + lift, z: at.z + z1 },
        { x: at.x + x0, y: flankY + lift, z: at.z + z1 },
      ],
      options,
    );

  /** A rectangle on the head's forward face, in that face's y–z coordinates. */
  const onFace = (
    y0: number,
    z0: number,
    y1: number,
    z1: number,
    options: Parameters<typeof face>[1] = {},
  ) =>
    face(
      [
        { x: faceX + 0.04, y: at.y + y0, z: at.z + z0 },
        { x: faceX + 0.04, y: at.y + y1, z: at.z + z0 },
        { x: faceX + 0.04, y: at.y + y1, z: at.z + z1 },
        { x: faceX + 0.04, y: at.y + y0, z: at.z + z1 },
      ],
      options,
    );

  return [
    // Legs and feet first, so the body's flank paints over their tops and they
    // emerge from under it rather than being stuck onto it. Both stand near the
    // body's front-bottom corner and are offset along ±y, which projects roughly
    // horizontally — that is what splays them apart on screen instead of
    // stacking one behind the other.
    ...[
      { x: 8, y: 10.5 },
      { x: 11, y: 5.5 },
    ].flatMap(({ x, y }) => [
      box(
        { x: at.x + x, y: at.y + y, z: at.z + 1.2 },
        { width: 1.8, depth: 1.8, height: 4.2 },
        green,
      ),
      box(
        { x: at.x + x, y: at.y + y, z: at.z },
        { width: 4.2, depth: 1.8, height: 1.2 },
        green,
      ),
    ]),
    // The tail: longer than it is tall, and reaching back off the body rather
    // than standing on top of it. At six units high it was a chimney.
    box(
      { x: at.x - 5, y: at.y + 4, z: at.z + 11.5 },
      { width: 5.5, depth: 5, height: 4.5 },
      green,
    ),
    box(
      { x: at.x + body.x, y: at.y + body.y, z: at.z + body.z },
      { width: body.width, depth: body.depth, height: body.height },
      green,
    ),
    // The cutaway in the flank, and what is inside it.
    //
    // This is the most specific thing about the object — a printed duck with its
    // belly opened up and a board wired in — so it survives the rebuild
    // unchanged in content. Only the shape moved: a rectangular port cut square
    // into a flat face, rather than an oval hole in a curved one.
    //
    // Filled with the page ground rather than a colour, so it reads as a hole
    // into a hollow body. Anything lighter and it becomes a sticker.
    onFlank(2.2, 6, 11.8, 13.6, 0.02, {
      stroke: palette.filament.line,
      fill: ink.ground,
    }),
    // The module seated inside, with its header strip along the top edge.
    onFlank(3.2, 10.4, 10.8, 12.8, 0.04, hue("arduino")),
    face(
      [
        { x: at.x + 3.9, y: flankY + 0.06, z: at.z + 11.9 },
        { x: at.x + 10.1, y: flankY + 0.06, z: at.z + 11.9 },
      ],
      { outlineOnly: true, open: true, ...hueLine("silkscreen") },
    ),
    // The terminal block the wiring lands on, at the floor of the cavity. Its
    // whole job is to give the three wires somewhere to end: a line that stops
    // in mid-air does not read as a wire, it reads as a scratch on the drawing.
    onFlank(3.4, 6.6, 10.6, 8.1, 0.04, hue("connector")),
    // Three jumper wires, each leaving the module and landing on the block. Both
    // endpoints sit inside a solid, so neither end is loose.
    ...[
      { colour: "wireWarm", from: 4.6, to: 4.3, bend: -0.9 },
      { colour: "led", from: 7, to: 7, bend: 0.7 },
      { colour: "wireCool", from: 9.4, to: 9.7, bend: 1.1 },
    ].map(({ colour, from, to, bend }) =>
      face(
        Array.from({ length: 9 }, (_, step) => {
          const t = step / 8;
          return {
            x: at.x + from + (to - from) * t + Math.sin(Math.PI * t) * bend,
            y: flankY + 0.06,
            z: at.z + 10.4 - t * 2.3,
          };
        }),
        {
          outlineOnly: true,
          open: true,
          smooth: true,
          ...hueLine(colour as PaletteName),
        },
      ),
    ),
    // The head, overlapping the body's top-front corner so the two masses
    // interlock. Eleven earlier attempts built this duck from smooth solids and
    // every one fused head into body, because two adjacent curved masses in the
    // same tone have no edge between them. Voxels do: every box contributes
    // three outlined faces, and the step from body to head is a drawn corner.
    box(
      { x: at.x + head.x, y: at.y + head.y, z: headZ },
      { width: head.size, depth: head.size, height: head.size },
      green,
    ),
    // The bill, off the head's forward face.
    box(
      { x: faceX, y: at.y + head.y + 1.4, z: at.z + headTop - 6.4 },
      { width: 4.6, depth: 5.2, height: 2.8 },
      green,
    ),
    // Two eyes on that same forward face, above the bill. Square, because every
    // other edge on this duck is square, and dark because the body wash is not.
    ...[head.y + 1, head.y + 4.6].map((y) =>
      onFace(y, headTop - 3.2, y + 1.6, headTop - 1.6, {
        stroke: palette.filament.line,
        fill: ink.ground,
      }),
    ),
  ];
}

/**
 * taekwondo: a fourth-degree black belt, rolled and set down flat.
 *
 * Seven arrangements have been tried and the six rejects are worth recording so
 * none of them comes back. A coil with a trailing strip read as something
 * obscene. A bare coil read as a tin. An upright knot with a strap out to both
 * sides and two tails below is anatomically a torso with limbs, and no tuning
 * fixed that — the symmetry was the problem. A tied hoop with a hole through it
 * read, but read as a tyre. A roll standing on edge read correctly and was still
 * wrong: nobody stands a belt up, and balancing one on its rim is a pose.
 *
 * So it lies down, the way a rolled belt actually sits in a bag. That flips the
 * axis from `plate()`'s horizontal one back to `cylinder`'s vertical one, and
 * turns the wound face from the near cap into the *top* — which is the face the
 * eye gets most of in this projection, so the winding is now the thing you see
 * first rather than something read edge-on.
 *
 * The winding is one spiral, not a stack of rings. Rings were the safe drawing:
 * a closed curve has no ends to place, whereas a spiral has two and the outer
 * one has to land somewhere believable. Here it lands on the tail — the spiral
 * leaves the roll at the exact bearing the loose end runs out along, so the
 * strip you can see wound is the same strip you can see unwound.
 */
export function belt(at: At): readonly DeskPart[] {
  const black = { stroke: palette.beltBlack.line, fill: palette.beltBlack.wash };
  const center = { x: at.x, y: at.y };
  const outer = 12;
  /** The cloth's width, which on a roll lying flat is the roll's height. */
  const width = 5.6;
  const topZ = at.z + width;
  /** How thin the loose end is: one thickness of cloth, and it should look it. */
  const cloth = 0.9;

  /**
   * The loose end leaves the roll *tangentially*, not radially.
   *
   * This is the whole reason the previous two tails were wrong. A strip wound in
   * a spiral does not come off a coil pointing away from its centre — it comes
   * off along the outer turn's own direction, which is at right angles to the
   * radius. Run it radially and the coil grows a handle: a disc with a stick out
   * of the middle is a frying pan or a magnifying glass, and no amount of
   * changing the stick's length or thickness fixes what its *bearing* is saying.
   *
   * So the strap leaves the `+x` rim — down-right, the roll's right side — and
   * runs along `+y`, down-left across the front. Those are the only two bearings
   * available: the tangent is perpendicular to the radius, and the two bearings
   * that project degenerately, `(1, 1)` and `(1, −1)`, are perpendicular to each
   * other, so choosing either one for the radius forces the other on the tangent
   * and flattens the strap into an axis-aligned screen rectangle. `+x` radius
   * with `+y` tangent avoids both.
   */
  /**
   * The strap's outer edge rides the tangent line exactly; its width lies
   * *inward*, under the roll.
   *
   * Tangency is preserved by projection, so a line touching the footprint circle
   * at one world point touches the screen ellipse at that same point — which
   * means the roll's own silhouette hides the strap's start with no seam to
   * draw. Laying the width outward instead leaves a square end floating clear of
   * the roll on the right, and it cannot be tucked away by running the strap
   * further back: `−y` projects *up-right*, faster than the roll widens, so
   * every unit of extra length pushes that corner further into the open.
   */
  const tailOuter = center.x + outer;
  const tailInner = tailOuter - width;
  const tailFrom = 0;
  const tailTo = 25;

  return [
    // The loose end, drawn *before* the roll so the roll's own body is what ends
    // it. Unwound webbing does not stop at the coil, it disappears under it.
    slab(
      [
        { x: tailInner, y: center.y + tailFrom },
        { x: tailInner, y: center.y + tailTo },
        { x: tailOuter, y: center.y + tailTo },
        { x: tailOuter, y: center.y + tailFrom },
      ],
      at.z,
      cloth,
      black,
    ),
    // The roll: a squat cylinder, cloth-width tall.
    cylinder(center, outer, at.z, width, { segments: 32, ...black }),
    // The winding, as a single Archimedean spiral on the top face. Four turns at
    // an even pitch, because cloth of one thickness wound on itself is evenly
    // spaced, and that even spacing is what reads as *wound* rather than as a
    // target. Densely sampled and left unsmoothed: Catmull-Rom through a
    // tightening spiral overshoots inward near the middle, and at four turns
    // there is no room for it to.
    //
    // It stops 1.2 units short of the rim. At 0.7 the outer turn ran within half
    // a unit of the top face's near edge, and on the front of the roll — where
    // that edge is the silhouette — it crossed onto the wall and read as a loose
    // thread hanging down the side.
    face(
      Array.from({ length: 145 }, (_, step) => {
        const t = step / 144;
        const radius = 1.6 + (outer - 1.6 - 1.2) * t;
        // Ends at the tail's bearing, so the loose end is the spiral continuing.
        const angle = (t - 1) * 4 * Math.PI * 2;
        return {
          x: center.x + Math.cos(angle) * radius,
          y: center.y + Math.sin(angle) * radius,
          z: topZ + 0.03,
        };
      }),
      { outlineOnly: true, open: true, ...hueLine("beltBlack") },
    ),
    // The four rank stripes, set in from the tip the way a dan belt carries
    // them. Each spans the full width of the strip, so the four read as one
    // rank rather than as four marks of different lengths.
    ...Array.from({ length: 4 }, (_, index) => {
      const y = center.y + tailTo - 8 + index * 1.6;
      const stripeZ = at.z + cloth + 0.02;
      return face(
        [
          { x: tailInner + 0.55, y, z: stripeZ },
          { x: tailOuter - 0.55, y, z: stripeZ },
        ],
        { outlineOnly: true, open: true, ...hueLine("beltGold") },
      );
    }),
  ];
}

/**
 * scouting: an Eagle Scout's compass.
 *
 * Also its own object. The lid, case, dial and needle previously merged into one
 * lump at the size it was drawn; the lid is gone and the remaining three parts
 * are spaced in depth so each keeps its own outline.
 */
export function compass(at: At): readonly DeskPart[] {
  const center = { x: at.x, y: at.y };
  const radius = 10;
  const caseHeight = 4.6;
  const dialZ = at.z + caseHeight;

  /** A point on the dial face, at `scale` of the radius and `angle` around it. */
  const onDial = (angle: number, scale: number, lift = 0.1) => ({
    x: center.x + Math.cos(angle) * radius * scale,
    y: center.y + Math.sin(angle) * radius * scale,
    z: dialZ + lift,
  });

  // North points back and left, so the needle runs along the grid rather than
  // straight up the screen — a needle that projects vertically reads as a hand
  // on a clock instead of an arrow lying on a dial.
  const north = Math.PI * 1.25;

  // Where the steel bezel stops and the glass begins.
  const glassEdge = 0.78;
  const glassRadius = radius * glassEdge;

  /**
   * The sheen lying on the glass.
   *
   * The same two-circle lune Kirby's terminator uses, mirrored: there the sliver
   * is what the light misses, here it is what the light catches, so the second
   * circle is pushed *away* from the light instead of toward it. A ground-plane
   * step of `(dx, dy)` moves `(dx − dy, ½(dx + dy))` on screen, so `(+x, +y)`
   * both small and positive puts the sliver up and to the left, under the key
   * light, which is where a reflection belongs.
   */
  const sheen = () => {
    const away = { x: 2.2, y: 0.4 };
    const sheenRadius = 9;
    const d = Math.hypot(away.x, away.y);
    const along = (glassRadius ** 2 - sheenRadius ** 2 + d ** 2) / (2 * d);
    const across = Math.sqrt(glassRadius ** 2 - along ** 2);
    const unit = { x: away.x / d, y: away.y / d };
    const mid = { x: along * unit.x, y: along * unit.y };
    const hit = (sign: number) => ({
      x: mid.x + sign * across * unit.y,
      y: mid.y - sign * across * unit.x,
    });

    const near = hit(-1);
    const far = hit(1);

    /**
     * An arc taking the *shortest* signed sweep between two angles.
     *
     * Both boundary arcs of a thin lune are minor arcs, so this is the whole
     * rule — but `atan2` returns values in `(−π, π]`, and if the pair straddles
     * that branch cut the naive `to − from` is the major arc instead. Here it
     * did: the sheen came out on the wrong side of the dial and its second
     * boundary swung outside the glass entirely, over the case.
     */
    const arc = (
      origin: Point2,
      r: number,
      from: number,
      to: number,
    ): readonly Point2[] => {
      const turn = Math.PI * 2;
      const delta =
        ((((to - from + Math.PI) % turn) + turn) % turn) - Math.PI;

      return Array.from({ length: 15 }, (_, step) => {
        const angle = from + (delta * step) / 14;
        return {
          x: origin.x + Math.cos(angle) * r,
          y: origin.y + Math.sin(angle) * r,
        };
      });
    };

    return face(
      [
        ...arc(
          { x: 0, y: 0 },
          glassRadius,
          Math.atan2(near.y, near.x),
          Math.atan2(far.y, far.x),
        ),
        ...arc(
          away,
          sheenRadius,
          Math.atan2(far.y - away.y, far.x - away.x),
          Math.atan2(near.y - away.y, near.x - away.x),
        ),
      ].map((point) => ({
        x: center.x + point.x,
        y: center.y + point.y,
        z: dialZ + 0.3,
      })),
      { smooth: true, stroke: "none", fill: palette.glassSheen.wash },
    );
  };

  return [
    // No `rings` here. A ring on the top face draws a second ellipse exactly
    // concentric with the silhouette, and stacked with the wall seam below it
    // the whole object came out as three parallel curves — a stack of pancakes.
    cylinder(center, radius, at.z, caseHeight, {
      segments: 24,
      ...hue("steel"),
    }),
    // The case seam, on the side wall rather than across the top face — it runs
    // round the body of a real compass, so it has to follow the wall's curve and
    // stop at the two silhouette edges. Cutting it across the dial instead was
    // the tell that this was a lid drawn from the front.
    face(
      Array.from({ length: 13 }, (_, step) => {
        const angle = -Math.PI / 4 + (step / 12) * Math.PI;
        return {
          x: center.x + Math.cos(angle) * radius,
          y: center.y + Math.sin(angle) * radius,
          z: at.z + caseHeight * 0.62,
        };
      }),
      { outlineOnly: true, open: true, smooth: true, ...hueLine("steel") },
    ),
    // The glass over the dial, inset so the steel bezel shows as a ring around
    // it. Two tones, borrowed from the Triforce's two faces and used for the
    // same reason: a single flat value cannot say *transparent*. This one is the
    // dial seen through the glass.
    flatDisc(center, glassRadius, dialZ + 0.02, hue("glass")),
    // Bezel ticks, twelve of them with the cardinals longer. They sit on the
    // steel ring outside the glass, which is where a compass is graduated —
    // inside, they were graduations floating in the liquid.
    ...Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2;
      const inner = index % 3 === 0 ? glassEdge + 0.02 : glassEdge + 0.07;
      return face([onDial(angle, inner), onDial(angle, 0.95)], {
        outlineOnly: true,
        open: true,
        ...hueLine("steel"),
      });
    }),
    // The needle, as two halves meeting at the pivot: red north, white south.
    // A single grey diamond is a play button, and that is exactly how the last
    // one read. The colour split is the oldest convention there is on a compass
    // and it does all the work here.
    face(
      [
        onDial(north, 0.62),
        onDial(north + Math.PI / 2, 0.14),
        onDial(north + Math.PI, 0.06),
        onDial(north - Math.PI / 2, 0.14),
      ],
      hue("needleNorth"),
    ),
    face(
      [
        onDial(north + Math.PI, 0.62),
        onDial(north + Math.PI / 2, 0.14),
        onDial(north, 0.06),
        onDial(north - Math.PI / 2, 0.14),
      ],
      hue("needleSouth"),
    ),
    // The pivot, over the join, so the two halves read as one needle turning on
    // a pin rather than as two loose triangles.
    face(
      Array.from({ length: 13 }, (_, step) => {
        const angle = (step / 12) * Math.PI * 2;
        return onDial(angle, 0.09, 0.2);
      }),
      { smooth: true, ...hue("connector") },
    ),
    // Last, over the needle: a reflection lies on the glass, not under it.
    sheen(),
  ];
}

/**
 * shared-food: good matcha, boba, and unhurried time with people.
 *
 * Two cups, deliberately overlapping into one still life — "shared" needs the
 * pair, so this is the one hotspot that keeps a second object, drawn as a single
 * grouped composition rather than two separated things.
 *
 */
export function twoCups(at: At): readonly DeskPart[] {
  /**
   * One drink: a tapered body, a sealed lid with real rim thickness, a straw
   * through it, and pearls settled in the bottom.
   *
   * Built from projected solids rather than screen-space profiles. The profiles
   * were a stopgap from when round solids had no curved base and appeared to
   * melt into the floor; now that a cylinder has a genuine lower arc, a cup can
   * just be a cup — and the lid gains a top face and a wall it never had.
   */
  const cup = (
    offset: Point2,
    scale: number,
    tea: PaletteName,
  ): readonly DeskPart[] => {
    const center = { x: at.x + offset.x, y: at.y + offset.y };
    const base = 5.4 * scale;
    // Height is not scaled. Both cups come out of the same machine, so both are
    // the same height; `scale` now varies only the footprint, which is enough to
    // keep the pair from reading as one traced twice.
    const body = 17;
    const flare = 1.28;
    const lidZ = at.z + body;
    // The lid clears the cup's rim by a lip, not by a brim. At `+0.9` it stood
    // proud of the cup all the way round and the drink came out looking like a
    // paint can — a sealed boba lid is heat-pressed flush to the rim.
    const lidRadius = base * flare + 0.25 * scale;

    return [
      cylinder(center, base, at.z, body, {
        segments: 24,
        taper: flare,
        ...hue(tea),
      }),
      // Pearls first, then the lid: they sit inside the cup, so the body's own
      // outline has to stay in front of them at the sides. Settled low, because
      // that is where tapioca goes and because a pearl floating at mid-height
      // reads as a bubble in the drink rather than a solid in it.
      ...[
        { dx: -0.62, dy: 0.68 },
        { dx: -0.22, dy: 0.6 },
        { dx: 0.18, dy: 0.66 },
        { dx: 0.58, dy: 0.72 },
        { dx: -0.44, dy: 0.94 },
        { dx: -0.04, dy: 0.88 },
        { dx: 0.38, dy: 0.98 },
        { dx: -0.2, dy: 1.2 },
        { dx: 0.22, dy: 1.24 },
      ].map((spot) =>
        circle({ x: center.x, y: center.y, z: at.z }, 1.4 * scale, {
          cx: spot.dx * base * 1.35,
          cy: -2.6 * scale - spot.dy * 2.2 * scale + 3.4 * scale,
          ...hue("pearl"),
        }),
      ),
      // The sealed lid, then the straw through it. Drawing the straw first put
      // it behind the lid, so it appeared to stop at the rim rather than pass
      // into the cup.
      cylinder(center, lidRadius, lidZ, 1.5 * scale, {
        segments: 24,
        ...hue("lid"),
      }),
      cylinder(
        { x: center.x + 1.4 * scale, y: center.y - 1.2 * scale },
        0.85 * scale,
        lidZ + 0.6 * scale,
        10.5 * scale,
        { segments: 14, lean: { x: 1.6, y: -1.4 }, ...hue("cocoa") },
      ),
    ];
  };

  return [
    // Far drink first, then the near one, so the near cup's wall occludes it.
    ...cup({ x: 9, y: -7 }, 0.86, "matcha"),
    ...cup({ x: -3, y: 3 }, 1, "thaiTea"),
  ];
}

/**
 * food-favorites: sushi, and the rest of a long rotation.
 *
 * Maki, which is the shape that actually works here: a roll is a cylinder with
 * concentric rings of nori, rice and filling, and every one of those is a real
 * curve now. The old version stacked two rounded slabs per piece and the
 * generator's convex hull left a flat triangular facet hanging off each one —
 * the artifacts under the sushi that Lakshya marked.
 */
export function sushiPlate(at: At): readonly DeskPart[] {
  const plateZ = at.z + 0.8;
  const rollRadius = 3.2;
  const rollHeight = 3;
  const rollTopZ = plateZ + rollHeight;

  const rolls: readonly Point2[] = [
    { x: at.x - 3.6, y: at.y - 2.6 },
    { x: at.x + 1.4, y: at.y - 3.8 },
    { x: at.x + 2.2, y: at.y + 1.8 },
  ];

  return [
    disc({ x: at.x, y: at.y }, 9.5, at.z, 0.8, {
      segments: 18,
      ...hue("silkscreen"),
    }),
    // Each roll: a nori wall, a bed of rice on top, and the filling at the
    // centre. Three flat circles rather than rings, so each layer can carry its
    // own colour instead of all sharing the cylinder's stroke.
    ...rolls.flatMap((center) => [
      cylinder(center, rollRadius, plateZ, rollHeight, {
        segments: 20,
        ...hue("nori"),
      }),
      flatDisc(center, rollRadius * 0.82, rollTopZ + 0.01, hue("rice")),
      flatDisc(center, rollRadius * 0.36, rollTopZ + 0.02, hue("salmon")),
    ]),
    // Chopsticks resting across the rim.
    ...[0, 1.6].map((offset) =>
      box(
        { x: at.x - 8 + offset, y: at.y + 5 + offset, z: plateZ },
        { width: 15, depth: 0.7, height: 0.7 },
        hue("cocoa"),
      ),
    ),
  ];
}

/**
 * climbing: bouldering, and one stubborn route.
 *
 * The hold alone — the chalk bag is gone. A hold is by far the more distinctive
 * of the two, and pairing them meant neither got enough size to read.
 *
 * Drawn as a screen-space profile because a hold is organic: the old version
 * extruded an angular footprint with a hard taper and came out an unreadable
 * wedge. The bolt hole is what settles it as climbing gear rather than a rock.
 */
export function climbingHold(at: At): readonly DeskPart[] {
  // Tall, thin, and set densely: that is what a bouldering panel looks like, and
  // two big holds on a squat board looked like signage. A wall is read from its
  // route — the scatter of small holds *is* the object, and no single one of
  // them has to carry it.
  const width = 13;
  const depth = 2.4;
  const height = 30;
  // Holds bolt to the face turned toward the camera.
  const wallY = at.y + depth;

  /**
   * One hold: a moulded blob standing off the panel, with a bolt through it.
   *
   * The projecting edge is a real one. The previous version drew the same
   * outline twice, the lower copy in a darker fill, and offsetting a shape from
   * itself does not read as depth — it reads as print misregistration, which is
   * exactly what three of them at once looked like. Here the near face is
   * anchored `stand` units off the wall in `+y`, so the two outlines diverge by
   * a genuine projection rather than by a constant nudge, and the strip between
   * them closes as the hold's side.
   */
  const hold = (
    across: number,
    up: number,
    size: number,
    stand: number,
    colour: PaletteName,
    offsets: readonly Point2[],
    bolt: boolean,
  ) => {
    const scaled = offsets.map((point) => ({
      x: point.x * size,
      y: point.y * size,
    }));
    const root = { x: at.x + across, y: wallY, z: at.z + up };
    const crown = { x: at.x + across, y: wallY + stand, z: at.z + up };

    return [
      // The footprint on the panel, in the deeper wash — the part of the base
      // that the crown does not cover.
      silhouette(root, scaled, {
        smooth: true,
        stroke: palette[colour].line,
        fill: palette[colour].wash,
      }),
      // The crown, standing proud. Barely smaller, so what shows of the base is
      // an even rim of thickness. Taper it harder and the base reappears as a
      // second whole shape behind the first, which reads as print
      // misregistration rather than as projection.
      silhouette(
        crown,
        scaled.map((point) => ({ x: point.x * 0.94, y: point.y * 0.94 })),
        { smooth: true, ...hue(colour) },
      ),
      // The bolt, on the larger holds only. Every bolt through a hold is the
      // same size in life, so it cannot be scaled down with the hold — below
      // about 0.5 units of radius it falls under the degenerate-silhouette
      // threshold and is sub-pixel at scene scale anyway. On the small holds it
      // is simply left off, which is also what they look like across a room.
      ...(bolt ? [circle(crown, 0.5, hue("connector"))] : []),
    ];
  };

  /**
   * Two moulded outlines, reused at different sizes and colours.
   *
   * Every hold on a real wall comes out of a mould and there are only ever a few
   * moulds in a set, so repeating two shapes is truer than drawing eleven unique
   * blobs — and eleven unique blobs at this size would be eleven pieces of
   * noise.
   */
  const jug: readonly Point2[] = [
    { x: -4, y: -2.5 },
    { x: -1, y: -4.5 },
    { x: 3, y: -3 },
    { x: 4, y: 1 },
    { x: 0, y: 3 },
    { x: -4, y: 1.5 },
  ];
  const crimp: readonly Point2[] = [
    { x: -4, y: -3 },
    { x: 2, y: -4 },
    { x: 4.5, y: 0 },
    { x: 1, y: 3.5 },
    { x: -4, y: 2 },
  ];

  return [
    box({ x: at.x, y: at.y, z: at.z }, { width, depth, height }),
    // A set route: graded colours, mixed sizes, and no two at the same height.
    //
    // Small, and well clear of the edges. The first pass at this scattered
    // eleven holds at the size the old pair had been, and they filled the face
    // edge to edge, overlapped each other, and spilled past the panel's left
    // silhouette — smoothing overshoots its control points, so a blob that fits
    // on paper still crosses the line. What makes a wall read is the *scatter*:
    // holds want empty panel around them far more than they want to be legible
    // one at a time.
    //
    // Positions are constrained by the panel rather than chosen freely. A hold
    // of screen radius `r` centred `up` from the floor stays on the face only
    // while `1.5r ≤ up ≤ height − 1.5r`, because the top and bottom edges each
    // slope by half a unit for every unit across.
    ...(
      [
        { across: 4.4, up: 26, size: 0.45, stand: 0.55, colour: "holdRed", shape: jug, bolt: false },
        { across: 8.8, up: 23.4, size: 0.4, stand: 0.5, colour: "holdBlue", shape: crimp, bolt: false },
        { across: 4.6, up: 20.8, size: 0.35, stand: 0.45, colour: "holdYellow", shape: crimp, bolt: false },
        { across: 9.4, up: 18.2, size: 0.45, stand: 0.55, colour: "holdRed", shape: crimp, bolt: true },
        { across: 3.8, up: 16, size: 0.4, stand: 0.5, colour: "holdBlue", shape: jug, bolt: false },
        { across: 7, up: 13, size: 0.5, stand: 0.6, colour: "holdGreen", shape: jug, bolt: true },
        { across: 9.2, up: 9.6, size: 0.4, stand: 0.5, colour: "holdBlue", shape: jug, bolt: false },
        { across: 3.6, up: 9, size: 0.4, stand: 0.5, colour: "holdYellow", shape: crimp, bolt: false },
        { across: 5.6, up: 5.8, size: 0.45, stand: 0.55, colour: "holdRed", shape: jug, bolt: false },
        { across: 9.4, up: 4.2, size: 0.35, stand: 0.45, colour: "holdGreen", shape: crimp, bolt: false },
      ] as const
    ).flatMap(({ across, up, size, stand, colour, shape, bolt }) =>
      hold(across, up, size, stand, colour, shape, bolt),
    ),
  ];
}

/**
 * gym: time under the bar.
 *
 * Three real solids on a horizontal axis. The previous version was one flat
 * screen-space outline — an H with a couple of tick marks — and it read flat
 * because it *was* flat: there was no projection in it anywhere.
 *
 * The axis runs along +x, which projects down and to the right, so the dumbbell
 * lies across the grid the way a dropped one does. Far plate, bar, near plate,
 * in that order, because screen depth grows with x and each solid has to be able
 * to paint over the one behind it.
 */
export function dumbbell(at: At): readonly DeskPart[] {
  const plateRadius = 7;
  const plateWidth = 4;
  const barRadius = 1.9;
  const reach = 9;
  const nearFace = at.x + reach + plateWidth;
  // Plates rest on the ground, so the axis sits one radius up.
  const axis = { y: at.y, z: at.z + plateRadius };

  /**
   * An arc across the visible half of the bar, at `x`.
   *
   * A point on the bar's surface faces the camera when its normal
   * `(0, cos a, sin a)` has a positive dot with the view direction `(1, 1, 1)` —
   * that is, when `cos a + sin a > 0`, which is the range `(−π/4, 3π/4)`. The
   * previous knurling ticks ran from `1.12π` to `1.45π`, squarely on the far
   * side, and showed through the bar's own outline. Everything drawn on a
   * cylinder has to be clipped to that range or it appears inside the solid.
   */
  const onBar = (x: number, from: number, to: number, steps: number) =>
    Array.from({ length: steps + 1 }, (_, step) => {
      const angle = from + ((to - from) * step) / steps;
      return {
        x,
        y: axis.y + Math.cos(angle) * barRadius,
        z: axis.z + Math.sin(angle) * barRadius,
      };
    });

  const visible = { from: -Math.PI / 4, to: (Math.PI * 3) / 4 };
  const grip = 5.2;

  const iron = hue("filament");
  const bar = hue("steel");

  /** A full circle drawn flat on a plate's outer face, at `x`. */
  const faceRing = (x: number, radius: number) =>
    face(
      Array.from({ length: 25 }, (_, step) => {
        const angle = (step / 24) * Math.PI * 2;
        return {
          x,
          y: axis.y + Math.cos(angle) * radius,
          z: axis.z + Math.sin(angle) * radius,
        };
      }),
      { outlineOnly: true, smooth: true, ...hueLine("filament") },
    );

  return [
    // No collars. They were two more concentric rims stacked on a face that
    // already had the plate's own rim and the bar's flush end on it, and that
    // pile-up is the whole reason the far plate looked like a mistake.
    // Plates in cast green, bar in steel grey. Two materials, and the split does
    // the work the extra rings used to: the eye separates weight from handle on
    // colour alone and no longer needs a stack of concentric curves to be told
    // where one ends and the other begins.
    ...plate(axis, plateRadius, at.x - reach - plateWidth, at.x - reach, iron),
    ...plate(axis, barRadius, at.x - reach, at.x + reach, bar, {
      farEnd: "flush",
      capped: false,
    }),
    // Knurling as a bounded section: a rim line where the grip starts and
    // another where it stops, with short ticks strictly between them. Scattered
    // ticks with no boundary read as scratches on the bar; the two rims are what
    // turn the same marks into a texture that was machined on purpose.
    ...[-grip, grip].map((offset) =>
      face(onBar(at.x + offset, visible.from, visible.to, 12), {
        outlineOnly: true,
        open: true,
        smooth: true,
        ...hueLine("steel"),
      }),
    ),
    // Five short dashes over the crown, not seven long ones. Ticks that sweep
    // most of the visible half turn the bar into a coil spring — the marks have
    // to stay short enough to read as texture rather than as windings.
    ...Array.from({ length: 5 }, (_, index) =>
      face(
        onBar(
          at.x - grip + ((index + 1) * (grip * 2)) / 6,
          Math.PI * 0.16,
          Math.PI * 0.34,
          3,
        ),
        { outlineOnly: true, open: true, smooth: true, ...hueLine("steel") },
      ),
    ),
    ...plate(axis, plateRadius, at.x + reach, nearFace, iron),
    // One rib on the near plate's outer face, not two. With two ribs plus the
    // rim, the collar's rim and the collar's cap, the near face carried six
    // concentric curves inside a circle forty pixels wide at scene scale, and
    // they merged into a target. One rib says *cast* and costs one curve.
    faceRing(nearFace + 0.02, plateRadius * 0.72),
    // The spin-lock collar and the threaded stub it screws down onto — steel,
    // like the bar it clamps to. This is what makes the object an adjustable
    // dumbbell rather than a fixed one.
    ...plate(axis, 2.8, nearFace, nearFace + 1.8, bar),
    ...plate(axis, 1.05, nearFace + 1.8, nearFace + 3.4, bar),
  ];
}

/**
 * anime: ambitious stories and strategic rivalries.
 *
 * A screen paused mid-episode, and nothing else. Earlier versions kept two book
 * volumes beside it as a nod to reading, and they did what blank slabs always do
 * here — read as blank slabs. The paused frame carries the motif on its own; the
 * volumes were only ever competing with it for the same few pixels.
 */
export function animeScreen(at: At): readonly DeskPart[] {
  const width = 20;
  // The front housing is shallow and the tube tapers back behind it. As one
  // 15-deep cube with a rectangle drawn on the front, this was a microwave: a
  // box that deep has no reason to be a screen, and nothing about it said the
  // screen was on.
  const front = 5;
  const height = 14;
  const screenY = at.y + front;
  // The set stands on its own base. Two 1.6-high feet under a housing this deep
  // were almost entirely hidden behind the front face, and what did show was two
  // stray ticks poking out at the bottom corners.
  const bodyZ = at.z;
  const inset = 2.2;

  const on = (across: number, up: number) => ({
    x: at.x + across,
    y: screenY + 0.1,
    z: bodyZ + up,
  });

  return [
    // The tube: a tapered box behind the housing, which is what makes this a CRT
    // and not a flat panel. It also stops it reading as the colophon monitor,
    // which is a thin panel on a stand.
    slab(
      [
        { x: at.x + 2.5, y: at.y },
        { x: at.x + width - 2.5, y: at.y },
        { x: at.x + width - 0.5, y: at.y + front },
        { x: at.x + 0.5, y: at.y + front },
      ],
      bodyZ + 2.5,
      height - 5,
    ),
    box({ x: at.x, y: at.y + 1, z: bodyZ }, { width, depth: front - 1, height }),
    // The screen, lit. A dark rectangle inset in a grey box is an appliance door
    // — the glow is the whole difference between a television and a microwave.
    // The bottom inset is larger than the others to leave the control strip its
    // own band; matched all round, the knobs sat on top of the picture.
    face(
      [
        on(inset, inset + 2.6),
        on(width - inset, inset + 2.6),
        on(width - inset, height - inset),
        on(inset, height - inset),
      ],
      hue("crtGlow"),
    ),
    // The paused frame, wholly inside the screen rather than straddling its
    // edge, which is where it sat before.
    face(
      [
        on(width / 2 - 2, height / 2 - 1.4),
        on(width / 2 + 2.6, height / 2 + 0.6),
        on(width / 2 - 2, height / 2 + 2.6),
      ],
      { stroke: palette.crtGlow.line, fill: ink.ground },
    ),
    // Two knobs on the strip below the screen — the detail that dates it.
    ...[width - 6.5, width - 3.5].map((across) =>
      face(
        ovalOffsets(0, 0, 0.75, 0.75, 14).map((point) => ({
          x: at.x + across + point.x,
          y: screenY + 0.12,
          z: bodyZ + 2.1 + point.y,
        })),
        { smooth: true, ...hue("connector") },
      ),
    ),
  ];
}

/**
 * A mouse.
 *
 * The shell alone is just a dome, and a dome reads as a hat. What identifies a
 * mouse is the split between the two buttons and the wheel sitting in it, so
 * both are drawn on the surface of the shell rather than left to the outline.
 *
 * The long axis runs in +y, away from the viewer, so the buttons are at the far
 * end where fingers would actually reach.
 */
export function mouse(at: At): readonly DeskPart[] {
  const radius = 5;
  const squash = 1.5;
  // Low and barely tapered: a tall flared wall reads as a bowl, and the top
  // surface is where everything that identifies a mouse actually lives.
  const height = 2.3;
  const taper = 0.85;
  const topZ = at.z + height;
  const topRadiusX = radius * taper;
  const topRadiusY = radius * squash * taper;

  /**
   * A point on the flat top face.
   *
   * The first attempt domed the shell and computed the buttons on the true
   * ellipsoid surface. The dome's outline is a parabolic approximation, so those
   * points projected *outside* the shape they were meant to sit on — the wheel
   * floated off the top edge. A frustum's top face is a genuinely projected
   * ellipse, so anything placed in that plane is inside the outline by
   * construction.
   */
  const onTop = (dx: number, dy: number) => ({
    x: at.x + dx * topRadiusX,
    y: at.y + dy * topRadiusY,
    z: topZ,
  });

  return [
    cylinder({ x: at.x, y: at.y }, radius, at.z, height, {
      squash,
      taper,
    }),
    // The seam between the two buttons, running the length of the top face.
    detail([onTop(0, -0.9), onTop(0, 0.05)]),
    // Where the buttons stop and the palm rest begins.
    detail([onTop(-0.78, 0.05), onTop(0.78, 0.05)]),
    // The wheel, sitting in the seam.
    silhouette(onTop(0, -0.42), [
      { x: -0.7, y: -1.5 },
      { x: 0.7, y: -1.5 },
      { x: 0.7, y: 0.3 },
      { x: -0.7, y: 0.3 },
    ], { smooth: true }),
  ];
}

/**
 * kirby: the puffball that took over a desk.
 *
 * A sphere's silhouette genuinely is a circle in screen space, so the body is
 * one — the same reasoning behind Guo's tree canopies and figures' heads, and
 * the reason a projected solid would be wrong here rather than merely harder.
 *
 * **Everything is drawn back to front, and the paint order is the drawing.**
 * Arms and feet go down *before* the body so the body's own fill erases their
 * inner halves and only the outer lobes survive. That is the difference between
 * limbs attached to a ball and ellipses stuck on one. The previous version drew
 * the near arm last: its full outline landed across the cheek, and the feet were
 * cylinders standing clear of the body with a visible gap under it, which read
 * as two hockey pucks parked beneath a balloon.
 *
 * The volume comes from three things and no others: limbs turned to follow their
 * own direction, limbs that overlap the body rather than abutting it, and one
 * terminator — the lune between his circle and a larger circle displaced toward
 * the key light. That last one is a second attempt. The first was drawn freehand
 * and put a scythe through his right eye, which is why it is now *derived*: the
 * lune can only ever hug the rim on the side away from the light, and the whole
 * face sits deep inside the lit circle where the construction cannot reach it.
 */
export function kirby(at: At): readonly DeskPart[] {
  const anchor = { x: at.x, y: at.y, z: at.z };
  const oval = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    options: Parameters<typeof silhouette>[2] = {},
    tilt = 0,
  ) =>
    silhouette(anchor, ovalOffsets(cx, cy, rx, ry, 24, tilt), {
      smooth: true,
      ...options,
    });

  const bodyY = -12;
  const bodyR = 11;
  // Features sit a shade left of centre, so he is turned very slightly toward
  // the camera's left rather than staring dead ahead.
  const turn = -0.8;

  /**
   * The lune between the body circle and a larger circle pushed toward the key
   * light — the shaded side of a sphere, constructed rather than eyeballed.
   *
   * Both intersection points come out of the standard two-circle solve, so the
   * two arcs meet exactly and the shape closes with no seam. `litRadius` larger
   * than `bodyR` is what keeps the crescent thin: the bigger the lit circle, the
   * flatter its arc across the body and the narrower the sliver left over.
   */
  const terminator = () => {
    const toLight = { x: -3.2, y: -3.2 };
    const litRadius = 13.2;
    // Held a hair inside the silhouette and drawn with no stroke of its own, so
    // the step from lit to shaded is a change of tone and nothing else. Given a
    // stroke it draws a bright line clean across the sphere, which is the exact
    // failure this construction was built to make impossible.
    const shadeR = bodyR - 0.3;
    const d = Math.hypot(toLight.x, toLight.y);
    const along = (shadeR ** 2 - litRadius ** 2 + d ** 2) / (2 * d);
    const across = Math.sqrt(shadeR ** 2 - along ** 2);
    const unit = { x: toLight.x / d, y: toLight.y / d };
    const mid = { x: along * unit.x, y: along * unit.y };
    const hit = (sign: number) => ({
      x: mid.x + sign * across * unit.y,
      y: mid.y - sign * across * unit.x,
    });

    const near = hit(-1);
    const far = hit(1);
    const arc = (
      centre: Point2,
      radius: number,
      from: number,
      to: number,
      steps: number,
    ) =>
      Array.from({ length: steps + 1 }, (_, step) => {
        const angle = from + ((to - from) * step) / steps;
        return {
          x: centre.x + Math.cos(angle) * radius,
          y: centre.y + Math.sin(angle) * radius,
        };
      });

    const body = { x: 0, y: 0 };
    return silhouette(
      anchor,
      [
        ...arc(
          body,
          shadeR,
          Math.atan2(near.y, near.x),
          Math.atan2(far.y, far.x),
          14,
        ),
        ...arc(
          toLight,
          litRadius,
          Math.atan2(far.y - toLight.y, far.x - toLight.x),
          Math.atan2(near.y - toLight.y, near.x - toLight.x),
          14,
        ),
      ].map((point) => ({ x: point.x, y: point.y + bodyY })),
      { smooth: true, stroke: "none", fill: palette.kirbyShade.wash },
    );
  };

  return [
    // Feet, then arms — both behind the body, each tilted along its own
    // direction and pushed far enough in that its inner half falls inside the
    // body circle and is painted over. That overlap is the difference between a
    // limb attached to a ball and an ellipse parked beside one.
    oval(-7.8, -3, 5.5, 3.1, hue("kirbyRed"), -0.26),
    oval(7.6, -2.4, 5.5, 3.1, hue("kirbyRed"), 0.22),
    oval(-11.2, -12.5, 3.6, 5.2, hue("kirbyPink"), -0.5),
    oval(11.4, -13.5, 3.6, 5.2, hue("kirbyPink"), 0.45),
    oval(0, bodyY, bodyR, bodyR, hue("kirbyPink")),
    terminator(),
    // Eyes: tall and narrow, which is the whole face — round eyes make a bear.
    // Each carries a highlight in its upper third, the single most identifying
    // mark he has and the one thing the first version left out.
    // Both eyes are the same size and sit symmetrically about `turn`. They used
    // to differ by a tenth in each radius and their midpoint fell 0.7 left of
    // the mouth's, which is small enough to look like a mistake rather than a
    // turn of the head — the head's turn is already carried by `turn` itself.
    ...[turn - 3.4, turn + 3.4].flatMap((cx) => [
      oval(cx, -15.6, 1.85, 3.9, hue("kirbyBlue")),
      oval(cx, -17.8, 1.26, 1.56, {
        stroke: palette.silkscreen.line,
        fill: palette.silkscreen.line,
      }),
    ]),
    // Cheeks, filled rather than outlined. As unfilled ellipses they read as two
    // small red rings — a donut on each side of his face, not a blush.
    //
    // The left one has to clear the silhouette: at 8.6 out with a 2.2 radius its
    // far edge landed 0.7 past the body circle and hung off his face.
    oval(-7.2 + turn, -10.4, 2, 1.2, hue("kirbyRed")),
    oval(7.2 + turn, -10.4, 2, 1.2, hue("kirbyRed")),
    // An open smile rather than a drawn line: flat along the top lip, arced
    // below. A single stroke reads as a scratch at this size, and the dark
    // interior is what gives the face any depth at all.
    silhouette(
      anchor,
      Array.from({ length: 11 }, (_, step) => {
        const angle = (step / 10) * Math.PI;
        return {
          x: turn + Math.cos(angle) * 2.6,
          y: -10.9 + Math.sin(angle) * 2.6,
        };
      }),
      hue("kirbyRed"),
    ),
  ];
}

/**
 * triforce: three golden prisms standing on the grid.
 *
 * Three builds were thrown away before this one, and the last of them is worth
 * recording because it looked correct in the source and was wrong on screen.
 * That version put the emblem in the one plane this camera does not shear — a
 * direction `(dx, dy, dz)` projects horizontally when `dz = ½(dx + dy)`, which
 * `(1, −1, 0)` satisfies — and so the Triforce stood perfectly upright and
 * unsqueezed. The trouble is that plane's normal is `(1, 1, 0)`, which projects
 * to `(0, +1)`: **straight down**. Depth had nowhere to go but behind the shape
 * that cast it, and the result was a front view with a one-pixel lip on two
 * edges.
 *
 * So the emblem stands in the **x–z plane** instead, like anything else that
 * stands on this desk. `+x` projects to `(1, ½)`, so the base rides a grid line
 * and the figure leans with the grid rather than fighting it. Depth runs along
 * `−y`, which projects to `(1, −½)` — up and to the right, where it is fully
 * visible. That is a genuine face normal, so this is a real right prism with no
 * oblique fudge in it.
 *
 * Checking each outward normal against the view direction `(1, 1, 1)`: the front
 * cap at `+y` and both slanted sides face the camera; the base at `−z` does not.
 */
export function triforce(at: At): readonly DeskPart[] {
  const half = 11;
  const rise = half * 0.866;
  // Thickness. Held to about a sixth of the emblem's width: at a third it stops
  // being a Triforce with depth and becomes a solid wedge that happens to have
  // notches, because the two side faces then outweigh the three front caps.
  const depth = 3.4;

  /** A point on the emblem, `back` units along −y into the prism's thickness. */
  const point = (across: number, up: number, back: number) => ({
    x: at.x + across,
    y: at.y - back,
    z: at.z + up,
  });

  const prism = (originAcross: number, originUp: number): readonly DeskPart[] => {
    const corners: readonly Point2[] = [
      { x: originAcross, y: originUp },
      { x: originAcross + half, y: originUp },
      { x: originAcross + half / 2, y: originUp + rise },
    ];

    // The two slanted edges, each swept back along −y. Held a stop darker than
    // the front cap: sides matching their own face is exactly what makes a
    // prism collapse back into a flat emblem.
    const sides = [
      [corners[1], corners[2]],
      [corners[2], corners[0]],
    ].map(([from, to]) =>
      face(
        [
          point(from.x, from.y, 0),
          point(to.x, to.y, 0),
          point(to.x, to.y, depth),
          point(from.x, from.y, depth),
        ],
        hue("triforceSide"),
      ),
    );

    return [
      // Sides first, then the front cap over them — the cap is the nearest face
      // on the prism, and it has to close the two side quads' front edges.
      ...sides,
      face(
        corners.map((corner) => point(corner.x, corner.y, 0)),
        hue("triforce"),
      ),
    ];
  };

  return [
    // Bottom pair first, then the crown, which rests on both and must paint
    // over them. Within the pair the right one is nearer the camera.
    ...prism(0, 0),
    ...prism(half, 0),
    ...prism(half / 2, rise),
  ];
}

export type ObjectBuilder = (at: At) => readonly DeskPart[];
export type { Point2 };
