import type { MouseEventHandler, ReactNode } from "react";

import type { SocialLinkData } from "@/lib/content/page-data";

/**
 * One outbound link, with the `target`/`rel` rules applied in one place.
 *
 * Pass `children` to render something other than the label — the header dock
 * passes an icon. The accessible name then comes from `aria-label`, so the
 * link still announces as "GitHub" rather than as an unnamed graphic.
 */
export function SocialAnchor({
  children,
  className,
  link,
  onClick,
}: Readonly<{
  children?: ReactNode;
  className: string;
  link: SocialLinkData;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}>) {
  const isExternal = link.kind !== "email";

  return (
    <a
      aria-label={children ? link.label : undefined}
      className={className}
      href={link.href}
      onClick={onClick}
      rel={isExternal ? "noreferrer noopener" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      {children ?? link.label}
      {/* Only worth announcing when the label is the visible text. On an icon
          the `aria-label` already carries the whole name. */}
      {isExternal && !children ? (
        <span className="sr-only"> (opens in a new tab)</span>
      ) : null}
    </a>
  );
}
