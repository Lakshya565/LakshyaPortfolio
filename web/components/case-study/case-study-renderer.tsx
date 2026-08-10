import type { ComponentType } from "react";
import Link from "next/link";

import {
  CaseStudyGallery,
  CaseStudyHero,
  CaseStudyVideos,
} from "@/components/case-study/case-study-media";
import { CaseStudyNavigation } from "@/components/case-study/case-study-navigation";
import { Badge } from "@/components/ui/badge";
import type {
  CaseStudyNavigationItem,
  CaseStudyPageData,
} from "@/lib/content/case-study-normalization";
import type { CaseStudyOutlineItem } from "@/lib/content/heading-anchors";

function CaseStudyHeader({ project }: Readonly<{ project: CaseStudyPageData }>) {
  const facts = [
    project.role ? { label: "Role", value: project.role } : null,
    project.dateLabel ? { label: "Timeline", value: project.dateLabel } : null,
  ].filter((fact): fact is NonNullable<typeof fact> => fact !== null);

  return (
    <header className="case-study-header">
      <p className="eyebrow">{project.category}</p>
      <h1>{project.title}</h1>
      <p className="case-study-summary">{project.description}</p>

      {facts.length > 0 ? (
        <dl className="case-study-facts">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {project.technologies.length > 0 ? (
        <div className="case-study-technologies">
          <p>Technologies</p>
          <ul aria-label="Technologies used">
            {project.technologies.map((technology) => (
              <li key={technology}>
                <Badge variant="outline">{technology}</Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {project.links.length > 0 ? (
        <ul aria-label="Project links" className="case-study-links">
          {project.links.map((link) => (
            <li key={`${link.kind}:${link.href}`}>
              <a
                className="button-secondary"
                href={link.href}
                rel="noreferrer noopener"
                target="_blank"
              >
                {link.label}
                <span aria-hidden="true"> ↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}

function CaseStudyOutline({
  outline,
}: Readonly<{ outline: readonly CaseStudyOutlineItem[] }>) {
  if (outline.length < 4) {
    return null;
  }

  return (
    <nav aria-label="Case study sections" className="case-study-outline">
      <p>On this page</p>
      <ol>
        {outline.map((item) => (
          <li data-depth={item.depth} key={item.id}>
            <a href={`#${item.id}`}>{item.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function CaseStudyMetrics({ project }: Readonly<{ project: CaseStudyPageData }>) {
  if (project.metrics.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="project-evidence-heading" className="case-study-section">
      <p className="eyebrow">Evidence</p>
      <h2 id="project-evidence-heading">Measured shape</h2>
      <dl className="case-study-metrics">
        {project.metrics.map((metric) => (
          <div key={`${metric.label}:${metric.value}`}>
            <dt>{metric.label}</dt>
            <dd>
              <span className="case-study-metric-value">{metric.value}</span>
              {metric.context ? (
                <span className="case-study-metric-context">
                  {metric.context}
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function CaseStudyRenderer({
  Content,
  navigation,
  outline,
  project,
}: Readonly<{
  Content: ComponentType;
  navigation: Readonly<{
    previous: CaseStudyNavigationItem | null;
    next: CaseStudyNavigationItem | null;
  }>;
  outline: readonly CaseStudyOutlineItem[];
  project: CaseStudyPageData;
}>) {
  return (
    <main
      className="site-container case-study-page"
      id="main-content"
      tabIndex={-1}
    >
      <Link className="text-link font-mono text-sm" href="/work">
        ← All selected work
      </Link>

      <article data-work-mode={project.workMode}>
        <CaseStudyHeader project={project} />
        {project.hero ? <CaseStudyHero media={project.hero} /> : null}

        <div className="case-study-reading-layout">
          <CaseStudyOutline outline={outline} />
          <div className="case-study-main-column">
            <CaseStudyMetrics project={project} />
            <div className="case-study-content">
              <Content />
            </div>
            <CaseStudyGallery media={project.media} />
            <CaseStudyVideos videos={project.videos} />
          </div>
        </div>

        <CaseStudyNavigation {...navigation} />
      </article>
    </main>
  );
}
