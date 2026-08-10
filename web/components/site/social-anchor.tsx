import type { MouseEventHandler } from "react";

import type { SocialLinkData } from "@/lib/content/page-data";

export function SocialAnchor({
  className,
  link,
  onClick,
}: Readonly<{
  className: string;
  link: SocialLinkData;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}>) {
  const isExternal = link.kind !== "email";

  return (
    <a
      className={className}
      href={link.href}
      onClick={onClick}
      rel={isExternal ? "noreferrer noopener" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      {link.label}
      {isExternal ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}
