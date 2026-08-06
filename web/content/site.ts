import type { SiteProfile } from "@/types/content";

export const siteProfile = {
  name: "Lakshya Agarwal",
  headline:
    "Computer Engineering student building across software, AI, and hardware.",
  shortIntro:
    "This first milestone proves the static application and local content boundary. Detailed project stories and the interactive circuit environment are intentionally deferred.",
} as const satisfies SiteProfile;
