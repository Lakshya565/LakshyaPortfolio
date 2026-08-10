import { describe, expect, it } from "vitest";

import { portfolioContent } from "../content/portfolio";
import { getPublishedProjects } from "../lib/content/project-queries";
import {
  getMdxValidationIssues,
  getPortfolioContentValidationIssues,
  resolveContentValidationMode,
} from "../lib/content/validate-portfolio-content";
import type { PortfolioContent, Project } from "../types/content";

const ciscoFixtureAsset = {
  kind: "diagram" as const,
  path: "/media/projects/cisco-agentic-runbook-creator/system-fixture.svg",
  alt: "Representative system diagram",
  width: 1200,
  height: 675,
  placeholder: false,
};

const repoFrameFixtureAssets = [
  {
    ...ciscoFixtureAsset,
    path: "/media/projects/repoframe/architecture-fixture.svg",
    alt: "Representative architecture diagram",
  },
  {
    ...ciscoFixtureAsset,
    kind: "screenshot" as const,
    path: "/media/projects/repoframe/profile-fixture.svg",
    alt: "Representative profile screen",
  },
];

describe("portfolio content validation", () => {
  it("forces release validation for an explicit flag or configured site origin", () => {
    expect(
      resolveContentValidationMode({
        commandLineArguments: ["node", "validate-content.ts"],
        siteOrigin: undefined,
      }),
    ).toBe("development");
    expect(
      resolveContentValidationMode({
        commandLineArguments: ["node", "validate-content.ts", "--release"],
        siteOrigin: undefined,
      }),
    ).toBe("release");
    expect(
      resolveContentValidationMode({
        commandLineArguments: ["node", "validate-content.ts"],
        siteOrigin: " https://portfolio.example.com ",
      }),
    ).toBe("release");
  });

  it("accepts the repository content in development mode", async () => {
    const issues = await getPortfolioContentValidationIssues(portfolioContent, {
      mode: "development",
      webRoot: process.cwd(),
    });

    expect(issues).toEqual([]);
  });

  it("rejects third-person narrator language in structured public prose", async () => {
    const content = {
      ...portfolioContent,
      aboutItems: portfolioContent.aboutItems.map((item, index) =>
        index === 0
          ? { ...item, body: "Lakshya writes about his engineering work from a distance instead of speaking in his own voice." }
          : item,
      ),
    } satisfies PortfolioContent;

    const issues = await getPortfolioContentValidationIssues(content, {
      mode: "development",
      webRoot: process.cwd(),
      checkFiles: false,
    });

    expect(issues).toContain(
      'aboutItems.Computer Engineering at UIUC.body: third-person narrator term "lakshya" is not allowed',
    );
    expect(issues).toContain(
      'aboutItems.Computer Engineering at UIUC.body: third-person narrator term "his" is not allowed',
    );
  });

  it("keeps relationship wording symbolic in public content", () => {
    expect(JSON.stringify(portfolioContent).toLowerCase()).not.toContain(
      "girlfriend",
    );
  });

  it("fails build-time validation when a desk motif is missing", async () => {
    const content = {
      ...portfolioContent,
      personalMotifs: portfolioContent.personalMotifs.filter(
        ({ key }) => key !== "anime",
      ),
    } satisfies PortfolioContent;

    const issues = await getPortfolioContentValidationIssues(content, {
      mode: "development",
      webRoot: process.cwd(),
      checkFiles: false,
    });

    expect(issues).toContain("deskHotspots.anime: missing motif anime");
  });

  it("accepts the repository content in release mode", async () => {
    const issues = await getPortfolioContentValidationIssues(portfolioContent, {
      mode: "release",
      webRoot: process.cwd(),
      checkFiles: false,
    });

    expect(issues).toEqual([]);
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
            assets: [],
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

  it("reports one actionable release issue per placeholder asset", async () => {
    const projects = portfolioContent.projects.map(
      (project) =>
        ({
          ...project,
          contentStatus: "reviewed",
          assets:
            project.slug === "cisco-agentic-runbook-creator"
              ? [{ ...ciscoFixtureAsset, placeholder: true }]
              : [],
        }) as Project,
    );
    const issues = await getPortfolioContentValidationIssues(
      { ...portfolioContent, projects } satisfies PortfolioContent,
      {
        mode: "release",
        webRoot: process.cwd(),
        checkFiles: false,
      },
    );

    expect(
      issues.filter((issue) =>
        issue.includes("cisco-agentic-runbook-creator/system-fixture.svg"),
      ),
    ).toEqual([
      "projects.cisco-agentic-runbook-creator: placeholder asset /media/projects/cisco-agentic-runbook-creator/system-fixture.svg is not release-ready",
    ]);
  });

  it("rejects a placeholder filename even when its flag is cleared", async () => {
    const projects = portfolioContent.projects.map(
      (project) =>
        ({
          ...project,
          contentStatus: "reviewed",
          assets:
            project.slug === "cisco-agentic-runbook-creator"
              ? [
                  {
                    ...ciscoFixtureAsset,
                    path: "/media/projects/cisco-agentic-runbook-creator/system-placeholder.svg",
                  },
                ]
              : [],
        }) as Project,
    );
    const issues = await getPortfolioContentValidationIssues(
      { ...portfolioContent, projects } satisfies PortfolioContent,
      {
        mode: "release",
        webRoot: process.cwd(),
        checkFiles: false,
      },
    );

    expect(issues).toContain(
      "projects.cisco-agentic-runbook-creator: placeholder-named asset /media/projects/cisco-agentic-runbook-creator/system-placeholder.svg is not release-ready",
    );
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
          ...ciscoFixtureAsset,
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

  it("requires media to stay in its project's namespace", async () => {
    const projectWithCrossProjectAsset = {
      ...portfolioContent.projects[0],
      assets: [repoFrameFixtureAssets[0]],
    } as Project;
    const content = {
      ...portfolioContent,
      projects: [
        projectWithCrossProjectAsset,
        ...portfolioContent.projects.slice(1),
      ],
    } satisfies PortfolioContent;

    const issues = await getPortfolioContentValidationIssues(content, {
      mode: "development",
      webRoot: process.cwd(),
      checkFiles: false,
    });

    expect(issues).toContain(
      "projects.cisco-agentic-runbook-creator: asset must live in its project media directory (/media/projects/repoframe/architecture-fixture.svg)",
    );
  });

  it("requires every video thumbnail to be explicitly assigned", async () => {
    const projectWithOrphanThumbnail = {
      ...portfolioContent.projects[1],
      assets: [
        {
          ...repoFrameFixtureAssets[0],
          kind: "video-thumbnail",
        },
      ],
      videos: [],
    } as Project;
    const content = {
      ...portfolioContent,
      projects: [portfolioContent.projects[0], projectWithOrphanThumbnail],
    } satisfies PortfolioContent;

    const issues = await getPortfolioContentValidationIssues(content, {
      mode: "development",
      webRoot: process.cwd(),
      checkFiles: false,
    });

    expect(issues).toContain(
      "projects.repoframe: video-thumbnail asset is not assigned to a video (/media/projects/repoframe/architecture-fixture.svg)",
    );
  });

  it("accepts multiple videos with independently assigned thumbnails", async () => {
    const projectWithVideos = {
      ...portfolioContent.projects[1],
      assets: repoFrameFixtureAssets.map((asset, index) => ({
        ...asset,
        kind: index < 2 ? ("video-thumbnail" as const) : asset.kind,
      })),
      videos: [
        {
          label: "Architecture tour",
          href: "https://example.com/architecture",
          thumbnailPath: repoFrameFixtureAssets[0].path,
        },
        {
          label: "Profile walkthrough",
          href: "https://example.com/profile",
          thumbnailPath: repoFrameFixtureAssets[1].path,
        },
        {
          label: "Audit walkthrough",
          href: "https://example.com/audit",
        },
      ],
    } as Project;
    const content = {
      ...portfolioContent,
      projects: portfolioContent.projects.map((project) =>
        project.slug === "repoframe" ? projectWithVideos : project,
      ),
    } satisfies PortfolioContent;

    const issues = await getPortfolioContentValidationIssues(content, {
      mode: "development",
      webRoot: process.cwd(),
      checkFiles: false,
    });

    expect(issues).toEqual([]);
  });

  it("rejects unsupported media extensions", async () => {
    const projectWithUnsupportedMedia = {
      ...portfolioContent.projects[0],
      assets: [
        {
          ...ciscoFixtureAsset,
          path: "/media/projects/cisco-agentic-runbook-creator/payload.html",
        },
      ],
    };

    const issues = await getPortfolioContentValidationIssues(
      {
        ...portfolioContent,
        projects: [
          projectWithUnsupportedMedia,
          ...portfolioContent.projects.slice(1),
        ],
      },
      {
        mode: "development",
        webRoot: process.cwd(),
        checkFiles: false,
      },
    );

    expect(issues).toContain(
      "projects.0.assets.0.path: must be a lowercase /media/projects/... path with a supported image extension",
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

  it("rejects a third-person narrator in MDX prose", async () => {
    const issues = await getMdxValidationIssues(
      "## Overview\n\nHe built the system and documented his decisions.",
      "fixture",
    );

    expect(issues).toContain(
      'fixture: third-person narrator term "he" is not allowed',
    );
    expect(issues).toContain(
      'fixture: third-person narrator term "his" is not allowed',
    );
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

  it("rejects raw HTML and all custom-component props", async () => {
    const issues = await getMdxValidationIssues(
      [
        "## Overview",
        "",
        "<div>Raw HTML-shaped JSX</div>",
        "",
        "<Callout tone={process.env.SECRET}>Unsafe</Callout>",
      ].join("\n"),
      "fixture",
    );

    expect(issues).toContain("fixture: MDX component div is not allowlisted");
    expect(issues).toContain("fixture: MDX component Callout cannot receive props");
    expect(issues).toContain(
      "fixture: arbitrary JavaScript expressions are not allowed",
    );
  });

  it("rejects unsafe protocols and Markdown images", async () => {
    const issues = await getMdxValidationIssues(
      [
        "## Overview",
        "",
        "[Unsafe](javascript:alert(1))",
        "",
        "![Remote bypass](https://example.com/image.png)",
      ].join("\n"),
      "fixture",
    );

    expect(issues).toContain(
      "fixture: unsafe link protocol in javascript:alert(1)",
    );
    expect(issues).toContain(
      "fixture: Markdown images are not allowed; use manifest media instead",
    );
  });

  it("accepts safe links and derives stable heading anchors", async () => {
    const issues = await getMdxValidationIssues(
      [
        "## Technical approach",
        "",
        "[Internal](/about) and [external](https://example.com).",
        "",
        "### Tradeoffs & constraints",
      ].join("\n"),
      "fixture",
    );

    expect(issues).toEqual([]);
  });

  it("rejects invalid heading levels, formatted headings, and duplicate anchors", async () => {
    const issues = await getMdxValidationIssues(
      ["# Extra title", "", "## Repeat!", "", "## Repeat", "", "### **Formatted**"].join(
        "\n",
      ),
      "fixture",
    );

    expect(issues).toContain(
      "fixture: case-study headings must use level 2 or level 3",
    );
    expect(issues).toContain("fixture: duplicate heading anchor repeat");
    expect(issues).toContain(
      "fixture: case-study headings must contain plain text",
    );
  });
});
