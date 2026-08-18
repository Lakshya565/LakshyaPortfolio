import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

import { portfolioContentSchema } from "@/lib/content/content-schema";
import { analyzeMdxSource } from "@/lib/content/mdx-policy";
import {
  deskHotspotDefinitions,
  getDeskHotspotIssues,
} from "@/lib/desk/hotspots";
import type { PortfolioContent, Project } from "@/types/content";

export type ContentValidationMode = "development" | "release";

export function resolveContentValidationMode({
  commandLineArguments,
  siteOrigin,
}: Readonly<{
  commandLineArguments: readonly string[];
  siteOrigin: string | null | undefined;
}>): ContentValidationMode {
  return commandLineArguments.includes("--release") || siteOrigin?.trim()
    ? "release"
    : "development";
}

type ValidationOptions = Readonly<{
  mode: ContentValidationMode;
  webRoot: string;
  checkFiles?: boolean;
}>;

function findDuplicateValues<T>(
  items: readonly T[],
  getValue: (item: T) => string | number,
): readonly (string | number)[] {
  const seen = new Set<string | number>();
  const duplicates = new Set<string | number>();

  for (const item of items) {
    const value = getValue(item);

    if (seen.has(value)) {
      duplicates.add(value);
    }

    seen.add(value);
  }

  return [...duplicates];
}

export async function getMdxValidationIssues(source: string, label: string) {
  const { issues } = await analyzeMdxSource(source);
  return [
    ...issues.map((issue) => `${label}: ${issue}`),
    ...getFirstPersonVoiceIssues(stripExcludedMdxText(source), label),
  ];
}

function stripExcludedMdxText(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/^>.*$/gm, "")
    .replace(/\]\([^)]*\)/g, "]");
}

function getFirstPersonVoiceIssues(value: string, label: string) {
  const narratorTerms = value.match(/\b(?:Lakshya|he|his)\b/gi) ?? [];
  const uniqueTerms = [...new Set(narratorTerms.map((term) => term.toLowerCase()))];

  return uniqueTerms.map(
    (term) => `${label}: third-person narrator term "${term}" is not allowed`,
  );
}

function getNarrativeVoiceIssues(content: PortfolioContent) {
  const issues = [
    ...getFirstPersonVoiceIssues(
      content.siteProfile.headline,
      "siteProfile.headline",
    ),
    ...getFirstPersonVoiceIssues(
      content.siteProfile.shortIntro,
      "siteProfile.shortIntro",
    ),
  ];

  for (const project of content.projects) {
    issues.push(
      ...getFirstPersonVoiceIssues(
        project.shortDescription,
        `projects.${project.slug}.shortDescription`,
      ),
    );
  }

  for (const item of content.aboutItems) {
    issues.push(
      ...getFirstPersonVoiceIssues(item.body, `aboutItems.${item.title}.body`),
    );
  }

  for (const motif of content.personalMotifs) {
    issues.push(
      ...getFirstPersonVoiceIssues(
        motif.detail,
        `personalMotifs.${motif.key}.detail`,
      ),
    );
  }

  return issues;
}

async function validateMdxFile(filePath: string, label: string) {
  try {
    const source = await readFile(filePath, "utf8");
    return await getMdxValidationIssues(source, label);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [`${label}: failed to read MDX (${message})`];
  }
}

