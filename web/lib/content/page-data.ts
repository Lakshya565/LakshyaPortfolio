import { formatProjectDateRange } from "@/lib/content/case-study-normalization";
import {
  getPublishedArchiveProjects,
  getPublishedCaseStudyProjects,
  getPublishedSocialLinks,
} from "@/lib/content/project-queries";
import type {
  AboutItem,
  ArchiveProject,
  CaseStudyProject,
  PersonalMotif,
  PortfolioContent,
  Project,
  ProjectCategory,
  ProjectLinkKind,
  ProjectSlug,
  ProjectWorkMode,
  SkillGroup,
  SocialLinkKind,
} from "@/types/content";

export type SocialLinkData = Readonly<{
  kind: SocialLinkKind;
  label: string;
  href: string;
}>;

type ProjectSummaryBase = Readonly<{
  slug: ProjectSlug;
  title: string;
  category: ProjectCategory;
  description: string;
  role: string;
  technologies: readonly string[];
  workMode: ProjectWorkMode;
}>;

export type RoutedProjectSummaryData = ProjectSummaryBase &
  Readonly<{
    presentation: "case-study";
    href: string;
  }>;

type ArchiveProjectLinkData = Readonly<{
  kind: ProjectLinkKind;
  label: string;
  href: string;
}>;

type ArchiveProjectMetricData = Readonly<{
  label: string;
  value: string | number;
  context: string | null;
}>;

export type ArchiveProjectSummaryData = ProjectSummaryBase &
  Readonly<{
    presentation: "archive-card";
    href: null;
    anchorId: string;
    dateLabel: string | null;
    links: readonly ArchiveProjectLinkData[];
    metrics: readonly ArchiveProjectMetricData[];
  }>;

export type ProjectMapSummaryData =
  | RoutedProjectSummaryData
  | ArchiveProjectSummaryData;

export type SiteShellData = Readonly<{
  name: string;
  socialLinks: readonly SocialLinkData[];
}>;

type HomePageData = Readonly<{
  profile: PortfolioContent["siteProfile"];
  featuredProjects: readonly RoutedProjectSummaryData[];
  supportingProjects: readonly RoutedProjectSummaryData[];
  archiveProjects: readonly ArchiveProjectSummaryData[];
  mapProjects: readonly ProjectMapSummaryData[];
  personalMotifs: readonly PersonalMotif[];
  socialLinks: readonly SocialLinkData[];
}>;

type AboutPageData = Readonly<{
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

function toProjectSummaryBase(project: Project): ProjectSummaryBase {
  return {
    slug: project.slug,
    title: project.title.trim(),
    category: project.category,
    description: project.shortDescription.trim(),
    role: project.role.trim(),
    technologies: project.technologies
      .map((technology) => technology.trim())
      .filter(Boolean),
    workMode: project.workMode,
  };
}

function toRoutedProjectSummary(
  project: CaseStudyProject,
): RoutedProjectSummaryData {
  return {
    ...toProjectSummaryBase(project),
    presentation: "case-study",
    href: `/projects/${project.slug}`,
  };
}

function toArchiveProjectSummary(
  project: ArchiveProject,
): ArchiveProjectSummaryData {
  return {
    ...toProjectSummaryBase(project),
    presentation: "archive-card",
    href: null,
    anchorId: `project-${project.slug}`,
    dateLabel: formatProjectDateRange(project.startDate, project.endDate),
    links: project.links.map(({ kind, label, href }) => ({
      kind,
      label: label.trim(),
      href: href.trim(),
    })),
    metrics: project.metrics.map(({ label, value, context }) => ({
      label: label.trim(),
      value: typeof value === "string" ? value.trim() : value,
      context: context?.trim() || null,
    })),
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
  const archiveProjects = getPublishedArchiveProjects(content);
  const mapProjects = [
    ...caseStudies
      .filter((project) => project.displayInMap)
      .map(toRoutedProjectSummary),
    ...archiveProjects
      .filter((project) => project.displayInMap)
      .map(toArchiveProjectSummary),
  ];

  return {
    profile: content.siteProfile,
    featuredProjects: caseStudies
      .filter((project) => project.priority === "featured")
      .map(toRoutedProjectSummary),
    supportingProjects: caseStudies
      .filter((project) => project.priority === "supporting")
      .map(toRoutedProjectSummary),
    archiveProjects: archiveProjects.map(toArchiveProjectSummary),
    mapProjects,
    personalMotifs: content.personalMotifs.toSorted(compareDisplayOrder),
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
