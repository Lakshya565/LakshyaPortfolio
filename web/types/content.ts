export const socialLinkKinds = ["github", "linkedin", "email"] as const;
export type SocialLinkKind = (typeof socialLinkKinds)[number];

export type PendingSocialLink = Readonly<{
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

export const projectAccentTokens = ["green", "purple", "mixed"] as const;
export type ProjectAccentToken = (typeof projectAccentTokens)[number];

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

export const caseStudyKeys = [
  "cisco-agentic-runbook-creator",
  "repoframe",
  "nucurrent-inventory-system",
  "smartlift-sleeve",
  "quackta",
] as const;
export type CaseStudyKey = (typeof caseStudyKeys)[number];

export type ProjectLink = Readonly<{
  kind: ProjectLinkKind;
  label: string;
  href: string;
}>;

export type ProjectMetric = Readonly<{
  label: string;
  value: string;
  context?: string;
  sourceNote?: string;
}>;

export type ProjectAsset = Readonly<{
  kind: ProjectAssetKind;
  path: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  placeholder: boolean;
}>;

type ProjectBase = Readonly<{
  slug: string;
  title: string;
  category: ProjectCategory;
  shortDescription: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
  technologies: readonly string[];
  accent: ProjectAccentToken;
  publication: "draft" | "published";
  contentStatus: "placeholder" | "reviewed";
  launchTarget: "initial";
  displayOrder: number;
  displayInMap: boolean;
  links: readonly ProjectLink[];
  metrics: readonly ProjectMetric[];
  assets: readonly ProjectAsset[];
}>;

export type CaseStudyProject = ProjectBase &
  Readonly<{
    presentation: "case-study";
    priority: "featured" | "supporting";
    caseStudyKey: CaseStudyKey;
  }>;

export type ArchiveProject = ProjectBase &
  Readonly<{
    presentation: "archive-card";
    priority: "archive";
    caseStudyKey: null;
    displayInMap: false;
  }>;

export type Project = CaseStudyProject | ArchiveProject;

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

export type Experience = Readonly<{
  organization: string;
  role: string;
  summary: string;
  displayOrder: number;
}>;

export type PortfolioContent = Readonly<{
  siteProfile: SiteProfile;
  socialLinks: readonly SocialLink[];
  projects: readonly Project[];
  skillGroups: readonly SkillGroup[];
  aboutItems: readonly AboutItem[];
  experiences: readonly Experience[];
}>;
