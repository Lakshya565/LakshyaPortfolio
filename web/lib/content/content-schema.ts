import { z } from "zod";

import {
  caseStudyKeys,
  projectAccentTokens,
  projectAssetKinds,
  projectCategories,
  projectLinkKinds,
  socialLinkKinds,
} from "@/types/content";

const nonEmptyText = z.string().trim().min(1);
const webUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://"), "must use https://");
const projectDate = z
  .string()
  .regex(/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/, "must use YYYY or YYYY-MM")
  .nullable();

export const siteProfileSchema = z.object({
  name: nonEmptyText,
  headline: nonEmptyText,
  shortIntro: nonEmptyText,
  location: nonEmptyText,
});

const pendingSocialLinkSchema = z.object({
  kind: z.enum(socialLinkKinds),
  label: nonEmptyText,
  status: z.literal("pending"),
  href: z.null(),
  requestedInput: nonEmptyText,
});

const publishedSocialLinkSchema = z
  .object({
    kind: z.enum(socialLinkKinds),
    label: nonEmptyText,
    status: z.literal("published"),
    href: nonEmptyText,
  })
  .superRefine((link, context) => {
    const isValid =
      link.kind === "email"
        ? /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(link.href)
        : (() => {
            try {
              return new URL(link.href).protocol === "https:";
            } catch {
              return false;
            }
          })();

    if (!isValid) {
      context.addIssue({
        code: "custom",
        path: ["href"],
        message:
          link.kind === "email"
            ? "must be a valid mailto address"
            : "must be a valid https URL",
      });
    }
  });

export const socialLinkSchema = z.discriminatedUnion("status", [
  pendingSocialLinkSchema,
  publishedSocialLinkSchema,
]);

const projectLinkSchema = z.object({
  kind: z.enum(projectLinkKinds),
  label: nonEmptyText,
  href: webUrl,
});

const projectMetricSchema = z.object({
  label: nonEmptyText,
  value: nonEmptyText,
  context: nonEmptyText.optional(),
  sourceNote: nonEmptyText.optional(),
});

const projectAssetSchema = z.object({
  kind: z.enum(projectAssetKinds),
  path: z
    .string()
    .regex(/^\/media\/[a-z0-9][a-z0-9/_-]*\.[a-z0-9]+$/, {
      message: "must be a lowercase /media/... public path",
    })
    .refine((value) => !value.includes(".."), "must not traverse directories")
    .refine((value) => !value.includes("\\"), "must use forward slashes"),
  alt: nonEmptyText,
  caption: nonEmptyText.optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  placeholder: z.boolean(),
});

const projectBaseSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: nonEmptyText,
  category: z.enum(projectCategories),
  shortDescription: z.string().trim().min(40),
  role: nonEmptyText,
  startDate: projectDate,
  endDate: projectDate,
  technologies: z.array(nonEmptyText).min(1),
  accent: z.enum(projectAccentTokens),
  publication: z.enum(["draft", "published"]),
  contentStatus: z.enum(["placeholder", "reviewed"]),
  launchTarget: z.literal("initial"),
  displayOrder: z.number().int().nonnegative(),
  displayInMap: z.boolean(),
  links: z.array(projectLinkSchema),
  metrics: z.array(projectMetricSchema),
  assets: z.array(projectAssetSchema),
});

const caseStudyProjectSchema = projectBaseSchema.extend({
  presentation: z.literal("case-study"),
  priority: z.enum(["featured", "supporting"]),
  caseStudyKey: z.enum(caseStudyKeys),
});

const archiveProjectSchema = projectBaseSchema.extend({
  presentation: z.literal("archive-card"),
  priority: z.literal("archive"),
  caseStudyKey: z.null(),
  displayInMap: z.literal(false),
});

export const projectSchema = z.discriminatedUnion("presentation", [
  caseStudyProjectSchema,
  archiveProjectSchema,
]);

const skillGroupSchema = z.object({
  name: nonEmptyText,
  displayOrder: z.number().int().nonnegative(),
  skills: z.array(nonEmptyText).min(1),
});

const aboutItemSchema = z.object({
  category: z.enum(["education", "leadership", "community", "interests"]),
  title: nonEmptyText,
  body: z.string().trim().min(40),
  displayOrder: z.number().int().nonnegative(),
});

const experienceSchema = z.object({
  organization: nonEmptyText,
  role: nonEmptyText,
  summary: z.string().trim().min(40),
  displayOrder: z.number().int().nonnegative(),
});

export const portfolioContentSchema = z.object({
  siteProfile: siteProfileSchema,
  socialLinks: z.array(socialLinkSchema),
  projects: z.array(projectSchema).min(1),
  skillGroups: z.array(skillGroupSchema),
  aboutItems: z.array(aboutItemSchema),
  experiences: z.array(experienceSchema),
});
