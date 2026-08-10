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

describe("page data projections", () => {
  it("builds the intended homepage hierarchy without editorial fields", () => {
    const data = buildHomePageData(portfolioContent);

    expect(data.featuredProjects.map(({ slug }) => slug)).toEqual([
      "cisco-agentic-runbook-creator",
      "repoframe",
    ]);
    expect(data.supportingProjects).toHaveLength(3);
    expect(data.archiveProjects).toHaveLength(5);
    expect(data.mapProjects).toHaveLength(10);
    expect(data.personalMotifs).toHaveLength(8);
    expect(data.archiveProjects.every(({ href }) => href === null)).toBe(true);
    expect(data.archiveProjects[0].links).toHaveLength(4);
    expect(data.archiveProjects[0].metrics[0]).toEqual({
      label: "Video views",
      value: "50K+",
      context: "Reported across the Lucky Arduino channel.",
    });
    expect(data.archiveProjects[1].dateLabel).toBe("Jan 2025 – May 2025");
    expect(data.featuredProjects[0]).not.toHaveProperty("publication");
    expect(data.featuredProjects[0]).not.toHaveProperty("contentStatus");
    expect(data.featuredProjects[0]).not.toHaveProperty("metrics");
    expect(data.archiveProjects[0].metrics[0]).not.toHaveProperty("sourceNote");
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
    const about = buildAboutPageData(emptyContent);

    expect(home.featuredProjects).toEqual([]);
    expect(home.supportingProjects).toEqual([]);
    expect(home.archiveProjects).toEqual([]);
    expect(home.personalMotifs).toEqual([]);
    expect(home.socialLinks).toEqual([]);
    expect(about.items).toEqual([]);
    expect(about.skillGroups).toEqual([]);
  });
});

describe("site navigation state", () => {
  const [work, about] = siteNavigationItems;

  it("marks one conventional route family active", () => {
    expect(isNavigationItemActive("/", work)).toBe(true);
    expect(isNavigationItemActive("/projects/repoframe", work)).toBe(true);
    expect(isNavigationItemActive("/about", about)).toBe(true);
    expect(isNavigationItemActive("/about", work)).toBe(false);
  });
});
