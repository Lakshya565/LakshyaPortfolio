import { compile } from "@mdx-js/mdx";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { portfolioContentSchema } from "@/lib/content/content-schema";
import type { PortfolioContent, Project } from "@/types/content";

export type ContentValidationMode = "development" | "release";

type ValidationOptions = Readonly<{
  mode: ContentValidationMode;
  webRoot: string;
  checkFiles?: boolean;
}>;

type MdxNode = Readonly<{
  type: string;
  name?: string | null;
  children?: readonly MdxNode[];
}>;

const allowedMdxComponents = new Set(["Callout", "Comparison", "Figure"]);

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

function getMdxPolicyPlugin(label: string, issues: string[]) {
  return () => (tree: MdxNode) => {
    const visit = (node: MdxNode) => {
      if (node.type === "mdxjsEsm") {
        issues.push(`${label}: imports and exports are not allowed`);
      }

      if (
        node.type === "mdxFlowExpression" ||
        node.type === "mdxTextExpression"
      ) {
        issues.push(`${label}: arbitrary JavaScript expressions are not allowed`);
      }

      if (
        node.type === "mdxJsxFlowElement" ||
        node.type === "mdxJsxTextElement"
      ) {
        if (!node.name || !allowedMdxComponents.has(node.name)) {
          issues.push(
            `${label}: MDX component ${node.name ?? "fragment"} is not allowlisted`,
          );
        }
      }

      node.children?.forEach(visit);
    };

    visit(tree);
  };
}

export async function getMdxValidationIssues(source: string, label: string) {
  const issues: string[] = [];

  try {
    await compile(source, {
      remarkPlugins: [getMdxPolicyPlugin(label, issues)],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    issues.push(`${label}: failed to compile MDX (${message})`);
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
    if (
      project.presentation === "case-study" &&
      project.caseStudyKey !== project.slug
    ) {
      issues.push(
        `projects.${project.slug}: caseStudyKey must match the stable project slug`,
      );
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

  for (const project of content.projects) {
    for (const asset of project.assets) {
      const relativePath = asset.path.slice(1).split("/").join(path.sep);
      const assetPath = path.resolve(publicRoot, relativePath);

      if (!assetPath.startsWith(`${publicRoot}${path.sep}`)) {
        issues.push(`projects.${project.slug}: asset escapes the public directory`);
      } else if (!(await pathExists(assetPath))) {
        issues.push(`projects.${project.slug}: missing asset ${asset.path}`);
      }
    }

    if (project.presentation === "case-study") {
      const fileName = `${project.caseStudyKey}.mdx`;
      const filePath = path.join(caseStudyRoot, fileName);
      referencedCaseStudies.add(fileName);

      if (!(await pathExists(filePath))) {
        issues.push(`projects.${project.slug}: missing case study ${fileName}`);
      } else {
        issues.push(...(await validateMdxFile(filePath, `projects.${project.slug}`)));
      }
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
    ...findDuplicateValues(parsedContent.socialLinks, (link) => link.kind).map(
      (kind) => `socialLinks: duplicate kind ${kind}`,
    ),
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
