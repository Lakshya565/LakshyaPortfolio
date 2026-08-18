import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProjectTree } from "../components/project-tree/project-tree";
import { SocialLinks } from "../components/site/social-links";
import { portfolioContent } from "../content/portfolio";
import {
  buildHomePageData,
  buildProjectTreeData,
} from "../lib/content/page-data";

describe("project tree", () => {
  const data = buildProjectTreeData(portfolioContent);

  it("server-renders the root, three labeled branches, and all ten projects", () => {
    const html = renderToStaticMarkup(<ProjectTree data={data} />);

    expect(html.match(/class="project-tree-node"/g)).toHaveLength(10);
    expect(html.match(/<details>/g)).toHaveLength(10);
    expect(html).toContain('href="/about"');
    expect(html).toContain(portfolioContent.siteProfile.name);
    // Titles are editorial and get reworded; slugs are the contract, because
    // they are the URL. Assert that every published project renders its own
    // title rather than pinning today's phrasing of two of them.
    for (const project of portfolioContent.projects) {
      expect(html, project.slug).toContain(`href="/projects/${project.slug}"`);
      expect(html, project.slug).toContain(project.title);
    }
    expect(html).toContain(">Hybrid</h2>");
    expect(html).toContain(">Software</h2>");
    expect(html).toContain(">Hardware</h2>");
  });

  it("keeps mobile DOM order and project depth inside native disclosure", () => {
    const html = renderToStaticMarkup(<ProjectTree data={data} />);
    const hybridBranchIndex = html.indexOf('data-work-mode="hybrid"');
    const softwareBranchIndex = html.indexOf('data-work-mode="software"');
    const hardwareBranchIndex = html.indexOf('data-work-mode="hardware"');

    expect(hybridBranchIndex).toBeGreaterThan(-1);
    expect(softwareBranchIndex).toBeGreaterThan(hybridBranchIndex);
    expect(hardwareBranchIndex).toBeGreaterThan(softwareBranchIndex);
    expect(html).toContain('href="/projects/lucky-arduino"');
    expect(html).toContain('href="/projects/backbuddy"');
    expect(html.match(/Open project/g)).toHaveLength(10);
    expect(html).toContain("Technologies");
    expect(html).toContain('aria-label="5 more technologies"');
    expect(html.match(/<pattern/g)).toHaveLength(11);
  });

  it("renders an intentional empty state without empty project nodes", () => {
    const emptyData = {
      ...data,
      branches: data.branches.map((branch) => ({ ...branch, projects: [] })),
      projectCount: 0,
    };
    const html = renderToStaticMarkup(<ProjectTree data={emptyData} />);

    expect(html).toContain("No public projects are available yet.");
    expect(html).toContain('href="/about"');
    expect(html).not.toContain('class="project-tree-node"');
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
