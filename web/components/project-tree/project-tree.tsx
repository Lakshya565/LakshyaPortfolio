import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { GridPattern } from "@/components/ui/grid-pattern";
import type {
  ProjectTreeBranchData,
  ProjectTreeData,
  ProjectTreeProjectData,
} from "@/lib/content/page-data";

function TechnologyList({
  technologies,
}: Readonly<{ technologies: readonly string[] }>) {
  const visibleTechnologies = technologies.slice(0, 3);
  const remainingTechnologyCount = technologies.length - visibleTechnologies.length;

  return (
    <ul aria-label="Technologies" className="project-tree-technologies">
      {visibleTechnologies.map((technology) => (
        <li key={technology}>
          <Badge variant="outline">{technology}</Badge>
        </li>
      ))}
      {remainingTechnologyCount > 0 ? (
        <li>
          <Badge
            aria-label={`${remainingTechnologyCount} more technologies`}
            variant="outline"
          >
            +{remainingTechnologyCount}
          </Badge>
        </li>
      ) : null}
    </ul>
  );
}

function ProjectTreeNode({
  project,
}: Readonly<{ project: ProjectTreeProjectData }>) {
  return (
    <article
      className="project-tree-node"
      data-work-mode={project.workMode}
      id={`project-node-${project.slug}`}
    >
      <GridPattern className="project-tree-pattern" height={28} width={28} />

      <details>
        <summary>
          <span className="project-tree-node-heading">
            <span>{project.category}</span>
            <strong>{project.title}</strong>
          </span>
          <span aria-hidden="true" className="project-tree-node-toggle">
            <span className="project-tree-node-toggle-closed">+</span>
            <span className="project-tree-node-toggle-open">−</span>
          </span>
        </summary>

        <div className="project-tree-node-body">
          <p>{project.summary}</p>
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
          <TechnologyList technologies={project.technologies} />
          <Link className="project-tree-action" href={project.routeHref}>
            Open project <span aria-hidden="true">→</span>
          </Link>
        </div>
      </details>
    </article>
  );
}

function ProjectTreeBranch({
  branch,
  headingLevel,
}: Readonly<{
  branch: ProjectTreeBranchData;
  headingLevel: "h2" | "h3";
}>) {
  const headingId = `project-branch-${branch.workMode}`;
  const Heading = headingLevel;

  return (
    <section
      aria-labelledby={headingId}
      className="project-tree-branch"
      data-work-mode={branch.workMode}
    >
      <header className="project-tree-branch-header">
        <Heading id={headingId}>{branch.label}</Heading>
        <span>
          {branch.projects.length} {branch.projects.length === 1 ? "project" : "projects"}
        </span>
      </header>

      {branch.projects.length > 0 ? (
        <ol className="project-tree-branch-list">
          {branch.projects.map((project) => (
            <li className="project-tree-branch-item" key={project.slug}>
              <ProjectTreeNode project={project} />
            </li>
          ))}
        </ol>
      ) : (
        <p className="project-tree-branch-empty">No published projects in this branch.</p>
      )}
    </section>
  );
}

export function ProjectTree({
  data,
  branchHeadingLevel = "h2",
}: Readonly<{
  data: ProjectTreeData;
  branchHeadingLevel?: "h2" | "h3";
}>) {
  return (
    <section aria-label="Project tree" className="project-tree">
      <div className="project-tree-root">
        <Link className="project-tree-root-link" href={data.root.routeHref}>
          <GridPattern className="project-tree-root-pattern" height={32} width={32} />
          <span className="project-tree-root-label">Root · About me</span>
          <strong>{data.root.name}</strong>
          <span className="project-tree-root-summary">{data.root.oneLiner}</span>
          <span className="project-tree-root-action">
            About me <span aria-hidden="true">→</span>
          </span>
        </Link>
      </div>

      {data.projectCount > 0 ? (
        <div className="project-tree-branches">
          {data.branches.map((branch) => (
            <ProjectTreeBranch
              branch={branch}
              headingLevel={branchHeadingLevel}
              key={branch.workMode}
            />
          ))}
        </div>
      ) : (
        <p className="empty-state">No public projects are available yet.</p>
      )}
    </section>
  );
}
