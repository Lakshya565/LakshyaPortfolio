import type { Metadata } from "next";

import type { CaseStudyPageData } from "@/lib/content/case-study-normalization";

import { getSiteOrigin } from "./site-origin";
import { getSocialImageMetadata, siteName } from "./site-metadata";

export function getProjectCanonicalPath(slug: string) {
  return `/projects/${slug}`;
}

export function buildProjectMetadata(
  project: CaseStudyPageData,
  origin: URL | null = getSiteOrigin(),
): Metadata {
  const canonical = origin
    ? new URL(getProjectCanonicalPath(project.slug), origin)
    : null;

  return {
    title: project.title,
    description: project.description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      type: "article",
      title: project.title,
      description: project.description,
      siteName,
      ...(canonical ? { url: canonical } : {}),
      ...(origin ? { images: [getSocialImageMetadata(origin)] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      ...(origin ? { images: [getSocialImageMetadata(origin)] } : {}),
    },
  };
}
