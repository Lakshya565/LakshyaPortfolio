import Link from "next/link";
import type { CSSProperties } from "react";

import { PersonalMotifMark } from "@/components/project-map/personal-motif-mark";
import { Badge } from "@/components/ui/badge";
import { GridPattern } from "@/components/ui/grid-pattern";
import type { ProjectMapNodeData } from "@/lib/map/project-map";
import type { PersonalMotif } from "@/types/content";

type NodeStyle = CSSProperties &
  Readonly<{
    "--map-column": number;
  }>;

const workModeLabels = {
  systems: "Systems",
  physical: "Physical",
  hybrid: "Hybrid",
} as const;

const motifGroupLabels = {
  maker: "Maker shelf",
  leadership: "Teach + lead",
  people: "Good company",
  recharge: "Reset modes",
} as const;

type MotifGroup = keyof typeof motifGroupLabels;

const motifGroups: Readonly<Record<MotifGroup, readonly PersonalMotif["key"][]>> = {
  maker: ["maker-origin", "quackta"],
  leadership: ["taekwondo", "scouting"],
  people: ["shared-food", "food-favorites"],
  recharge: ["movement", "anime"],
};

function ProjectNode({ project }: Readonly<{ project: ProjectMapNodeData }>) {
  const actionHref =
    project.presentation === "case-study"
      ? project.href
      : `#${project.anchorId}`;
  const actionLabel =
    project.presentation === "case-study" ? "Open case study" : "Jump to archive";

  return (
    <details
      className="workbench-project-node"
      data-presentation={project.presentation}
      data-tier={project.tier}
      data-work-mode={project.workMode}
      name="portfolio-project-map"
    >
      <summary>
        <span className="workbench-node-label">
          {workModeLabels[project.workMode]}
          <span aria-hidden="true"> · </span>
          {project.presentation === "case-study" ? "Case study" : "Archive"}
        </span>
        <strong>{project.title}</strong>
        <span aria-hidden="true" className="workbench-node-toggle">
          +
        </span>
      </summary>
      <div className="workbench-node-detail">
        <p>{project.description}</p>
        <div className="workbench-node-meta">
          <span>{project.role}</span>
          <Link href={actionHref}>{actionLabel} →</Link>
        </div>
      </div>
    </details>
  );
}

function PersonalCluster({
  group,
  motifs,
}: Readonly<{
  group: MotifGroup;
  motifs: readonly PersonalMotif[];
}>) {
  if (motifs.length === 0) {
    return null;
  }

  return (
    <details className="workbench-personal-node" name="portfolio-personal-map">
      <summary>
        <span className="personal-motif-icons" aria-hidden="true">
          {motifs.map((motif) => (
            <PersonalMotifMark key={motif.key} motif={motif.key} />
          ))}
        </span>
        <span>{motifGroupLabels[group]}</span>
      </summary>
      <ul>
        {motifs.map((motif) => (
          <li key={motif.key}>
            <strong>{motif.label}</strong>
            <span>{motif.detail}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function CircuitScene({
  identity,
  personalMotifs,
  projects,
}: Readonly<{
  identity: Readonly<{ name: string }>;
  personalMotifs: readonly PersonalMotif[];
  projects: readonly ProjectMapNodeData[];
}>) {
  if (projects.length === 0) {
    return null;
  }

  const groupedMotifs = Object.entries(motifGroups).map(([group, keys]) => {
    const motifKeys = new Set<PersonalMotif["key"]>(keys);

    return {
      group: group as MotifGroup,
      motifs: personalMotifs.filter((motif) => motifKeys.has(motif.key)),
    };
  });

  return (
    <div className="workbench-scene">
      <GridPattern className="workbench-grid-pattern" height={32} width={32} />
      <div className="workbench-rail" aria-hidden="true" />
      <div className="workbench-header">
        <div>
          <span>LA / 01</span>
          <strong>{identity.name}</strong>
        </div>
        <Badge variant="outline">10 projects · one workbench</Badge>
      </div>
      <div className="workbench-grid">
        {projects.map((project, index) => (
          <div
            className="workbench-slot"
            key={project.slug}
            style={{ "--map-column": project.desktopColumn } as NodeStyle}
          >
            <ProjectNode project={project} />
            {groupedMotifs[index]?.motifs.length ? (
              <PersonalCluster {...groupedMotifs[index]} />
            ) : null}
          </div>
        ))}
      </div>
      <div className="workbench-legend" aria-label="Project map legend">
        <span><i data-work-mode="systems" /> Systems and software</span>
        <span><i data-work-mode="physical" /> Physical and human-facing</span>
        <span><i data-work-mode="hybrid" /> Hybrid systems</span>
        <span><i data-pattern="grid" /> Case study</span>
        <span><i data-pattern="dots" /> Archive</span>
      </div>
    </div>
  );
}
