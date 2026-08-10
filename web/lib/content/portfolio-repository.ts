import "server-only";

import { portfolioContent } from "@/content/portfolio";
import {
  buildAboutPageData,
  buildHomePageData,
  buildSiteShellData,
  buildWorkPageData,
} from "@/lib/content/page-data";
import {
  toCaseStudyNavigationItem,
  toCaseStudyPageData,
} from "@/lib/content/case-study-normalization";
import {
  getAdjacentPublishedCaseStudies,
  getPublishedCaseStudyBySlug,
  getPublishedCaseStudyParams,
} from "@/lib/content/project-queries";

export function getSiteShellData() {
  return buildSiteShellData(portfolioContent);
}

export function getHomePageData() {
  return buildHomePageData(portfolioContent);
}

export function getWorkPageData() {
  return buildWorkPageData(portfolioContent);
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

  const adjacent = getAdjacentPublishedCaseStudies(portfolioContent, slug);

  return {
    pageData: toCaseStudyPageData(project),
    caseStudyKey: project.caseStudyKey,
    navigation: {
      previous: adjacent.previous
        ? toCaseStudyNavigationItem(adjacent.previous)
        : null,
      next: adjacent.next ? toCaseStudyNavigationItem(adjacent.next) : null,
    },
  } as const;
}
