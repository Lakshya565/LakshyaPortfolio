import type { SiteProfile } from "@/types/content";

type SiteProfileField = keyof SiteProfile;

const requiredFields: readonly SiteProfileField[] = [
  "name",
  "headline",
  "shortIntro",
  "location",
];

export function getSiteProfileValidationIssues(
  profile: SiteProfile,
): readonly string[] {
  return requiredFields.flatMap((field) =>
    profile[field].trim().length === 0 ? [`${field} must not be empty`] : [],
  );
}

export function assertValidSiteProfile(profile: SiteProfile): void {
  const issues = getSiteProfileValidationIssues(profile);

  if (issues.length > 0) {
    throw new Error(`Invalid site profile:\n- ${issues.join("\n- ")}`);
  }
}
