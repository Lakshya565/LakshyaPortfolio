import type { ProjectSummaryData } from "@/lib/content/page-data";

export function ArchiveCard({
  project,
}: Readonly<{ project: ProjectSummaryData }>) {
  return (
    <article
      className="archive-card rounded-2xl border border-line bg-surface p-6"
      data-accent={project.accent}
    >
      <p className="eyebrow">{project.category}</p>
      <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-primary">
        {project.title}
      </h3>
      <p className="mt-4 text-sm leading-6 text-secondary">
        {project.description}
      </p>
      <p className="mt-6 border-t border-line pt-4 font-mono text-xs text-muted">
        {project.technologies.join(" · ")}
      </p>
    </article>
  );
}
