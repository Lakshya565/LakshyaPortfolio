export const socialLinkKinds = ["github", "linkedin", "email"] as const;
export type SocialLinkKind = (typeof socialLinkKinds)[number];

type PendingSocialLink = Readonly<{
  kind: SocialLinkKind;
  label: string;
  status: "pending";
  href: null;
  requestedInput: string;
}>;

export type PublishedSocialLink = Readonly<{
  kind: SocialLinkKind;
  label: string;
  status: "published";
  href: string;
}>;

export type SocialLink = PendingSocialLink | PublishedSocialLink;

export type SiteProfile = Readonly<{
  name: string;
  headline: string;
  shortIntro: string;
  location: string;
}>;

export const projectCategories = [
  "AI Systems",
  "Developer Tools",
  "Full-stack Software",
  "Embedded Systems",
  "Hardware",
] as const;
export type ProjectCategory = (typeof projectCategories)[number];

export const projectWorkModes = ["software", "hardware", "hybrid"] as const;
export type ProjectWorkMode = (typeof projectWorkModes)[number];

/** The single source for branch naming, shared by the tree and case studies. */
export const projectWorkModeLabels = {
  hybrid: "Hybrid",
  software: "Software",
  hardware: "Hardware",
} as const satisfies Readonly<Record<ProjectWorkMode, string>>;

/**
 * Explicit `endDate` sentinel for work that is still running. A `null` end date
 * means the end is unknown; only this value licenses rendering "– Present".
 */
export const ongoingProjectDate = "present";

export const projectLinkKinds = ["repository", "live", "video"] as const;
export type ProjectLinkKind = (typeof projectLinkKinds)[number];

export const projectAssetKinds = [
  "hero",
  "screenshot",
  "diagram",
  "hardware-photo",
  "gallery",
  "video-thumbnail",
] as const;
export type ProjectAssetKind = (typeof projectAssetKinds)[number];

export const projectSlugs = [
  "cisco-agentic-runbook-creator",
  "repoframe",
  "nucurrent-inventory-system",
  "smartlift-sleeve",
  "quackta",
  "lucky-arduino",
  "backbuddy",
  "neurify",
  "agrisense",
  "risenrun-wifi-alarm-clock",
] as const;
export type ProjectSlug = (typeof projectSlugs)[number];
export type CaseStudyKey = ProjectSlug;

export const personalMotifKeys = [
  "maker-origin",
  "quackta",
  "taekwondo",
  "scouting",
  "shared-food",
  "food-favorites",
  "climbing",
  "gym",
  "anime",
  "kirby",
  "triforce",
  "music",
] as const;
export type PersonalMotifKey = (typeof personalMotifKeys)[number];

type ProjectLink = Readonly<{
  kind: ProjectLinkKind;
  label: string;
  href: string;
}>;

type ProjectMetric = Readonly<{
  label: string;
  value: string | number;
  context?: string;
}>;

type ProjectAsset = Readonly<{
  kind: ProjectAssetKind;
  path: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  placeholder: boolean;
}>;

type ProjectVideo = Readonly<{
  label: string;
  href: string;
  thumbnailPath?: string;
}>;

type ProjectBase = Readonly<{
  slug: ProjectSlug;
  title: string;
  category: ProjectCategory;
  shortDescription: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
  technologies: readonly string[];
  workMode: ProjectWorkMode;
  publication: "draft" | "published";
  contentStatus: "placeholder" | "reviewed";
  displayOrder: number;
  links: readonly ProjectLink[];
  metrics: readonly ProjectMetric[];
  assets: readonly ProjectAsset[];
  videos: readonly ProjectVideo[];
}>;

export type Project = ProjectBase;
export type CaseStudyProject = Project;

export type SkillGroup = Readonly<{
  name: string;
  displayOrder: number;
  skills: readonly string[];
}>;

export type AboutItem = Readonly<{
  category: "education" | "leadership" | "community" | "interests";
  title: string;
  body: string;
  displayOrder: number;
}>;

export type PersonalMotif = Readonly<{
  key: PersonalMotifKey;
  label: string;
  detail: string;
  group: "engineering" | "life";
  displayOrder: number;
}>;

export type PortfolioContent = Readonly<{
  siteProfile: SiteProfile;
  socialLinks: readonly SocialLink[];
  projects: readonly Project[];
  skillGroups: readonly SkillGroup[];
  aboutItems: readonly AboutItem[];
  personalMotifs: readonly PersonalMotif[];
}>;
