"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "motion/react";

import { SocialAnchor } from "@/components/site/social-anchor";
import { homeIcon, personIcon, SocialIcon } from "@/components/site/site-icons";
import { Dock, DockIcon } from "@/components/ui/dock";
import type { SocialLinkData } from "@/lib/content/page-data";
import {
  isNavigationItemActive,
  siteNavigationItems,
} from "@/lib/navigation/site-navigation";

/**
 * The header navigation, as a dock of icons.
 *
 * Two groups separated by a hairline: the site's own routes, then the outbound
 * profile links. `Dock` clones only its **direct** `DockIcon` children in order
 * to hand them the shared `mouseX`, and passes anything else through untouched
 * — which is why the separator can be a plain `<span>`, and why a `DockIcon`
 * must never be wrapped in anything. Wrap one and it silently stops magnifying.
 *
 * Text labels are gone, so every link carries an `aria-label`; the visible
 * label under each icon is `aria-hidden` decoration for people who can see it.
 * Below `40rem` this is not rendered at all — `SiteNavigation` keeps its
 * dropdown of real text labels there, because an icon with no hover is an icon
 * with no name.
 */

const routeIcons: Readonly<Record<string, React.ReactElement>> = {
  work: homeIcon,
  about: personIcon,
};

/** The label that appears *below* an icon. See `.site-dock-tip`. */
function Tip({ children }: Readonly<{ children: string }>) {
  return (
    <span aria-hidden="true" className="site-dock-tip">
      {children}
    </span>
  );
}

export function SiteDock({
  socialLinks,
}: Readonly<{ socialLinks: readonly SocialLinkData[] }>) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <Dock
      className="site-dock"
      /* The component has no reduced-motion handling of its own, and the
         magnification is the whole of its motion. */
      disableMagnification={prefersReducedMotion ?? false}
      iconDistance={100}
      iconMagnification={44}
      iconSize={32}
    >
      {siteNavigationItems.map((item) => (
        <DockIcon key={item.key}>
          <Link
            aria-current={
              isNavigationItemActive(pathname, item) ? "page" : undefined
            }
            aria-label={item.label}
            className="site-dock-link"
            href={item.href}
          >
            {routeIcons[item.key]}
            <Tip>{item.label}</Tip>
          </Link>
        </DockIcon>
      ))}

      <span aria-hidden="true" className="site-dock-divider" />

      {socialLinks.map((link) => (
        <DockIcon key={link.kind}>
          {/* `SocialAnchor` owns the `target`/`rel` and "opens in a new tab"
              rules for every link on the site; the label it would render is
              suppressed here in favour of the icon. */}
          <SocialAnchor className="site-dock-link" link={link}>
            <SocialIcon kind={link.kind} />
            <Tip>{link.label}</Tip>
          </SocialAnchor>
        </DockIcon>
      ))}
    </Dock>
  );
}
