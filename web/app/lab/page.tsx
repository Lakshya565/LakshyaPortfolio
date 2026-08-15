import { notFound } from "next/navigation";

import { LabControls } from "@/app/lab/lab-controls";
import { ink } from "@/lib/desk/parts";
import {
  deskCatalog,
  deskCatalogStrokeWidth,
  type DeskCatalogEntry,
} from "@/lib/desk/scene-catalog";

/**
 * The object workbench: every object in the scene, alone and large.
 *
 * This exists because the scene is reviewed at 1444px wide, where a duck is
 * roughly forty pixels across. Judging whether a shape reads at that size is
 * guesswork, and guessing is how the previous duck took eleven attempts. Here
 * each object gets its own tile, cropped to its own bounds, at whatever size the
 * grid gives it.
 *
 * Development only — the route 404s in production, so neither the page nor its
 * styles ever ship.
 */

/**
 * Metadata is resolved before the page renders, so a static `metadata` export
 * would put "Object workbench" in the production 404's title even though
 * `notFound()` stops the page body from being emitted at all.
 */
export function generateMetadata() {
  if (process.env.NODE_ENV === "production") {
    return {};
  }

  return {
    title: "Object workbench",
    robots: { index: false, follow: false },
  };
}

function Tile({ entry }: Readonly<{ entry: DeskCatalogEntry }>) {
  return (
    <figure className="lab-tile">
      <svg
        aria-hidden="true"
        className="lab-art"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        strokeWidth={deskCatalogStrokeWidth}
        viewBox={entry.viewBox}
      >
        <g className="lab-grid" dangerouslySetInnerHTML={{ __html: entry.grid }} />
        {/* Paths inherit their stroke from here, exactly as they do from the
            object group in the real scene, so a tile shows the object's real
            colour rather than a monochrome stand-in. */}
        <g
          className="lab-body"
          stroke={entry.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={1.5}
          dangerouslySetInnerHTML={{ __html: entry.body }}
        />
      </svg>
      <figcaption>
        <b>{entry.key}</b>
        <span>
          {Math.round(entry.width)} × {Math.round(entry.height)}
        </span>
      </figcaption>
    </figure>
  );
}

function Section({
  entries,
  title,
}: Readonly<{ entries: readonly DeskCatalogEntry[]; title: string }>) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="lab-section">
      <h2>
        {title} <span>{entries.length}</span>
      </h2>
      <div className="lab-grid-layout">
        {entries.map((entry) => (
          <Tile entry={entry} key={entry.key} />
        ))}
      </div>
    </section>
  );
}

export default function LabPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const entries = [...deskCatalog];
  const labelled = entries.filter((entry) => !entry.scenery);
  const workspace = entries.filter(
    (entry) => entry.scenery && !/^(tree|figure)-/.test(entry.id),
  );
  const scenery = entries.filter((entry) =>
    /^(tree|figure)-/.test(entry.id),
  );

  return (
    <main className="lab" id="main-content" tabIndex={-1}>
      {/* Scoped to this page rather than globals.css: the route is dev-only, so
          its styles have no business in the shipped stylesheet. */}
      <style>{`
        .lab { padding: 2rem 1.5rem 5rem; color: ${ink.line}; }
        .lab h1 { font-size: 1.25rem; margin-bottom: 0.35rem; }
        .lab-note { font-size: 0.85rem; opacity: 0.7; max-width: 46rem; }
        .lab-controls {
          display: flex; flex-wrap: wrap; gap: 1rem;
          margin: 1.25rem 0 2rem; padding: 0.75rem 1rem;
          border: 1px solid ${ink.grid}; border-radius: 0.5rem;
          font-size: 0.8rem; position: sticky; top: 0; z-index: 2;
          background: ${ink.ground};
        }
        .lab-controls label { display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer; }
        .lab-section { margin-bottom: 2.5rem; }
        .lab-section h2 {
          font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em;
          opacity: 0.6; margin-bottom: 0.75rem;
        }
        .lab-section h2 span { opacity: 0.5; }
        .lab-grid-layout {
          display: grid; gap: 0.75rem;
          grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
        }
        .lab-tile {
          margin: 0; border: 1px solid ${ink.grid}; border-radius: 0.5rem;
          padding: 0.5rem; background: ${ink.ground};
        }
        .lab-art { width: 100%; height: 11rem; display: block; }
        .lab-tile figcaption {
          display: flex; justify-content: space-between; gap: 0.5rem;
          margin-top: 0.4rem; font-size: 0.7rem; font-family: var(--font-mono, monospace);
        }
        .lab-tile figcaption span { opacity: 0.5; }
        [data-grid="off"] .lab-grid { display: none; }
        [data-labels="off"] .lab-tile figcaption { visibility: hidden; }
        /* Presentation attributes lose to CSS, so this reliably strips the
           fills that hide overlapping construction inside an object. */
        [data-wireframe="on"] .lab-body path { fill: none !important; }
      `}</style>

      <h1>Object workbench</h1>
      <p className="lab-note">
        Every object in the scene, alone and cropped to its own bounds. The bar:
        name each one without reading its caption. Dimensions are screen units at
        scene scale — the number that decides whether a shape survives at 1444px
        wide.
      </p>

      <LabControls>
        <Section entries={labelled} title="Interactive objects" />
        <Section entries={workspace} title="Workspace and landmarks" />
        <Section entries={scenery} title="Scenery" />
      </LabControls>
    </main>
  );
}
