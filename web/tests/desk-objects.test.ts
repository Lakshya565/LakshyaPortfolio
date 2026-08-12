import { describe, expect, it } from "vitest";

import { deskCatalog } from "../lib/desk/scene-catalog";
import { deskObjects } from "../lib/desk/scene";
import type { DeskPart } from "../lib/desk/parts";

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
