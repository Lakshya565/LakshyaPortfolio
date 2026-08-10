import { describe, expect, it } from "vitest";

import { portfolioContent } from "../content/portfolio";
import {
  buildAboutPageData,
  buildHomePageData,
  buildSiteShellData,
  buildWorkPageData,
} from "../lib/content/page-data";
import {
  isNavigationItemActive,
  siteNavigationItems,
} from "../lib/navigation/site-navigation";
import type { PortfolioContent } from "../types/content";

const expectedProjectOrder = [
  "cisco-agentic-runbook-creator",
  "repoframe",
  "nucurrent-inventory-system",
  "smartlift-sleeve",
  "quackta",
  "lucky-arduino",
  "backbuddy",
  "neurify",
  "agrisense",
  "risenrun-wifi-alarm-clock",
];

describe("page data projections", () => {
  it("builds one ordered project system for the homepage and /work", () => {
    const home = buildHomePageData(portfolioContent);
    const work = buildWorkPageData(portfolioContent);

    expect(home.projectSystem).toEqual(work.projectSystem);
    expect(home.projectSystem.projects.map(({ slug }) => slug)).toEqual(
      expectedProjectOrder,
    );
    expect(
      home.projectSystem.projects.filter(
        ({ presentation }) => presentation === "case-study",
      ),
    ).toHaveLength(5);
    expect(
      home.projectSystem.projects.filter(
        ({ presentation }) => presentation === "archive",
      ),
    ).toHaveLength(5);
  });

  it("projects archive evidence and stable /work permalinks without editorial fields", () => {
    const { projects } = buildWorkPageData(portfolioContent).projectSystem;
    const cisco = projects[0];
    const luckyArduino = projects.find(
      ({ slug }) => slug === "lucky-arduino",
    );

    expect(cisco).toMatchObject({
      presentation: "case-study",
      priority: "featured",
      routeHref: "/projects/cisco-agentic-runbook-creator",
    });
    expect(luckyArduino).toMatchObject({
      presentation: "archive",
      anchorId: "project-lucky-arduino",
      permalinkHref: "/work#project-lucky-arduino",
    });

    if (luckyArduino?.presentation !== "archive") {
      throw new Error("Expected Lucky Arduino to remain an archive project");
    }

    expect(luckyArduino.links).toHaveLength(4);
    expect(luckyArduino.metrics[0]).toEqual({
      label: "Video views",
      value: "50K+",
      context: "Reported across the Lucky Arduino channel.",
    });
    expect(luckyArduino).not.toHaveProperty("publication");
    expect(luckyArduino).not.toHaveProperty("contentStatus");
    expect(luckyArduino.metrics[0]).not.toHaveProperty("sourceNote");
  });

  it("builds eight desk hotspot groups that cover all nine motifs", () => {
    const home = buildHomePageData(portfolioContent);
    const projectedMotifKeys = home.personalHotspots.flatMap((hotspot) =>
      hotspot.motifs.map(({ key }) => key),
    );

    expect(home.personalHotspots).toHaveLength(8);
    expect(projectedMotifKeys).toHaveLength(9);
    expect(new Set(projectedMotifKeys)).toEqual(
      new Set(portfolioContent.personalMotifs.map(({ key }) => key)),
    );
    expect(
      home.personalHotspots.find(({ key }) => key === "leadership")?.motifs,
    ).toHaveLength(2);
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
    const work = buildWorkPageData(emptyContent);
    const about = buildAboutPageData(emptyContent);

    expect(home.projectSystem.projects).toEqual([]);
    expect(work.projectSystem.projects).toEqual([]);
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

  it("uses /work as the conventional project destination", () => {
    expect(work.href).toBe("/work");
    expect(isNavigationItemActive("/", work)).toBe(false);
    expect(isNavigationItemActive("/work", work)).toBe(true);
    expect(isNavigationItemActive("/projects/repoframe", work)).toBe(true);
    expect(isNavigationItemActive("/about", about)).toBe(true);
    expect(isNavigationItemActive("/about", work)).toBe(false);
  });
});
