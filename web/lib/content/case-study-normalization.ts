import type {
  CaseStudyProject,
  ProjectAssetKind,
  ProjectCategory,
  ProjectLinkKind,
  ProjectWorkMode,
} from "@/types/content";

type CaseStudyLinkData = Readonly<{
  kind: ProjectLinkKind;
  label: string;
  href: string;
}>;

type CaseStudyMetricData = Readonly<{
  label: string;
  value: string | number;
  context: string | null;
}>;

export type CaseStudyMediaData = Readonly<{
  kind: ProjectAssetKind;
  src: string;
  alt: string;
  caption: string | null;
  width: number;
  height: number;
}>;

export type CaseStudyVideoData = Readonly<{
  href: string;
  label: string;
  thumbnail: CaseStudyMediaData | null;
}>;

export type CaseStudyPageData = Readonly<{
  slug: string;
  title: string;
  category: ProjectCategory;
  description: string;
  role: string | null;
  dateLabel: string | null;
  technologies: readonly string[];
  workMode: ProjectWorkMode;
  links: readonly CaseStudyLinkData[];
  metrics: readonly CaseStudyMetricData[];
  hero: CaseStudyMediaData | null;
  media: readonly CaseStudyMediaData[];
  videos: readonly CaseStudyVideoData[];
}>;

export type CaseStudyNavigationItem = Readonly<{
  title: string;
  category: ProjectCategory;
  href: string;
}>;

const allowedMediaExtensions = new Set([
  "avif",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "webp",
]);

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function isSafeHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeProjectDate(value: string | null | undefined): string | null {
  const normalized = normalizeOptionalText(value);

  if (!normalized || !/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/.test(normalized)) {
    return null;
  }

  if (!normalized.includes("-")) {
    return normalized;
  }

  const [year, month] = normalized.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function formatProjectDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): string | null {
  const start = normalizeProjectDate(startDate);
  const end = normalizeProjectDate(endDate);

  if (start && end) {
    return start === end ? start : `${start} – ${end}`;
  }

  return start ?? end;
}

function normalizeLinks(project: CaseStudyProject): readonly CaseStudyLinkData[] {
  const seen = new Set<string>();

  return project.links.flatMap((link) => {
    const label = normalizeOptionalText(link.label);
    const href = link.href.trim();
    const key = `${link.kind}:${href}`;

    if (!label || !isSafeHttpsUrl(href) || seen.has(key)) {
      return [];
    }

    seen.add(key);
    return [{ kind: link.kind, label, href }];
  });
}

function normalizeMetrics(
  project: CaseStudyProject,
): readonly CaseStudyMetricData[] {
  return project.metrics.flatMap((metric) => {
    const label = normalizeOptionalText(metric.label);
    const value =
      typeof metric.value === "number"
        ? Number.isFinite(metric.value)
          ? metric.value
          : null
        : normalizeOptionalText(metric.value);

    if (!label || value === null) {
      return [];
    }

    return [
      {
        label,
        value,
        context: normalizeOptionalText(metric.context),
      },
    ];
  });
}

function normalizeMedia(
  project: CaseStudyProject,
): readonly CaseStudyMediaData[] {
  const namespace = `/media/projects/${project.slug}/`;
  const seen = new Set<string>();

  return project.assets.flatMap((asset) => {
    const src = asset.path.trim();
    const extension = src.split(".").pop()?.toLowerCase() ?? "";
    const alt = normalizeOptionalText(asset.alt);

    if (
      !src.startsWith(namespace) ||
      src.includes("//") ||
      src.includes("..") ||
      src.includes("\\") ||
      !allowedMediaExtensions.has(extension) ||
      !alt ||
      !Number.isInteger(asset.width) ||
      asset.width <= 0 ||
      !Number.isInteger(asset.height) ||
      asset.height <= 0 ||
      seen.has(src)
    ) {
      return [];
    }

    seen.add(src);
    return [
      {
        kind: asset.kind,
        src,
        alt,
        caption: normalizeOptionalText(asset.caption),
        width: asset.width,
        height: asset.height,
      },
    ];
  });
}

function normalizeVideos(
  project: CaseStudyProject,
  assets: readonly CaseStudyMediaData[],
): readonly CaseStudyVideoData[] {
  const seen = new Set<string>();
  const assetsByPath = new Map(assets.map((asset) => [asset.src, asset]));

  return project.videos.flatMap((video) => {
    const label = normalizeOptionalText(video.label);
    const href = video.href.trim();

    if (!label || !isSafeHttpsUrl(href) || seen.has(href)) {
      return [];
    }

    const thumbnailCandidate = video.thumbnailPath
      ? assetsByPath.get(video.thumbnailPath.trim())
      : null;
    const thumbnail =
      thumbnailCandidate?.kind === "video-thumbnail"
        ? thumbnailCandidate
        : null;

    seen.add(href);
    return [{ href, label, thumbnail }];
  });
}

export function toCaseStudyPageData(
  project: CaseStudyProject,
): CaseStudyPageData {
  const links = normalizeLinks(project);
  const assets = normalizeMedia(project);

  return {
    slug: project.slug,
    title: project.title.trim(),
    category: project.category,
    description: project.shortDescription.trim(),
    role: normalizeOptionalText(project.role),
    dateLabel: formatProjectDateRange(project.startDate, project.endDate),
    technologies: [
      ...new Set(
        project.technologies
          .map((technology) => technology.trim())
          .filter(Boolean),
      ),
    ],
    workMode: project.workMode,
    links,
    metrics: normalizeMetrics(project),
    hero: assets.find((asset) => asset.kind === "hero") ?? null,
    media: assets.filter(
      (asset) => asset.kind !== "hero" && asset.kind !== "video-thumbnail",
    ),
    videos: normalizeVideos(project, assets),
  };
}

export function toCaseStudyNavigationItem(
  project: CaseStudyProject,
): CaseStudyNavigationItem {
  return {
    title: project.title.trim(),
    category: project.category,
    href: `/projects/${project.slug}`,
  };
}
