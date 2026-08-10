import { describe, expect, it } from "vitest";

import { portfolioContent } from "../content/portfolio";
import { buildRobots, buildSitemap } from "../lib/metadata/discovery";
import {
  buildRootMetadata,
  buildStaticPageMetadata,
} from "../lib/metadata/site-metadata";
import { parseSiteOrigin } from "../lib/metadata/site-origin";

describe("site origin", () => {
  it("treats an omitted value as an intentionally unconfigured origin", () => {
    expect(parseSiteOrigin(undefined)).toBeNull();
    expect(parseSiteOrigin("   ")).toBeNull();
  });

  it("accepts a public HTTPS origin and normalizes its trailing slash", () => {
    expect(parseSiteOrigin(" https://portfolio.example.com/ ")?.href).toBe(
      "https://portfolio.example.com/",
    );
  });

  it.each([
    "http://portfolio.example.com",
    "https://localhost",
    "https://127.0.0.1",
    "https://portfolio.example.com/path",
    "https://portfolio.example.com?preview=1",
    "https://user:password@portfolio.example.com",
    "not a url",
  ])("rejects an unsafe or non-origin value: %s", (value) => {
    expect(() => parseSiteOrigin(value)).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});

describe("indexing metadata", () => {
  it("keeps unconfigured local and preview builds non-indexable", () => {
    const metadata = buildRootMetadata(null);

    expect(metadata).not.toHaveProperty("metadataBase");
    expect(metadata).not.toHaveProperty("alternates");
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
      nocache: true,
    });
    expect(buildRobots(null)).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
    expect(buildSitemap(null)).toEqual([]);
  });

  it("enables canonicals and discovery only for a configured origin", () => {
    const origin = new URL("https://portfolio.example.com");
    const metadata = buildRootMetadata(origin);
    const aboutMetadata = buildStaticPageMetadata(
      {
        title: "About",
        description: "About the engineer.",
        path: "/about",
      },
      origin,
    );

    expect(metadata.metadataBase).toEqual(origin);
    expect(metadata.alternates).toEqual({ canonical: origin });
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(aboutMetadata.alternates).toEqual({
      canonical: new URL("https://portfolio.example.com/about"),
    });
    expect(buildRobots(origin)).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://portfolio.example.com/sitemap.xml",
    });
  });

  it("lists only routable public pages and published case studies", () => {
    const origin = new URL("https://portfolio.example.com");
    const sitemap = buildSitemap(origin, portfolioContent);
    const urls = sitemap.map(({ url }) => url);

    expect(urls).toEqual([
      "https://portfolio.example.com/",
      "https://portfolio.example.com/about",
      "https://portfolio.example.com/projects/cisco-agentic-runbook-creator",
      "https://portfolio.example.com/projects/repoframe",
      "https://portfolio.example.com/projects/nucurrent-inventory-system",
      "https://portfolio.example.com/projects/smartlift-sleeve",
      "https://portfolio.example.com/projects/quackta",
    ]);
    expect(urls).not.toContain("https://portfolio.example.com/projects/backbuddy");
    expect(new Set(urls).size).toBe(urls.length);
  });
});
