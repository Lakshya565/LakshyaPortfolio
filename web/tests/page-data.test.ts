import { describe, expect, it } from "vitest";

import { portfolioContent } from "../content/portfolio";
import {
  buildAboutPageData,
  buildHomePageData,
  buildSelectedWorkData,
  buildSiteShellData,
  buildWorkPageData,
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
  it("leads the homepage with the flagships and still covers every branch", () => {
    const selected = buildSelectedWorkData(portfolioContent);

    expect(selected.map((project) => project.slug)).toEqual([
      "cisco-agentic-runbook-creator",
      "repoframe",
      "smartlift-sleeve",
      "quackta",
    ]);
    // Priority alone would return three Software projects and hide the range.
    expect(new Set(selected.map((project) => project.workMode))).toEqual(
      new Set(["software", "hardware", "hybrid"]),
    );
    expect(selected.map((project) => project.branchLabel)).toEqual([
      "Software",
      "Software",
      "Hardware",
      "Hybrid",
    ]);
  });

  it("builds one ordered project tree for the homepage and /work", () => {
    const home = buildHomePageData(portfolioContent);
    const work = buildWorkPageData(portfolioContent);

    expect(home.projectTree).toEqual(work.projectTree);
    expect(home.projectTree.root).toEqual({
      name: "Lakshya Agarwal",
      oneLiner: "I make computers do useful things in the real world.",
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
    const projects = buildWorkPageData(portfolioContent).projectTree.branches.flatMap(
      (branch) => branch.projects,
    );
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

    expect(home.projectTree.projectCount).toBe(0);
    expect(work.projectTree.projectCount).toBe(0);
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

  it("uses /work as the conventional project destination", () => {
    expect(work.href).toBe("/work");
    expect(isNavigationItemActive("/", work)).toBe(false);
    expect(isNavigationItemActive("/work", work)).toBe(true);
    expect(isNavigationItemActive("/projects/repoframe", work)).toBe(true);
    expect(isNavigationItemActive("/about", about)).toBe(true);
    expect(isNavigationItemActive("/about", work)).toBe(false);
  });
});
