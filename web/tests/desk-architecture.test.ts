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

  it("keeps the monitor as a real fallback link without inert hotspot controls", () => {
    const html = renderToStaticMarkup(
      createElement(DeskExperience, {
        hotspots: buildDeskHotspots(portfolioContent.personalMotifs),
        projectSystem: createElement("p", null, "Project system"),
      }),
    );

    expect(html).toContain('href="/work"');
    expect(html).toContain('aria-label="Enter the project system"');
    expect(html).toContain('src="/media/site/lakshya-desk.svg"');
    expect(html).not.toContain('aria-label="Objects on my desk"');
  });
});

describe("desk SVG boundary", () => {
  it("contains the monitor and every required hotspot group", async () => {
    const svg = await readFile(
      path.join(process.cwd(), "public", "media", "site", "lakshya-desk.svg"),
      "utf8",
    );
    const requiredIds = [
      "desk-monitor",
      ...deskHotspotDefinitions.map(({ key }) => `desk-${key}`),
    ];

    for (const id of requiredIds) {
      expect(svg).toContain(`id="${id}"`);
    }

    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps the public SVG passive and self-contained", async () => {
    const svg = await readFile(
      path.join(process.cwd(), "public", "media", "site", "lakshya-desk.svg"),
      "utf8",
    );

    expect(svg).toMatch(/^<svg\b/);
    expect(svg).toMatch(/\bviewBox="0 0 1440 900"/);
    expect(svg).toContain('<title id="desk-title">');
    expect(svg).toContain('<desc id="desk-description">');
    expect(svg).not.toMatch(/<script\b/i);
    expect(svg).not.toMatch(/<foreignObject\b/i);
    expect(svg).not.toMatch(/<filter\b/i);
    expect(svg).not.toMatch(/\son[a-z]+\s*=/i);
    expect(svg).not.toMatch(/(?:href|xlink:href)\s*=\s*["'](?:https?:|\/\/|data:|javascript:)/i);
  });
});
