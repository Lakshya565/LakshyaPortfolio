export const siteNavigationItems = [
  { key: "work", label: "Work", href: "/work" },
  { key: "about", label: "About", href: "/about" },
] as const;

export type SiteNavigationItem = (typeof siteNavigationItems)[number];

export function isNavigationItemActive(
  pathname: string,
  item: SiteNavigationItem,
) {
  return item.key === "work"
    ? pathname === "/work" || pathname.startsWith("/projects/")
    : pathname === "/about";
}
