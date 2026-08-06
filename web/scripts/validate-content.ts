import { siteProfile } from "@/content/site";
import { assertValidSiteProfile } from "@/lib/content/validate-site-profile";

assertValidSiteProfile(siteProfile);

console.log(`Content validation passed for ${siteProfile.name}.`);

