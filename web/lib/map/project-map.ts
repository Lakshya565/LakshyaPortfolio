import type { ProjectMapSummaryData } from "@/lib/content/page-data";
import {
  projectMapPlacements,
  type ProjectMapPlacement,
} from "@/lib/map/placements";

export type ProjectMapNodeData = ProjectMapSummaryData & ProjectMapPlacement;

type MapEligibleProject = Readonly<{
  slug: string;
  publication: "draft" | "published";
  displayInMap: boolean;
}>;

function getFallbackPlacement(
  slug: ProjectMapPlacement["slug"],
  index: number,
): ProjectMapPlacement {
  return {
    slug,
    tier: "secondary",
    desktopColumn: ((index % 4) + 1) as 1 | 2 | 3 | 4,
    mobileOrder: (index + 1) * 10,
  };
}

export function buildProjectMapData(
  projects: readonly ProjectMapSummaryData[],
  placements: readonly ProjectMapPlacement[] = projectMapPlacements,
): readonly ProjectMapNodeData[] {
  return projects
    .map((project, index) => {
      const placement =
        placements.find((candidate) => candidate.slug === project.slug) ??
        getFallbackPlacement(project.slug, index);

      return { ...project, ...placement };
    })
    .toSorted(
      (left, right) =>
        left.mobileOrder - right.mobileOrder || left.slug.localeCompare(right.slug),
    );
}

export function getProjectMapPlacementIssues(
  projects: readonly MapEligibleProject[],
  placements: readonly ProjectMapPlacement[] = projectMapPlacements,
): readonly string[] {
  const issues: string[] = [];
  const eligibleSlugs = new Set(
    projects
      .filter(
        (project) => project.publication === "published" && project.displayInMap,
      )
      .map((project) => project.slug),
  );
  const placementSlugs = new Set<string>();
  const mobileOrders = new Set<number>();

  for (const placement of placements) {
    if (placementSlugs.has(placement.slug)) {
      issues.push(`mapPlacements: duplicate slug ${placement.slug}`);
    }
    placementSlugs.add(placement.slug);

    if (mobileOrders.has(placement.mobileOrder)) {
      issues.push(`mapPlacements: duplicate mobileOrder ${placement.mobileOrder}`);
    }
    mobileOrders.add(placement.mobileOrder);

    if (
      !Number.isInteger(placement.desktopColumn) ||
      placement.desktopColumn < 1 ||
      placement.desktopColumn > 4
    ) {
      issues.push(
        `mapPlacements.${placement.slug}: desktopColumn must be between 1 and 4`,
      );
    }

    if (!Number.isInteger(placement.mobileOrder) || placement.mobileOrder < 0) {
      issues.push(`mapPlacements.${placement.slug}: mobileOrder must be nonnegative`);
    }

    if (!eligibleSlugs.has(placement.slug)) {
      issues.push(`mapPlacements.${placement.slug}: placement is not map-visible`);
    }
  }

  for (const slug of eligibleSlugs) {
    if (!placementSlugs.has(slug)) {
      issues.push(`mapPlacements.${slug}: missing placement`);
    }
  }

  return issues;
}
