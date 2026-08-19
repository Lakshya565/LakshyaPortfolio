import { DotPattern } from "@/components/ui/dot-pattern";
import { GridPattern } from "@/components/ui/grid-pattern";
import { HexagonPattern } from "@/components/ui/hexagon-pattern";
import { cn } from "@/lib/utils";
import type { ProjectWorkMode } from "@/types/content";

/**
 * The texture a branch is drawn in.
 *
 * Each work mode gets a shape as well as a hue, so a card, a branch chip and a
 * case study page all announce which branch they belong to before the label is
 * read. The mapping lives here and only here — the tree and the case study
 * renderer both go through this component rather than reaching for a pattern
 * directly.
 *
 * Nothing here sets a colour. All three patterns paint from `currentColor` and
 * `stroke`, and `--project-accent` is already on the ancestor in every place
 * this is used, so `globals.css` colours the lot in one rule. `tone` picks the
 * opacity and the mask, nothing more.
 *
 * The geometry is tuned for the smallest box any of these lands in — a branch
 * chip is about 130×55px after the shrink, and a 40px hexagon in a box that
 * size shows one and a half hexagons. The cards use the same numbers so the
 * two read as one texture at two strengths rather than as two textures.
 */
export type WorkModePatternTone =
  /** Branch chips and project cards: texture under text that stays readable. */
  | "faint"
  /** The band across the top of a case study page. */
  | "band";

export function WorkModePattern({
  className,
  tone,
  workMode,
}: Readonly<{
  className?: string;
  tone: WorkModePatternTone;
  workMode: ProjectWorkMode;
}>) {
  const classes = cn(
    "work-mode-pattern",
    `work-mode-pattern-${tone}`,
    className,
  );

  if (workMode === "hybrid") {
    return <GridPattern className={classes} height={26} width={26} />;
  }

  if (workMode === "hardware") {
    return (
      <DotPattern className={classes} cr={1} cx={2} cy={2} height={14} width={14} />
    );
  }

  return <HexagonPattern className={classes} radius={13} />;
}
