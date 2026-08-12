import { formatProjectDateRange } from "@/lib/content/case-study-normalization";
import {
  getPublishedProjects,
  getPublishedSocialLinks,
} from "@/lib/content/project-queries";
import { buildDeskHotspots, type DeskHotspotData } from "@/lib/desk/hotspots";
import { projectWorkModeLabels } from "@/types/content";
import type {
  AboutItem,
  PortfolioContent,
  Project,
  ProjectCategory,
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

export type ProjectTreeProjectData = Readonly<{
  slug: ProjectSlug;
  title: string;
  category: ProjectCategory;
  summary: string;
  role: string;
  technologies: readonly string[];
  workMode: ProjectWorkMode;
  dateLabel: string | null;
  routeHref: string;
}>;

export type ProjectTreeBranchData = Readonly<{
  workMode: ProjectWorkMode;
  label: string;
  projects: readonly ProjectTreeProjectData[];
}>;

export type ProjectTreeData = Readonly<{
  root: Readonly<{
    name: string;
    oneLiner: string;
    routeHref: "/about";
  }>;
  branches: readonly ProjectTreeBranchData[];
  projectCount: number;
}>;

export type SiteShellData = Readonly<{
  name: string;
  socialLinks: readonly SocialLinkData[];
}>;

export type HomePageData = Readonly<{
  profile: PortfolioContent["siteProfile"];
  personalHotspots: readonly DeskHotspotData[];
  projectTree: ProjectTreeData;
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

// Desktop reading order. Labels come from the shared map so the tree and the
// case-study adjacency links can never name the same branch differently.
const projectTreeBranchOrder = [
  "hybrid",
  "software",
  "hardware",
] as const satisfies readonly ProjectWorkMode[];

function toProjectTreeProject(project: Project): ProjectTreeProjectData {
  return {
    slug: project.slug,
    title: project.title.trim(),
    category: project.category,
    summary: project.shortDescription.trim(),
    role: project.role.trim(),
    technologies: project.technologies
      .map((technology) => technology.trim())
      .filter(Boolean),
    workMode: project.workMode,
    dateLabel: formatProjectDateRange(project.startDate, project.endDate),
    routeHref: `/projects/${project.slug}`,
  };
}

export function buildProjectTreeData(
  content: Pick<PortfolioContent, "siteProfile" | "projects">,
): ProjectTreeData {
  const projects = getPublishedProjects(content).map(toProjectTreeProject);
  const branches = projectTreeBranchOrder.map((workMode) => ({
    workMode,
    label: projectWorkModeLabels[workMode],
    projects: projects.filter((project) => project.workMode === workMode),
  }));

  return {
    root: {
      name: content.siteProfile.name.trim(),
      oneLiner: content.siteProfile.headline.trim(),
      routeHref: "/about",
    },
    branches,
    projectCount: projects.length,
  };
}


export function buildSiteShellData(content: PortfolioContent): SiteShellData {
  return {
    name: content.siteProfile.name.trim(),
    socialLinks: toSocialLinkData(content),
  };
}

export function buildHomePageData(content: PortfolioContent): HomePageData {
  const projectTree = buildProjectTreeData(content);

  return {
    profile: content.siteProfile,
    personalHotspots: buildDeskHotspots(
      content.personalMotifs.toSorted(compareDisplayOrder),
    ),
    projectTree,
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
