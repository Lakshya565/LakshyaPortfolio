"use client";

import { motion } from "motion/react";

/**
 * A light travelling along a measured path, shared by the project tree and the
 * About page rails.
 *
 * Both pages draw the same figure — a trunk down to a junction, a horizontal
 * rail, rounded corners, and drops into three columns — so both light it the
 * same way. Each caller measures its own geometry from the DOM and hands the
 * finished paths here; this module owns only the travel and the drawing.
 *
 * **Why a dash on a path, and not a gradient.** The tree originally animated a
 * `linearGradient`'s `y1`/`y2` along straight `<line>`s. That cannot follow an
 * elbow: a gradient vector is a straight line by definition, so the moment a
 * connector turns a corner the sweep stops tracking it. A dash pattern walked
 * by `stroke-dashoffset` is the only mechanism that follows a curve.
 *
 * The cost is that a dash has hard ends where a gradient faded in and out. Two
 * strokes of the same path — a wide faint one for bloom and a crisp one on top,
 * both round-capped — is the closest equivalent.
 */

/** A measured run of connector, ready to light. */
export interface Pulse {
  readonly key: string;
  /** The path the light follows, in layer coordinates. */
  readonly d: string;
  /** Its length, so the band is a real number of pixels on every path. */
  readonly length: number;
  /** Faint outer colour, for the bloom. */
  readonly edge: string;
  /** Crisp inner colour. */
  readonly core: string;
  readonly delay: number;
  readonly duration: number;
  readonly repeatDelay: number;
}

/**
 * Build one pulse's timing.
 *
 * **Every pulse in a group must share `period`.** Motion applies `delay` to the
 * first run only, so once the animations are repeating it is `duration +
 * repeatDelay` alone that keeps them together. Give a trunk and the branches it
 * feeds different periods and they drift apart over a few minutes, until the
 * light arrives at the junction with nothing leaving it.
 */
export function pulseTiming(
  period: number,
  duration: number,
  delay = 0,
): Pick<Pulse, "delay" | "duration" | "repeatDelay"> {
  return { delay, duration, repeatDelay: period - duration };
}

/**
 * The corner radius of a CSS elbow, in pixels.
 *
 * Read off the rendered pseudo-element, never from `--tree-radius`. That
 * token's value is the literal text `0.75rem`, and `parseFloat` on it yields
 * `0.75` — a sub-pixel arc, which draws a sharp corner. A resolved
 * `border-top-left-radius` comes back in pixels and is the very corner the path
 * is meant to trace.
 */
export function elbowRadius(
  element: Element,
  fallback = 12,
  /* Which corner to read. A fan-out elbow curves at the top; the merge's
     inverted one curves at the bottom, and reading the wrong corner on either
     returns `0px` rather than a wrong number. */
  corner: "borderTopLeftRadius" | "borderBottomLeftRadius" = "borderTopLeftRadius",
) {
  return (
    Number.parseFloat(getComputedStyle(element, "::before")[corner]) || fallback
  );
}

/**
 * The path from a junction out along a rail, round the corner, and down.
 *
 * The sweep flag is the direction of the turn: the arc starts directly above
 * its centre and ends directly beside it, so 0 goes left and 1 goes right — the
 * short way, which is the way the CSS corner curves. A column within a couple
 * of pixels of the junction gets a straight drop instead, since there is no
 * rail to run along and no corner to turn.
 */
export function railPath({
  columnX,
  endY,
  junctionX,
  radius,
  railY,
}: Readonly<{
  columnX: number;
  endY: number;
  junctionX: number;
  radius: number;
  railY: number;
}>): Readonly<{ d: string; length: number }> {
  const offset = columnX - junctionX;

  if (Math.abs(offset) < 2) {
    return {
      d: `M ${junctionX} ${railY} V ${endY}`,
      length: endY - railY,
    };
  }

  const towards = Math.sign(offset);
  const cornerX = columnX - towards * radius;
  const sweep = towards > 0 ? 1 : 0;

  return {
    d:
      `M ${junctionX} ${railY} H ${cornerX} ` +
      `A ${radius} ${radius} 0 0 ${sweep} ${columnX} ${railY + radius} ` +
      `V ${endY}`,
    /* Computed rather than read back with `getTotalLength()`: the segments are
       known, and this avoids a second measure pass purely to size a dash. */
    length:
      Math.abs(cornerX - junctionX) +
      (Math.PI * radius) / 2 +
      (endY - railY - radius),
  };
}

/**
 * The path from a column down into a junction — the fan-out reversed.
 *
 * Not `railPath` traversed backwards: the light enters the arc from the column
 * rather than from the rail, so the turn happens at the *end* of the drop
 * instead of at the start of it, and the sweep flag is the opposite one. Get
 * that flag wrong and the arc takes the long way round — a 270° loop, which is
 * obvious in a screenshot and invisible in the numbers.
 *
 * The column within a couple of pixels of the junction drops straight through:
 * it has no corner to turn, only the elbow's height to cross.
 */
export function mergePath({
  columnX,
  junctionX,
  radius,
  railY,
  startY,
}: Readonly<{
  columnX: number;
  junctionX: number;
  radius: number;
  railY: number;
  startY: number;
}>): Readonly<{ d: string; length: number }> {
  const offset = junctionX - columnX;

  if (Math.abs(offset) < 2) {
    return {
      d: `M ${columnX} ${startY} V ${railY}`,
      length: railY - startY,
    };
  }

  const towards = Math.sign(offset);
  const cornerX = columnX + towards * radius;
  const sweep = towards > 0 ? 0 : 1;

  return {
    d:
      `M ${columnX} ${startY} V ${railY - radius} ` +
      `A ${radius} ${radius} 0 0 ${sweep} ${cornerX} ${railY} ` +
      `H ${junctionX}`,
    length:
      (railY - radius - startY) +
      (Math.PI * radius) / 2 +
      Math.abs(junctionX - cornerX),
  };
}

export function TravelingBeams({
  bandLength = 110,
  bloomOpacity = 0.3,
  bloomWidth = 8,
  coreWidth = 2,
  height,
  pulses,
  width,
}: Readonly<{
  /** Length of the travelling band, in pixels. */
  bandLength?: number;
  bloomOpacity?: number;
  bloomWidth?: number;
  coreWidth?: number;
  height: number;
  pulses: readonly Pulse[];
  width: number;
}>) {
  if (pulses.length === 0) {
    return null;
  }

  return (
    <svg fill="none" height={height} width={width}>
      {pulses.map((pulse) => {
        /* One dash on the path at a time: the gap is longer than the path, so
           the pattern never repeats within it. The offset runs from one band's
           length before the start to one path's length past the end, which
           walks the dash the whole way through. */
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
          <g key={pulse.key}>
            <motion.path
              animate={animate}
              d={pulse.d}
              opacity={bloomOpacity}
              stroke={pulse.edge}
              strokeDasharray={dash}
              strokeLinecap="round"
              strokeWidth={bloomWidth}
              transition={transition}
            />
            <motion.path
              animate={animate}
              d={pulse.d}
              stroke={pulse.core}
              strokeDasharray={dash}
              strokeLinecap="round"
              strokeWidth={coreWidth}
              transition={transition}
            />
          </g>
        );
      })}
    </svg>
  );
}
