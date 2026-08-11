import { describe, expect, it } from "vitest";

import { portfolioContent } from "../content/portfolio";
import {
  formatProjectDateRange,
  toCaseStudyPageData,
} from "../lib/content/case-study-normalization";
import type { CaseStudyProject } from "../types/content";

function getCaseStudy(slug: string) {
  const project = portfolioContent.projects.find(
    (candidate) => candidate.slug === slug,
  );

  if (!project) {
    throw new Error(`Missing test case study: ${slug}`);
  }

  return project;
}

describe("case-study normalization", () => {
  it("keeps renderer data intentional and strips editorial control fields", () => {
    const pageData = toCaseStudyPageData(getCaseStudy("repoframe"));

    expect(pageData.metrics).toHaveLength(3);
    expect(pageData.media).toEqual([]);
    expect(pageData.hero).toBeNull();
    expect(pageData.videos).toEqual([]);
    expect(pageData).not.toHaveProperty("publication");
    expect(pageData).not.toHaveProperty("contentStatus");
    expect(pageData).not.toHaveProperty("caseStudyKey");
    expect(pageData.metrics[0]).not.toHaveProperty("sourceNote");
  });

  it("normalizes any number of videos and associates optional thumbnails by path", () => {
    const source = {
      ...getCaseStudy("repoframe"),
      assets: [
        {
          kind: "video-thumbnail" as const,
          path: "/media/projects/repoframe/profile-fixture.svg",
          alt: "Representative profile output",
          width: 1200,
          height: 675,
          placeholder: false,
        },
      ],
      videos: [
        {
          label: " Architecture tour ",
          href: "https://example.com/architecture",
          thumbnailPath: "/media/projects/repoframe/profile-fixture.svg",
        },
        {
          label: "Audit walkthrough",
          href: "https://example.com/audit",
        },
      ],
    } as CaseStudyProject;

    const pageData = toCaseStudyPageData(source);

    expect(pageData.videos).toHaveLength(2);
    expect(pageData.videos[0]).toEqual({
      href: "https://example.com/architecture",
      label: "Architecture tour",
      thumbnail: expect.objectContaining({
        src: "/media/projects/repoframe/profile-fixture.svg",
      }),
    });
    expect(pageData.videos[1]).toEqual({
      href: "https://example.com/audit",
      label: "Audit walkthrough",
      thumbnail: null,
    });
  });

  it("trims optionals, deduplicates technologies, filters unsafe records, and preserves zero", () => {
    const source = {
      ...getCaseStudy("repoframe"),
      role: "  ",
      startDate: "2025-01",
      endDate: "2025-03",
      technologies: [" TypeScript ", "TypeScript", "  "],
      links: [
        { kind: "live", label: " Preview ", href: "https://example.com/demo" },
        { kind: "live", label: "Unsafe", href: "javascript:alert(1)" },
      ],
      metrics: [
        { label: " Retries ", value: 0, context: " None required ", sourceNote: "private" },
        { label: " ", value: "discarded" },
      ],
      assets: [
        {
          kind: "screenshot",
          path: "/media/projects/repoframe/profile-fixture.svg",
          alt: " Profile output ",
          caption: "  ",
          width: 1200,
          height: 675,
          placeholder: true,
        },
        {
          kind: "screenshot",
          path: "/media/projects/other/cross-project.svg",
          alt: "Wrong namespace",
          width: 1200,
          height: 675,
          placeholder: true,
        },
      ],
    } as unknown as CaseStudyProject;

    const pageData = toCaseStudyPageData(source);

    expect(pageData.role).toBeNull();
    expect(pageData.dateLabel).toBe("Jan 2025 – Mar 2025");
    expect(pageData.technologies).toEqual(["TypeScript"]);
    expect(pageData.links).toEqual([
      { kind: "live", label: "Preview", href: "https://example.com/demo" },
    ]);
    expect(pageData.metrics).toEqual([
      { label: "Retries", value: 0, context: "None required" },
    ]);
    expect(pageData.media).toHaveLength(1);
    expect(pageData.media[0].caption).toBeNull();
  });

  it("formats partial date ranges without inventing an ongoing state", () => {
    expect(formatProjectDateRange(null, null)).toBeNull();
    expect(formatProjectDateRange("2024", null)).toBe("2024");
    expect(formatProjectDateRange("2024-09", "2024-09")).toBe("Sep 2024");
    expect(formatProjectDateRange("bad", "2025")).toBe("2025");
  });

  it("renders an ongoing range only when the content says so", () => {
    expect(formatProjectDateRange("2026-06", "present")).toBe("Jun 2026 – Present");
    expect(formatProjectDateRange(null, "present")).toBeNull();
  });
});
