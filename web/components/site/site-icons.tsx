import { cloneElement } from "react";

import type { SocialLinkData } from "@/lib/content/page-data";
import { cn } from "@/lib/utils";

/**
 * Every icon on the site, in one place.
 *
 * Two things use them: the hero link buttons, which reveal one on hover, and
 * the header dock, which is nothing but icons. The paths should exist once.
 *
 * **Inline, not an icon package.** The site has no icon dependency and did not
 * need one for six glyphs — `lucide-react` would also not have covered it,
 * since it dropped brand marks, so GitHub and LinkedIn would have needed
 * hand-written paths regardless.
 *
 * All four are solid rather than stroked. Mixing a filled brand mark with an
 * outline icon at the same level is the most common way an icon set stops
 * looking like a set.
 *
 * GitHub and LinkedIn marks: Simple Icons, CC0 1.0 Universal. The marks remain
 * trademarks of their owners and are used here only to link to those profiles.
 * Envelope and document: drawn for this file.
 */

/**
 * Every icon shares one box and inherits its colour from whatever contains it.
 * The size comes from CSS rather than a width attribute, so the dock can draw
 * them larger than the hero buttons do without a second copy of each path.
 *
 * **`.site-icon` must keep a base size in `globals.css`.** There is no `width`
 * or `height` attribute here, and an SVG with a viewBox but no intrinsic size
 * falls back to the 300px default object size. That is not a small mistake: in
 * a flex row a 300px icon squeezes its sibling label to a couple of characters,
 * and `overflow-wrap: anywhere` (global on `<a>`) then breaks the word in half.
 * That is exactly what the hero buttons did on hover.
 */
function Icon({
  children,
  className,
  label,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  label: string;
}>) {
  return (
    <svg
      aria-hidden="true"
      className={cn("site-icon", className)}
      data-icon={label}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

/** "Work" — a house, as asked for, though it points at the project tree. */
export const homeIcon = (
  <Icon label="work">
    <path d="M12 2.1 1.5 11.2l1.32 1.5L4 11.68V21a1 1 0 0 0 1 1h5v-6h4v6h5a1 1 0 0 0 1-1v-9.32l1.18 1.02 1.32-1.5Z" />
  </Icon>
);

/** "About". */
export const personIcon = (
  <Icon label="about">
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 1.8c-4.1 0-8 2.06-8 4.6V21a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.6c0-2.54-3.9-4.6-8-4.6Z" />
  </Icon>
);

/** Keyed by link kind, so the `socialLinkKinds` union drives the mapping. */
export const socialIcons: Partial<
  Record<SocialLinkData["kind"], React.ReactElement<{ className?: string }>>
> = {
  github: (
    <Icon label="github">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </Icon>
  ),
  linkedin: (
    <Icon label="linkedin">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </Icon>
  ),
  email: (
    <Icon label="email">
      <path d="M2.4 6.2A2.7 2.7 0 0 1 5.1 4h13.8a2.7 2.7 0 0 1 2.7 2.2L12 11.6 2.4 6.2Zm-.4 2.3v9.3A2.5 2.5 0 0 0 4.5 20h15a2.5 2.5 0 0 0 2.5-2.2V8.5l-9.5 5.4a1 1 0 0 1-1 0L2 8.5Z" />
    </Icon>
  ),
  resume: (
    <Icon label="resume">
      {/* One path, `evenodd`, so the ruled lines and the folded corner are real
          holes and stay transparent whatever the button is filled with. */}
      <path
        d="M6 2h7.2L19 7.8V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm7.6 1.4v4.2h4.2l-4.2-4.2ZM8 9h4v1.6H8V9Zm0 3.6h8v1.6H8v-1.6Zm0 3.6h8v1.6H8v-1.6Z"
        fillRule="evenodd"
      />
    </Icon>
  ),
};

/**
 * The icon for a link, or nothing if that kind has none.
 *
 * `className` is passed down to the `<svg>`, which is how a caller sizes one.
 * The entries in `socialIcons` are already-built elements, so this clones the
 * one it needs rather than re-rendering the map.
 */
export function SocialIcon({
  className,
  kind,
}: Readonly<{ className?: string; kind: SocialLinkData["kind"] }>) {
  const icon = socialIcons[kind];

  if (!icon) {
    return null;
  }

  return className ? cloneElement(icon, { className }) : icon;
}
