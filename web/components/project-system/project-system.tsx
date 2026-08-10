import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { DotPattern } from "@/components/ui/dot-pattern";
import { GridPattern } from "@/components/ui/grid-pattern";
import type {
  ProjectSystemData,
  ProjectSystemProjectData,
} from "@/lib/content/page-data";

const workModeLabels = {
  systems: "Systems",
  physical: "Physical",
  hybrid: "Hybrid",
} as const;

function TechnologyList({
  technologies,
}: Readonly<{ technologies: readonly string[] }>) {
  const visible = technologies.slice(0, 3);
  const remaining = technologies.length - visible.length;

  return (
    <ul aria-label="Technologies" className="project-system-technologies">
      {visible.map((technology) => (
        <li key={technology}>
          <Badge variant="outline">{technology}</Badge>
        </li>
      ))}
      {remaining > 0 ? (
        <li>
          <Badge aria-label={`${remaining} more technologies`} variant="outline">
            +{remaining}
          </Badge>
        </li>
      ) : null}
    </ul>
  );
}

function ProjectSystemNode({
  project,
}: Readonly<{ project: ProjectSystemProjectData }>) {
  const isCaseStudy = project.presentation === "case-study";

  return (
    <article
      className="project-system-node"
      data-presentation={project.presentation}
      data-priority={project.priority}
      data-work-mode={project.workMode}
      id={isCaseStudy ? undefined : project.anchorId}
    >
      {isCaseStudy ? (
        <GridPattern className="project-system-pattern" height={28} width={28} />
      ) : (
        <DotPattern className="project-system-pattern" height={18} width={18} />
      )}

      <details>
        <summary>
          <span className="project-system-node-heading">
            <span className="project-system-node-label">
              {workModeLabels[project.workMode]}
              <span aria-hidden="true"> · </span>
              {isCaseStudy ? "Case study" : "Archive"}
            </span>
            <strong>{project.title}</strong>
          </span>
          <span aria-hidden="true" className="project-system-node-toggle">
            +
          </span>
        </summary>

        <div className="project-system-node-body">
          <p>{project.description}</p>
          <dl>
            <div>
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
            {project.dateLabel ? (
              <div>
                <dt>When</dt>
                <dd>{project.dateLabel}</dd>
              </div>
            ) : null}
          </dl>
          {!isCaseStudy && project.metrics.length > 0 ? (
            <dl aria-label={`${project.title} evidence`} className="project-system-metrics">
              {project.metrics.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>
                    <strong>{metric.value}</strong>
                    {metric.context ? <span>{metric.context}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          <TechnologyList technologies={project.technologies} />

          {isCaseStudy ? (
            <Link className="project-system-action" href={project.routeHref}>
              Open case study <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <div className="project-system-archive-actions">
              {project.links.length > 0 ? (
                <ul aria-label={`${project.title} links`}>
                  {project.links.map((link) => (
                    <li key={`${link.kind}:${link.href}`}>
                      <a href={link.href} rel="noreferrer noopener" target="_blank">
                        {link.label} <span aria-hidden="true">↗</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="project-system-link-status">
                  Public links will be added later.
                </p>
              )}
              <Link href={project.permalinkHref}>Permanent link</Link>
            </div>
          )}
        </div>
      </details>
    </article>
  );
}

export function ProjectSystem({
  data,
  headingId,
  headingLevel = "h2",
}: Readonly<{
  data: ProjectSystemData;
  headingId: string;
  headingLevel?: "h1" | "h2";
}>) {
  const Heading = headingLevel;

  return (
    <section aria-labelledby={headingId} className="project-system">
      <header className="project-system-header">
        <div>
          <p className="eyebrow">Project system · {data.projects.length} nodes</p>
          <Heading id={headingId}>Everything I’ve built, on one circuit.</Heading>
        </div>
        <div aria-label="Project legend" className="project-system-legend">
          <span><i data-work-mode="systems" /> Systems</span>
          <span><i data-work-mode="physical" /> Physical</span>
          <span><i data-work-mode="hybrid" /> Hybrid</span>
          <span><i data-pattern="grid" /> Case study</span>
          <span><i data-pattern="dots" /> Archive</span>
        </div>
      </header>

      {data.projects.length > 0 ? (
        <div className="project-system-grid">
          {data.projects.map((project) => (
            <ProjectSystemNode key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <p className="empty-state">No public projects are available yet.</p>
      )}
    </section>
  );
}
