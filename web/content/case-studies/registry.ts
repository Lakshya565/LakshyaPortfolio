import type { ComponentType } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";

import "server-only";

import { analyzeMdxSource } from "@/lib/content/mdx-policy";
import type { CaseStudyKey } from "@/types/content";

type CaseStudyModule = Readonly<{
  default: ComponentType;
}>;

type CaseStudyRegistryEntry = Readonly<{
  fileName: `${CaseStudyKey}.mdx`;
  load: () => Promise<CaseStudyModule>;
}>;

const caseStudyRegistry = {
  "cisco-agentic-runbook-creator": {
    fileName: "cisco-agentic-runbook-creator.mdx",
    load: () => import("./cisco-agentic-runbook-creator.mdx"),
  },
  repoframe: {
    fileName: "repoframe.mdx",
    load: () => import("./repoframe.mdx"),
  },
  "nucurrent-inventory-system": {
    fileName: "nucurrent-inventory-system.mdx",
    load: () => import("./nucurrent-inventory-system.mdx"),
  },
  "smartlift-sleeve": {
    fileName: "smartlift-sleeve.mdx",
    load: () => import("./smartlift-sleeve.mdx"),
  },
  quackta: {
    fileName: "quackta.mdx",
    load: () => import("./quackta.mdx"),
  },
  "lucky-arduino": {
    fileName: "lucky-arduino.mdx",
    load: () => import("./lucky-arduino.mdx"),
  },
  backbuddy: {
    fileName: "backbuddy.mdx",
    load: () => import("./backbuddy.mdx"),
  },
  neurify: {
    fileName: "neurify.mdx",
    load: () => import("./neurify.mdx"),
  },
  agrisense: {
    fileName: "agrisense.mdx",
    load: () => import("./agrisense.mdx"),
  },
  "risenrun-wifi-alarm-clock": {
    fileName: "risenrun-wifi-alarm-clock.mdx",
    load: () => import("./risenrun-wifi-alarm-clock.mdx"),
  },
} satisfies Record<CaseStudyKey, CaseStudyRegistryEntry>;

export async function loadCaseStudyDocument(key: CaseStudyKey) {
  const entry = caseStudyRegistry[key];

  if (!entry) {
    throw new Error(`Unknown case-study module key: ${key}`);
  }

  const sourcePath = path.join(
    process.cwd(),
    "content",
    "case-studies",
    entry.fileName,
  );
  const [caseStudyModule, source] = await Promise.all([
    entry.load(),
    readFile(sourcePath, "utf8"),
  ]);
  const analysis = await analyzeMdxSource(source);

  if (analysis.issues.length > 0) {
    throw new Error(
      `Invalid case study ${key}:\n- ${analysis.issues.join("\n- ")}`,
    );
  }

  return {
    Content: caseStudyModule.default,
    outline: analysis.outline,
  } as const;
}
