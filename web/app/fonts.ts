/**
 * The site's typefaces.
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

import { Chakra_Petch, Inter, JetBrains_Mono } from "next/font/google";

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
 * Labels that name a thing rather than describe it: the project tree's three
 * branch plaques today.
 *
 * The third face exists because two was one short. Inter is the voice of every
 * paragraph and card title, so anything set in it reads as more of the same;
 * JetBrains Mono is the voice of metadata, so a heading set in it reads as a
 * field label. A branch plaque is neither — it names one of the three things
 * the whole page is organised around, and it had no face of its own.
 *
 * Chakra Petch: a squarish sans with clipped corners and angled cuts on the
 * stems — the most overtly technical of the faces tried here, and narrower than
 * the alternatives, which is why it is tracked wider than they were.
 *
 * **Not variable.** Unlike the other two it ships static instances, so
 * `weight` is required rather than optional, and asking for one weight means
 * one weight is what the plaques can use. 700 is the only one they need.
 */
export const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-chakra-petch",
  display: "swap",
  preload: true,
});

/**
 * Every face's CSS variables, for the `<html>` element in `app/layout.tsx`.
 */
export const fontVariables = [
  inter.variable,
  jetbrainsMono.variable,
  chakraPetch.variable,
].join(" ");
