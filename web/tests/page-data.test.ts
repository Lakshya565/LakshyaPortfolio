import { describe, expect, it } from "vitest";

import { portfolioContent } from "../content/portfolio";
import {
  buildAboutPageData,
  buildHomePageData,
  buildSiteShellData,
} from "../lib/content/page-data";
import {
  isNavigationItemActive,
  siteNavigationItems,
} from "../lib/navigation/site-navigation";
import type { PortfolioContent } from "../types/content";

const expectedBranches = [
  {
    workMode: "hybrid",
    slugs: ["quackta", "lucky-arduino", "neurify", "agrisense"],
  },
  {
    workMode: "software",
    slugs: [
      "cisco-agentic-runbook-creator",
      "repoframe",
      "nucurrent-inventory-system",
    ],
  },
  {
    workMode: "hardware",
    slugs: ["smartlift-sleeve", "backbuddy", "risenrun-wifi-alarm-clock"],
  },
];

describe("page data projections", () => {
  it("builds one ordered project tree for the homepage", () => {
    const home = buildHomePageData(portfolioContent);

    // Read the identity from the content rather than repeating it. The root of
    // the tree is a projection of `siteProfile`, so what is worth asserting is
    // that it projects — not what today's spelling of the name happens to be.
    expect(home.projectTree.root).toEqual({
      name: portfolioContent.siteProfile.name,
      oneLiner: portfolioContent.siteProfile.headline,
      routeHref: "/about",
    });
    expect(
      home.projectTree.branches.map(({ workMode, projects }) => ({
        workMode,
        slugs: projects.map(({ slug }) => slug),
      })),
    ).toEqual(expectedBranches);
    expect(home.projectTree.projectCount).toBe(10);
    expect(
      home.projectTree.branches
        .flatMap(({ projects }) => projects)
        .every(({ routeHref }) => routeHref.startsWith("/projects/")),
    ).toBe(true);
  });

  it("projects routed display data without editorial control fields", () => {
    const projects = buildHomePageData(
      portfolioContent,
    ).projectTree.branches.flatMap((branch) => branch.projects);
    const cisco = projects.find(
      ({ slug }) => slug === "cisco-agentic-runbook-creator",
    );
    const luckyArduino = projects.find(
      ({ slug }) => slug === "lucky-arduino",
    );

    expect(cisco).toMatchObject({
      workMode: "software",
      routeHref: "/projects/cisco-agentic-runbook-creator",
    });
    expect(luckyArduino).toMatchObject({
      workMode: "hybrid",
      routeHref: "/projects/lucky-arduino",
    });
    expect(luckyArduino).not.toHaveProperty("publication");
    expect(luckyArduino).not.toHaveProperty("contentStatus");
    expect(luckyArduino).not.toHaveProperty("links");
    expect(luckyArduino).not.toHaveProperty("metrics");
  });

  it("builds thirteen desk hotspots covering all twelve motifs one-to-one", () => {
    const home = buildHomePageData(portfolioContent);
    const projectedMotifKeys = home.personalHotspots.flatMap((hotspot) =>
      hotspot.motifs.map(({ key }) => key),
    );

    // Twelve motif hotspots plus the colophon, which carries authored facts
    // rather than a motif. `leadership` used to hold two motifs and one object,
    // and the object read as neither; splitting it into `taekwondo` and
    // `scouting` left every motif mapped to exactly one hotspot.
    expect(home.personalHotspots).toHaveLength(13);
    expect(projectedMotifKeys).toHaveLength(12);
    expect(new Set(projectedMotifKeys)).toEqual(
      new Set(portfolioContent.personalMotifs.map(({ key }) => key)),
    );
    for (const hotspot of home.personalHotspots) {
      expect(hotspot.motifs.length, hotspot.key).toBeLessThanOrEqual(1);
      expect(hotspot.details.length, hotspot.key).toBeGreaterThan(0);
    }

    const colophon = home.personalHotspots.find(({ key }) => key === "colophon");
    expect(colophon?.motifs).toHaveLength(0);
    expect(colophon?.details.length).toBeGreaterThan(0);
  });

  it("projects the supplied public contact links", () => {
    const shell = buildSiteShellData(portfolioContent);

    expect(shell.socialLinks).toEqual([
      {
        kind: "github",
        label: "GitHub",
        href: "https://github.com/Lakshya565",
      },
      {
        kind: "linkedin",
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/lakshya-agarwal-b43515317/",
      },
      {
        kind: "email",
        label: "Email",
        href: "mailto:lakshya6@illinois.edu",
      },
      // The one link that stays on this site. Its file is checked separately by
      // `validate-portfolio-content.ts`, which fails if the PDF is missing.
      {
        kind: "resume",
        label: "Resume",
        href: "/lakshya-agarwal-resume.pdf",
      },
    ]);
  });

  it("returns intentional empty collections instead of invented content", () => {
    const emptyContent = {
      ...portfolioContent,
      socialLinks: [],
      projects: [],
      skillGroups: [],
      aboutItems: [],
      personalMotifs: [],
    } satisfies PortfolioContent;

    const home = buildHomePageData(emptyContent);
    const about = buildAboutPageData(emptyContent);

    expect(home.projectTree.projectCount).toBe(0);
    expect(
      home.projectTree.branches.every(({ projects }) => projects.length === 0),
    ).toBe(true);
    expect(home.personalHotspots.every(({ motifs }) => motifs.length === 0)).toBe(
      true,
    );
    expect(home.socialLinks).toEqual([]);
    expect(about.items).toEqual([]);
    expect(about.skillGroups).toEqual([]);
  });
});

describe("site navigation state", () => {
  const [work, about] = siteNavigationItems;

  it("points work at the tree on the home page", () => {
    expect(work.href).toBe("/#project-tree");
    // The tree no longer has its own route, so home counts as the work page.
    expect(isNavigationItemActive("/", work)).toBe(true);
    expect(isNavigationItemActive("/projects/repoframe", work)).toBe(true);
    expect(isNavigationItemActive("/about", about)).toBe(true);
    expect(isNavigationItemActive("/about", work)).toBe(false);
  });
});
