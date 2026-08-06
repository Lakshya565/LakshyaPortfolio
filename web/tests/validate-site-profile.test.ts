import { describe, expect, it } from "vitest";

import {
  assertValidSiteProfile,
  getSiteProfileValidationIssues,
} from "../lib/content/validate-site-profile";
import type { SiteProfile } from "../types/content";

const validProfile: SiteProfile = {
  name: "Lakshya Agarwal",
  headline: "Computer Engineering student.",
  shortIntro: "Building across software and hardware.",
};

describe("site profile validation", () => {
  it("accepts a complete profile", () => {
    expect(getSiteProfileValidationIssues(validProfile)).toEqual([]);
    expect(() => assertValidSiteProfile(validProfile)).not.toThrow();
  });

  it("reports every blank required field", () => {
    const invalidProfile: SiteProfile = {
      name: " ",
      headline: "",
      shortIntro: "\n",
    };

    expect(getSiteProfileValidationIssues(invalidProfile)).toEqual([
      "name must not be empty",
      "headline must not be empty",
      "shortIntro must not be empty",
    ]);
  });

  it("throws an actionable validation error", () => {
    expect(() =>
      assertValidSiteProfile({ ...validProfile, headline: "" }),
    ).toThrow("headline must not be empty");
  });
});
