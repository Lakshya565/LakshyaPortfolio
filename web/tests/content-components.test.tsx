import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ArchiveCard } from "../components/projects/archive-card";
import { ProjectRow } from "../components/projects/project-row";
import { SocialLinks } from "../components/site/social-links";
import { portfolioContent } from "../content/portfolio";
import { buildHomePageData } from "../lib/content/page-data";

describe("content components", () => {
  const data = buildHomePageData(portfolioContent);

  it("renders a semantic route link for case studies", () => {
    const html = renderToStaticMarkup(
      <ProjectRow index={0} project={data.featuredProjects[0]} />,
    );

    expect(html).toContain('href="/projects/cisco-agentic-runbook-creator"');
    expect(html).toContain("Cisco Agentic Runbook Creator");
    expect(html).toContain("<article");
  });

  it("renders archive evidence without inventing a detail route", () => {
    const html = renderToStaticMarkup(
      <ArchiveCard project={data.archiveProjects[0]} />,
    );

    expect(html).toContain("Lucky Arduino");
    expect(html).not.toMatch(/<a(?:\s|>)/);
  });

  it("uses safe new-tab behavior for external profiles and mailto for email", () => {
    const html = renderToStaticMarkup(<SocialLinks links={data.socialLinks} />);

    expect(html).toContain('href="https://github.com/Lakshya565"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer noopener"');
    expect(html).toContain('href="mailto:lakshya6@illinois.edu"');
  });

  it("renders no empty social container", () => {
    expect(renderToStaticMarkup(<SocialLinks links={[]} />)).toBe("");
  });
});
