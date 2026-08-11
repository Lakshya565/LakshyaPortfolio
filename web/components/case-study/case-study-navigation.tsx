import Link from "next/link";

import type { CaseStudyNavigationItem } from "@/lib/content/case-study-normalization";
import { projectWorkModeLabels } from "@/types/content";

function NavigationLink({
  direction,
  project,
}: Readonly<{
  direction: "Next" | "Previous";
  project: CaseStudyNavigationItem;
}>) {
  return (
    // The accent comes from the linked project's own work mode, not the page
    // being read, so the color never describes the wrong project.
    <Link
      className="case-study-navigation-link"
      data-direction={direction.toLowerCase()}
      data-work-mode={project.workMode}
      href={project.href}
    >
      <span className="eyebrow">
        {direction} in {projectWorkModeLabels[project.workMode]}
      </span>
      <strong>{project.title}</strong>
      <span>{project.category}</span>
    </Link>
  );
}

export function CaseStudyNavigation({
  next,
  previous,
}: Readonly<{
  next: CaseStudyNavigationItem | null;
  previous: CaseStudyNavigationItem | null;
}>) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav aria-label="Adjacent projects" className="case-study-navigation">
      {previous ? <NavigationLink direction="Previous" project={previous} /> : null}
      {next ? <NavigationLink direction="Next" project={next} /> : null}
    </nav>
  );
}
