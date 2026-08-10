import { DeskExperience } from "@/components/desk/desk-experience";
import { ProjectSystem } from "@/components/project-system/project-system";
import type { HomePageData } from "@/lib/content/page-data";

export function IsometricDesk({
  data,
}: Readonly<{
  data: Pick<HomePageData, "personalHotspots" | "projectSystem">;
}>) {
  return (
    <DeskExperience
      hotspots={data.personalHotspots}
      projectSystem={
        <ProjectSystem
          data={data.projectSystem}
          headingId="dialog-project-system-heading"
        />
      }
    />
  );
}
