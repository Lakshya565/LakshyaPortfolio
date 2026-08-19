"use client";

import { useEffect, useRef, useState } from "react";
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
 * **Why a dash on a path, and not a gradient.** This drew straight lines and
 * animated a `linearGradient`'s `y1`/`y2` along them. That cannot follow the
 * elbow: a gradient vector is a straight line by definition, so the moment a
 * connector turns a corner the sweep stops tracking it. A dash pattern walking
 * a `<path>` via `stroke-dashoffset` is the only mechanism that follows a
 * curve, and it is what the outer two branches need — they leave the junction
 * sideways before they ever head down.
 *
 * The cost is that a dash has hard ends where the gradient faded in and out.
 * Two strokes of the same path — a wide faint one for bloom and a crisp one on
 * top, both round-capped — is the closest equivalent.
 *
 * (`@magicui/animated-beam` was the intended route originally and cannot do any
 * of this: its gradient vector is pinned horizontal with no prop to change it,
 * it draws one full-size `<svg>` per beam, and it reads colour through
 * `stopColor`, where a `var(--token)` does not resolve.)
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
  /** The path the light follows, in layer coordinates. */
  readonly d: string;
  /** Its length, so the dash is a real number of pixels on every branch. */
  readonly length: number;
  readonly edge: string;
  readonly core: string;
  readonly delay: number;
  readonly duration: number;
  readonly repeatDelay: number;
}

/** Length of the travelling band, in pixels. */
const bandLength = 110;

/*
 * The two runs, and the timing that makes them read as one signal splitting.
 *
 * The trunk goes first; the branches leave slightly before it lands, so the
 * light appears to arrive at the junction and fan out rather than to stop and
 * restart. **Both periods must stay equal** — `duration + repeatDelay` — or the
 * two drift apart over a few minutes and the split stops lining up. `delay` in
 * Motion applies to the first run only, so it cannot hold them together.
 */
const cyclePeriod = 5.5;
const trunkDuration = 0.9;
const branchDuration = 2.6;
const branchDelay = 0.75;

/** The length of a quarter circle of radius `r`. */
const quarterArc = (radius: number) => (Math.PI * radius) / 2;

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
       * edge. The corner radius comes from the same token the elbow uses, so
       * the path cannot drift from the shape the CSS draws.
       */
      const rootBox = place(root);
      const railY = branchGrid.getBoundingClientRect().top - frame.top;
      /*
       * Read off the elbow itself rather than from `--tree-radius`. The token's
       * value is the literal text `0.75rem`, and `parseFloat` on that yields
       * `0.75` — a sub-pixel arc, which is a sharp corner. A resolved
       * `border-top-left-radius` comes back in pixels, and it is the very
       * corner this path is meant to trace.
       */
      const radius =
        Number.parseFloat(
          getComputedStyle(branchGrid, "::before").borderTopLeftRadius,
        ) || 12;
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
          delay: 0,
          duration: trunkDuration,
          repeatDelay: cyclePeriod - trunkDuration,
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

        const columnX = place(column).x;
        /* Down to the last card's *bottom*, so the dash finishes its travel
           hidden behind that card instead of winking out on its top edge. */
        const endY = place(tail).bottom;
        const offset = columnX - junctionX;

        let d: string;
        let length: number;

        if (Math.abs(offset) < 2) {
          /* The middle column sits directly under the junction: straight down,
             no rail to run along and no corner to turn. */
          d = `M ${junctionX} ${railY} V ${endY}`;
          length = endY - railY;
        } else {
          /*
           * Out along the rail, round the corner, then down. The sweep flag is
           * the direction of the turn: the arc starts directly above its centre
           * and ends directly beside it, so 0 goes left and 1 goes right — the
           * short way, which is the way the CSS corner curves.
           */
          const towards = Math.sign(offset);
          const cornerX = columnX - towards * radius;
          const sweep = towards > 0 ? 1 : 0;

          d =
            `M ${junctionX} ${railY} H ${cornerX} ` +
            `A ${radius} ${radius} 0 0 ${sweep} ${columnX} ${railY + radius} ` +
            `V ${endY}`;
          /* Computed rather than read back with `getTotalLength()`: the
             segments are known, and this avoids a second measure pass purely
             to size a dash. */
          length =
            Math.abs(cornerX - junctionX) +
            quarterArc(radius) +
            (endY - railY - radius);
        }

        next.push({
          key: `chain-${branch.workMode}`,
          d,
          length,
          edge: resolve(edgeToken),
          core: resolve(coreToken),
          delay: branchDelay,
          duration: branchDuration,
          repeatDelay: cyclePeriod - branchDuration,
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
      {pulses.length > 0 ? (
        <svg fill="none" height={size.height} width={size.width}>
          {pulses.map((pulse) => {
            /* One dash on the path at a time: the gap is longer than the path,
               so the pattern never repeats within it. The offset runs from one
               band's length before the start to one path's length past the end,
               which walks the dash the whole way through. */
            const dash = `${bandLength} ${pulse.length + bandLength}`;
            const animate = { strokeDashoffset: [bandLength, -pulse.length] };
            const transition = {
              delay: pulse.delay,
              duration: pulse.duration,
              ease: "easeInOut" as const,
              repeat: Infinity,
              repeatDelay: pulse.repeatDelay,
            };

            return (
              /*
               * Two passes of the same path: a wide, faint one for the bloom
               * and a crisp one on top. A 2px line alone was almost invisible
               * against the hairline it travels.
               */
              <g key={pulse.key}>
                <motion.path
                  animate={animate}
                  d={pulse.d}
                  opacity={0.3}
                  stroke={pulse.edge}
                  strokeDasharray={dash}
                  strokeLinecap="round"
                  strokeWidth={8}
                  transition={transition}
                />
                <motion.path
                  animate={animate}
                  d={pulse.d}
                  stroke={pulse.core}
                  strokeDasharray={dash}
                  strokeLinecap="round"
                  strokeWidth={2}
                  transition={transition}
                />
              </g>
            );
          })}
        </svg>
      ) : null}
    </div>
  );
}
