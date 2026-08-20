import {
  aboutIntro,
  aboutItems,
  aboutPanels,
  personalMotifs,
  skillGroups,
} from "@/content/about";
import { projects } from "@/content/projects";
import { siteProfile, socialLinks } from "@/content/site";
import type { PortfolioContent } from "@/types/content";

export const portfolioContent = {
  siteProfile,
  socialLinks,
  projects,
  skillGroups,
  aboutItems,
  personalMotifs,
  aboutIntro,
  aboutPanels,
} as const satisfies PortfolioContent;
