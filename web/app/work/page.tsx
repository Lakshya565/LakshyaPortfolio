import type { Metadata } from "next";

import { ProjectTree } from "@/components/project-tree/project-tree";
import { getWorkPageData } from "@/lib/content/portfolio-repository";
import { buildStaticPageMetadata } from "@/lib/metadata/site-metadata";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "Work",
  description:
    "Explore Lakshya Agarwal's software, AI, embedded-systems, and hardware projects.",
  path: "/work",
});

export default function WorkPage() {
  const data = getWorkPageData();

  return (
    <main className="work-page site-container" id="main-content" tabIndex={-1}>
      <header className="project-tree-page-header">
        <p className="eyebrow">Work · {data.projectTree.projectCount} projects</p>
        <h1>Project tree</h1>
        <p>Open a node for context, or follow it to the complete project story.</p>
      </header>
      <ProjectTree data={data.projectTree} />
    </main>
  );
}
