import type { Metadata } from "next";
import type { ReactNode } from "react";

import { RouteTransitionController } from "@/components/navigation/route-transition-controller";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSiteShellData } from "@/lib/content/portfolio-repository";
import { buildRootMetadata } from "@/lib/metadata/site-metadata";

import { displayFontVariables } from "./fonts";

import "./globals.css";

export const metadata: Metadata = buildRootMetadata();

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const shellData = getSiteShellData();

  return (
    <html className={displayFontVariables} lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader data={shellData} />
        <RouteTransitionController />
        {children}
        <SiteFooter data={shellData} />
      </body>
    </html>
  );
}
