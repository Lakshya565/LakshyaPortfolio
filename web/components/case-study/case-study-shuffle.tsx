"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";

import type { CaseStudyMediaData } from "@/lib/content/case-study-normalization";

/**
 * The project's photos, crossfading beside the case-study header.
 *
 * **Photos only.** Videos on this site are long form, so they stay in the
 * "Watch the project" section below, where a deliberate click opens them in a
 * new tab. Nothing here plays, which is why the whole component is two `<img>`
 * layers and an interval rather than a media player.
 *
 * **Every image is mounted the whole time**, and the current one is the only
 * one at full opacity. Swapping which node is rendered would decode the next
 * image mid-fade and flash; changing an opacity cannot. It also means the frame
 * cannot resize between slides, because all of them occupy it at once.
 *
 * The dash between "shows one photo" and "is usable" is the pause: the cycle
 * stops on hover and on `focus-within`, so a slide is never moving out from
 * under a pointer or a keyboard focus ring.
 */

/** Long enough to look at a photo, short enough to see a second one. */
const slideDuration = 5000;

export function CaseStudyShuffle({
  media,
}: Readonly<{ media: readonly CaseStudyMediaData[] }>) {
  const headingId = useId();
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const canCycle = media.length > 1 && !prefersReducedMotion && !isPaused;

  useEffect(() => {
    if (!canCycle) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % media.length);
    }, slideDuration);

    return () => window.clearInterval(timer);
  }, [canCycle, media.length]);

  if (media.length === 0) {
    return null;
  }

  const current = media[index] ?? media[0];

  return (
    <section
      aria-labelledby={headingId}
      className="case-study-shuffle"
      onBlur={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <h2 className="sr-only" id={headingId}>
        Project photos
      </h2>

      <div className="case-study-shuffle-frame">
        {media.map((item, itemIndex) => (
          <Image
            alt={item.alt}
            aria-hidden={itemIndex === index ? undefined : true}
            className="case-study-shuffle-image"
            data-active={itemIndex === index ? "true" : undefined}
            height={item.height}
            key={item.src}
            /* Only the first is worth blocking on: the rest are behind a fade
               that has not started yet when the page paints. */
            preload={itemIndex === 0}
            sizes="(min-width: 68rem) 22rem, (min-width: 40rem) calc(100vw - 6rem), calc(100vw - 2rem)"
            src={item.src}
            unoptimized={item.src.endsWith(".svg")}
            width={item.width}
          />
        ))}
      </div>

      {current.caption ? (
        <p className="case-study-shuffle-caption">{current.caption}</p>
      ) : null}

      {media.length > 1 ? (
        <ul aria-label="Choose a photo" className="case-study-shuffle-dots">
          {media.map((item, itemIndex) => (
            <li key={item.src}>
              <button
                aria-current={itemIndex === index ? "true" : undefined}
                aria-label={`Show photo ${itemIndex + 1} of ${media.length}`}
                onClick={() => setIndex(itemIndex)}
                type="button"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
