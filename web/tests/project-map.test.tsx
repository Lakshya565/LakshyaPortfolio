import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CircuitScene } from "../components/project-map/circuit-scene";
import { portfolioContent } from "../content/portfolio";
import { buildHomePageData } from "../lib/content/page-data";
import { projectMapPlacements } from "../lib/map/placements";
import {
  buildProjectMapData,
  getProjectMapPlacementIssues,
} from "../lib/map/project-map";

describe("project map data", () => {
  const home = buildHomePageData(portfolioContent);

  it("joins every public project to deterministic typed placement", () => {
    const nodes = buildProjectMapData(home.mapProjects);

    expect(nodes.map(({ slug }) => slug)).toEqual([
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
    ]);
    expect(
      nodes
        .filter((node) => node.presentation === "case-study")
        .every(({ href }) => href.startsWith("/projects/")),
    ).toBe(true);
    expect(
      nodes
        .filter((node) => node.presentation === "archive-card")
        .every(({ href, anchorId }) => href === null && anchorId.startsWith("project-")),
    ).toBe(true);
    expect(getProjectMapPlacementIssues(portfolioContent.projects)).toEqual([]);
  });

  it("provides a deterministic fallback while validation reports missing placement", () => {
    const placementsWithoutCisco = projectMapPlacements.slice(1);
    const nodes = buildProjectMapData(home.mapProjects, placementsWithoutCisco);
    const cisco = nodes.find(
      (node) => node.slug === "cisco-agentic-runbook-creator",
    );
    const issues = getProjectMapPlacementIssues(
      portfolioContent.projects,
      placementsWithoutCisco,
    );

    expect(cisco?.desktopColumn).toBe(1);
    expect(issues).toContain(
      "mapPlacements.cisco-agentic-runbook-creator: missing placement",
    );
  });

  it("reports duplicate placement identity and mobile order", () => {
    const duplicate = {
      ...projectMapPlacements[0],
      slug: "repoframe" as const,
    };
    const issues = getProjectMapPlacementIssues(portfolioContent.projects, [
      ...projectMapPlacements,
      duplicate,
    ]);

    expect(issues).toContain("mapPlacements: duplicate slug repoframe");
    expect(issues).toContain("mapPlacements: duplicate mobileOrder 10");
  });
});

describe("workbench scene", () => {
  it("server-renders expandable project nodes and personal clusters", () => {
    const home = buildHomePageData(portfolioContent);
    const html = renderToStaticMarkup(
      <CircuitScene
        identity={{ name: portfolioContent.siteProfile.name }}
        personalMotifs={home.personalMotifs}
        projects={buildProjectMapData(home.mapProjects)}
      />,
    );

    expect(html.match(/class="workbench-project-node"/g)).toHaveLength(10);
    expect(html.match(/class="workbench-personal-node"/g)).toHaveLength(4);
    expect(html).toContain('href="/projects/repoframe"');
    expect(html).toContain('href="#project-lucky-arduino"');
    expect(html).toContain("portfolio-project-map");
    expect(html).toContain('data-presentation="case-study"');
    expect(html).toContain('data-presentation="archive-card"');
    expect(html).toContain("workbench-grid-pattern");
    expect(html).not.toContain("circuit-pulse");
    expect(html).not.toContain("<button");
  });
});
