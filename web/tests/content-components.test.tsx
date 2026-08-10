import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ArchiveCard } from "../components/projects/archive-card";
import { ProjectBentoGrid } from "../components/projects/project-bento-grid";
import { SocialLinks } from "../components/site/social-links";
import { portfolioContent } from "../content/portfolio";
import { buildHomePageData } from "../lib/content/page-data";

describe("content components", () => {
  const data = buildHomePageData(portfolioContent);

  it("renders routed summaries in the featured-first bento hierarchy", () => {
    const html = renderToStaticMarkup(
      <ProjectBentoGrid
        featuredProjects={data.featuredProjects}
        supportingProjects={data.supportingProjects}
      />,
    );

    expect(html).toContain('href="/projects/cisco-agentic-runbook-creator"');
    expect(html).toContain("Cisco Agentic Runbook Creator");
    expect(html.match(/<article/g)).toHaveLength(5);
    expect(html.match(/data-prominence="featured"/g)).toHaveLength(2);
    expect(html.match(/data-prominence="supporting"/g)).toHaveLength(3);
    expect(html.indexOf('data-prominence="featured"')).toBeLessThan(
      html.indexOf('data-prominence="supporting"'),
    );
    expect(html).toContain("Open case study");
  });

  it("renders substantial archive evidence without inventing a detail route", () => {
    const html = renderToStaticMarkup(
      <ArchiveCard project={data.archiveProjects[0]} />,
    );

    expect(html).toContain("Lucky Arduino Collection");
    expect(html).toContain("50K+");
    expect(html).toContain('id="project-lucky-arduino"');
    expect(html).toContain("archive-card-dots");
    expect(html).toContain(
      'href="https://github.com/Lakshya565/Basic-Electronics-Projects"',
    );
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer noopener"');
    expect(html).not.toContain('href="/projects/lucky-arduino"');
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
