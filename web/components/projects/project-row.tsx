import Link from "next/link";

import type { ProjectSummaryData } from "@/lib/content/page-data";

export function ProjectRow({
  project,
  index,
  compact = false,
}: Readonly<{
  project: ProjectSummaryData;
  index: number;
  compact?: boolean;
}>) {
  if (!project.href) {
    return null;
  }

  return (
    <article
      className="project-row border-t border-line"
      data-accent={project.accent}
    >
      <div
        className={`grid gap-6 py-8 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start ${
          compact ? "lg:py-9" : "lg:py-12"
        }`}
      >
        <p aria-hidden="true" className="font-mono text-xs text-muted">
          {String(index + 1).padStart(2, "0")}
        </p>
        <div className="min-w-0">
          <p className="eyebrow">{project.category}</p>
          <h3
            className={`mt-3 font-semibold tracking-[-0.035em] text-primary ${
              compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
            }`}
          >
            <Link className="project-title-link" href={project.href}>
              {project.title}
            </Link>
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-7 text-secondary">
            {project.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <span>{project.role}</span>
            <span aria-hidden="true">/</span>
            <span>{project.technologies.join(" · ")}</span>
          </div>
        </div>
        <span
          aria-hidden="true"
          className="project-arrow hidden pt-8 font-mono text-xl sm:block"
        >
          ↗
        </span>
      </div>
    </article>
  );
}
