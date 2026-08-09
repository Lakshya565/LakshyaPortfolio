import type { ComponentType } from "react";

import "server-only";

import type { CaseStudyKey } from "@/types/content";

type CaseStudyModule = Readonly<{
  default: ComponentType;
}>;

export const caseStudyLoaders = {
  "cisco-agentic-runbook-creator": () =>
    import("./cisco-agentic-runbook-creator.mdx"),
  repoframe: () => import("./repoframe.mdx"),
  "nucurrent-inventory-system": () =>
    import("./nucurrent-inventory-system.mdx"),
  "smartlift-sleeve": () => import("./smartlift-sleeve.mdx"),
  quackta: () => import("./quackta.mdx"),
} satisfies Record<CaseStudyKey, () => Promise<CaseStudyModule>>;

export async function loadCaseStudy(key: CaseStudyKey): Promise<ComponentType> {
  const loader = caseStudyLoaders[key];

  if (!loader) {
    throw new Error(`Unknown case-study module key: ${key}`);
  }

  const caseStudyModule = await loader();
  return caseStudyModule.default;
}
