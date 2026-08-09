import Link from "next/link";

import { SiteNavigation } from "@/components/site/site-navigation";
import type { SiteShellData } from "@/lib/content/page-data";

export function SiteHeader({ data }: Readonly<{ data: SiteShellData }>) {
  return (
    <header className="site-header">
      <div className="site-container flex h-18 items-center justify-between gap-6">
        <Link
          aria-label={`${data.name}, home`}
          className="font-mono text-sm font-semibold tracking-[-0.02em] text-primary"
          href="/"
        >
          LA<span className="text-accent-green">/</span>01
        </Link>
        <SiteNavigation socialLinks={data.socialLinks} />
      </div>
    </header>
  );
}
