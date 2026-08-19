/**
 * The site's two typefaces.
 *
 * Before this file did its current job, `globals.css` named `"Inter"` and
 * `"Cascadia Code"` in its font stacks and **neither was ever loaded** — no
 * `@font-face` existed for either one. Every paragraph and every mono label
 * rendered in whatever the visitor's operating system happened to supply:
 * Segoe UI and Consolas on Windows, Helvetica and SF Mono on a Mac. The site
 * looked correct on a machine with Cascadia installed and looked like a
 * different site everywhere else.
 *
 * These two are loaded for real. **`next/font` self-hosts at build time**, so
 * nothing is fetched from Google at runtime — no third-party request, no
 * privacy question, and no change needed to the CSP in
 * `lib/security/response-headers.ts`.
 *
 * Both set `preload: true`, which is the default and is correct for two faces
 * used on every page. Note, though, that **this version of Next emits no
 * `<link rel="preload" as="font">` for them** — checked against a production
 * build and against `next start`, both serve zero font preload tags. The faces
 * still load: their `@font-face` rules ship in the render-blocking stylesheet
 * that is already in the head, so the browser discovers the `src` at
 * effectively the same moment a preload would have been found. Do not "fix"
 * this by hand-writing preload tags without measuring first.
 */

import { Inter, JetBrains_Mono } from "next/font/google";

/**
 * Body text: paragraphs, headings, links, card titles.
 *
 * Variable, so the whole weight range arrives in one file and no `weight` is
 * requested. This is the face the stylesheet always intended; it simply was
 * never fetched.
 */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

/**
 * Structure: the nav wordmark, every eyebrow, the metric and field labels, the
 * project categories, and the hero name.
 *
 * It replaces a `"Cascadia Code"` stack that only resolved on machines with
 * Cascadia installed. JetBrains Mono is the closest relative available as a
 * webfont — squarer than Cascadia and a touch wider, which is why
 * `--font-display-tracking` in `globals.css` is a shade tighter than it was.
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: true,
});

/**
 * Both faces' CSS variables, for the `<html>` element in `app/layout.tsx`.
 */
export const fontVariables = [inter.variable, jetbrainsMono.variable].join(" ");
