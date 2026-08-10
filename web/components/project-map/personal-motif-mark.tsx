import type { PersonalMotifKey } from "@/types/content";

export function PersonalMotifMark({
  motif,
}: Readonly<{ motif: PersonalMotifKey }>) {
  const commonProps = {
    "aria-hidden": true,
    className: "personal-motif-mark",
    fill: "none",
    viewBox: "0 0 32 32",
  } as const;

  switch (motif) {
    case "maker-origin":
      return (
        <svg {...commonProps}>
          <rect height="14" rx="2" width="18" x="7" y="9" />
          <path d="M11 6v3m5-3v3m5-3v3M11 23v3m5-3v3m5-3v3M4 13h3m-3 6h3m18-6h3m-3 6h3" />
          <circle cx="13" cy="16" r="2" />
          <path d="M18 14h4m-4 4h4" />
        </svg>
      );
    case "quackta":
      return (
        <svg {...commonProps}>
          <circle cx="18" cy="10" r="5" />
          <path d="m23 10 6 2-6 2M7 22c2-7 8-10 15-7 3 1 5 4 5 8-6 3-15 3-20-1Z" />
          <circle cx="19" cy="9" fill="currentColor" r="0.8" stroke="none" />
        </svg>
      );
    case "taekwondo":
      return (
        <svg {...commonProps}>
          <path d="M7 8h18M7 13h18M7 18h18M7 23h18" strokeWidth="2.4" />
        </svg>
      );
    case "scouting":
      return (
        <svg {...commonProps}>
          <circle cx="16" cy="16" r="11" />
          <path d="m16 7 3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z" />
          <circle cx="16" cy="16" r="2" />
        </svg>
      );
    case "shared-food":
      return (
        <svg {...commonProps}>
          <path d="M6 11h8l-1 15H7L6 11Zm12 0h8l-1 15h-6l-1-15ZM10 11 8 5m14 6 3-7" />
          <circle cx="9" cy="22" r="1" />
          <circle cx="11" cy="19" r="1" />
          <circle cx="21" cy="22" r="1" />
          <circle cx="23" cy="19" r="1" />
        </svg>
      );
    case "food-favorites":
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="10" r="5" />
          <circle cx="9" cy="10" r="2" />
          <path d="M17 9c4-3 7 0 4 3s0 6 4 3M15 19h13c-1 6-4 8-7 8s-5-2-6-8Zm2-3 9-9m-6 9 9-9" />
        </svg>
      );
    case "movement":
      return (
        <svg {...commonProps}>
          <path d="M4 9c2-4 7-4 9 0l-2 5-6 1-1-6Zm4 12c3-3 7-1 6 3l-4 3-4-2 2-4Z" />
          <circle cx="23" cy="18" r="7" />
          <circle cx="23" cy="18" r="2" />
        </svg>
      );
    case "anime":
      return (
        <svg {...commonProps}>
          <rect height="20" rx="2" width="7" x="3" y="6" />
          <rect height="20" rx="2" width="7" x="13" y="6" />
          <rect height="20" rx="2" width="7" x="23" y="6" />
          <path d="M5 12h3m-3 4h3m-3 4h3m10-8-3 3 3 3-3 3m10-9 3 4-3 4m0-4h3" />
        </svg>
      );
  }
}
