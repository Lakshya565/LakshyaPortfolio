import { SocialIcon } from "@/components/site/site-icons";
import type { SocialLinkData } from "@/lib/content/page-data";

/**
 * A hero link, as a pill that floods on hover.
 *
 * Adapted from `@magicui/interactive-hover-button` rather than vendored,
 * because that component cannot be used here as shipped:
 *
 * - it imports `ArrowRight` from `lucide-react`, which is not a dependency of
 *   this project **and is not declared as one by the registry entry**, so
 *   `shadcn add` installs nothing and the build fails;
 * - it renders a `<button>`, and every one of these is a link;
 * - its icon is hardcoded, where each link needs its own.
 *
 * The mechanic is kept exactly: a dot scales up until it floods the pill, the
 * resting label slides out, and a second label slides in over the flood. With
 * this site's tokens that reads as dark → white with dark text, which is what
 * it was picked for.
 *
 * No `"use client"`. It is hover and focus in CSS, with no state.
 */
export function HeroLinkButton({
  link,
}: Readonly<{ link: SocialLinkData }>) {
  /* Same rule as `components/site/social-anchor.tsx`: everything except a
     `mailto:` leaves the site, and a link that opens a new tab has to say so
     for anyone who cannot see it happen. */
  const isExternal = link.kind !== "email";

  return (
    <a
      className="hero-link-button"
      href={link.href}
      rel={isExternal ? "noreferrer noopener" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      <span className="hero-link-button-rest">
        <span aria-hidden="true" className="hero-link-button-dot" />
        <span className="hero-link-button-label">{link.label}</span>
      </span>

      {/* The flooded state. Hidden from assistive tech: it is the same label
          again, and announcing it twice would be a bug, not a feature. */}
      <span aria-hidden="true" className="hero-link-button-flood">
        <span>{link.label}</span>
        {/* The class is what sizes it. Without it the SVG has no intrinsic
            size, falls back to 300px, and crushes the label beside it. */}
        <SocialIcon className="hero-link-button-icon" kind={link.kind} />
      </span>

      {isExternal ? (
        <span className="sr-only"> (opens in a new tab)</span>
      ) : null}
    </a>
  );
}
