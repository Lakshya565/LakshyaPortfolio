import { describe, expect, it } from "vitest";

import { portfolioContent } from "../content/portfolio";
import { toCaseStudyPageData } from "../lib/content/case-study-normalization";
import {
  getAdjacentPublishedCaseStudies,
  getPublishedCaseStudyBySlug,
  getPublishedCaseStudyParams,
  getPublishedCaseStudyProjects,
  getPublishedProjectBySlug,
} from "../lib/content/project-queries";
import {
  buildProjectMetadata,
  getProjectCanonicalPath,
} from "../lib/metadata/project-metadata";
import type { Project } from "../types/content";

describe("project route queries", () => {
  it("emits every published case-study slug exactly once in display order", () => {
    const caseStudies = getPublishedCaseStudyProjects(portfolioContent);
    const params = getPublishedCaseStudyParams(portfolioContent);

    expect(params).toEqual(caseStudies.map(({ slug }) => ({ slug })));
    expect(new Set(params.map(({ slug }) => slug)).size).toBe(params.length);
    expect(params.map(({ slug }) => slug)).toEqual([
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
  });

  it("routes projects that previously appeared only in the archive", () => {
    expect(getPublishedProjectBySlug(portfolioContent, "backbuddy")?.title).toBe(
      "BackBuddy",
    );
    expect(getPublishedCaseStudyBySlug(portfolioContent, "backbuddy")?.slug).toBe(
      "backbuddy",
    );
    expect(getPublishedCaseStudyParams(portfolioContent)).toContainEqual({
      slug: "backbuddy",
    });
  });

  it("returns null and no static param for an unpublished project", () => {
    const draftProject = {
      ...portfolioContent.projects[0],
      publication: "draft",
    } as Project;
    const contentWithDraft = {
      projects: [draftProject, ...portfolioContent.projects.slice(1)],
    };

    expect(
      getPublishedCaseStudyBySlug(contentWithDraft, draftProject.slug),
    ).toBeNull();
    expect(getPublishedCaseStudyParams(contentWithDraft)).not.toContainEqual({
      slug: draftProject.slug,
    });
    expect(getPublishedCaseStudyBySlug(portfolioContent, "missing")).toBeNull();
  });

  it("provides deterministic adjacent case studies", () => {
    const adjacent = getAdjacentPublishedCaseStudies(portfolioContent, "repoframe");

    expect(adjacent.previous?.slug).toBe("cisco-agentic-runbook-creator");
    expect(adjacent.next?.slug).toBe("nucurrent-inventory-system");
    expect(getAdjacentPublishedCaseStudies(portfolioContent, "missing")).toEqual({
      previous: null,
      next: null,
    });
  });

  it("keeps adjacent case studies inside the project's own branch", () => {
    const neurify = getAdjacentPublishedCaseStudies(portfolioContent, "neurify");

    // Global display order would give backbuddy (Hardware) and agrisense.
    expect(neurify.previous?.slug).toBe("lucky-arduino");
    expect(neurify.previous?.workMode).toBe("hybrid");
    expect(neurify.next?.slug).toBe("agrisense");

    const firstInBranch = getAdjacentPublishedCaseStudies(
      portfolioContent,
      "quackta",
    );
    expect(firstInBranch.previous).toBeNull();

    const lastInBranch = getAdjacentPublishedCaseStudies(
      portfolioContent,
      "risenrun-wifi-alarm-clock",
    );
    expect(lastInBranch.next).toBeNull();
  });

});

describe("project metadata", () => {
  it("derives project metadata and a stable canonical path without a fake origin", () => {
    const project = getPublishedCaseStudyBySlug(portfolioContent, "repoframe");
    expect(project).not.toBeNull();

    const pageData = toCaseStudyPageData(project!);
    const metadata = buildProjectMetadata(pageData);

    expect(metadata.title).toBe("RepoFrame");
    expect(metadata.description).toBe(project!.shortDescription);
    expect(metadata.openGraph).toMatchObject({
      title: "RepoFrame",
      description: project!.shortDescription,
    });
    expect(metadata.twitter).toMatchObject({
      title: "RepoFrame",
      description: project!.shortDescription,
    });
    expect(getProjectCanonicalPath(project!.slug)).toBe("/projects/repoframe");
    expect(JSON.stringify(metadata)).not.toMatch(/localhost|127\.0\.0\.1/);
  });
});
