import type { AboutPanel, AboutRailKey } from "@/types/content";

/**
 * One rail of the About page: a horizontal run with three panels hanging off it.
 *
 * The connectors are drawn entirely by `globals.css` pseudo-elements, using the
 * same `--tree-*` tokens as the project tree — a trunk into the rail, an elbow
 * with two rounded corners, and a drop into each panel. That is deliberate:
 * this page should look like the workbench continuing, not like a second
 * drawing that happens to sit nearby.
 *
 * **Three panels is structural.** The elbow's ends are placed at the outer
 * column centres with `100% / 6`, which is only correct for three equal
 * columns. `content-schema.ts` enforces the count so a fourth panel fails
 * validation rather than rendering a broken corner.
 *
 * **The merge below it** is the same figure inverted: three legs converging
 * into one trunk, which then feeds the next rail. Each leg is as long as its
 * own card is short — see `.about-panel-column` in `globals.css` for why that
 * needs no measuring.
 *
 * Below `56rem` the rail stacks to one column and every connector hides,
 * exactly as the tree does.
 */
export function AboutRail({
  headingId,
  label,
  mergesBelow = false,
  panels,
  railKey,
}: Readonly<{
  headingId: string;
  label: string;
  /** Draw the converging junction under this rail, into whatever follows it. */
  mergesBelow?: boolean;
  panels: readonly AboutPanel[];
  railKey: AboutRailKey;
}>) {
  return (
    <section
      aria-labelledby={headingId}
      className="about-rail"
      data-rail={railKey}
    >
      <h2 className="eyebrow about-rail-label" id={headingId}>
        {label}
      </h2>

      <div className="about-rail-panels">
        {panels.map((panel) => (
          /* The column, not the card, is the grid item: it stretches to the
             tallest of the three, and the leg below the card takes up the
             slack. That is the whole mechanism behind legs of three different
             lengths arriving on one rail. */
          <div className="about-panel-column" key={panel.title}>
            <article className="about-panel">
              <h3>{panel.title}</h3>
              <p>{panel.body}</p>
            </article>

            {mergesBelow ? (
              <span aria-hidden="true" className="about-panel-leg" />
            ) : null}
          </div>
        ))}
      </div>

      {mergesBelow ? <div aria-hidden="true" className="about-merge" /> : null}
    </section>
  );
}
