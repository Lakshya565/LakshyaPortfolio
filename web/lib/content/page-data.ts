import {
  getPublishedArchiveProjects,
  getPublishedCaseStudyProjects,
  getPublishedSocialLinks,
} from "@/lib/content/project-queries";
import type {
  AboutItem,
  PortfolioContent,
  Project,
  ProjectAccentToken,
  ProjectCategory,
  SkillGroup,
  SocialLinkKind,
} from "@/types/content";

export type SocialLinkData = Readonly<{
  kind: SocialLinkKind;
  label: string;
  href: string;
}>;

export type ProjectSummaryData = Readonly<{
  slug: string;
  title: string;
  category: ProjectCategory;
  description: string;
  role: string;
  technologies: readonly string[];
  accent: ProjectAccentToken;
  href: string | null;
}>;

export type SiteShellData = Readonly<{
  name: string;
  socialLinks: readonly SocialLinkData[];
}>;

export type HomePageData = Readonly<{
  profile: PortfolioContent["siteProfile"];
  featuredProjects: readonly ProjectSummaryData[];
  supportingProjects: readonly ProjectSummaryData[];
  archiveProjects: readonly ProjectSummaryData[];
  aboutPreview: readonly AboutItem[];
  socialLinks: readonly SocialLinkData[];
}>;

export type AboutPageData = Readonly<{
  profile: PortfolioContent["siteProfile"];
  items: readonly AboutItem[];
  skillGroups: readonly SkillGroup[];
  socialLinks: readonly SocialLinkData[];
}>;

function compareDisplayOrder(
  left: Readonly<{ displayOrder: number }>,
  right: Readonly<{ displayOrder: number }>,
) {
  return left.displayOrder - right.displayOrder;
}

function toSocialLinkData(
  content: Pick<PortfolioContent, "socialLinks">,
): readonly SocialLinkData[] {
  return getPublishedSocialLinks(content).map(({ kind, label, href }) => ({
    kind,
    label: label.trim(),
    href,
  }));
}

function toProjectSummary(project: Project): ProjectSummaryData {
  return {
    slug: project.slug,
    title: project.title.trim(),
    category: project.category,
    description: project.shortDescription.trim(),
    role: project.role.trim(),
    technologies: project.technologies
      .map((technology) => technology.trim())
      .filter(Boolean),
    accent: project.accent,
    href:
      project.presentation === "case-study"
        ? `/projects/${project.slug}`
        : null,
  };
}

export function buildSiteShellData(content: PortfolioContent): SiteShellData {
  return {
    name: content.siteProfile.name.trim(),
    socialLinks: toSocialLinkData(content),
  };
}

export function buildHomePageData(content: PortfolioContent): HomePageData {
  const caseStudies = getPublishedCaseStudyProjects(content);

  return {
    profile: content.siteProfile,
    featuredProjects: caseStudies
      .filter((project) => project.priority === "featured")
      .map(toProjectSummary),
    supportingProjects: caseStudies
      .filter((project) => project.priority === "supporting")
      .map(toProjectSummary),
    archiveProjects: getPublishedArchiveProjects(content).map(toProjectSummary),
    aboutPreview: content.aboutItems
      .toSorted(compareDisplayOrder)
      .slice(0, 2),
    socialLinks: toSocialLinkData(content),
  };
}

export function buildAboutPageData(content: PortfolioContent): AboutPageData {
  return {
    profile: content.siteProfile,
    items: content.aboutItems.toSorted(compareDisplayOrder),
    skillGroups: content.skillGroups.toSorted(compareDisplayOrder),
    socialLinks: toSocialLinkData(content),
  };
}
