import { formatProjectDateRange } from "@/lib/content/case-study-normalization";
import {
  getPublishedArchiveProjects,
  getPublishedCaseStudyProjects,
  getPublishedSocialLinks,
} from "@/lib/content/project-queries";
import { buildDeskHotspots, type DeskHotspotData } from "@/lib/desk/hotspots";
import type {
  AboutItem,
  ArchiveProject,
  CaseStudyProject,
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

type ProjectSystemBaseData = Readonly<{
  slug: ProjectSlug;
  title: string;
  category: ProjectCategory;
  description: string;
  role: string;
  technologies: readonly string[];
  workMode: ProjectWorkMode;
  dateLabel: string | null;
}>;

export type ProjectSystemCaseStudyData = ProjectSystemBaseData &
  Readonly<{
    presentation: "case-study";
    priority: "featured" | "supporting";
    routeHref: string;
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

export type ProjectSystemArchiveData = ProjectSystemBaseData &
  Readonly<{
    presentation: "archive";
    priority: "archive";
    anchorId: string;
    permalinkHref: string;
    links: readonly ArchiveProjectLinkData[];
    metrics: readonly ArchiveProjectMetricData[];
  }>;

export type ProjectSystemProjectData =
  | ProjectSystemCaseStudyData
  | ProjectSystemArchiveData;

export type ProjectSystemData = Readonly<{
  projects: readonly ProjectSystemProjectData[];
}>;

export type SiteShellData = Readonly<{
  name: string;
  socialLinks: readonly SocialLinkData[];
}>;

export type HomePageData = Readonly<{
  profile: PortfolioContent["siteProfile"];
  personalHotspots: readonly DeskHotspotData[];
  projectSystem: ProjectSystemData;
  socialLinks: readonly SocialLinkData[];
}>;

export type WorkPageData = Readonly<{
  projectSystem: ProjectSystemData;
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

function toProjectSystemBase(project: Project): ProjectSystemBaseData {
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
    dateLabel: formatProjectDateRange(project.startDate, project.endDate),
  };
}

function toProjectSystemCaseStudy(
  project: CaseStudyProject,
): ProjectSystemCaseStudyData {
  return {
    ...toProjectSystemBase(project),
    presentation: "case-study",
    priority: project.priority,
    routeHref: `/projects/${project.slug}`,
  };
}

function toProjectSystemArchive(
  project: ArchiveProject,
): ProjectSystemArchiveData {
  const anchorId = `project-${project.slug}`;

  return {
    ...toProjectSystemBase(project),
    presentation: "archive",
    priority: "archive",
    anchorId,
    permalinkHref: `/work#${anchorId}`,
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

export function buildProjectSystemData(
  content: Pick<PortfolioContent, "projects">,
): ProjectSystemData {
  const projects = [
    ...getPublishedCaseStudyProjects(content).map(toProjectSystemCaseStudy),
    ...getPublishedArchiveProjects(content).map(toProjectSystemArchive),
  ].toSorted((left, right) => {
    const leftProject = content.projects.find(({ slug }) => slug === left.slug);
    const rightProject = content.projects.find(({ slug }) => slug === right.slug);
    return (leftProject?.displayOrder ?? 0) - (rightProject?.displayOrder ?? 0);
  });

  return { projects };
}

export function buildSiteShellData(content: PortfolioContent): SiteShellData {
  return {
    name: content.siteProfile.name.trim(),
    socialLinks: toSocialLinkData(content),
  };
}

export function buildHomePageData(content: PortfolioContent): HomePageData {
  return {
    profile: content.siteProfile,
    personalHotspots: buildDeskHotspots(
      content.personalMotifs.toSorted(compareDisplayOrder),
    ),
    projectSystem: buildProjectSystemData(content),
    socialLinks: toSocialLinkData(content),
  };
}

export function buildWorkPageData(content: PortfolioContent): WorkPageData {
  return { projectSystem: buildProjectSystemData(content) };
}

export function buildAboutPageData(content: PortfolioContent): AboutPageData {
  return {
    profile: content.siteProfile,
    items: content.aboutItems.toSorted(compareDisplayOrder),
    skillGroups: content.skillGroups.toSorted(compareDisplayOrder),
    socialLinks: toSocialLinkData(content),
  };
}
