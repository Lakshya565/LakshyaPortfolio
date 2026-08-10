"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { SocialAnchor } from "@/components/site/social-anchor";
import type { SocialLinkData } from "@/lib/content/page-data";
import {
  isNavigationItemActive,
  siteNavigationItems,
  type SiteNavigationItem,
} from "@/lib/navigation/site-navigation";

function NavigationLink({
  item,
  pathname,
  onNavigate,
}: Readonly<{
  item: SiteNavigationItem;
  pathname: string;
  onNavigate?: () => void;
}>) {
  const isActive = isNavigationItemActive(pathname, item);

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className="nav-link"
      href={item.href}
      onNavigate={onNavigate}
    >
      {item.label}
    </Link>
  );
}

function SocialNavigationLink({
  link,
  onClick,
}: Readonly<{ link: SocialLinkData; onClick?: () => void }>) {
  return (
    <SocialAnchor className="nav-link" link={link} onClick={onClick} />
  );
}

export function SiteNavigation({
  socialLinks,
}: Readonly<{ socialLinks: readonly SocialLinkData[] }>) {
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  const closeMobileMenu = () => {
    if (mobileMenuRef.current) {
      mobileMenuRef.current.open = false;
    }
  };

  useEffect(() => {
    if (mobileMenuRef.current) {
      mobileMenuRef.current.open = false;
    }
  }, [pathname]);

  return (
    <>
      <nav aria-label="Primary navigation" className="hidden sm:block">
        <ul className="flex items-center gap-1">
          {siteNavigationItems.map((item) => (
            <li key={item.key}>
              <NavigationLink item={item} pathname={pathname} />
            </li>
          ))}
          {socialLinks.map((link) => (
            <li key={link.kind}>
              <SocialNavigationLink link={link} />
            </li>
          ))}
        </ul>
      </nav>

      <details className="mobile-menu relative sm:hidden" ref={mobileMenuRef}>
        <summary className="button-secondary cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          Menu
        </summary>
        <nav
          aria-label="Mobile navigation"
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-48 rounded-xl border border-line bg-surface-raised p-2 shadow-2xl"
        >
          <ul className="grid gap-1">
            {siteNavigationItems.map((item) => (
              <li key={item.key}>
                <NavigationLink
                  item={item}
                  onNavigate={closeMobileMenu}
                  pathname={pathname}
                />
              </li>
            ))}
            {socialLinks.map((link) => (
              <li key={link.kind}>
                <SocialNavigationLink
                  link={link}
                  onClick={closeMobileMenu}
                />
              </li>
            ))}
          </ul>
        </nav>
      </details>
    </>
  );
}
