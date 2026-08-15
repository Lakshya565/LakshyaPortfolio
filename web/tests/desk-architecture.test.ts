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
import { ink, palette } from "../lib/desk/parts";
import { deskSceneGeometry } from "../lib/desk/scene-geometry";
import { personalMotifKeys } from "../types/content";

describe("desk hotspot configuration", () => {
  it("maps every motif onto exactly one hotspot", () => {
    const assignedMotifs = deskHotspotDefinitions.flatMap(
      ({ motifKeys }) => motifKeys,
    );
    const hotspots = buildDeskHotspots(portfolioContent.personalMotifs);

    // Twelve motif hotspots plus the colophon. Splitting `leadership` into
    // `taekwondo` and `scouting` removed the last hotspot that carried two
    // motifs, so the mapping is strictly one-to-one; `kirby` and `triforce`
    // joined as motifs ten and eleven, and `music` as twelve when the field's
    // last meaningless object — a plain cube — became a pair of headphones.
    expect(deskHotspotDefinitions).toHaveLength(13);
    expect(assignedMotifs).toHaveLength(12);
    expect(new Set(assignedMotifs)).toEqual(new Set(personalMotifKeys));
    expect(new Set(assignedMotifs).size).toBe(assignedMotifs.length);
    expect(hotspots).toHaveLength(13);
    expect(hotspots.flatMap(({ motifs }) => motifs)).toHaveLength(12);
    expect(getDeskHotspotIssues(portfolioContent.personalMotifs)).toEqual([]);
  });

  it("gives every hotspot something to say", () => {
    for (const hotspot of buildDeskHotspots(portfolioContent.personalMotifs)) {
      expect(hotspot.details.length, hotspot.key).toBeGreaterThan(0);
    }
  });

  it("reports a hotspot with neither motifs nor facts", () => {
    const empty = {
      ...deskHotspotDefinitions[0],
      motifKeys: [],
      facts: [],
    } as const;

    expect(
      getDeskHotspotIssues(portfolioContent.personalMotifs, [empty]),
    ).toContain("deskHotspots.colophon: has no motifs and no facts");
  });

  it("reports duplicate assignments, missing motifs, and invalid placement", () => {
    const maker = deskHotspotDefinitions.find(({ key }) => key === "maker");
    const quackta = deskHotspotDefinitions.find(({ key }) => key === "quackta");
    if (!maker || !quackta) {
      throw new Error("expected maker and quackta hotspots");
    }

    const invalidDefinition = {
      ...quackta,
      placement: { ...quackta.placement, xPercent: 95, widthPercent: 10 },
    } as const;
    const issues = getDeskHotspotIssues(portfolioContent.personalMotifs, [
      maker,
      maker,
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
    // The scene is flat paths only — no blur, no gradient. The hero stays cheap.
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

    // Matched on the attribute rather than the whole opening tag: interactive
    // groups also carry a `stroke`, and asserting exact tag text would break on
    // any future attribute without anything actually being wrong.
    const groups = new Set(
      [...svg.matchAll(/<g data-object="([^"]+)"/g)].map((match) => match[1]),
    );

    for (const key of Object.keys(deskSceneGeometry.hotspots)) {
      expect([...groups], key).toContain(key);
    }
    // Scenery is grouped too, so the keyboard can respond as one piece.
    expect([...groups]).toContain("keyboard");
  });

  it("strokes interactive objects in the accent and leaves scenery grey", async () => {
    const svg = await readFile(
      path.join(process.cwd(), "public", "media", "site", "lakshya-desk-v2.svg"),
      "utf8",
    );

    // Colour is the only cue that an object responds, so this is a real contract
    // rather than styling: every hotspot carries it, and nothing else does. Read
    // from `ink` rather than a literal, so changing the accent cannot fail this
    // test for the wrong reason.
    for (const key of Object.keys(deskSceneGeometry.hotspots)) {
      expect(svg, key).toContain(`<g data-object="${key}" stroke="${ink.accent}"`);
    }

    const accented = [
      ...svg.matchAll(
        new RegExp(`<g data-object="([^"]+)" stroke="${ink.accent}"`, "g"),
      ),
    ].map((match) => match[1]);

    expect(new Set(accented)).toEqual(
      new Set(Object.keys(deskSceneGeometry.hotspots)),
    );
  });

  it("lets a part override its group's stroke with its own colour", async () => {
    const svg = await readFile(
      path.join(process.cwd(), "public", "media", "site", "lakshya-desk-v2.svg"),
      "utf8",
    );

    // The board is teal because an Arduino is teal; the group around it is green
    // because it responds. Both have to be true at once, which only works if a
    // part's own stroke beats the one it would otherwise inherit.
    expect(svg).toContain(`stroke="${palette.arduino.line}"`);
    expect(svg).toContain(`fill="${palette.arduino.wash}"`);
    expect(svg).toContain(`<g data-object="maker" stroke="${ink.accent}"`);
  });
});
