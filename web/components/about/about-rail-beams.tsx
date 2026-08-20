"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import {
  elbowRadius,
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
 * Rail one runs, then rail two. Both share `cyclePeriod` — see `pulseTiming`
 * for why equal periods are the thing holding a group together once `delay` has
 * been spent on the first run.
 */
const cyclePeriod = 9;
const trunkDuration = 1.1;
const railDuration = 3.4;
const railOneDelay = 0.9;
const railTwoDelay = 2.6;

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

        /* What feeds this rail: the intro for the first, the rail above for the
           second. Either way the trunk drops from that block's bottom edge. */
        const feeder =
          railIndex === 0
            ? stage.querySelector(".about-intro")
            : rails[railIndex - 1]?.querySelector(".about-rail-panels");

        if (feeder) {
          next.push({
            key: `trunk-${railIndex}`,
            d: `M ${junctionX} ${place(feeder).bottom} V ${railY}`,
            length: Math.max(railY - place(feeder).bottom, 0),
            edge: resolve("--accent-green"),
            core: resolve("--accent-green-hover"),
            ...pulseTiming(
              cyclePeriod,
              trunkDuration,
              railIndex === 0 ? 0 : railOneDelay + railDuration,
            ),
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
            ...pulseTiming(
              cyclePeriod,
              railDuration,
              railIndex === 0 ? railOneDelay : railTwoDelay,
            ),
          });
        });
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
