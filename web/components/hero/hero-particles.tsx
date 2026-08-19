"use client";

import { useRef } from "react";

import { useHeroMotion } from "@/components/hero/use-hero-motion";
import { Particles } from "@/components/ui/particles";

/**
 * The drifting field behind the hero.
 *
 * A wrapper exists because `@magicui/particles` has no `prefers-reduced-motion`
 * handling and no idea whether it is on screen. Hiding it in CSS would stop it
 * being seen without stopping it being drawn; not rendering it is the only way
 * to actually turn it off. See `useHeroMotion` for the three conditions.
 *
 * Keep this a leaf. `Particles` calls `setState` on every `mousemove`, so it
 * re-renders continuously while the pointer moves — affordable exactly as long
 * as it has no children and nothing above it re-renders with it.
 */
export function HeroParticles() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const isRunning = useHeroMotion(anchorRef);

  return (
    <div aria-hidden="true" className="hero-particles" ref={anchorRef}>
      {isRunning ? (
        <Particles
          /* A hex literal, and it has to be. The component parses colour with a
             `hexToRgb` that handles nothing else — an `oklch()` or a `var()`
             comes out `NaN` and the field renders invisible. This is
             `ink.accent` from `lib/desk/parts.ts`, the green the desk scene is
             drawn in. */
          color="#62d691"
          quantity={45}
          size={0.4}
          staticity={60}
        />
      ) : null}
    </div>
  );
}
