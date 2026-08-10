import { SocialLinks } from "@/components/site/social-links";
import type { SiteShellData } from "@/lib/content/page-data";

export function SiteFooter({ data }: Readonly<{ data: SiteShellData }>) {
  return (
    <footer className="border-t border-line py-6">
      <div className="site-container flex flex-col gap-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Designed and built by {data.name}.</p>
        <SocialLinks
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
          links={data.socialLinks}
        />
      </div>
    </footer>
  );
}
