import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProjectSystem } from "../components/project-system/project-system";
import { SocialLinks } from "../components/site/social-links";
import { portfolioContent } from "../content/portfolio";
import {
  buildHomePageData,
  buildProjectSystemData,
} from "../lib/content/page-data";

describe("project system", () => {
  const data = buildProjectSystemData(portfolioContent);

  it("server-renders all case studies and archives through one component", () => {
    const html = renderToStaticMarkup(
      <ProjectSystem data={data} headingId="project-system-test-heading" />,
    );

    expect(html.match(/class="project-system-node"/g)).toHaveLength(10);
    expect(html.match(/data-presentation="case-study"/g)).toHaveLength(5);
    expect(html.match(/data-presentation="archive"/g)).toHaveLength(5);
    expect(html).toContain('href="/projects/cisco-agentic-runbook-creator"');
    expect(html).toContain("Cisco Agentic Runbook Creator");
    expect(html).toContain("Lucky Arduino Collection");
  });

  it("keeps archive evidence at /work permalinks without inventing detail routes", () => {
    const html = renderToStaticMarkup(
      <ProjectSystem data={data} headingId="project-system-test-heading" />,
    );

    expect(html).toContain('id="project-lucky-arduino"');
    expect(html).toContain('href="/work#project-lucky-arduino"');
    expect(html).toContain(
      'href="https://github.com/Lakshya565/Basic-Electronics-Projects"',
    );
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer noopener"');
    expect(html).not.toContain('href="/projects/lucky-arduino"');
  });

  it("renders an intentional empty state without empty project nodes", () => {
    const html = renderToStaticMarkup(
      <ProjectSystem
        data={{ projects: [] }}
        headingId="empty-project-system-heading"
      />,
    );

    expect(html).toContain("No public projects are available yet.");
    expect(html).not.toContain('class="project-system-node"');
  });
});

describe("social links", () => {
  const data = buildHomePageData(portfolioContent);

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
