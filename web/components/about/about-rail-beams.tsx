"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import {
  elbowRadius,
  mergePath,
  pulseTiming,
  railPath,
  TravelingBeams,
  type Pulse,
} from "@/components/motion/traveling-beams";

/**
 * Light travelling the About page's rails.
 *
 * Additive, exactly like the project tree's layer: `globals.css` draws the
 * trunks, elbows and drops as pseudo-elements, and those are the whole figure
 * without JavaScript or under reduced motion. This only lights them.
 *
 * **Quieter than the tree's on purpose.** There the pulses run under cards and
 * are visible only in the gaps between them; here they cross open space
 * directly above text somebody is trying to read. Slower travel, longer rest,
 * a dimmer bloom and a thinner core — enough to notice once, not enough to pull
 * the eye back while reading.
 *
 * The page stays a server component: this finds its anchors through the DOM by
 * the classes the markup already carries, so no panel copy enters the client
 * bundle.
 */

/*
 * One pass down the page: in at the top, out across rail one, back together
 * under it, down to rail two, out again.
 *
 * Every entry shares `cyclePeriod` — see `pulseTiming` for why equal periods
 * are the only thing holding a group together once `delay` has been spent on
 * the first run. The rest at the end of the cycle is deliberate: this is a page
 * somebody is reading, and light that never stops is light nobody stops seeing.
 */
const cyclePeriod = 13;

const railStages = [
  {
    /** From the intro down to rail one's junction. */
    trunk: { delay: 0, duration: 1.1 },
    /** Out along the rail and down into the three panels. */
    drops: { delay: 0.9, duration: 3.4 },
    /**
     * The three legs back in. One duration for all three, though the legs are
     * three different lengths — so the short one crawls, the long one hurries,
     * and all three reach the junction on the same frame. That simultaneous
     * arrival is the entire point of a merge.
     */
    merge: { delay: 4.2, duration: 2.6 },
  },
  {
    /** Down from the merge rail into rail two's junction. */
    trunk: { delay: 6.7, duration: 1.4 },
    drops: { delay: 8, duration: 3.4 },
    merge: { delay: 11.4, duration: 1.4 },
  },
] as const;

const stageFor = (railIndex: number) =>
  railStages[Math.min(railIndex, railStages.length - 1)];

/** Matches the `@media (min-width: 56rem)` block that builds the rails. */
const threeColumnQuery = "(min-width: 56rem)";

export function AboutRailBeams() {
  const layerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isThreeColumn, setIsThreeColumn] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [pulses, setPulses] = useState<readonly Pulse[]>([]);

  useEffect(() => {
    const query = window.matchMedia(threeColumnQuery);
    const sync = () => setIsThreeColumn(query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const isActive = isThreeColumn && !prefersReducedMotion;

  useEffect(() => {
    const layer = layerRef.current;
    const stage = layer?.parentElement;

    if (!isActive || !layer || !stage) {
      setPulses([]);
      return;
    }

    const measure = () => {
      const frame = layer.getBoundingClientRect();
      const tokens = getComputedStyle(document.documentElement);
      const resolve = (token: string) => tokens.getPropertyValue(token).trim();
      const place = (element: Element) => {
        const rect = element.getBoundingClientRect();
        return {
          x: rect.left - frame.left + rect.width / 2,
          top: rect.top - frame.top,
          bottom: rect.bottom - frame.top,
        };
      };

      const rails = [...stage.querySelectorAll(".about-rail")];
      const next: Pulse[] = [];

      rails.forEach((rail, railIndex) => {
        const grid = rail.querySelector(".about-rail-panels");
        const panels = grid ? [...grid.querySelectorAll(".about-panel")] : [];

        if (!grid || panels.length === 0) {
          return;
        }

        /* The rail sits on the panel grid's own top edge, the same way the
           tree's does — the grid carries `padding-top: var(--tree-link)` and
           its `::before` elbow is at `top: 0` of that padding box. */
        const railY = grid.getBoundingClientRect().top - frame.top;
        const radius = elbowRadius(grid);
        const gridBox = grid.getBoundingClientRect();
        const junctionX = gridBox.left - frame.left + gridBox.width / 2;

        const timing = stageFor(railIndex);

        /* What feeds this rail: the intro for the first, and for any rail below
           that, the merge closing the one above — the trunk leaves the merge
           rail, not the panel grid, whose bottom edge the legs have pushed
           down. The grid is the fallback if a rail above has no merge. */
        const above = rails[railIndex - 1];
        const feeder =
          railIndex === 0
            ? stage.querySelector(".about-intro")
            : (above?.querySelector(".about-merge") ??
              above?.querySelector(".about-rail-panels"));

        if (feeder) {
          const feederBottom = place(feeder).bottom;

          next.push({
            key: `trunk-${railIndex}`,
            d: `M ${junctionX} ${feederBottom} V ${railY}`,
            length: Math.max(railY - feederBottom, 0),
            edge: resolve("--accent-green"),
            core: resolve("--accent-green-hover"),
            ...pulseTiming(cyclePeriod, timing.trunk.duration, timing.trunk.delay),
          });
        }

        panels.forEach((panel, panelIndex) => {
          const panelBox = place(panel);

          next.push({
            key: `rail-${railIndex}-${panelIndex}`,
            ...railPath({
              columnX: panelBox.x,
              /* Stops on the panel's top edge. Unlike the tree there is no card
                 covering the run below, so a dash carried further would be seen
                 crossing the text. */
              endY: panelBox.top,
              junctionX,
              radius,
              railY,
            }),
            edge: resolve("--accent-green"),
            core: resolve("--accent-green-hover"),
            ...pulseTiming(cyclePeriod, timing.drops.duration, timing.drops.delay),
          });
        });

        /* The converging junction under this rail, if it has one. Its rail is
           the bottom edge of the elbow box, and its corners curve the other
           way — hence the second argument to `elbowRadius`. */
        const merge = rail.querySelector(".about-merge");

        if (merge) {
          const mergeBox = place(merge);
          const mergeRadius = elbowRadius(merge, 12, "borderBottomLeftRadius");

          panels.forEach((panel, panelIndex) => {
            const panelBox = place(panel);

            next.push({
              key: `merge-${railIndex}-${panelIndex}`,
              ...mergePath({
                columnX: panelBox.x,
                junctionX,
                radius: mergeRadius,
                railY: mergeBox.bottom,
                /* The card's own bottom edge, which is what makes the three
                   legs three different lengths. */
                startY: panelBox.bottom,
              }),
              edge: resolve("--accent-green"),
              core: resolve("--accent-green-hover"),
              ...pulseTiming(
                cyclePeriod,
                timing.merge.duration,
                timing.merge.delay,
              ),
            });
          });
        }
      });

      setSize({ width: frame.width, height: frame.height });
      setPulses(next);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(layer);
    return () => observer.disconnect();
  }, [isActive]);

  return (
    <div aria-hidden="true" className="about-rail-beams" ref={layerRef}>
      <TravelingBeams
        bandLength={90}
        bloomOpacity={0.2}
        bloomWidth={6}
        coreWidth={1.5}
        height={size.height}
        pulses={pulses}
        width={size.width}
      />
    </div>
  );
}
