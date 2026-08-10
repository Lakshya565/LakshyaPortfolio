import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { BentoGrid } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GridPattern } from "@/components/ui/grid-pattern";
import type { RoutedProjectSummaryData } from "@/lib/content/page-data";
import { cn } from "@/lib/utils";

type ProjectGridItem = Readonly<{
  project: RoutedProjectSummaryData;
  prominence: "featured" | "supporting";
}>;

function toProjectGridItems(
  featuredProjects: readonly RoutedProjectSummaryData[],
  supportingProjects: readonly RoutedProjectSummaryData[],
): readonly ProjectGridItem[] {
  return [
    ...featuredProjects.map((project) => ({
      project,
      prominence: "featured" as const,
    })),
    ...supportingProjects.map((project) => ({
      project,
      prominence: "supporting" as const,
    })),
  ];
}

function TechnologyBadges({
  technologies,
}: Readonly<{ technologies: readonly string[] }>) {
  const visibleTechnologies = technologies.slice(0, 3);
  const overflowCount = technologies.length - visibleTechnologies.length;

  return (
    <ul aria-label="Technologies" className="flex flex-wrap gap-2">
      {visibleTechnologies.map((technology) => (
        <li key={technology}>
          <Badge variant="outline">{technology}</Badge>
        </li>
      ))}
      {overflowCount > 0 ? (
        <li>
          <Badge
            aria-label={`${overflowCount} more technologies`}
            variant="outline"
          >
            +{overflowCount}
          </Badge>
        </li>
      ) : null}
    </ul>
  );
}

function ProjectBentoCard({ item }: Readonly<{ item: ProjectGridItem }>) {
  const { project, prominence } = item;

  return (
    <Card
      asChild
      className={cn(
        "project-bento-card relative min-h-68 h-full justify-between",
        prominence === "featured"
          ? "md:col-span-1 lg:col-span-3 lg:min-h-76"
          : "md:col-span-1 lg:col-span-2",
      )}
      data-work-mode={project.workMode}
      data-prominence={prominence}
    >
      <article>
        <GridPattern
          className="project-card-grid"
          height={32}
          width={32}
          x={-1}
          y={-1}
        />
        <CardHeader className="relative z-1 gap-4">
          <p className="project-mode-label">
            {project.workMode} · {project.category}
          </p>
          <CardTitle>
            <h3
              className={cn(
                "font-semibold tracking-[-0.035em] text-primary",
                prominence === "featured"
                  ? "text-2xl sm:text-3xl"
                  : "text-xl sm:text-2xl",
              )}
            >
              {project.title}
            </h3>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-1 mt-auto grid gap-4">
          <p className="project-proof">{project.role}</p>
          <TechnologyBadges technologies={project.technologies} />
        </CardContent>

        <CardFooter className="relative z-1 justify-end">
          <Button asChild size="sm" variant="ghost">
            <Link href={project.href}>
              Open case study <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </CardFooter>
      </article>
    </Card>
  );
}

export function ProjectBentoGrid({
  featuredProjects,
  supportingProjects,
}: Readonly<{
  featuredProjects: readonly RoutedProjectSummaryData[];
  supportingProjects: readonly RoutedProjectSummaryData[];
}>) {
  const items = toProjectGridItems(featuredProjects, supportingProjects);

  if (items.length === 0) {
    return null;
  }

  return (
    <BentoGrid>
      {items.map((item) => (
        <ProjectBentoCard item={item} key={item.project.slug} />
      ))}
    </BentoGrid>
  );
}
