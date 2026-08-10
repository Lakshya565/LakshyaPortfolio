import type { Metadata } from "next";

import { getSiteOrigin } from "./site-origin";
import {
  socialImageAlt,
  socialImagePath,
  socialImageSize,
} from "./social-image-config";

export const siteName = "Lakshya Agarwal";
const siteDescription =
  "Lakshya Agarwal builds software, AI systems, embedded devices, and hardware products.";

export function getSocialImageMetadata(origin: URL) {
  return {
    url: new URL(socialImagePath, origin),
    width: socialImageSize.width,
    height: socialImageSize.height,
    alt: socialImageAlt,
  } as const;
}

type StaticPageMetadataInput = Readonly<{
  title: string;
  description: string;
  path: `/${string}`;
}>;

export function buildRootMetadata(
  origin: URL | null = getSiteOrigin(),
): Metadata {
  return {
    ...(origin
      ? {
          metadataBase: origin,
          alternates: { canonical: new URL("/", origin) },
        }
      : {}),
    title: {
      default: `${siteName} — Computer Engineer`,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    applicationName: `${siteName} Portfolio`,
    authors: [{ name: siteName }],
    creator: siteName,
    robots: origin
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
      title: `${siteName} — Computer Engineer`,
      description: siteDescription,
      ...(origin ? { url: origin } : {}),
      ...(origin ? { images: [getSocialImageMetadata(origin)] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} — Computer Engineer`,
      description: siteDescription,
      ...(origin ? { images: [getSocialImageMetadata(origin)] } : {}),
    },
  };
}

export function buildStaticPageMetadata(
  { title, description, path }: StaticPageMetadataInput,
  origin: URL | null = getSiteOrigin(),
): Metadata {
  const canonical = origin ? new URL(path, origin) : null;

  return {
    title,
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      ...(canonical ? { url: canonical } : {}),
      ...(origin ? { images: [getSocialImageMetadata(origin)] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(origin ? { images: [getSocialImageMetadata(origin)] } : {}),
    },
  };
}
