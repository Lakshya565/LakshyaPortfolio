import Link from "next/link";

import type { CaseStudyNavigationItem } from "@/lib/content/case-study-normalization";

function NavigationLink({
  direction,
  project,
}: Readonly<{
  direction: "Next" | "Previous";
  project: CaseStudyNavigationItem;
}>) {
  return (
    <Link
      className="case-study-navigation-link"
      data-direction={direction.toLowerCase()}
      href={project.href}
    >
      <span className="eyebrow">{direction} project</span>
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
    <nav aria-label="Other case studies" className="case-study-navigation">
      {previous ? <NavigationLink direction="Previous" project={previous} /> : null}
      {next ? <NavigationLink direction="Next" project={next} /> : null}
    </nav>
  );
}
