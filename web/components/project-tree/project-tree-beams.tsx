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
 * A pulse travelling the project tree's connectors.
 *
 * **This layer is additive.** The tree is drawn by the CSS in `globals.css` —
 * the trunk, the rounded elbow, and one hairline per join, all pseudo-elements.
 * Those remain the visible line and the only thing that renders before
 * hydration, without JavaScript, or with reduced motion. Nothing here replaces
 * them; the beams just light one up now and again.
 *
 * The layer sits at `z-index: 0` beneath the cards, which do the clipping. A
 * pulse's path runs the whole length of a branch, but the stretches behind a
 * card are hidden — so down a column the light appears to hop from join to
 * join, while the run along the rail at the top, which crosses open space, is
 * visible end to end.
 *
 * `ProjectTree` itself stays a server component. This finds its anchors through
 * the DOM by the ids and classes the markup already carries, so no refs are
 * threaded through the tree and none of the project content is pushed into the
 * client bundle.
 *
 * The travel and the drawing live in `components/motion/traveling-beams.tsx`,
 * shared with the About page rails, which draw the same figure.
 */

/** Which branch each pulse belongs to, and where its chain ends. */
export interface ProjectTreeBeamBranch {
  readonly workMode: string;
  /** Slug of the last project in the chain, or `null` for an empty branch. */
  readonly lastSlug: string | null;
}

/**
 * Branch colour, as token names rather than values. These are the locked
 * product semantics — software green, hybrid blue, hardware purple — so a pulse
 * says which chain it is running down instead of being decoration.
 */
const beamAccent: Readonly<Record<string, readonly [string, string]>> = {
  software: ["--accent-green", "--accent-green-hover"],
  hybrid: ["--accent-blue", "--accent-blue-hover"],
  hardware: ["--accent-purple", "--accent-purple-hover"],
};

/*
 * The trunk goes first; the branches leave slightly before it lands, so the
 * light appears to arrive at the junction and fan out rather than to stop and
 * restart. Both share `cyclePeriod` — see `pulseTiming` for why that is not
 * optional.
 */
const cyclePeriod = 5.5;
const trunkDuration = 0.9;
const branchDuration = 2.6;
const branchDelay = 0.75;

/**
 * The breakpoint at which `.project-tree-branches` becomes three columns and
 * grows its elbow. Stacked below that there is no elbow to trace, so the layer
 * stays dark. Matches the `@media (min-width: 56rem)` block in `globals.css`.
 */
const threeColumnQuery = "(min-width: 56rem)";

export function ProjectTreeBeams({
  branches,
}: Readonly<{ branches: readonly ProjectTreeBeamBranch[] }>) {
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
    const tree = layer?.parentElement;

    if (!isActive || !layer || !tree) {
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

      /* The card is the neon wrapper, not the link inside it. */
      const root =
        tree.querySelector(".project-tree-root-neon") ??
        tree.querySelector(".project-tree-root-link");
      const branchGrid = tree.querySelector(".project-tree-branches");

      if (!root || !branchGrid) {
        setPulses([]);
        return;
      }

      /*
       * The junction: where the trunk meets the rail. `.project-tree-branches`
       * carries `padding-top: var(--tree-link)` and its `::before` elbow sits
       * at `top: 0` of that padding box, so the rail is on the grid's own top
       * edge.
       */
      const rootBox = place(root);
      const railY = branchGrid.getBoundingClientRect().top - frame.top;
      const radius = elbowRadius(branchGrid);
      const junctionX = rootBox.x;

      const next: Pulse[] = [
        {
          key: "trunk",
          d: `M ${junctionX} ${rootBox.bottom} V ${railY}`,
          length: Math.max(railY - rootBox.bottom, 0),
          /* The trunk carries all three, so it takes the root card's own two
             colours rather than any one branch's. */
          edge: resolve("--accent-green"),
          core: resolve("--accent-purple"),
          ...pulseTiming(cyclePeriod, trunkDuration),
        },
      ];

      branches.forEach((branch) => {
        const [edgeToken, coreToken] =
          beamAccent[branch.workMode] ?? beamAccent.software;
        const column = tree.querySelector(
          `.project-tree-branch[data-work-mode="${branch.workMode}"]`,
        );
        const tail = branch.lastSlug
          ? tree.querySelector(`#project-node-${CSS.escape(branch.lastSlug)}`)
          : null;

        if (!column || !tail) {
          return;
        }

        next.push({
          key: `chain-${branch.workMode}`,
          ...railPath({
            columnX: place(column).x,
            /* Down to the last card's *bottom*, so the dash finishes its travel
               hidden behind that card instead of winking out on its top edge. */
            endY: place(tail).bottom,
            junctionX,
            radius,
            railY,
          }),
          edge: resolve(edgeToken),
          core: resolve(coreToken),
          ...pulseTiming(cyclePeriod, branchDuration, branchDelay),
        });
      });

      setSize({ width: frame.width, height: frame.height });
      setPulses(next);
    };

    measure();

    /*
     * The layer is `inset: 0` on the tree, so its own box changes whenever the
     * tree does — including when a `<details>` opens and pushes every card
     * below it down. That is the case a container-only observer usually misses.
     */
    const observer = new ResizeObserver(measure);
    observer.observe(layer);
    return () => observer.disconnect();
  }, [branches, isActive]);

  return (
    <div aria-hidden="true" className="project-tree-beams" ref={layerRef}>
      <TravelingBeams
        height={size.height}
        pulses={pulses}
        width={size.width}
      />
    </div>
  );
}
