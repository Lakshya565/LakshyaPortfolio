"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * A pulse travelling the project tree's connectors.
 *
 * **This layer is additive.** The tree is drawn by the CSS in `globals.css` —
 * the trunk, the rounded elbow, and one hairline per join, all pseudo-elements.
 * Those remain the visible line and the only thing that renders before
 * hydration, without JavaScript, or with reduced motion. Nothing here replaces
 * them; the beams just light one up now and again.
 *
 * The layer sits at `z-index: 0` beneath the cards, which do the clipping: a
 * pulse's line runs the whole length of a column, but only the stretches
 * crossing the gaps between cards are ever seen — and those gaps are exactly
 * where the connectors are. So the light appears to hop from join to join down
 * the chain.
 *
 * `ProjectTree` itself stays a server component. This finds its anchors through
 * the DOM by the ids and classes the markup already carries, so no refs are
 * threaded through the tree and none of the project content is pushed into the
 * client bundle.
 *
 * **Why this is not `@magicui/animated-beam`.** That component was the intended
 * route and it cannot do this. It animates a `linearGradient` whose vector is
 * always horizontal — `y1` and `y2` are pinned to `"0%"` with no prop to change
 * them — so on a vertical connector the sweep crosses the line's ~2px of width
 * in a couple of frames instead of running along it. Rendered and captured at
 * 250ms intervals across a full cycle, it produced no visible pulse at all. It
 * also draws one full-size `<svg>` per beam and reads its colours through
 * `stopColor`, where a `var(--token)` does not resolve. This is one `<svg>` for
 * the whole layer with the gradient turned to run along the path.
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

/** A measured run of connector, ready to light. */
interface Pulse {
  readonly key: string;
  /** Column centre, in layer coordinates. */
  readonly x: number;
  readonly top: number;
  readonly bottom: number;
  readonly edge: string;
  readonly core: string;
  readonly delay: number;
}

/** Length of the travelling band, in pixels. */
const bandLength = 110;
/** One pass down a chain. */
const travelDuration = 2.4;
/** Dead time between passes — a heartbeat, not a strobe. */
const travelRepeatDelay = 3.2;

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
  const gradientId = useId();
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

      const root = tree.querySelector(".project-tree-root-link");
      const rootBox = root ? place(root) : null;
      const next: Pulse[] = [];

      branches.forEach((branch, index) => {
        const [edgeToken, coreToken] =
          beamAccent[branch.workMode] ?? beamAccent.software;
        const edge = resolve(edgeToken);
        const core = resolve(coreToken);
        const head = tree.querySelector(
          `.project-tree-branch[data-work-mode="${branch.workMode}"] > .project-tree-branch-node`,
        );

        if (!head) {
          return;
        }

        const headBox = place(head);

        /*
         * Only the branch directly below the root gets a beam from it. The
         * connector to the outer two turns a corner through the elbow, and a
         * straight line would cut the corner rather than follow it. Comparing
         * centres finds the middle column without assuming which index it is.
         */
        if (rootBox && Math.abs(headBox.x - rootBox.x) < 2) {
          next.push({
            key: `trunk-${branch.workMode}`,
            x: headBox.x,
            top: rootBox.bottom,
            bottom: headBox.top,
            edge,
            core,
            delay: 0,
          });
        }

        /*
         * The chain, as one run. Every card in a column shares a centre, so a
         * single line from the branch head down to the last card is exactly
         * vertical and covers every join in between — one pulse per branch
         * rather than one per join, with the cards clipping it to the gaps.
         */
        const tail = branch.lastSlug
          ? tree.querySelector(`#project-node-${CSS.escape(branch.lastSlug)}`)
          : null;

        if (tail) {
          const tailBox = place(tail);
          next.push({
            key: `chain-${branch.workMode}`,
            x: headBox.x,
            top: headBox.bottom,
            bottom: tailBox.top,
            edge,
            core,
            delay: 0.45 + index * 0.3,
          });
        }
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
      {pulses.length > 0 ? (
        <svg fill="none" height={size.height} width={size.width}>
          <defs>
            {pulses.map((pulse) => (
              /*
               * `gradientUnits="userSpaceOnUse"` with a vertical vector, so the
               * band is a real length in pixels travelling along the line
               * rather than a proportion of a box. `x1`/`x2` are equal, which
               * is what makes it run down the path instead of across it.
               */
              <motion.linearGradient
                animate={{
                  y1: [pulse.top - bandLength, pulse.bottom],
                  y2: [pulse.top, pulse.bottom + bandLength],
                }}
                gradientUnits="userSpaceOnUse"
                id={`${gradientId}-${pulse.key}`}
                initial={{ y1: pulse.top - bandLength, y2: pulse.top }}
                key={pulse.key}
                transition={{
                  delay: pulse.delay,
                  duration: travelDuration,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: travelRepeatDelay,
                }}
                x1={0}
                x2={0}
              >
                <stop offset="0%" stopColor={pulse.edge} stopOpacity={0} />
                <stop offset="50%" stopColor={pulse.core} stopOpacity={1} />
                <stop offset="100%" stopColor={pulse.edge} stopOpacity={0} />
              </motion.linearGradient>
            ))}
          </defs>
          {pulses.map((pulse) => (
            /*
             * Two passes of the same gradient: a wide, faint one for the bloom
             * and a crisp one on top. A 2px line alone was almost invisible
             * against the hairline it travels.
             */
            <g key={pulse.key} stroke={`url(#${gradientId}-${pulse.key})`}>
              <line
                opacity={0.3}
                strokeLinecap="round"
                strokeWidth={8}
                x1={pulse.x}
                x2={pulse.x}
                y1={pulse.top}
                y2={pulse.bottom}
              />
              <line
                strokeLinecap="round"
                strokeWidth={2}
                x1={pulse.x}
                x2={pulse.x}
                y1={pulse.top}
                y2={pulse.bottom}
              />
            </g>
          ))}
        </svg>
      ) : null}
    </div>
  );
}
