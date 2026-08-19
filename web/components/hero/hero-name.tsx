import type { ReactElement } from "react";

/**
 * The hero name, drawn as an SVG rather than set as HTML text.
 *
 * **The geometry is computed, not measured, because JetBrains Mono is
 * monospace.** Every advance is exactly `0.6em`, so at a notional font size of
 * 100 SVG user units the box a line occupies is arithmetic. That is what lets
 * this be a plain server component: the `<svg>` carries its own `viewBox` and
 * scales to whatever column it is given like any other vector, with no font
 * measurement, no `document.fonts.ready` wait, and no re-layout on resize.
 *
 * It is drawn rather than typed so the two words break onto their own lines at
 * a size and weight the heading scale does not otherwise offer, and so the glow
 * in `globals.css` haloes the letterforms instead of a text box.
 *
 * The real, readable name lives in the visually-hidden `<h1>` beside this in
 * `app/page.tsx`. Keep it there rather than nesting this inside the heading —
 * as a child, the SVG's own `<text>` joins the heading's `textContent` and
 * reads back as "Lakshya AgarwalLAKSHYAAGARWAL" to anything extracting plain
 * text.
 */

/** The notional font size the geometry is expressed in. */
const emSize = 100;
/** Monospace: one advance, every character, at every weight. */
const advance = 0.6 * emSize;
/** `--font-display-tracking`, in the same units. */
const tracking = 0.05 * emSize;
/** JetBrains Mono cap height, so line one's box starts flush at `y = 0`. */
const capHeight = 0.73 * emSize;
/** `line-height: 1.05`. */
const lineStep = 1.05 * emSize;
/**
 * SVG and HTML disagree about whether `letter-spacing` is added after the final
 * character. A little slack costs nothing and avoids clipping the last stroke.
 */
const slack = 10;

/** One line per word, and the box that holds them. */
function layout(name: string) {
  const lines = name.trim().toUpperCase().split(/\s+/);
  const longest = Math.max(...lines.map((line) => line.length));

  return {
    lines,
    width: longest * advance + (longest - 1) * tracking + slack,
    height: capHeight + (lines.length - 1) * lineStep,
  };
}

export function HeroName({ name }: Readonly<{ name: string }>): ReactElement {
  const { lines, width, height } = layout(name);

  return (
    <div className="hero-name">
      <svg
        aria-hidden="true"
        className="hero-name-base"
        viewBox={`0 0 ${width} ${height}`}
      >
        {lines.map((line, index) => (
          <text
            className="hero-name-letters"
            key={`${line}-${index}`}
            x={0}
            y={capHeight + index * lineStep}
          >
            {line}
          </text>
        ))}
      </svg>
    </div>
  );
}
