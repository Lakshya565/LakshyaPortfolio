import type {
  ArchiveProject,
  CaseStudyProject,
  PortfolioContent,
  Project,
  PublishedSocialLink,
} from "@/types/content";

export type ProjectRouteParams = Readonly<{ slug: string }>;

export type ProjectPageData = Readonly<{
  slug: string;
  title: string;
  category: string;
  description: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
  technologies: readonly string[];
}>;

function compareProjects(left: Project, right: Project) {
  return (
    left.displayOrder - right.displayOrder || left.slug.localeCompare(right.slug)
  );
}

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function getPublishedProjects(
  content: Pick<PortfolioContent, "projects">,
): readonly Project[] {
  return content.projects
    .filter((project) => project.publication === "published")
    .toSorted(compareProjects);
}

export function getPublishedCaseStudyProjects(
  content: Pick<PortfolioContent, "projects">,
): readonly CaseStudyProject[] {
  return getPublishedProjects(content).filter(
    (project): project is CaseStudyProject =>
      project.presentation === "case-study",
  );
}

export function getPublishedArchiveProjects(
  content: Pick<PortfolioContent, "projects">,
): readonly ArchiveProject[] {
  return getPublishedProjects(content).filter(
    (project): project is ArchiveProject =>
      project.presentation === "archive-card",
  );
}

export function getPublishedProjectBySlug(
  content: Pick<PortfolioContent, "projects">,
  slug: string,
): Project | null {
  return (
    content.projects.find(
      (project) =>
        project.slug === slug && project.publication === "published",
    ) ?? null
  );
}

export function getPublishedCaseStudyBySlug(
  content: Pick<PortfolioContent, "projects">,
  slug: string,
): CaseStudyProject | null {
  const project = getPublishedProjectBySlug(content, slug);
  return project?.presentation === "case-study" ? project : null;
}

export function getPublishedCaseStudyParams(
  content: Pick<PortfolioContent, "projects">,
): readonly ProjectRouteParams[] {
  return getPublishedCaseStudyProjects(content).map(({ slug }) => ({ slug }));
}

export function getAdjacentPublishedCaseStudies(
  content: Pick<PortfolioContent, "projects">,
  slug: string,
): Readonly<{
  previous: CaseStudyProject | null;
  next: CaseStudyProject | null;
}> {
  const projects = getPublishedCaseStudyProjects(content);
  const index = projects.findIndex((project) => project.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: projects[index - 1] ?? null,
    next: projects[index + 1] ?? null,
  };
}

export function getRelatedPublishedProjects(
  content: Pick<PortfolioContent, "projects">,
  slug: string,
  limit = 2,
): readonly Project[] {
  if (limit <= 0) {
    return [];
  }

  const current = getPublishedProjectBySlug(content, slug);

  if (!current) {
    return [];
  }

  return getPublishedProjects(content)
    .filter((project) => project.slug !== slug)
    .toSorted((left, right) => {
      const leftCategoryRank = left.category === current.category ? 0 : 1;
      const rightCategoryRank = right.category === current.category ? 0 : 1;
      return leftCategoryRank - rightCategoryRank || compareProjects(left, right);
    })
    .slice(0, limit);
}

export function toProjectPageData(project: CaseStudyProject): ProjectPageData {
  return {
    slug: project.slug,
    title: project.title.trim(),
    category: project.category,
    description: project.shortDescription.trim(),
    role: project.role.trim(),
    startDate: normalizeOptionalText(project.startDate),
    endDate: normalizeOptionalText(project.endDate),
    technologies: project.technologies
      .map((technology) => technology.trim())
      .filter(Boolean),
  };
}

export function getPublishedSocialLinks(
  content: Pick<PortfolioContent, "socialLinks">,
): readonly PublishedSocialLink[] {
  return content.socialLinks.filter(
    (link): link is PublishedSocialLink => link.status === "published",
  );
}
