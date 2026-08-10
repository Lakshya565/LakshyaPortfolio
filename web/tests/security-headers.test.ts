import { describe, expect, it } from "vitest";

import { securityResponseHeaders } from "../lib/security/response-headers";

describe("security response headers", () => {
  it("defines one explicit value for every static security boundary", () => {
    const headers = new Map(
      securityResponseHeaders.map(({ key, value }) => [key.toLowerCase(), value]),
    );

    expect(headers.size).toBe(securityResponseHeaders.length);
    expect(headers.get("content-security-policy")).toBe(
      "base-uri 'self'; form-action 'none'; frame-ancestors 'none'; object-src 'none'",
    );
    expect(headers.get("permissions-policy")).toBe(
      "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    );
    expect(headers.get("referrer-policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(headers.get("x-content-type-options")).toBe("nosniff");
    expect(headers.get("x-frame-options")).toBe("DENY");
  });
});
