export const siteNavigationItems = [
  { key: "work", label: "Work", href: "/#project-tree" },
  { key: "about", label: "About", href: "/about" },
] as const;

export type SiteNavigationItem = (typeof siteNavigationItems)[number];

export function isNavigationItemActive(
  pathname: string,
  item: SiteNavigationItem,
) {
  // The tree lives on the home page now, so "Work" is active on home and on any
  // project page it leads to.
  return item.key === "work"
    ? pathname === "/" || pathname.startsWith("/projects/")
    : pathname === "/about";
}
