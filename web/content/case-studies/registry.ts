import type { ComponentType } from "react";

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

