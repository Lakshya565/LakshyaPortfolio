import type { SiteProfile, SocialLink } from "@/types/content";

export const siteProfile = {
  name: "Lakshya Agarwal",
  headline: "I make computers do useful things in the real world.",
  shortIntro:
    "Studying Computer Engineering at UIUC, building software, hardware, and AI systems that survive contact with real people and real constraints. Previously interned at Cisco as a Software Engineer on the Industrial IoT team.",
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
  /**
   * The resume, served from this site rather than from a file host.
   *
   * The `href` is a path, not a URL — the only social link that is. The schema
   * in `content-schema.ts` enforces that it names a PDF at the root of
   * `public/`, and `validate-portfolio-content.ts` fails the build if that file
   * is not actually there, because a resume link that 404s is worse than no
   * resume link at all.
   *
   * **To update it, replace `public/lakshya-agarwal-resume.pdf` and commit.**
   * The filename is deliberately stable and not versioned: anyone who has the
   * link from an application should keep getting the current document.
   */
  {
    kind: "resume",
    label: "Resume",
    status: "published",
    href: "/lakshya-agarwal-resume.pdf",
  },
] as const satisfies readonly SocialLink[];
