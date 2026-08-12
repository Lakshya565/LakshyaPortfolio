import createMDX from "@next/mdx";
import type { NextConfig } from "next";

import { remarkMdxPolicy } from "./lib/content/mdx-policy";
import { securityResponseHeaders } from "./lib/security/response-headers";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // /work was a separate page until the project tree moved onto the home page.
  // Keeping the redirect means existing links and bookmarks still land on it.
  redirects() {
    return Promise.resolve([
      { source: "/work", destination: "/#project-tree", permanent: true },
    ]);
  },
  headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityResponseHeaders],
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkMdxPolicy],
  },
});

export default withMDX(nextConfig);
