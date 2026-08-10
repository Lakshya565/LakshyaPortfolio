import type { SiteProfile, SocialLink } from "@/types/content";

export const siteProfile = {
  name: "Lakshya Agarwal",
  headline: "I make computers do useful things in the real world.",
  shortIntro:
    "I am a Computer Engineering student at UIUC building software, hardware, and AI systems that have to survive contact with real people and real constraints.",
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
