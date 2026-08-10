import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudyRenderer } from "@/components/case-study/case-study-renderer";
import { loadCaseStudyDocument } from "@/content/case-studies/registry";
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

  const document = await loadCaseStudyDocument(project.caseStudyKey);

  return (
    <CaseStudyRenderer
      Content={document.Content}
      navigation={project.navigation}
      outline={document.outline}
      project={project.pageData}
    />
  );
}
