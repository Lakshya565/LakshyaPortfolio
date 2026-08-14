import { describe, expect, it } from "vitest";

import { deskCatalog } from "../lib/desk/scene-catalog";
import { deskObjects } from "../lib/desk/scene";
import {
  box,
  circle,
  cylinder,
  dome,
  face,
  hue,
  ink,
  palette,
  pyramid,
  rounded,
  silhouette,
  wedge,
  type DeskPart,
  type PaletteName,
} from "../lib/desk/parts";
import type { Point2 } from "../lib/desk/projection";

/**
 * Per-object invariants, in the spirit of the generator's overlap check.
 *
 * The overlap validator already fails the build when two labelled objects
 * collide. These are the same kind of guarantee applied one level down: cheap,
 * mechanical properties that were violated by every object that turned out
 * unrecognizable, and which nobody should have to notice by eye.
 *
 * They cannot tell you a duck looks like a duck — that is what `/lab` and the
 * contact sheet are for. They catch the failures that have an arithmetic
 * signature.
 */

function polygonArea(points: readonly { x: number; y: number }[]): number {
  let total = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    total += a.x * b.y - b.x * a.y;
  }
  return Math.abs(total) / 2;
}

describe("desk object geometry", () => {
  it("gives every object at least one part", () => {
    for (const object of deskObjects) {
      expect(object.parts.length, object.id).toBeGreaterThan(0);
    }
  });

  it("draws no degenerate silhouette", () => {
    // A silhouette is drawn directly in screen space, so a bad one is a bad
    // picture — there is no projection left to blame.
    //
    // Only filled silhouettes have to enclose area. An `outlineOnly` one is a
    // stroked polyline and two points is a perfectly good line: that is how the
    // dumbbell's knurling and the duck's wing crease are drawn.
    for (const object of deskObjects) {
      for (const [index, part] of object.parts.entries()) {
        if (part.shape !== "screen") {
          continue;
        }
        const where = `${object.id} part ${index}`;

        if (part.outlineOnly) {
          expect(part.offsets.length, where).toBeGreaterThanOrEqual(2);
          continue;
        }

        expect(part.offsets.length, where).toBeGreaterThanOrEqual(3);
        expect(polygonArea(part.offsets), where).toBeGreaterThan(0.5);
      }
    }
  });

  it("keeps every footprint and box non-zero", () => {
    const nonZero = (part: DeskPart, where: string) => {
      if (part.shape === "extrude") {
        expect(part.footprint.length, where).toBeGreaterThanOrEqual(3);
        expect(polygonArea(part.footprint), where).toBeGreaterThan(0);
        expect(part.height, where).toBeGreaterThan(0);
        return;
      }
      if (part.shape === undefined || part.shape === "box") {
        expect(part.size.width, where).toBeGreaterThan(0);
        expect(part.size.depth, where).toBeGreaterThan(0);
        expect(part.size.height, where).toBeGreaterThan(0);
      }
    };

    for (const object of deskObjects) {
      for (const [index, part] of object.parts.entries()) {
        nonZero(part, `${object.id} part ${index}`);
      }
    }
  });
});

describe("desk object catalog", () => {
  it("covers every object in the scene exactly once", () => {
    const catalogKeys = deskCatalog.map((entry) => entry.key);
    const sceneKeys = deskObjects.map((object) => object.hotspot ?? object.id);

    expect(new Set(catalogKeys)).toEqual(new Set(sceneKeys));
    expect(catalogKeys.length).toBe(sceneKeys.length);
    expect(new Set(catalogKeys).size).toBe(catalogKeys.length);
  });

  it("gives every object a drawable body and a real viewBox", () => {
    for (const entry of deskCatalog) {
      expect(entry.body, entry.key).toContain("<path");
      expect(entry.width, entry.key).toBeGreaterThan(0);
      expect(entry.height, entry.key).toBeGreaterThan(0);
      expect(entry.viewBox, entry.key).toMatch(
        /^-?[\d.]+ -?[\d.]+ [\d.]+ [\d.]+$/,
      );
    }
  });

  /**
   * A guard against the squashed-tent failure: a footprint projects
   * `(width + depth)` across the screen but only half that in height, so a shape
   * modelled as chunky can come out a wide flat sliver.
   *
   * Worth being clear about what this does and does not do. Measured across the
   * current objects the spread is 0.53 (clock tower) to 2.07 (dev board), so
   * this band catches nothing today — the objects that read badly are legible
   * failures, not arithmetic ones. It earns its place as a regression guard
   * during the redraw, when a mistyped `lean` or `taper` can degenerate a shape
   * silently. Judging whether something *looks* right is `/lab`'s job.
   */
  it("keeps every object within a sane aspect ratio", () => {
    for (const entry of deskCatalog) {
      const ratio = entry.width / entry.height;
      expect(ratio, `${entry.key} is too wide and flat`).toBeLessThan(3);
      expect(ratio, `${entry.key} is too tall and thin`).toBeGreaterThan(0.35);
    }
  });

  it("keeps every object inside a plausible screen size", () => {
    // Nothing in the field should rival the whole frame. A runaway `lean` or
    // `taper` shows up here long before anyone opens the page.
    for (const entry of deskCatalog) {
      expect(entry.width, entry.key).toBeLessThan(220);
      expect(entry.height, entry.key).toBeLessThan(220);
    }
  });
});

