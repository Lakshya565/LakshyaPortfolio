import type { Metadata } from "next";

import type { ProjectPageData } from "@/lib/content/project-queries";

export function getProjectCanonicalPath(slug: string) {
  return `/projects/${slug}`;
}

export function buildProjectMetadata(project: ProjectPageData): Metadata {
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      type: "article",
      title: project.title,
      description: project.description,
      siteName: "Lakshya Agarwal",
    },
    twitter: {
      card: "summary",
      title: project.title,
      description: project.description,
    },
  };
}
