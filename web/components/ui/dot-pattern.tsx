import { useId, type SVGProps } from "react";

import { cn } from "@/lib/utils";

/**
 * A field of dots, as one tiled SVG `<pattern>`.
 *
 * **Why this is not `@magicui/dot-pattern`.** That component is `"use client"`,
 * measures itself with `getBoundingClientRect` on a `resize` listener, and
 * emits one `<motion.circle>` per dot. The Hardware branch of the project tree
 * would ask it for roughly four hundred circles across four elements, none of
 * them server-rendered — the dots would appear only at hydration, and every
 * card would carry its own observer.
 *
 * This is shaped like the vendored `GridPattern` instead: a `<pattern>` holding
 * a single `<circle>`, tiled by the browser. Three nodes whatever the size of
 * the box, no JavaScript, and identical output. The one thing it gives up is
 * the registry component's optional `glow`, which nothing here uses.
 */
interface DotPatternProps extends SVGProps<SVGSVGElement> {
  /** Horizontal spacing between dots. */
  width?: number;
  /** Vertical spacing between dots. */
  height?: number;
  /** Offset of the pattern origin. */
  x?: number;
  y?: number;
  /** Offset of the dot inside its own cell. */
  cx?: number;
  cy?: number;
  /** Dot radius. */
  cr?: number;
  className?: string;
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          height={height}
          id={id}
          patternUnits="userSpaceOnUse"
          width={width}
          x={x}
          y={y}
        >
          {/* `currentColor`, so a single `color` declaration in CSS drives this
              the same way it drives `GridPattern` and `HexagonPattern`. */}
          <circle cx={cx} cy={cy} fill="currentColor" r={cr} stroke="none" />
        </pattern>
      </defs>
      <rect fill={`url(#${id})`} height="100%" stroke="none" width="100%" />
    </svg>
  );
}
