import { readFile } from "node:fs/promises";
import path from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DeskExperience } from "../components/desk/desk-experience";
import { portfolioContent } from "../content/portfolio";
import {
  buildDeskHotspots,
  deskHotspotDefinitions,
  getDeskHotspotIssues,
} from "../lib/desk/hotspots";
import { deskSceneGeometry } from "../lib/desk/scene-geometry";
import { personalMotifKeys } from "../types/content";

describe("desk hotspot configuration", () => {
  it("defines eight groups that assign all nine motifs exactly once", () => {
    const assignedMotifs = deskHotspotDefinitions.flatMap(
      ({ motifKeys }) => motifKeys,
    );
    const hotspots = buildDeskHotspots(portfolioContent.personalMotifs);

    expect(deskHotspotDefinitions).toHaveLength(8);
    expect(assignedMotifs).toHaveLength(9);
    expect(new Set(assignedMotifs)).toEqual(new Set(personalMotifKeys));
    expect(new Set(assignedMotifs).size).toBe(assignedMotifs.length);
    expect(hotspots).toHaveLength(8);
    expect(hotspots.flatMap(({ motifs }) => motifs)).toHaveLength(9);
    expect(getDeskHotspotIssues(portfolioContent.personalMotifs)).toEqual([]);
  });

  it("reports duplicate assignments, missing motifs, and invalid placement", () => {
    const duplicateDefinition = deskHotspotDefinitions[0];
    const invalidDefinition = {
      ...deskHotspotDefinitions[1],
      placement: {
        ...deskHotspotDefinitions[1].placement,
        xPercent: 95,
        widthPercent: 10,
      },
    } as const;
    const issues = getDeskHotspotIssues(portfolioContent.personalMotifs, [
      duplicateDefinition,
      duplicateDefinition,
      invalidDefinition,
    ]);

    expect(issues).toContain("deskHotspots: duplicate key maker");
    expect(issues).toContain(
      "deskHotspots: motif maker-origin is assigned more than once",
    );
    expect(issues).toContain(
      "deskHotspots.quackta: placement is outside the scene",
    );
    expect(issues).toContain("deskHotspots: motif anime is not assigned");
  });

  it("renders the scene inline with no inert hotspot controls before hydration", () => {
    const html = renderToStaticMarkup(
      createElement(DeskExperience, {
        hotspots: buildDeskHotspots(portfolioContent.personalMotifs),
        scene: createElement("svg", { className: "desk-art" }),
      }),
    );

    // The monitor is no longer a portal: no dialog, no zoom, no /work link.
    expect(html).toContain("desk-art");
    expect(html).not.toContain('href="/work"');
    expect(html).not.toContain("desk-monitor-trigger");
    expect(html).not.toContain('aria-label="Things on my desk"');
  });
});

describe("desk scene geometry", () => {
  /**
   * Replaces the old `desk-<key>` id contract. Overlay placement no longer
   * depends on matching id strings inside the artwork: it is generated from the
   * same scene the artwork is drawn from, which is the stronger guarantee.
   */
  it("covers every hotspot", () => {
    const generatedKeys = Object.keys(deskSceneGeometry.hotspots);

    expect(new Set(generatedKeys)).toEqual(
      new Set(deskHotspotDefinitions.map(({ key }) => key)),
    );
  });

  it("places every generated hotspot inside the artwork", () => {
    for (const [key, bounds] of Object.entries(deskSceneGeometry.hotspots)) {
      expect(bounds.xPercent, key).toBeGreaterThanOrEqual(0);
      expect(bounds.yPercent, key).toBeGreaterThanOrEqual(0);
      expect(bounds.xPercent + bounds.widthPercent, key).toBeLessThanOrEqual(100);
      expect(bounds.yPercent + bounds.heightPercent, key).toBeLessThanOrEqual(100);
    }
  });
});

describe("desk SVG boundary", () => {
  it("keeps the public SVG passive and self-contained", async () => {
    const svg = await readFile(
      path.join(process.cwd(), "public", "media", "site", "lakshya-desk-v2.svg"),
      "utf8",
    );

    expect(svg).toMatch(/^<svg\b/);
    expect(svg).toContain('<title id="desk-title">');
    expect(svg).toContain('<desc id="desk-description">');
    expect(svg).not.toMatch(/<script\b/i);
    expect(svg).not.toMatch(/<foreignObject\b/i);
    // Soft shadows are stacked polygons, not a blur: the hero must stay cheap.
    expect(svg).not.toMatch(/<filter\b/i);
    expect(svg).not.toMatch(/\son[a-z]+\s*=/i);
    expect(svg).not.toMatch(/(?:href|xlink:href)\s*=\s*["'](?:https?:|\/\/|data:|javascript:)/i);
  });

  it("declares a frame matching the generated geometry", async () => {
    const svg = await readFile(
      path.join(process.cwd(), "public", "media", "site", "lakshya-desk-v2.svg"),
      "utf8",
    );
    const { viewBox } = deskSceneGeometry;

    expect(svg).toContain(
      `viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}"`,
    );
    // A fixed 1444x720 frame, as guochen.design uses. The grid fills the frame,
    // so the frame cannot be derived from the objects' own bounds.
    expect(viewBox.width / viewBox.height).toBeCloseTo(
      deskSceneGeometry.aspectRatio,
      3,
    );
    expect(deskSceneGeometry.aspectRatio).toBeCloseTo(1444 / 720, 3);
  });

  it("wraps every object in its own group so it can be hovered", async () => {
    const svg = await readFile(
      path.join(process.cwd(), "public", "media", "site", "lakshya-desk-v2.svg"),
      "utf8",
    );

    for (const key of Object.keys(deskSceneGeometry.hotspots)) {
      expect(svg, key).toContain(`<g data-object="${key}">`);
    }
    // Scenery is grouped too, so the monitor can respond as one piece.
    expect(svg).toContain('<g data-object="monitor">');
  });
});
