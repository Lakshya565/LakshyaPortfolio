import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSiteShellData } from "@/lib/content/portfolio-repository";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lakshya Agarwal — Computer Engineer",
    template: "%s | Lakshya Agarwal",
  },
  description:
    "Lakshya Agarwal builds software, AI systems, embedded devices, and hardware products.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const shellData = getSiteShellData();

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader data={shellData} />
        {children}
        <SiteFooter data={shellData} />
      </body>
    </html>
  );
}
