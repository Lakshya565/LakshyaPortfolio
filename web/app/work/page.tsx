import type { Metadata } from "next";

import { ProjectSystem } from "@/components/project-system/project-system";
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
      <ProjectSystem
        data={data.projectSystem}
        headingId="work-project-system-heading"
        headingLevel="h1"
      />
    </main>
  );
}
