import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { loadCaseStudy } from "@/content/case-studies/registry";
import {
  getProjectRouteData,
  getStaticProjectParams,
} from "@/lib/content/portfolio-repository";
import { buildProjectMetadata } from "@/lib/metadata/project-metadata";

export const dynamicParams = false;

type ProjectPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export function generateStaticParams() {
  return [...getStaticProjectParams()];
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectRouteData(slug);

  if (!project) {
    notFound();
  }

  return buildProjectMetadata(project.pageData);
}

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectRouteData(slug);

  if (!project) {
    notFound();
  }

  const CaseStudy = await loadCaseStudy(project.caseStudyKey);

  return (
    <main className="site-container pb-24 pt-12 sm:pb-32 sm:pt-20" id="main-content">
      <Link className="text-link font-mono text-sm" href="/#work">
        ← All selected work
      </Link>

      <article className="mx-auto mt-12 max-w-3xl">
        <header className="border-b border-line pb-10">
          <p className="eyebrow">{project.pageData.category}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-primary sm:text-6xl">
            {project.pageData.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-secondary">
            {project.pageData.description}
          </p>
          <dl className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Role</dt>
              <dd className="mt-1 text-primary">{project.pageData.role}</dd>
            </div>
            <div>
              <dt className="text-muted">Technologies</dt>
              <dd className="mt-1 text-primary">
                {project.pageData.technologies.join(", ")}
              </dd>
            </div>
          </dl>
        </header>

        <div className="case-study-content mt-10">
          <CaseStudy />
        </div>
      </article>
    </main>
  );
}
