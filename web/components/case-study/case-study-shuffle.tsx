"use client";

import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";

import { Backlight } from "@/components/ui/backlight";
import type { CaseStudyMediaData } from "@/lib/content/case-study-normalization";

/**
 * The project's photos, crossfading beside the case-study header.
 *
 * **Photos only.** Videos on this site are long form, so they stay in the
 * "Watch the project" section below, where a deliberate click opens them in a
 * new tab. Nothing here plays, which is why the whole component is two `<img>`
 * layers and a timer rather than a media player.
 *
 * **Every image is mounted the whole time**, and the current one is the only
 * one at full opacity. Swapping which node is rendered would decode the next
 * image mid-fade and flash; changing an opacity cannot. It also means the frame
 * cannot resize between slides, because all of them occupy it at once.
 *
 * **Nothing is cropped.** These are phone photos: the set runs from 9:16
 * portrait to 2:1 landscape, and most projects mix both, so a fixed box with
 * `object-fit: cover` would guillotine half of them. Instead each photo is
 * `contain`ed, and a blurred, enlarged copy of that same photo fills whatever
 * is left over — the frame is always full, and the leftover is made of the
 * picture rather than of a grey bar.
 *
 * The frame's ratio is still fixed for the whole run, for the resize reason
 * above, but it is **this project's** ratio: see `frameRatio`.
 *
 * The dash between "shows one photo" and "is usable" is the pause: the cycle
 * stops on hover and on `focus-within`, so a slide is never moving out from
 * under a pointer or a keyboard focus ring.
 *
 * **The progress bar and the timer share one clock.** The bar is a CSS
 * animation, so pausing is `animation-play-state` rather than arithmetic — but
 * a paused CSS animation resumes from where it froze, so the timer has to as
 * well or the photo would change after the bar had already filled. That is what
 * `remainingRef` is for, and it is the only reason this component tracks time
 * itself instead of setting a plain interval.
 */

/** Long enough to look at a photo, short enough to see a second one. */
const slideDuration = 5000;

/* Portrait phones and landscape cameras cannot share one box without one of
   them being stranded in a wide margin. The bounds are the tallest and widest
   frames the header column can carry without either dwarfing the text beside
   it or squashing to a letterbox. */
const narrowestFrame = 0.82;
const widestFrame = 1.6;

/**
 * One aspect ratio for a whole set of photos: the geometric mean of theirs.
 *
 * The mean has to be geometric rather than arithmetic because these are
 * ratios — 2:1 and 1:2 are equal and opposite, and should average to square.
 * Arithmetically they average to 1.25, which tilts every mixed set landscape
 * and pushes the portraits into pillarboxes.
 */
function frameRatio(media: readonly CaseStudyMediaData[]) {
  const ratios = media
    .map((item) => item.width / item.height)
    .filter((ratio) => Number.isFinite(ratio) && ratio > 0);

  if (ratios.length === 0) {
    return widestFrame;
  }

  const mean = Math.exp(
    ratios.reduce((total, ratio) => total + Math.log(ratio), 0) / ratios.length,
  );
  return Math.min(widestFrame, Math.max(narrowestFrame, Number(mean.toFixed(3))));
}

export function CaseStudyShuffle({
  media,
}: Readonly<{ media: readonly CaseStudyMediaData[] }>) {
  const headingId = useId();
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const startedAtRef = useRef(0);
  const remainingRef = useRef(slideDuration);

  const canCycle = media.length > 1 && !prefersReducedMotion;

  useEffect(() => {
    if (!canCycle) {
      return;
    }

    if (isPaused) {
      remainingRef.current = Math.max(
        0,
        remainingRef.current - (Date.now() - startedAtRef.current),
      );
      return;
    }

    startedAtRef.current = Date.now();
    const timer = window.setTimeout(() => {
      remainingRef.current = slideDuration;
      setIndex((current) => (current + 1) % media.length);
    }, remainingRef.current);

    return () => window.clearTimeout(timer);
  }, [canCycle, index, isPaused, media.length]);

  if (media.length === 0) {
    return null;
  }

  const current = media[index] ?? media[0];
  const ratio = frameRatio(media);

  /* A segment is one of three things, and the CSS reads this rather than a
     class per state: filled behind the playhead, filling on it, empty ahead. */
  const segmentState = (position: number) => {
    if (position < index) {
      return "past";
    }
    return position === index ? "current" : "upcoming";
  };

  return (
    <section
      aria-labelledby={headingId}
      className="case-study-shuffle"
      data-paused={isPaused ? "true" : undefined}
      onBlur={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      /* One source of truth for the slide length: the bar's animation reads
         the same number the timeout above does. */
      style={{ "--shuffle-slide": `${slideDuration}ms` } as CSSProperties}
    >
      <h2 className="sr-only" id={headingId}>
        Project photos
      </h2>

      {/* The halo is made of the photo's own colours — see the class comment in
          `globals.css`. It has to wrap the frame rather than sit inside it: the
          frame clips to its own rounded corners, which would clip the glow. */}
      <Backlight className="case-study-backlight">
      <div
        className="case-study-shuffle-frame"
        style={{ "--shuffle-ratio": ratio } as CSSProperties}
      >
        {media.map((item, itemIndex) => (
          <div
            className="case-study-shuffle-slide"
            data-active={itemIndex === index ? "true" : undefined}
            key={item.src}
          >
            {/* The fill behind a photo that does not cover the frame. Asked for
                at 96px and then blown up: a thumbnail is both cheaper to fetch
                and already halfway to blurred, so the filter has less to do. */}
            <Image
              alt=""
              aria-hidden="true"
              className="case-study-shuffle-backdrop"
              height={item.height}
              sizes="96px"
              src={item.src}
              unoptimized={item.src.endsWith(".svg")}
              width={item.width}
            />
            <Image
              alt={item.alt}
              aria-hidden={itemIndex === index ? undefined : true}
              className="case-study-shuffle-image"
              data-active={itemIndex === index ? "true" : undefined}
              height={item.height}
              /* Only the first is worth blocking on: the rest are behind a fade
                 that has not started yet when the page paints. */
              preload={itemIndex === 0}
              sizes="(min-width: 68rem) 24rem, (min-width: 40rem) calc(100vw - 6rem), calc(100vw - 2rem)"
              src={item.src}
              unoptimized={item.src.endsWith(".svg")}
              width={item.width}
            />
          </div>
        ))}
      </div>
      </Backlight>

      {media.length > 1 ? (
        <ul aria-label="Choose a photo" className="case-study-shuffle-progress">
          {media.map((item, itemIndex) => (
            <li key={item.src}>
              <button
                aria-current={itemIndex === index ? "true" : undefined}
                aria-label={`Show photo ${itemIndex + 1} of ${media.length}`}
                onClick={() => {
                  /* Only a real move resets the clock. Clicking the segment
                     already playing would otherwise hand the timer a fresh
                     5000ms without restarting it — the effect below never
                     re-runs, because `index` did not change — and the bar and
                     the photo would drift apart by however far in we were. */
                  if (itemIndex === index) {
                    return;
                  }
                  remainingRef.current = slideDuration;
                  setIndex(itemIndex);
                }}
                type="button"
              >
                <span aria-hidden="true" className="case-study-shuffle-track">
                  <span
                    className="case-study-shuffle-fill"
                    data-state={segmentState(itemIndex)}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {current.caption ? (
        <p className="case-study-shuffle-caption">{current.caption}</p>
      ) : null}
    </section>
  );
}
