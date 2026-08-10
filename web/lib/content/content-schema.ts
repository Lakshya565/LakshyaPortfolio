import { z } from "zod";

import {
  caseStudyKeys,
  personalMotifKeys,
  projectAssetKinds,
  projectCategories,
  projectLinkKinds,
  projectWorkModes,
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

const siteProfileSchema = z.object({
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

const socialLinkSchema = z.discriminatedUnion("status", [
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
  value: z.union([nonEmptyText, z.number().finite()]),
  context: nonEmptyText.optional(),
});

const projectAssetSchema = z.object({
  kind: z.enum(projectAssetKinds),
  path: z
    .string()
    .regex(
      /^\/media\/projects\/[a-z0-9][a-z0-9/_-]*\.(?:avif|jpe?g|png|svg|webp)$/,
      {
        message:
          "must be a lowercase /media/projects/... path with a supported image extension",
      },
    )
    .refine((value) => !value.includes("//"), "must not contain empty segments")
    .refine((value) => !value.includes(".."), "must not traverse directories")
    .refine((value) => !value.includes("\\"), "must use forward slashes"),
  alt: nonEmptyText,
  caption: nonEmptyText.optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  placeholder: z.boolean(),
});

const projectVideoSchema = z.object({
  label: nonEmptyText,
  href: webUrl,
  thumbnailPath: projectAssetSchema.shape.path.optional(),
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
  workMode: z.enum(projectWorkModes),
  publication: z.enum(["draft", "published"]),
  contentStatus: z.enum(["placeholder", "reviewed"]),
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
  videos: z.array(projectVideoSchema),
});

const archiveProjectSchema = projectBaseSchema.extend({
  presentation: z.literal("archive-card"),
  priority: z.literal("archive"),
  caseStudyKey: z.null(),
});

const projectSchema = z.discriminatedUnion("presentation", [
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

const personalMotifSchema = z.object({
  key: z.enum(personalMotifKeys),
  label: nonEmptyText,
  detail: z.string().trim().min(20),
  group: z.enum(["engineering", "life"]),
  displayOrder: z.number().int().nonnegative(),
});

export const portfolioContentSchema = z.object({
  siteProfile: siteProfileSchema,
  socialLinks: z.array(socialLinkSchema),
  projects: z.array(projectSchema).min(1),
  skillGroups: z.array(skillGroupSchema),
  aboutItems: z.array(aboutItemSchema),
  personalMotifs: z.array(personalMotifSchema),
});
