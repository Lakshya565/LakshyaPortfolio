import Link from "next/link";

import type { SelectedWorkProjectData } from "@/lib/content/page-data";

function SelectedWorkRow({
  project,
}: Readonly<{ project: SelectedWorkProjectData }>) {
  return (
    <li className="selected-work-item" data-work-mode={project.workMode}>
      <Link className="selected-work-link" href={project.routeHref}>
        <span className="selected-work-branch">{project.branchLabel}</span>
        <strong>{project.title}</strong>
        <span className="selected-work-summary">{project.summary}</span>
        <span className="selected-work-meta">
          {project.role}
          {project.dateLabel ? ` · ${project.dateLabel}` : ""}
        </span>
      </Link>
    </li>
  );
}

export function SelectedWork({
  projects,
  totalProjectCount,
}: Readonly<{
  projects: readonly SelectedWorkProjectData[];
  totalProjectCount: number;
}>) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="selected-work-title" className="selected-work">
      <p className="eyebrow" id="selected-work-title">
        Selected work
      </p>
      <ol className="selected-work-list">
        {projects.map((project) => (
          <SelectedWorkRow key={project.slug} project={project} />
        ))}
      </ol>
      <Link className="selected-work-all" href="/work">
        All {totalProjectCount} projects <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
