import { compile } from "@mdx-js/mdx";

import {
  createHeadingAnchor,
  type CaseStudyOutlineItem,
} from "./heading-anchors";
import { isSafeEditorialHref } from "./editorial-links";

type MdxAttribute = Readonly<{
  type: string;
  value?: unknown;
}>;

type MdxNode = Readonly<{
  type: string;
  depth?: number;
  name?: string | null;
  url?: string;
  value?: string;
  attributes?: readonly MdxAttribute[];
  children?: readonly MdxNode[];
}>;

type MdxAnalysis = Readonly<{
  issues: readonly string[];
  outline: readonly CaseStudyOutlineItem[];
}>;

const allowedMdxComponents = new Set(["Callout"]);

function getPlainHeadingLabel(node: MdxNode): string | null {
  if (!node.children?.length) {
    return null;
  }

  if (node.children.some((child) => child.type !== "text")) {
    return null;
  }

  const label = node.children.map((child) => child.value ?? "").join("").trim();
  return label || null;
}

function analyzeMdxTree(tree: MdxNode): MdxAnalysis {
  const issues: string[] = [];
  const outline: CaseStudyOutlineItem[] = [];
  const anchors = new Set<string>();
  let previousHeadingDepth: 2 | 3 | null = null;

  const visit = (node: MdxNode) => {
    if (node.type === "mdxjsEsm") {
      issues.push("imports and exports are not allowed");
    }

    if (
      node.type === "mdxFlowExpression" ||
      node.type === "mdxTextExpression" ||
      node.type === "mdxJsxAttributeValueExpression" ||
      node.type === "mdxJsxExpressionAttribute"
    ) {
      issues.push("arbitrary JavaScript expressions are not allowed");
    }

    if (node.type === "html") {
      issues.push("raw HTML is not allowed");
    }

    if (node.type === "image" || node.type === "imageReference") {
      issues.push("Markdown images are not allowed; use manifest media instead");
    }

    if (
      (node.type === "link" || node.type === "definition") &&
      node.url &&
      !isSafeEditorialHref(node.url)
    ) {
      issues.push(`unsafe link protocol in ${node.url}`);
    }

    if (
      node.type === "mdxJsxFlowElement" ||
      node.type === "mdxJsxTextElement"
    ) {
      if (!node.name || !allowedMdxComponents.has(node.name)) {
        issues.push(
          `MDX component ${node.name ?? "fragment"} is not allowlisted`,
        );
      }

      if (node.attributes?.length) {
        issues.push(`MDX component ${node.name ?? "fragment"} cannot receive props`);

        if (
          node.attributes.some(
            (attribute) =>
              attribute.type === "mdxJsxExpressionAttribute" ||
              (attribute.value !== null &&
                attribute.value !== undefined &&
                typeof attribute.value !== "string"),
          )
        ) {
          issues.push("arbitrary JavaScript expressions are not allowed");
        }
      }
    }

    if (node.type === "heading") {
      if (node.depth !== 2 && node.depth !== 3) {
        issues.push("case-study headings must use level 2 or level 3");
      } else {
        const depth = node.depth;
        const label = getPlainHeadingLabel(node);

        if (!label) {
          issues.push("case-study headings must contain plain text");
        } else {
          const id = createHeadingAnchor(label);

          if (!id) {
            issues.push(`heading \"${label}\" does not produce a usable anchor`);
          } else if (anchors.has(id)) {
            issues.push(`duplicate heading anchor ${id}`);
          } else {
            anchors.add(id);
            outline.push({ depth, id, label });
          }
        }

        if (depth === 3 && previousHeadingDepth === null) {
          issues.push("a level 3 heading cannot appear before a level 2 heading");
        }

        previousHeadingDepth = depth;
      }
    }

    node.children?.forEach(visit);
  };

  visit(tree);
  return { issues, outline };
}

export function remarkMdxPolicy() {
  return (tree: MdxNode) => {
    const { issues } = analyzeMdxTree(tree);

    if (issues.length > 0) {
      throw new Error(`Unsupported MDX:\n- ${issues.join("\n- ")}`);
    }
  };
}

export async function analyzeMdxSource(source: string): Promise<MdxAnalysis> {
  let analysis: MdxAnalysis = { issues: [], outline: [] };

  try {
    await compile(source, {
      remarkPlugins: [
        () => (tree: MdxNode) => {
          analysis = analyzeMdxTree(tree);
        },
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { issues: [`failed to compile MDX (${message})`], outline: [] };
  }

  return analysis;
}
