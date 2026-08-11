import type {
  CaseStudyProject,
  PortfolioContent,
  Project,
  PublishedSocialLink,
} from "@/types/content";

function compareProjects(left: Project, right: Project) {
  return (
    left.displayOrder - right.displayOrder || left.slug.localeCompare(right.slug)
  );
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
  return getPublishedProjects(content);
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
  return getPublishedProjectBySlug(content, slug);
}

export function getPublishedCaseStudyParams(
  content: Pick<PortfolioContent, "projects">,
): readonly Readonly<{ slug: string }>[] {
  return getPublishedCaseStudyProjects(content).map(({ slug }) => ({ slug }));
}

/**
 * Adjacency stays inside the project's own branch. Walking the global order
 * would send a reader from a Hybrid project to a Hardware one, contradicting
 * the tree they navigated in from.
 */
export function getAdjacentPublishedCaseStudies(
  content: Pick<PortfolioContent, "projects">,
  slug: string,
): Readonly<{
  previous: CaseStudyProject | null;
  next: CaseStudyProject | null;
}> {
  const current = getPublishedProjectBySlug(content, slug);

  if (!current) {
    return { previous: null, next: null };
  }

  const branch = getPublishedCaseStudyProjects(content).filter(
    (project) => project.workMode === current.workMode,
  );
  const index = branch.findIndex((project) => project.slug === slug);

  return {
    previous: branch[index - 1] ?? null,
    next: branch[index + 1] ?? null,
  };
}

export function getPublishedSocialLinks(
  content: Pick<PortfolioContent, "socialLinks">,
): readonly PublishedSocialLink[] {
  return content.socialLinks.filter(
    (link): link is PublishedSocialLink => link.status === "published",
  );
}
