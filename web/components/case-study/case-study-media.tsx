import Image from "next/image";

import { Backlight } from "@/components/ui/backlight";
import type {
  CaseStudyMediaData,
  CaseStudyVideoData,
} from "@/lib/content/case-study-normalization";

/**
 * The one figure left on the page: a video thumbnail. Project photos moved to
 * `case-study-shuffle.tsx`, which stacks them rather than laying them out.
 */
function ProjectFigure({ media }: Readonly<{ media: CaseStudyMediaData }>) {
  return (
    /* The same halo the header shuffle wears, at a blur scaled to a card a
       third the size — a thumbnail carried the header's 20px as a smear. */
    <Backlight blur={12} className="case-study-backlight">
      <figure className="case-study-figure" data-media-kind={media.kind}>
        <Image
          alt={media.alt}
          className="case-study-image"
          height={media.height}
          sizes="(min-width: 56rem) 24rem, calc(100vw - 2rem)"
          src={media.src}
          unoptimized={media.src.endsWith(".svg")}
          width={media.width}
        />
        {media.caption ? <figcaption>{media.caption}</figcaption> : null}
      </figure>
    </Backlight>
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
