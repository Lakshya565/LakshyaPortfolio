import { Badge } from "@/components/ui/badge";
import { DotPattern } from "@/components/ui/dot-pattern";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ArchiveProjectSummaryData } from "@/lib/content/page-data";

export function ArchiveCard({
  project,
}: Readonly<{ project: ArchiveProjectSummaryData }>) {
  const visibleTechnologies = project.technologies.slice(0, 3);
  const overflowCount = project.technologies.length - visibleTechnologies.length;

  return (
    <Card
      asChild
      className="archive-card relative h-full"
      data-work-mode={project.workMode}
      size="sm"
    >
      <article id={project.anchorId}>
        <DotPattern className="archive-card-dots" height={18} width={18} />
        <CardHeader className="relative z-1 gap-3">
          <p className="project-mode-label">
            {project.workMode} · {project.category}
          </p>
          <CardTitle>
            <h3 className="text-lg font-semibold tracking-[-0.025em] text-primary">
              {project.title}
            </h3>
          </CardTitle>
          <p className="text-sm leading-6 text-secondary">
            {project.description}
          </p>
        </CardHeader>

        <CardContent className="relative z-1">
          {project.metrics.length > 0 ? (
            <dl className="archive-card-metrics">
              <div>
                <dt>{project.metrics[0].label}</dt>
                <dd>
                  <span>{project.metrics[0].value}</span>
                  {project.metrics[0].context ? (
                    <small>{project.metrics[0].context}</small>
                  ) : null}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="project-proof">{project.role}</p>
          )}

          <ul aria-label="Technologies" className="mt-4 flex flex-wrap gap-2">
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
        </CardContent>

        {project.links.length > 0 ? (
          <CardFooter className="relative z-1">
            <ul
              aria-label={`${project.title} links`}
              className="archive-card-links"
            >
              {project.links.map((link) => (
                <li key={`${link.kind}:${link.href}`}>
                  <a href={link.href} rel="noreferrer noopener" target="_blank">
                    {link.label}
                    <span aria-hidden="true"> ↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </CardFooter>
        ) : null}
      </article>
    </Card>
  );
}