describe("part colour", () => {
  /**
   * The shape helpers build their parts field by field rather than spreading
   * their options, because most of what they receive is geometry to be
   * converted. That made dropping a presentation option completely silent — the
   * part simply came out grey, with nothing to point at. This is the guard.
   */
  it("forwards stroke and fill through every shape helper", () => {
    const paint = { stroke: "#112233", fill: "#445566" } as const;
    const square: readonly Point2[] = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 4 },
    ];

    const built: readonly [string, DeskPart][] = [
      ["box", box({ x: 0, y: 0, z: 0 }, { width: 4, depth: 4, height: 4 }, paint)],
      ["cylinder", cylinder({ x: 0, y: 0 }, 4, 0, 4, paint)],
      ["rounded", rounded({ x: 0, y: 0 }, 4, 4, 0, 4, paint)],
      ["wedge", wedge(square as [Point2, Point2, Point2], 0, 4, paint)],
      ["pyramid", pyramid(square, 0, 4, paint)],
      ["dome", dome({ x: 0, y: 0 }, 4, 0, 4, paint)],
      ["face", face([{ x: 0, y: 0, z: 0 }], paint)],
      ["silhouette", silhouette({ x: 0, y: 0, z: 0 }, [{ x: 0, y: 0 }], paint)],
      ["circle", circle({ x: 0, y: 0, z: 0 }, 4, paint)],
    ];

    for (const [name, part] of built) {
      expect(part.stroke, name).toBe(paint.stroke);
      expect(part.fill, name).toBe(paint.fill);
    }
  });

  it("pairs every palette hue with a distinct wash", () => {
    // The pairing is the whole design: a bright line over a fill of the same
    // hue at a lower value. Collapsing the two would make the object a solid
    // block and lose the outline that carries the drawing.
    for (const [name, tones] of Object.entries(palette)) {
      expect(tones.line, name).not.toBe(tones.wash);
      expect(hue(name as PaletteName), name).toEqual({
        stroke: tones.line,
        fill: tones.wash,
      });
    }
  });

  /**
   * A wash also has to separate from the page, not just from its own line.
   *
   * The first colour pass held every wash within a few percent of `ink.ground`
   * on the theory that the outline could carry the object. At the size the scene
   * is viewed that made Kirby a black ball with a pink edge and the matcha a
   * black cup — the colours were technically present and did nothing. This is
   * the arithmetic form of that failure, which is the only form of it a test can
   * see.
   */
  it("keeps every wash clear of the page ground", () => {
    // Two entries are deliberately near-black, and both would be wrong lifted:
    // a black belt lifted is a grey belt, and a tapioca pearl at the value of
    // the tea it sits in is invisible.
    const intentionallyDark = new Set<PaletteName>(["beltBlack", "pearl"]);

    const luminance = (colour: string) => {
      const channel = (from: number) => {
        const value = Number.parseInt(colour.slice(from, from + 2), 16) / 255;
        return value <= 0.04045
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4;
      };
      return (
        0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
      );
    };

    const ground = luminance(ink.ground);
    for (const [name, tones] of Object.entries(palette)) {
      if (intentionallyDark.has(name as PaletteName)) {
        continue;
      }
      const ratio = (luminance(tones.wash) + 0.05) / (ground + 0.05);
      expect(ratio, `${name} wash is indistinguishable from the page`).toBeGreaterThan(
        1.4,
      );
    }
  });
});
