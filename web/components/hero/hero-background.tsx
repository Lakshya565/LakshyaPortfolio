import { HeroGrid } from "@/components/hero/hero-grid";
import { HeroParticles } from "@/components/hero/hero-particles";

/**
 * What sits behind the hero.
 *
 * Both fields are built and both work; this constant decides which one runs.
 * Flip the string to swap them back — `page.tsx` imports only this file, so
 * nothing else in the tree knows or cares which is in use.
 *
 * They occupy the same slot by design: both render into `.hero-particles`, and
 * both go through `useHeroMotion`, so the reduced-motion and off-screen
 * behaviour is identical either way.
 */
const HERO_BACKGROUND: "grid" | "particles" = "particles";

export function HeroBackground() {
  return HERO_BACKGROUND === "grid" ? <HeroGrid /> : <HeroParticles />;
}
