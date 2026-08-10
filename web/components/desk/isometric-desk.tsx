import { DeskExperience } from "@/components/desk/desk-experience";
import { ProjectTree } from "@/components/project-tree/project-tree";
import type { HomePageData } from "@/lib/content/page-data";

export function IsometricDesk({
  data,
}: Readonly<{
  data: Pick<HomePageData, "personalHotspots" | "projectTree">;
}>) {
  return (
    <DeskExperience
      hotspots={data.personalHotspots}
      projectTree={
        <ProjectTree branchHeadingLevel="h3" data={data.projectTree} />
      }
    />
  );
}
