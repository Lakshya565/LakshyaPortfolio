const siteOriginVariable = "NEXT_PUBLIC_SITE_URL";

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]" ||
    hostname.startsWith("127.")
  );
}

export function parseSiteOrigin(value: string | null | undefined): URL | null {
  const candidate = value?.trim();

  if (!candidate) {
    return null;
  }

  let parsed: URL;

  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error(
      `${siteOriginVariable} must be a valid absolute HTTPS origin.`,
    );
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash ||
    isLocalHostname(parsed.hostname)
  ) {
    throw new Error(
      `${siteOriginVariable} must be a public HTTPS origin without credentials, a path, a query, or a fragment.`,
    );
  }

  return new URL(parsed.origin);
}

export function getSiteOrigin(): URL | null {
  return parseSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
}
