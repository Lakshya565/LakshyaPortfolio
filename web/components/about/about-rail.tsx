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
 * Below `56rem` the rail stacks to one column and every connector hides,
 * exactly as the tree does.
 */
export function AboutRail({
  headingId,
  label,
  panels,
  railKey,
}: Readonly<{
  headingId: string;
  label: string;
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
          <article className="about-panel" key={panel.title}>
            <h3>{panel.title}</h3>
            <p>{panel.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
