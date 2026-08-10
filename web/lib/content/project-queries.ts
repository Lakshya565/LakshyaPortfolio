import type {
  ArchiveProject,
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
): readonly Readonly<{ slug: string }>[] {
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

export function getPublishedSocialLinks(
  content: Pick<PortfolioContent, "socialLinks">,
): readonly PublishedSocialLink[] {
  return content.socialLinks.filter(
    (link): link is PublishedSocialLink => link.status === "published",
  );
}
