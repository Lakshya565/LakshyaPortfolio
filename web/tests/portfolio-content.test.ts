import { describe, expect, it } from "vitest";

import { portfolioContent } from "../content/portfolio";
import { getPublishedProjects } from "../lib/content/project-queries";
import {
  getMdxValidationIssues,
  getPortfolioContentValidationIssues,
} from "../lib/content/validate-portfolio-content";
import type { PortfolioContent, Project } from "../types/content";

describe("portfolio content validation", () => {
  it("accepts the repository content in development mode", async () => {
    const issues = await getPortfolioContentValidationIssues(portfolioContent, {
      mode: "development",
      webRoot: process.cwd(),
    });

    expect(issues).toEqual([]);
  });

  it("keeps deferred inputs and placeholder content out of a release", async () => {
    const issues = await getPortfolioContentValidationIssues(portfolioContent, {
      mode: "release",
      webRoot: process.cwd(),
      checkFiles: false,
    });

    expect(issues.some((issue) => issue.startsWith("socialLinks."))).toBe(false);
    expect(issues).toContain(
      "projects.repoframe: content is still placeholder",
    );
  });

  it("accepts a release-ready minimal and rich content set", async () => {
    const releaseReadyContent = {
      ...portfolioContent,
      socialLinks: [
        {
          kind: "github",
          label: "GitHub",
          status: "published",
          href: "https://example.com/github",
        },
        {
          kind: "linkedin",
          label: "LinkedIn",
          status: "published",
          href: "https://example.com/linkedin",
        },
        {
          kind: "email",
          label: "Email",
          status: "published",
          href: "mailto:portfolio@example.com",
        },
      ],
      projects: portfolioContent.projects.map(
        (project) =>
          ({
            ...project,
            publication: "published",
            contentStatus: "reviewed",
            assets: project.assets.map((asset) => ({
              ...asset,
              placeholder: false,
            })),
          }) as Project,
      ),
    } satisfies PortfolioContent;

    const issues = await getPortfolioContentValidationIssues(
      releaseReadyContent,
      {
        mode: "release",
        webRoot: process.cwd(),
      },
    );

    expect(issues).toEqual([]);
  });

  it("reports duplicate project slugs", async () => {
    const duplicateProject = {
      ...portfolioContent.projects[0],
      displayOrder: 999,
    } as Project;
    const contentWithDuplicate = {
      ...portfolioContent,
      projects: [...portfolioContent.projects, duplicateProject],
    } satisfies PortfolioContent;

    const issues = await getPortfolioContentValidationIssues(
      contentWithDuplicate,
      {
        mode: "development",
        webRoot: process.cwd(),
        checkFiles: false,
      },
    );

    expect(issues).toContain(
      "projects: duplicate slug cisco-agentic-runbook-creator",
    );
  });

  it("reports missing local media", async () => {
    const projectWithMissingAsset = {
      ...portfolioContent.projects[0],
      assets: [
        {
          ...portfolioContent.projects[0].assets[0],
          path: "/media/projects/missing/asset.svg",
        },
      ],
    } as Project;
    const contentWithMissingAsset = {
      ...portfolioContent,
      projects: [projectWithMissingAsset, ...portfolioContent.projects.slice(1)],
    } satisfies PortfolioContent;

    const issues = await getPortfolioContentValidationIssues(
      contentWithMissingAsset,
      {
        mode: "development",
        webRoot: process.cwd(),
      },
    );

    expect(issues).toContain(
      "projects.cisco-agentic-runbook-creator: missing asset /media/projects/missing/asset.svg",
    );
  });

  it("rejects unsafe project URLs before file checks", async () => {
    const projectWithUnsafeLink = {
      ...portfolioContent.projects[0],
      links: [
        {
          kind: "live",
          label: "Local preview",
          href: "http://localhost:3000",
        },
      ],
    };
    const contentWithUnsafeLink = {
      ...portfolioContent,
      projects: [projectWithUnsafeLink, ...portfolioContent.projects.slice(1)],
    };

    const issues = await getPortfolioContentValidationIssues(
      contentWithUnsafeLink,
      {
        mode: "development",
        webRoot: process.cwd(),
        checkFiles: false,
      },
    );

    expect(issues).toContain("projects.0.links.0.href: must use https://");
  });

  it("excludes drafts from published project queries", () => {
    const draftProject = {
      ...portfolioContent.projects[0],
      publication: "draft",
    } as Project;
    const draftOnlyContent = { projects: [draftProject] };

    expect(getPublishedProjects(draftOnlyContent)).toEqual([]);
    expect(getPublishedProjects(portfolioContent)).toHaveLength(10);
  });
});

describe("MDX policy", () => {
  it("accepts the approved editorial component set", async () => {
    const issues = await getMdxValidationIssues(
      "## Overview\n\n<Callout>Grounded evidence.</Callout>",
      "fixture",
    );

    expect(issues).toEqual([]);
  });

  it("rejects imports, expressions, and unapproved components", async () => {
    const issues = await getMdxValidationIssues(
      [
        'import Widget from "./widget"',
        "",
        "## Overview",
        "",
        "{dangerousValue}",
        "",
        "<Widget />",
      ].join("\n"),
      "fixture",
    );

    expect(issues).toContain("fixture: imports and exports are not allowed");
    expect(issues).toContain(
      "fixture: arbitrary JavaScript expressions are not allowed",
    );
    expect(issues).toContain(
      "fixture: MDX component Widget is not allowlisted",
    );
  });
});
