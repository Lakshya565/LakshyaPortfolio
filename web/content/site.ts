import type { SiteProfile, SocialLink } from "@/types/content";

export const siteProfile = {
  name: "Lakshya Agarwal",
  headline:
    "Computer Engineering student building across software, AI, and hardware.",
  shortIntro:
    "I build complete systems across software and hardware, with an emphasis on thoughtful technical decisions, evidence, and the people a system is meant to help.",
  location: "University of Illinois Urbana-Champaign",
} as const satisfies SiteProfile;

export const socialLinks = [
  {
    kind: "github",
    label: "GitHub",
    status: "published",
    href: "https://github.com/Lakshya565",
  },
  {
    kind: "linkedin",
    label: "LinkedIn",
    status: "published",
    href: "https://www.linkedin.com/in/lakshya-agarwal-b43515317/",
  },
  {
    kind: "email",
    label: "Email",
    status: "published",
    href: "mailto:lakshya6@illinois.edu",
  },
] as const satisfies readonly SocialLink[];
