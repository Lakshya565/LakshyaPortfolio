"use client";

import { useState, type ReactNode } from "react";

/**
 * The toggles for the object workbench.
 *
 * Only the switches are client-side. The tiles themselves are server-rendered
 * SVG passed through as `children`, so the artwork never ships as JavaScript —
 * the same reason the real scene inlines its markup on the server. Each toggle
 * sets a data attribute and the page's CSS does the rest.
 */
export function LabControls({ children }: Readonly<{ children: ReactNode }>) {
  const [grid, setGrid] = useState(true);
  const [shadows, setShadows] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [labels, setLabels] = useState(true);

  const toggles = [
    { id: "grid", label: "Grid", value: grid, set: setGrid },
    { id: "shadows", label: "Shadows", value: shadows, set: setShadows },
    { id: "wireframe", label: "Wireframe", value: wireframe, set: setWireframe },
    { id: "labels", label: "Labels", value: labels, set: setLabels },
  ];

  return (
    <>
      <div className="lab-controls">
        {toggles.map((toggle) => (
          <label key={toggle.id}>
            <input
              checked={toggle.value}
              onChange={(event) => toggle.set(event.target.checked)}
              type="checkbox"
            />
            {toggle.label}
          </label>
        ))}
      </div>

      <div
        data-grid={grid ? "on" : "off"}
        data-labels={labels ? "on" : "off"}
        data-shadows={shadows ? "on" : "off"}
        data-wireframe={wireframe ? "on" : "off"}
      >
        {children}
      </div>
    </>
  );
}
