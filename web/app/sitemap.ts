import type { MetadataRoute } from "next";

import { buildSitemap } from "@/lib/metadata/discovery";
import { getSiteOrigin } from "@/lib/metadata/site-origin";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(getSiteOrigin());
}
