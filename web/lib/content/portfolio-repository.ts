import "server-only";

import { portfolioContent } from "@/content/portfolio";
import {
  buildAboutPageData,
  buildHomePageData,
  buildSiteShellData,
} from "@/lib/content/page-data";
import {
  getPublishedCaseStudyBySlug,
  getPublishedCaseStudyParams,
  toProjectPageData,
} from "@/lib/content/project-queries";

export function getSiteShellData() {
  return buildSiteShellData(portfolioContent);
}

export function getHomePageData() {
  return buildHomePageData(portfolioContent);
}

export function getAboutPageData() {
  return buildAboutPageData(portfolioContent);
}

export function getStaticProjectParams() {
  return getPublishedCaseStudyParams(portfolioContent);
}

export function getProjectRouteData(slug: string) {
  const project = getPublishedCaseStudyBySlug(portfolioContent, slug);

  if (!project) {
    return null;
  }

  return {
    pageData: toProjectPageData(project),
    caseStudyKey: project.caseStudyKey,
  } as const;
}
