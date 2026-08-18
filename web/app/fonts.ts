/**
 * The optional display faces for the hero title.
 *
 * The site's own two faces — `--font-body` and `--font-code` in `globals.css` —
 * are system stacks and download nothing. These four are real files, and they
 * exist so the hero title can be tried in each without a rebuild of the setup.
 *
 * **`next/font` self-hosts at build time.** Nothing is fetched from Google at
 * runtime, so there is no third-party request, no privacy question, and no
 * change needed to the CSP in `lib/security/response-headers.ts`.
 *
 * **Every face here sets `preload: false`, and that is deliberate.** `preload`
 * defaults to true, which injects a `<link rel="preload">` per face — so four
 * declared faces would mean four downloads on every page load for a site that
 * otherwise ships none. With preload off, an unused `@font-face` costs only its
 * few hundred bytes of CSS: the browser fetches a font file when text actually
 * asks for it, which is exactly one of these. **Once a face is chosen for good,
 * turn its `preload` back on** — it is the active one, so paying for it up front
 * is the right trade.
 *
 * Pick the active face in `globals.css`; see `--font-display`.
 */

import { IBM_Plex_Mono, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";

/**
 * Taller x-height and wider apertures than Cascadia. Variable, so no `weight`
 * is requested — the whole range comes in one file.
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

/**
 * Warmer and slightly humanist. **Not** a variable font on Google Fonts, so the
 * weights have to be named: each one listed here is a separate file, and only
 * the two the site actually uses are.
 */
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

/** A geometric sans rather than a mono. Variable, 300–700. */
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: false,
});

/**
 * A pixel face, and the only one not on Google Fonts — the file lives in
 * `app/fonts/` and is committed.
 *
 * Copyright 2022–2024 Helena Zhang, under the SIL Open Font License 1.1, which
 * permits bundling and redistribution with software and requires the licence to
 * travel with the font. `DepartureMono-OFL.txt` sits beside the `.woff2` for
 * that reason — **do not separate them.**
 *
 * It has one weight. `--font-display-weight` in `globals.css` exists because of
 * that: asking a single-weight pixel font for 600 makes the browser synthesise
 * a bold, which smears the pixel grid the face is made of.
 */
export const departureMono = localFont({
  src: "./fonts/DepartureMono-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-departure-mono",
  display: "swap",
  preload: false,
});

/**
 * Every face's CSS variable, for the `<html>` element.
 *
 * Declaring a face costs its `@font-face` rule, not its font file. See the note
 * on `preload` above for why that stays true.
 */
export const displayFontVariables = [
  jetbrainsMono.variable,
  plexMono.variable,
  spaceGrotesk.variable,
  departureMono.variable,
].join(" ");
