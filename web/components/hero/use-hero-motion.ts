"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Whether the decorative canvases in the hero should be running.
 *
 * Three conditions, and all of them have to hold:
 *
 * - **Mounted.** Not merely "reduced motion is off" — that is `false` on the
 *   server too, which would put the canvas into the server-rendered HTML and
 *   then rip it out at hydration. A visitor who asked for reduced motion would
 *   see a flash of exactly the thing they asked not to see.
 * - **Motion is allowed.**
 * - **The hero is actually on screen.** The hero sits at the top of a page
 *   about 2,500px long; without this, both canvases keep painting forever while
 *   the reader is somewhere in the project tree.
 */
export function useHeroMotion(ref: RefObject<HTMLElement | null>) {
  const [isAllowed, setIsAllowed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setIsAllowed(!reduced.matches);

    sync();
    reduced.addEventListener("change", sync);
    return () => reduced.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      /* A little slack, so the field is already running by the time a reader
         scrolling back up can see it. */
      { rootMargin: "120px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return isAllowed && isVisible;
}
