import createMDX from "@next/mdx";
import type { NextConfig } from "next";

import { remarkMdxPolicy } from "./lib/content/mdx-policy";
import { securityResponseHeaders } from "./lib/security/response-headers";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
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
