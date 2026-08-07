import type {
  PortfolioContent,
  Project,
  PublishedSocialLink,
} from "@/types/content";

export function getPublishedProjects(
  content: Pick<PortfolioContent, "projects">,
): readonly Project[] {
  return content.projects
    .filter((project) => project.publication === "published")
    .toSorted(
      (left, right) =>
        left.displayOrder - right.displayOrder ||
        left.slug.localeCompare(right.slug),
    );
}

export function getPublishedSocialLinks(
  content: Pick<PortfolioContent, "socialLinks">,
): readonly PublishedSocialLink[] {
  return content.socialLinks.filter(
    (link): link is PublishedSocialLink => link.status === "published",
  );
}

