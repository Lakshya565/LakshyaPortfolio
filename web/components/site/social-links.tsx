import type { SocialLinkData } from "@/lib/content/page-data";

export function SocialLinks({
  links,
  className = "",
}: Readonly<{
  links: readonly SocialLinkData[];
  className?: string;
}>) {
  if (links.length === 0) {
    return null;
  }

  return (
    <ul className={className}>
      {links.map((link) => {
        const isExternal = link.kind !== "email";

        return (
          <li key={link.kind}>
            <a
              className="text-link"
              href={link.href}
              rel={isExternal ? "noreferrer noopener" : undefined}
              target={isExternal ? "_blank" : undefined}
            >
              {link.label}
              {isExternal ? <span className="sr-only"> (opens in a new tab)</span> : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
