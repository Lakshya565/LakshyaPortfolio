import Image from "next/image";

import type {
  CaseStudyMediaData,
  CaseStudyVideoData,
} from "@/lib/content/case-study-normalization";

function ProjectFigure({
  media,
  preload = false,
}: Readonly<{
  media: CaseStudyMediaData;
  preload?: boolean;
}>) {
  return (
    <figure className="case-study-figure" data-media-kind={media.kind}>
      <Image
        alt={media.alt}
        className="case-study-image"
        height={media.height}
        preload={preload}
        sizes="(min-width: 64rem) 48rem, (min-width: 40rem) calc(100vw - 6rem), calc(100vw - 2rem)"
        src={media.src}
        unoptimized={media.src.endsWith(".svg")}
        width={media.width}
      />
      {media.caption ? <figcaption>{media.caption}</figcaption> : null}
    </figure>
  );
}

export function CaseStudyHero({ media }: Readonly<{ media: CaseStudyMediaData }>) {
  return (
    <div className="case-study-hero">
      <ProjectFigure media={media} preload />
    </div>
  );
}

export function CaseStudyGallery({
  media,
}: Readonly<{ media: readonly CaseStudyMediaData[] }>) {
  if (media.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="project-media-heading" className="case-study-section">
      <p className="eyebrow">Artifacts</p>
      <h2 id="project-media-heading">Project media</h2>
      <div className="case-study-gallery">
        {media.map((item) => (
          <ProjectFigure key={item.src} media={item} />
        ))}
      </div>
    </section>
  );
}

function CaseStudyVideoCard({ video }: Readonly<{ video: CaseStudyVideoData }>) {
  return (
    <a
      className={video.thumbnail ? "case-study-video-link" : "button-secondary"}
      href={video.href}
      rel="noreferrer noopener"
      target="_blank"
    >
      {video.thumbnail ? <ProjectFigure media={video.thumbnail} /> : null}
      <span>
        {video.label}
        <span aria-hidden="true"> ↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </span>
    </a>
  );
}

export function CaseStudyVideos({
  videos,
}: Readonly<{ videos: readonly CaseStudyVideoData[] }>) {
  if (videos.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="project-videos-heading" className="case-study-section">
      <p className="eyebrow">Videos</p>
      <h2 id="project-videos-heading">Watch the project</h2>
      <ul className="case-study-video-list">
        {videos.map((video) => (
          <li key={video.href}>
            <CaseStudyVideoCard video={video} />
          </li>
        ))}
      </ul>
    </section>
  );
}
