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
    status: "pending",
    href: null,
    requestedInput: "Lakshya's public GitHub profile URL",
  },
  {
    kind: "linkedin",
    label: "LinkedIn",
    status: "pending",
    href: null,
    requestedInput: "Lakshya's public LinkedIn profile URL",
  },
  {
    kind: "email",
    label: "Email",
    status: "pending",
    href: null,
    requestedInput: "Lakshya's public contact email address",
  },
] as const satisfies readonly SocialLink[];