async function pathExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getProjectCrossRecordIssues(projects: readonly Project[]) {
  const issues: string[] = [];

  for (const slug of findDuplicateValues(projects, (project) => project.slug)) {
    issues.push(`projects: duplicate slug ${slug}`);
  }

  for (const order of findDuplicateValues(
    projects,
    (project) => project.displayOrder,
  )) {
    issues.push(`projects: duplicate displayOrder ${order}`);
  }

  for (const project of projects) {
    const assetPaths = findDuplicateValues(project.assets, (asset) => asset.path);
    for (const assetPath of assetPaths) {
      issues.push(`projects.${project.slug}: duplicate asset path ${assetPath}`);
    }

    for (const asset of project.assets) {
      if (!asset.path.startsWith(`/media/projects/${project.slug}/`)) {
        issues.push(
          `projects.${project.slug}: asset must live in its project media directory (${asset.path})`,
        );
      }
    }

    if (project.assets.filter((asset) => asset.kind === "hero").length > 1) {
      issues.push(`projects.${project.slug}: at most one hero asset is allowed`);
    }

    const duplicateVideoUrls = findDuplicateValues(
      project.videos,
      (video) => video.href,
    );
    for (const href of duplicateVideoUrls) {
      issues.push(`projects.${project.slug}: duplicate video URL ${href}`);
    }

    const referencedThumbnailPaths = project.videos.flatMap((video) =>
      video.thumbnailPath ? [video.thumbnailPath] : [],
    );
    for (const thumbnailPath of findDuplicateValues(
      referencedThumbnailPaths,
      (value) => value,
    )) {
      issues.push(
        `projects.${project.slug}: video thumbnail ${thumbnailPath} is referenced more than once`,
      );
    }

    for (const video of project.videos) {
      if (!video.thumbnailPath) {
        continue;
      }

      const thumbnail = project.assets.find(
        (asset) => asset.path === video.thumbnailPath,
      );
      if (!thumbnail) {
        issues.push(
          `projects.${project.slug}: video thumbnail is missing from assets (${video.thumbnailPath})`,
        );
      } else if (thumbnail.kind !== "video-thumbnail") {
        issues.push(
          `projects.${project.slug}: video thumbnail asset must use kind video-thumbnail (${video.thumbnailPath})`,
        );
      }
    }

    const referencedThumbnailSet = new Set(referencedThumbnailPaths);
    for (const asset of project.assets) {
      if (
        asset.kind === "video-thumbnail" &&
        !referencedThumbnailSet.has(asset.path)
      ) {
        issues.push(
          `projects.${project.slug}: video-thumbnail asset is not assigned to a video (${asset.path})`,
        );
      }
    }
  }

  return issues;
}

function getReleaseIssues(content: PortfolioContent) {
  const issues: string[] = [];

  for (const link of content.socialLinks) {
    if (link.status === "pending") {
      issues.push(`socialLinks.${link.kind}: ${link.requestedInput} is still pending`);
    }
  }

  for (const project of content.projects) {
    if (project.publication !== "published") {
      issues.push(`projects.${project.slug}: initial-launch project is still draft`);
    }

    if (project.contentStatus !== "reviewed") {
      issues.push(`projects.${project.slug}: content is still placeholder`);
    }

    for (const asset of project.assets) {
      if (asset.placeholder) {
        issues.push(
          `projects.${project.slug}: placeholder asset ${asset.path} is not release-ready`,
        );
      } else if (asset.path.toLowerCase().includes("placeholder")) {
        issues.push(
          `projects.${project.slug}: placeholder-named asset ${asset.path} is not release-ready`,
        );
      }
    }
  }

  return issues;
}

