import type { MetadataRoute } from "next";

import { buildRobots } from "@/lib/metadata/discovery";
import { getSiteOrigin } from "@/lib/metadata/site-origin";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(getSiteOrigin());
}
