import { describe, expect, it } from "vitest";

import { portfolioContent } from "../content/portfolio";
import {
  getAdjacentPublishedCaseStudies,
  getPublishedArchiveProjects,
  getPublishedCaseStudyBySlug,
  getPublishedCaseStudyParams,
  getPublishedCaseStudyProjects,
  getPublishedProjectBySlug,
  getRelatedPublishedProjects,
  toProjectPageData,
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
    ]);
  });

  it("keeps published archive cards out of case-study routes", () => {
    expect(getPublishedArchiveProjects(portfolioContent)).toHaveLength(5);
    expect(getPublishedProjectBySlug(portfolioContent, "backbuddy")?.title).toBe(
      "BackBuddy",
    );
    expect(getPublishedCaseStudyBySlug(portfolioContent, "backbuddy")).toBeNull();
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

  it("provides deterministic adjacent and related work", () => {
    const adjacent = getAdjacentPublishedCaseStudies(portfolioContent, "repoframe");
    const related = getRelatedPublishedProjects(portfolioContent, "quackta", 2);

    expect(adjacent.previous?.slug).toBe("cisco-agentic-runbook-creator");
    expect(adjacent.next?.slug).toBe("nucurrent-inventory-system");
    expect(related.map(({ slug }) => slug)).toEqual([
      "lucky-arduino",
      "agrisense",
    ]);
    expect(getRelatedPublishedProjects(portfolioContent, "missing")).toEqual([]);
  });

  it("normalizes route data without exposing editorial control fields", () => {
    const project = getPublishedCaseStudyBySlug(portfolioContent, "repoframe");
    expect(project).not.toBeNull();

    const pageData = toProjectPageData(project!);

    expect(pageData.title).toBe("RepoFrame");
    expect(pageData.startDate).toBeNull();
    expect(pageData.technologies).toContain("Next.js");
    expect(pageData).not.toHaveProperty("publication");
    expect(pageData).not.toHaveProperty("contentStatus");
    expect(pageData).not.toHaveProperty("caseStudyKey");
    expect(pageData).not.toHaveProperty("metrics");
  });
});

describe("project metadata", () => {
  it("derives project metadata and a stable canonical path without a fake origin", () => {
    const project = getPublishedCaseStudyBySlug(portfolioContent, "repoframe");
    expect(project).not.toBeNull();

    const pageData = toProjectPageData(project!);
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
