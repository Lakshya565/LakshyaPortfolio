import type { MetadataRoute } from "next";

import { portfolioContent } from "@/content/portfolio";
import { getPublishedCaseStudyProjects } from "@/lib/content/project-queries";
import type { PortfolioContent } from "@/types/content";

export function buildRobots(origin: URL | null): MetadataRoute.Robots {
  if (!origin) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", origin).href,
  };
}

export function buildSitemap(
  origin: URL | null,
  content: Pick<PortfolioContent, "projects"> = portfolioContent,
): MetadataRoute.Sitemap {
  if (!origin) {
    return [];
  }

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: new URL("/", origin).href,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: new URL("/about", origin).href,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
  const projectEntries: MetadataRoute.Sitemap =
    getPublishedCaseStudyProjects(content).map((project) => ({
      url: new URL(`/projects/${project.slug}`, origin).href,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [...staticEntries, ...projectEntries];
}
