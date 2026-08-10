import type { ProjectSlug } from "@/types/content";

export type ProjectMapPlacement = Readonly<{
  slug: ProjectSlug;
  tier: "primary" | "secondary";
  desktopColumn: 1 | 2 | 3 | 4;
  mobileOrder: number;
}>;

export const projectMapPlacements = [
  {
    slug: "cisco-agentic-runbook-creator",
    tier: "primary",
    desktopColumn: 1,
    mobileOrder: 10,
  },
  {
    slug: "repoframe",
    tier: "primary",
    desktopColumn: 3,
    mobileOrder: 20,
  },
  {
    slug: "nucurrent-inventory-system",
    tier: "secondary",
    desktopColumn: 2,
    mobileOrder: 30,
  },
  {
    slug: "smartlift-sleeve",
    tier: "secondary",
    desktopColumn: 4,
    mobileOrder: 40,
  },
  {
    slug: "quackta",
    tier: "secondary",
    desktopColumn: 1,
    mobileOrder: 50,
  },
  {
    slug: "lucky-arduino",
    tier: "secondary",
    desktopColumn: 2,
    mobileOrder: 60,
  },
  {
    slug: "backbuddy",
    tier: "secondary",
    desktopColumn: 4,
    mobileOrder: 70,
  },
  {
    slug: "neurify",
    tier: "secondary",
    desktopColumn: 1,
    mobileOrder: 80,
  },
  {
    slug: "agrisense",
    tier: "secondary",
    desktopColumn: 3,
    mobileOrder: 90,
  },
  {
    slug: "risenrun-wifi-alarm-clock",
    tier: "secondary",
    desktopColumn: 4,
    mobileOrder: 100,
  },
] as const satisfies readonly ProjectMapPlacement[];
