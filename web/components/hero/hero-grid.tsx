"use client";

import { useRef } from "react";

import { useHeroMotion } from "@/components/hero/use-hero-motion";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

/**
 * A grid behind the hero, with squares lighting and fading at random.
 *
 * Gated through `useHeroMotion` for the same three reasons the particle field
 * is — mounted, motion allowed, hero still on screen — and it matters more
 * here. `AnimatedGridPattern` calls `setSquares` from every square's
 * `onAnimationComplete`, which re-renders all forty `motion.rect`s each time;
 * the hero is the top of a 2,300px page, and none of that work is worth doing
 * while the reader is down in the project tree.
 *
 * Colour is not passed as a prop. The lit squares are `fill="currentColor"`
 * and the rules are stroked, so `.hero-grid` in `globals.css` sets both — which
 * keeps the accent a token rather than a literal duplicated here.
 */
export function HeroGrid() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const isRunning = useHeroMotion(anchorRef);

  return (
    <div aria-hidden="true" className="hero-particles" ref={anchorRef}>
      {isRunning ? (
        <AnimatedGridPattern
          className="hero-grid"
          duration={4}
          height={44}
          /* 0.12 is the "very light" — a lit square is 12% green over the
             canvas, closer to a shift in the dark than to a highlight. */
          maxOpacity={0.12}
          numSquares={40}
          repeatDelay={1.2}
          width={44}
        />
      ) : null}
    </div>
  );
}
