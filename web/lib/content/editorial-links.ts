export function isSafeEditorialHref(href: string): boolean {
  if (href.startsWith("#")) {
    return href.length > 1;
  }

  if (href.startsWith("/")) {
    return !href.startsWith("//") && !href.includes("\\");
  }

  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "mailto:";
  } catch {
    return false;
  }
}
