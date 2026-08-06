import "server-only";

import { siteProfile } from "@/content/site";
import { assertValidSiteProfile } from "@/lib/content/validate-site-profile";

export function getSiteProfile() {
  assertValidSiteProfile(siteProfile);
  return siteProfile;
}

