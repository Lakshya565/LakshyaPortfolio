export type CaseStudyOutlineItem = Readonly<{
  depth: 2 | 3;
  id: string;
  label: string;
}>;

export function createHeadingAnchor(label: string): string {
  return label
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