async function getFileIssues(content: PortfolioContent, webRoot: string) {
  const issues: string[] = [];
  const publicRoot = path.resolve(webRoot, "public");
  const caseStudyRoot = path.resolve(webRoot, "content", "case-studies");
  const referencedCaseStudies = new Set<string>();
  /**
   * The generated scene. This used to validate `lakshya-desk.svg`, the original
   * hand-authored asset that was rejected three rebuilds ago and is no longer
   * rendered anywhere — so the check passed on a file the site does not use, and
   * only surfaced when new hotspot keys appeared that the dead file lacked.
   */
  const deskSvgPath = path.resolve(
    publicRoot,
    "media",
    "site",
    "lakshya-desk-v2.svg",
  );

  try {
    const [deskSvg, deskSvgStats] = await Promise.all([
      readFile(deskSvgPath, "utf8"),
      stat(deskSvgPath),
    ]);
    // Objects are addressed by `data-object`, not by id: placement is derived
    // from the same scene data the artwork is generated from, so there are no
    // id strings for the two to disagree about.
    const deskObjectKeys = [...deskSvg.matchAll(/\sdata-object="([^"]+)"/g)].map(
      (match) => match[1],
    );

    if (!deskSvgStats.isFile()) {
      issues.push("desk: public desk SVG is not a file");
    }
    if (deskSvgStats.size > 250_000) {
      issues.push("desk: public desk SVG exceeds 250 KB");
    }
    if (!/\bviewBox="[-\d. ]+"/.test(deskSvg)) {
      issues.push("desk: public desk SVG must declare a viewBox");
    }
    for (const { key } of deskHotspotDefinitions) {
      if (!deskObjectKeys.includes(key)) {
        issues.push(`desk: public desk SVG is missing object ${key}`);
      }
    }
    for (const duplicateKey of findDuplicateValues(
      deskObjectKeys,
      (value) => value,
    )) {
      issues.push(`desk: public desk SVG has duplicate object ${duplicateKey}`);
    }
    if (
      /<(?:script|foreignObject|filter|animate|animateMotion|animateTransform)\b/i.test(
        deskSvg,
      )
    ) {
      issues.push("desk: public desk SVG contains active or unsupported elements");
    }
    if (/\son[a-z]+\s*=/i.test(deskSvg)) {
      issues.push("desk: public desk SVG contains an event handler");
    }
    if (
      /(?:href|xlink:href)\s*=\s*["'](?:https?:|\/\/|data:|javascript:)/i.test(
        deskSvg,
      )
    ) {
      issues.push("desk: public desk SVG contains an external or executable reference");
    }
  } catch {
    issues.push(
      "desk: missing public desk SVG /media/site/lakshya-desk-v2.svg — run `npm run generate:desk`",
    );
  }

  // A resume link that 404s is worse than no resume link, and it is the one
  // href in the content that names a file this repository is supposed to own.
  for (const link of content.socialLinks) {
    if (link.kind !== "resume" || link.status !== "published") {
      continue;
    }

    const resumePath = path.resolve(publicRoot, link.href.replace(/^\//, ""));

    if (!resumePath.startsWith(`${publicRoot}${path.sep}`)) {
      issues.push("socialLinks.resume: href escapes the public directory");
    } else if (!(await pathExists(resumePath))) {
      issues.push(`socialLinks.resume: missing public file ${link.href}`);
    }
  }

  for (const project of content.projects) {
    for (const asset of project.assets) {
      const relativePath = asset.path.slice(1).split("/").join(path.sep);
      const assetPath = path.resolve(publicRoot, relativePath);

      if (!assetPath.startsWith(`${publicRoot}${path.sep}`)) {
        issues.push(`projects.${project.slug}: asset escapes the public directory`);
      } else {
        try {
          if (!(await stat(assetPath)).isFile()) {
            issues.push(`projects.${project.slug}: asset is not a file ${asset.path}`);
          }
        } catch {
          issues.push(`projects.${project.slug}: missing asset ${asset.path}`);
        }
      }
    }

    const fileName = `${project.slug}.mdx`;
    const filePath = path.join(caseStudyRoot, fileName);
    referencedCaseStudies.add(fileName);

    if (!(await pathExists(filePath))) {
      issues.push(`projects.${project.slug}: missing case study ${fileName}`);
    } else {
      issues.push(...(await validateMdxFile(filePath, `projects.${project.slug}`)));
    }
  }

  const existingCaseStudies = (await readdir(caseStudyRoot)).filter((fileName) =>
    fileName.endsWith(".mdx"),
  );

  for (const fileName of existingCaseStudies) {
    if (!referencedCaseStudies.has(fileName)) {
      issues.push(`caseStudies: unreferenced MDX file ${fileName}`);
    }
  }

  const aboutPath = path.resolve(webRoot, "content", "about.mdx");
  if (!(await pathExists(aboutPath))) {
    issues.push("about: missing content/about.mdx");
  } else {
    issues.push(...(await validateMdxFile(aboutPath, "about")));
  }

  return issues;
}

export async function getPortfolioContentValidationIssues(
  content: unknown,
  options: ValidationOptions,
): Promise<readonly string[]> {
  const result = portfolioContentSchema.safeParse(content);

  if (!result.success) {
    return result.error.issues.map(
      (issue) => `${issue.path.join(".") || "content"}: ${issue.message}`,
    );
  }

  const parsedContent = result.data as PortfolioContent;
  const issues = [
    ...getProjectCrossRecordIssues(parsedContent.projects),
    ...getDeskHotspotIssues(parsedContent.personalMotifs),
    ...getNarrativeVoiceIssues(parsedContent),
    ...findDuplicateValues(parsedContent.socialLinks, (link) => link.kind).map(
      (kind) => `socialLinks: duplicate kind ${kind}`,
    ),
    ...findDuplicateValues(parsedContent.personalMotifs, (motif) => motif.key).map(
      (key) => `personalMotifs: duplicate key ${key}`,
    ),
    ...findDuplicateValues(
      parsedContent.personalMotifs,
      (motif) => motif.displayOrder,
    ).map((order) => `personalMotifs: duplicate displayOrder ${order}`),
  ];

  if (options.mode === "release") {
    issues.push(...getReleaseIssues(parsedContent));
  }

  if (options.checkFiles ?? true) {
    issues.push(...(await getFileIssues(parsedContent, options.webRoot)));
  }

  return issues;
}

export async function assertValidPortfolioContent(
  content: unknown,
  options: ValidationOptions,
): Promise<void> {
  const issues = await getPortfolioContentValidationIssues(content, options);

  if (issues.length > 0) {
    throw new Error(`Invalid portfolio content:\n- ${issues.join("\n- ")}`);
  }
}
