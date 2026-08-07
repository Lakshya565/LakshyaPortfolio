import "server-only";

import { caseStudyLoaders } from "@/content/case-studies/registry";
import { portfolioContent } from "@/content/portfolio";
import { siteProfile } from "@/content/site";
import { assertValidSiteProfile } from "@/lib/content/validate-site-profile";

export function getSiteProfile() {
  assertValidSiteProfile(siteProfile);
  return siteProfile;
}

export function getContentFoundationSummary() {
  return {
    projectCount: portfolioContent.projects.length,
    caseStudyCount: Object.keys(caseStudyLoaders).length,
    archiveCount: portfolioContent.projects.filter(
      (project) => project.presentation === "archive-card",
    ).length,
  } as const;
}
