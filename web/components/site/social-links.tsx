import { SocialAnchor } from "@/components/site/social-anchor";
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
      {links.map((link) => (
        <li key={link.kind}>
          <SocialAnchor className="text-link" link={link} />
        </li>
      ))}
    </ul>
  );
}
