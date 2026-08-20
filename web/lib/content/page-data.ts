import { formatProjectDateRange } from "@/lib/content/case-study-normalization";
import {
  getPublishedProjects,
  getPublishedSocialLinks,
} from "@/lib/content/project-queries";
import { buildDeskHotspots, type DeskHotspotData } from "@/lib/desk/hotspots";
import { aboutRailKeys, projectWorkModeLabels } from "@/types/content";
import type {
  AboutItem,
  AboutPanel,
  AboutRailKey,
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
  intro: PortfolioContent["aboutIntro"];
  /** Two rails of three, in display order, ready to render as given. */
  rails: readonly Readonly<{
    key: AboutRailKey;
    panels: readonly AboutPanel[];
  }>[];
  /* `items` and `skillGroups` are still built and still validated, but nothing
     renders them — see the comments on their exports in `content/about.ts`. */
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
      /* Nothing renders this any more — the root card became a door to
         `/about` rather than a summary, so its tagline went. Kept because the
         headline itself is still the hero's, and the field costs nothing. */
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
  const panels = content.aboutPanels.toSorted(compareDisplayOrder);

  return {
    profile: content.siteProfile,
    intro: content.aboutIntro,
    /* Grouped here rather than in the page, so rail order is a property of the
       data and not of whichever component happens to loop over it. */
    rails: aboutRailKeys.map((key) => ({
      key,
      panels: panels.filter((panel) => panel.rail === key),
    })),
    items: content.aboutItems.toSorted(compareDisplayOrder),
    skillGroups: content.skillGroups.toSorted(compareDisplayOrder),
    socialLinks: toSocialLinkData(content),
  };
}
