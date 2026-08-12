import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CaseStudyRenderer } from "../components/case-study/case-study-renderer";
import type { CaseStudyPageData } from "../lib/content/case-study-normalization";
import type { CaseStudyOutlineItem } from "../lib/content/heading-anchors";

function FixtureContent() {
  return (
    <>
      <h2 id="overview">Overview</h2>
      <p>Representative long-form content.</p>
    </>
  );
}

const minimalProject: CaseStudyPageData = {
  slug: "minimal",
  title: "Minimal project",
  category: "Developer Tools",
  description: "A deliberately sparse renderer fixture with only useful content.",
  role: null,
  dateLabel: null,
  technologies: [],
  workMode: "software",
  links: [],
  metrics: [],
  hero: null,
  media: [],
  videos: [],
};

const richProject: CaseStudyPageData = {
  ...minimalProject,
  slug: "rich",
  title:
    "A deliberately long systems project title that tests wrapping without changing the template",
  role: "Lead systems engineer",
  dateLabel: "Jan 2025 – Mar 2025",
  technologies: Array.from({ length: 14 }, (_, index) => `Technology ${index + 1}`),
  workMode: "hardware",
  links: [
    { kind: "repository", label: "Source", href: "https://example.com/source" },
  ],
  metrics: [
    { label: "Failures", value: 0, context: "Zero observed in the fixture run." },
  ],
  hero: {
    kind: "hero",
    src: "/media/projects/repoframe/architecture-fixture.svg",
    alt: "Representative architecture diagram",
    caption: null,
    width: 1200,
    height: 675,
  },
  media: [
    {
      kind: "screenshot",
      src: "/media/projects/repoframe/profile-fixture.svg",
      alt: "Representative profile output",
      caption: "A long caption remains readable and attached to its image.",
      width: 1200,
      height: 675,
    },
  ],
  videos: [
    {
      href: "https://example.com/video",
      label: "Watch demo",
      thumbnail: null,
    },
    {
      href: "https://example.com/technical-tour",
      label: "Technical tour",
      thumbnail: {
        kind: "video-thumbnail",
        src: "/media/projects/repoframe/audit-fixture.svg",
        alt: "Representative audit interface",
        caption: null,
        width: 1200,
        height: 675,
      },
    },
  ],
};

const outline: readonly CaseStudyOutlineItem[] = [
  { depth: 2, id: "overview", label: "Overview" },
  { depth: 2, id: "problem", label: "Problem" },
  { depth: 2, id: "approach", label: "Approach" },
  { depth: 3, id: "tradeoffs", label: "Tradeoffs" },
];

describe("case-study renderer", () => {
  it("renders a sparse project without empty optional containers", () => {
    const html = renderToStaticMarkup(
      <CaseStudyRenderer
        Content={FixtureContent}
        navigation={{ previous: null, next: null }}
        outline={outline.slice(0, 2)}
        project={minimalProject}
      />,
    );

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('href="/#project-tree"');
    expect(html).not.toContain("case-study-facts");
    expect(html).not.toContain("case-study-technologies");
    expect(html).not.toContain("case-study-links");
    expect(html).not.toContain("case-study-metrics");
    expect(html).not.toContain("case-study-gallery");
    expect(html).not.toContain("case-study-video-list");
    expect(html).not.toContain('aria-label="Adjacent projects"');
    expect(html).not.toContain('aria-label="Case study sections"');
  });

  it("renders rich and stress content through the same template", () => {
    const html = renderToStaticMarkup(
      <CaseStudyRenderer
        Content={FixtureContent}
        navigation={{
          previous: {
            title: "Previous project",
            category: "Hardware",
            workMode: "hardware",
            href: "/projects/previous",
          },
          next: null,
        }}
        outline={outline}
        project={richProject}
      />,
    );

    expect(html).toContain(richProject.title);
    expect(html).toContain('aria-label="Case study sections"');
    expect(html).toContain('href="#tradeoffs"');
    expect(html).toContain("Failures");
    expect(html).toMatch(/<dd[^>]*><span[^>]*>0<\/span>/);
    expect(html).toContain('class="case-study-metric-context"');
    expect(html).toContain('width="1200"');
    expect(html).toContain('height="675"');
    expect(html).toContain('alt="Representative architecture diagram"');
    expect(html).toContain('href="https://example.com/video"');
    expect(html).toContain('href="https://example.com/technical-tour"');
    expect(html).toContain('class="case-study-video-list"');
    expect(html).not.toContain("data-count");
    expect(html).toContain('rel="noreferrer noopener"');
    expect(html).toContain('href="/projects/previous"');
    expect(html).not.toContain("sourceNote");
  });
});
