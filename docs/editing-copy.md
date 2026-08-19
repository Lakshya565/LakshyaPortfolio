# Where the writing lives

Every visible sentence on this site, and the file to open to change it. All paths
are from the repository root; the app itself lives in `web/`.

Two habits worth having before you start:

- **Most copy is data, not markup.** The files under `web/content/` are the
  source of truth, and the pages read from them. If a sentence is there, change
  it there — do not chase it into a component.
- **Run `npm run check` from `web/` after any edit.** Content is schema-checked
  and prose-checked, so a bad edit fails loudly rather than shipping. See
  [Rules that will reject an edit](#rules-that-will-reject-an-edit).

This document maps the rendered page back to its source file. For how the content
model itself works — publication states, adding a project, media manifests, the
full MDX policy — see [`content-authoring.md`](content-authoring.md).

## Quick lookup

| What you see | File |
|---|---|
| Your name, anywhere | `web/content/site.ts` → `siteProfile.name` |
| The hero sentence under your name | `web/content/site.ts` → `siteProfile.headline` |
| The hero paragraph | `web/content/site.ts` → `siteProfile.shortIntro` |
| GitHub / LinkedIn / Email / Resume links | `web/content/site.ts` → `socialLinks` |
| The resume PDF itself | `web/public/lakshya-agarwal-resume.pdf` |
| A project card's title, blurb, tech, metrics | `web/content/projects.ts` |
| A case study's body | `web/content/case-studies/<slug>.mdx` |
| The About narrative | `web/content/about.mdx` |
| Skills lists and About cards | `web/content/about.ts` |
| Labels on the isometric desk objects | `web/lib/desk/hotspots.ts` |
| The words spelled out in the desk scene | `web/lib/desk/lettering.ts` → `phrase` |
| Browser tab title and Google description | `web/lib/metadata/site-metadata.ts` |
| Nav labels ("Work", "About") | `web/lib/navigation/site-navigation.ts` |
| Section headings on the home page | `web/app/page.tsx` |
| Section headings on the About page | `web/app/about/page.tsx` |
| The 404 page | `web/app/not-found.tsx` |
| The footer line | `web/components/site/site-footer.tsx` |

---

## Site-wide

### `web/content/site.ts`

The single most useful file. It holds two things.

`siteProfile` — used on the home page, the About page header, and in metadata:

| Field | Where it appears |
|---|---|
| `name` | The home page `<h1>`, the About eyebrow, the footer, the browser tab |
| `headline` | The bold sentence under your name on the home page |
| `shortIntro` | The paragraph under that, and the About page intro |
| `location` | The mono line under the About page intro |

`socialLinks` — rendered in **three** places from this one list: the header nav,
the hero, and the footer. Adding an entry adds it to all three.

Each link is either `published` (has an `href`) or `pending` (has `href: null`
and a `requestedInput` describing what is still needed). Pending links are not
rendered at all, and they fail a release build rather than a development one.

**The resume is the one link whose `href` is a path rather than a URL**, because
the PDF is served from this site. To swap the document, replace
`web/public/lakshya-agarwal-resume.pdf` and commit — the filename is deliberately
stable and unversioned so a link someone already has keeps resolving to the
current document. `validate-portfolio-content.ts` fails the build if that file
goes missing, so you cannot ship a resume link that 404s.

### `web/lib/metadata/site-metadata.ts`

- `siteName` — the browser tab, the social card, the `og:title`
- `siteDescription` — the Google result snippet and the social card description

Per-page titles are set in each page's own `metadata` export (see below).

### `web/lib/navigation/site-navigation.ts`

The nav labels and their targets. Changing a `key` also means updating
`isNavigationItemActive` in the same file, which decides which item is
highlighted.

### `web/components/site/site-footer.tsx`

"Designed and built by …" is hardcoded here. The name interpolates from
`siteProfile`.

---

## Home page — `/`

Copy comes from two places, and it is worth knowing which is which.

**From `web/content/site.ts`:**

```
Lakshya Agarwal                      ← siteProfile.name
I make computers do useful things…   ← siteProfile.headline
I am a Computer Engineering student… ← siteProfile.shortIntro
GitHub · LinkedIn · Email · Resume   ← socialLinks
```

**Hardcoded in `web/app/page.tsx`:**

- `Work · N projects` (the count is computed, the word "Work" is not)
- The `Project tree` heading and the line under it
- The whole closing block: `Away from the workbench`, *I like learning with other
  people.*, the paragraph about teaching and bouldering, and the
  `A little more about me →` link label

That closing block is prose that never needed to be reused anywhere, which is
why it sits in the page. If it ever needs to appear twice, move it to
`web/content/site.ts` first.

### How the hero is put together

Three tracks above `56rem` — two equal columns with a hairline suspended
between them — and one stack below it. Left is who, right is what, and
everything inside each half is centred.

**`56rem` (896px) is the site's one desktop breakpoint.** It used to be `64rem`,
which was too high: a 1366-pixel laptop panel at 150% display scaling reports
911 CSS pixels and fell into the stacked layout, turning the page into a
blown-up phone view and making it 40% taller. Nothing was close to breaking at
1024, so the number simply came down. It appears in `globals.css` and — the one
place it is duplicated — in `threeColumnQuery` in
`components/project-tree/project-tree-beams.tsx`. **Change both or the tree
renders three columns with no pulses running down them.**

```
components/hero/
  hero-name.tsx          the drawn name
  hero-link-button.tsx   one link, as a pill that floods on hover
                         (icons live in components/site/site-icons.tsx)
  hero-background.tsx    which field is behind the hero — the switch
  hero-particles.tsx     the drifting field
  hero-grid.tsx          a grid whose squares light and fade
  use-hero-motion.ts     the gate both fields run through
```

**One width governs both halves, and it is what makes the hero symmetric.**
`--hero-identity-width` on `.personal-hero-split` sets `.hero-name`,
`.hero-actions` and `.hero-statement`. Change that one token, never the three
rules.

It is worth knowing why, because the failure is subtle. The two grid tracks were
always exactly equal; the *blocks inside them* were not. The name was 21rem
centred in a 523px track — 94px of slack each side — while the statement's 34rem
measure was wider than its track, so it filled it and had none. That put 146px
of air left of the divider and 52px right, and no amount of centring fixes it.
Give both blocks the same width and their slack is equal by construction, at
every viewport rather than at the one that happens to get measured.

**Icons need `.site-icon` to keep a base size in `globals.css`.**
`components/site/site-icons.tsx` draws every icon with a `viewBox` and no
`width` or `height`, so without that rule an SVG falls back to the 300px default
object size. That is not a cosmetic bug: in the hero button's flood — a flex row
of label plus icon — a 300px icon crushed the label to a couple of characters,
and `overflow-wrap: anywhere` (global on `<a>`) then broke "GitHub" into
"GitH / ub".

**Your name is drawn, not typed.** `hero-name.tsx` renders it as an SVG with its
own `viewBox`. The geometry is *computed rather than measured* — JetBrains Mono
is monospace, so at a notional font size of 100 user units every advance is
exactly 60 and the box a line occupies is arithmetic. That is why the file is a
plain server component with no hooks: it scales to any column width without
measuring a font or listening for a resize.

Things worth knowing before editing it:

- **The name comes from `siteProfile.name` and is split on whitespace, one word
  per line.** Two words gives two lines. A middle name would give three, and the
  box grows to suit — nothing is hardcoded to "Lakshya Agarwal".
- **Its size is one number:** `max-width` on `.hero-name` in `globals.css`. The
  SVG fills that box, so the box is the size. Do not look for a `font-size`.
- The `<h1>` holds the real, readable text and is visually hidden; the drawing
  is a sibling and is `aria-hidden`. Keep it that way — nested inside the
  heading, the SVG's own text joined the heading's `textContent` and read back
  as `Lakshya AgarwalLAKSHYAAGARWAL` to anything extracting plain text.

**The divider** is `.hero-divider`: a one-pixel column faded to transparent at
both ends so it reads as suspended rather than ruled edge to edge. The light
bouncing down it is `.hero-divider-beam`, a plain CSS keyframe on `alternate`
and `ease-in-out` — that pairing is the bounce, since it decelerates into each
end rather than reversing at speed.

This was `BorderBeam` and could not stay. That component walks a gradient square
around its host's border box at a constant rate, and on a one-pixel-wide element
the path is 460px down, 1px across, 460px back up — so the whole turn happens in
one frame, and `offset-rotate` spins the square 180° while it does. There is no
prop for it. Nothing on the site uses `BorderBeam` any more.

One number in that rule is derived, not chosen: the segment is `22%` of the line
and the keyframe moves it `354.5%`, which is `(100 / 22 − 1) × 100`. **Change the
height and you must recompute the translate**, or the beam stops short of the
bottom or runs past it.

**Which field sits behind the hero** is one constant in `hero-background.tsx`:

```tsx
const HERO_BACKGROUND: "grid" | "particles" = "particles";
```

Both are built and both work. Flip the string to swap them; `page.tsx` imports
only `HeroBackground`, so nothing else knows or cares which is running.

**Both fields run through `useHeroMotion`**, which requires three things at
once: the component is mounted (not merely "reduced motion is off", which is
also true on the server), motion is allowed, and the hero is still on screen.
Take any one away and the field stops. That last condition matters — the hero is
the top of a 2,300px page, and without it the field would paint forever while
the reader is down in the project tree.

Under reduced motion the beam and the field both go and the divider stays. With
JavaScript off, or at any width below `56rem`, the name still renders in full
from the server-side SVG.

### The header

`components/site/site-navigation.tsx` renders two things and shows one at a
time: `SiteDock` at `40rem` and up, and the existing `<details>` dropdown below
that. The dropdown keeps real text labels on purpose — an icon with no hover is
an icon with no name, and there is no hover on a touch screen.

The dock is `@magicui/dock`. Two points worth knowing before editing it:

- **A `DockIcon` must be a direct child of `Dock`.** `Dock` clones only its
  immediate `DockIcon` children in order to hand them the shared pointer
  position; wrap one in anything and it silently stops magnifying. Other
  children pass through untouched, which is how the group separator works.
- **The hover label is anchored to the icon's centre, not its bottom.**
  `DockIcon` animates its own width and height, so anything measured from the
  bottom edge slides down as the icon grows. The dock is `items-center`, so the
  centreline is the one thing that holds still. See `.site-dock-tip`.

Every icon carries an `aria-label`, since the visible label is decoration that
only appears on hover or focus. The current route is marked with a filled disc
*and* the accent colour — colour alone would be the only cue otherwise.

Icons are inline SVG in `components/site/site-icons.tsx`, shared with the hero
buttons. There is no icon package and adding one is not worth it for six
glyphs.

### Type sizes in the hero

If the issue is size rather than wording, it is CSS, in `web/app/globals.css`:

| Class | What it sets |
|---|---|
| `.hero-title` | Nothing visual — the heading is visually hidden; see `.hero-name` |
| `.hero-headline` | The sentence under it |
| `.hero-intro` | The paragraph |
| `.hero-actions` | The grid of link pills, and the fade that ends the reveal sequence |
| `.hero-name` | **The size of the name**, and the green glow around it |
| `.hero-name-letters` | The face, weight and tracking of the drawn name |
| `.hero-divider` | The hairline between the halves |
| `.eyebrow` | The small uppercase mono line used elsewhere on the site |

**Sizes come from tokens in `:root`, not from the rules themselves.** One
constraint governs the scale: *every page's `h1` is `--text-display`, and no
`h2` is ever larger than an `h1`.* Before those tokens existed the hero name
rendered at 48px while its own "Project tree" heading rendered at 52px, About's
title at 60px and case-study titles at 64px — the name was the quietest large
text on the site. If you change one heading size, change the token, not the
rule, or the ranking drifts apart again.

| Token | Value | Used by |
|---|---|---|
| `--text-display` | `clamp(2.5rem, 6vw, 4rem)` | Every `h1` |
| `--text-section` | `clamp(1.6rem, 3vw, 2.25rem)` | Every `h2` |
| `--text-subsection` | `clamp(1.25rem, 2.2vw, 1.75rem)` | `h3`, the tree's root card name |
| `--text-lead` | `clamp(1.25rem, 2.2vw, 1.625rem)` | The hero headline, case-study summaries |
| `--text-body-lg` | `clamp(1rem, 1.4vw, 1.125rem)` | The hero intro |
| `--text-label` / `--text-label-sm` | `0.75rem` / `0.6875rem` | Every uppercase mono label |

There are two label sizes because there used to be four — `0.65`, `0.68`, `0.7`
and `0.75rem` — which read as one size but never quite lined up. Do not add a
fifth.

---

## Fonts

### The two faces

Both are real files, downloaded at build time and served from this site.

| Token | Face | Used for |
|---|---|---|
| `--font-body` | **Inter** | Every paragraph, heading, link and card title |
| `--font-code` | **JetBrains Mono** | The nav wordmark, every eyebrow, metric labels, project categories, and the hero name |

They are declared in `web/app/fonts.ts` and mapped to tokens near the top of
`web/app/globals.css`, inside `:root`:

```css
--font-body: var(--font-inter), "Segoe UI", sans-serif;
--font-code: var(--font-jetbrains-mono), Consolas, monospace;
```

**This used to be broken, and the failure was invisible on the machine it was
written on.** The tokens named `"Inter"` and `"Cascadia Code"` directly, and
neither font was ever loaded — no `@font-face` for either existed anywhere in
the build. Every visitor got whatever their operating system supplied instead:
Segoe UI and Consolas on Windows, Helvetica and SF Mono on a Mac. Because
Cascadia Code is installed on the development machine, the site looked correct
there and looked like a different site everywhere else. If you ever put a bare
font name in one of these stacks again, that is what you are choosing.

### Changing a font everywhere

Edit the token, not the rules that use it:

```css
--font-code: var(--font-jetbrains-mono), Consolas, monospace;
```

To swap in a different face, add it to `web/app/fonts.ts` with `next/font`, add
its `.variable` to `fontVariables` at the bottom of that file, then point the
token at it. Be deliberate with `--font-code` — it runs from 64px in the hero
name down to 11px on a project category label.

### Changing just the hero title

The hero name has its own three tokens so it can move without dragging every
label on the site with it:

```css
--font-display: var(--font-code);
--font-display-weight: 600;
--font-display-tracking: 0.05em;
```

They move together on purpose: the tracking that suits one face rarely suits
another, and a face with only one weight will have a bold synthesised for it if
you ask for 600.

### How loading works

`next/font` downloads each file at **build** time and self-hosts it. Nothing is
fetched from Google at runtime, so there is no third-party request, no privacy
question, and no change needed to the CSP in
`web/lib/security/response-headers.ts`.

Both faces set `preload: true`, which is the default and correct for two faces
used on every page. **Note that this version of Next emits no
`<link rel="preload" as="font">` regardless** — checked against a production
build and against `next start`, both serve zero font preload tags. The faces
still load: their `@font-face` rules ship inside the render-blocking stylesheet
that is already in the head, so the browser finds the `src` at effectively the
moment a preload would have been found. Do not hand-write preload tags to
"fix" this without measuring first.

### What was removed

IBM Plex Mono, Space Grotesk and Departure Mono were wired up as hero
candidates alongside a commented switch block in `globals.css`. Once JetBrains
Mono was chosen, all three came out along with the switch. Departure Mono's
`.woff2` and its `DepartureMono-OFL.txt` were deleted **as a pair** — the SIL
Open Font License requires the licence to travel with the font, so they go
together or not at all. All of it is recoverable from git history if the pixel
face is ever wanted for the hero.

---

## The isometric desk scene

The scene is generated, not hand-drawn, so its text lives in source and has to be
regenerated after a change: **`npm run generate:desk` from `web/`.**

| What | File |
|---|---|
| The label on a hoverable object ("A Debugging Duck") | `web/lib/desk/hotspots.ts` |
| The paragraph that object shows | `web/content/about.ts` → `personalMotifs` |
| The words built out of blocks in the scene | `web/lib/desk/lettering.ts` → `phrase` |
| The screen-reader text for those words | `web/components/desk/isometric-desk.tsx` |
| The SVG's own description, for screen readers | `web/scripts/generate-desk.ts` |

The lettering has its own font, so a new character needs a glyph adding to `font`
in the same file — it throws at import rather than rendering a blank. The
[desk artwork handoff](desk-artwork-handoff.md) covers the rest.

---

## Project tree cards and project pages

### The About card

`NeonGradientCard`, and almost everything about it is steered from
`globals.css` rather than from props — because **its inner wrapper's classes are
hardcoded and are not merged with anything passed in.** `cn` is applied to its
outer element only. Those hardcoded classes include `bg-gray-100`, and this site
has no `.dark` class for the `dark:` variant to match, so left alone the card
paints *light grey*. `.project-tree-root-neon > div` takes back the background,
the padding and the blur radius; unlayered CSS beats `@layer utilities`.

Two more things it does not handle itself: it sets its glow's size from
`offsetWidth` in an effect, so the card keeps a plain hairline border underneath
for the moment before hydration and for no-JS; and it ships no reduced-motion
handling, so `globals.css` stops the sweep.

Its colours are passed as `var(--accent-green)` and `var(--accent-purple)`. That
works because the component interpolates them into a `linear-gradient()` string,
where a `var()` resolves normally — unlike `Particles`, which parses hex by hand
and turns anything else into `NaN`.

### Each branch has a colour *and* a texture

`components/project-tree/work-mode-pattern.tsx` is the only place the mapping
lives, and both the tree and every case study page go through it:

| branch | colour | texture |
|---|---|---|
| Hybrid | blue | grid |
| Software | green | hexagons |
| Hardware | purple | dots |

It sets no colour of its own. All three patterns paint from `currentColor` and
`stroke`, and `--project-accent` is already on an ancestor wherever this is
used, so one rule in `globals.css` colours the lot. Changing a branch's texture
is one line in that file; changing a branch's colour is `--project-accent` in
`globals.css`, and **the colours are locked product semantics — do not.**

The same texture appears as a band across the top of that project's case study,
faded out by a mask rather than by a scroll listener. It is already transparent
where the reading column starts, so scrolling past it is scrolling past nothing,
and it is correct before hydration.

**The category eyebrow is now its branch's colour**, and that overturned an
earlier rule that colour never appears without its branch label. The cost is
real: "Embedded Systems" sits under Hybrid *and* under Hardware, so it is blue
in one column and purple in the other. The eyebrow answers "which branch", not
"which category". Measured at 9.3–10.7:1 against the card surface, so it reads
better than the grey it replaced.

**The beams trace the tree, corners and all.** A pulse leaves the About card,
reaches the junction where the trunk meets the rail, and three more depart from
that junction — out along the rail, round the corner, and down their branch to
the last card. `project-tree-beams.tsx` builds one SVG `<path>` per branch from
the measured positions and walks a dash along it; a travelling gradient cannot
be used, because a gradient vector is a straight line and stops tracking the
connector the moment it turns.

Two numbers in that file are load-bearing. The trunk and the branches must keep
**equal periods** (`duration + repeatDelay`), or they drift apart over a few
minutes and the split stops lining up — `delay` applies only to the first run
and cannot hold them together. And the corner radius is read from the elbow's
resolved `border-top-left-radius`, not from `--tree-radius`: that token's value
is the text `0.75rem`, and `parseFloat` on it yields `0.75`, which is a sharp
corner rather than a curve.

`components/ui/dot-pattern.tsx` is written here rather than vendored. The
registry's version is a client component that emits one `<circle>` per dot —
roughly four hundred of them across the Hardware branch, none server-rendered.
Ours is one SVG `<pattern>` holding a single circle. If you re-run
`shadcn add @magicui/dot-pattern`, it will overwrite this. Don't.

### `web/content/projects.ts`

One entry per project, and it drives both the card on the home page and the
header of the project's own page.

| Field | Effect |
|---|---|
| `title` | Card heading and page heading |
| `shortDescription` | The blurb on the card |
| `role` | The role line |
| `category` | The category chip |
| `technologies` | The tech list |
| `metrics` | The numbers, each with a `label`, `value`, and `context` |
| `links` | The outbound buttons (repo, demo, video) |
| `workMode` | **Which branch of the tree the project hangs from** — `software`, `hardware`, or `hybrid` |
| `displayOrder` | Position within the branch. Must be unique across all projects |
| `publication` | `draft` hides the project from a release build |
| `slug` | The URL, **and** the case-study filename it must match |

`slug` is load-bearing in two directions: it is the URL at `/projects/<slug>`,
and the validator requires `web/content/case-studies/<slug>.mdx` to exist. It
also rejects a `.mdx` file that no project references, so renaming means renaming
both.

### `web/content/case-studies/<slug>.mdx`

The long-form body of a project page: Overview, Technical approach, and so on.
Plain Markdown with a deliberately narrow feature set — see the MDX rules below.

---

## About page — `/about`

Three sources:

| What | File |
|---|---|
| The narrative essay | `web/content/about.mdx` |
| The skills lists | `web/content/about.ts` → `skillGroups` |
| The cards below the essay | `web/content/about.ts` → `aboutItems` |
| The headings — *Building across boundaries.*, *What shapes the work.*, *Continue the conversation.* — and the page's `<title>`/description | `web/app/about/page.tsx` |

---

## Other pages

- **404** — `web/app/not-found.tsx`. All of it is hardcoded there.
- **`/lab`** — `web/app/lab/page.tsx`. An internal workbench for reviewing the
  desk artwork object by object. Not linked from the site.

---

## Rules that will reject an edit

`npm run check` runs schema validation, prose validation, lint, types, and tests.
The ones that catch writing:

**Write in the first person.** The words `Lakshya`, `he`, and `his` are rejected
in `siteProfile.headline`, `siteProfile.shortIntro`, project descriptions, About
items, and desk motif details. The site speaks as you, not about you. (Your name
is fine as a *value* — `siteProfile.name` — just not inside prose.)

**Nothing may be empty.** Every text field is checked for non-empty content.

**MDX is deliberately restricted.** In case studies and `about.mdx`:

- No imports, exports, or JavaScript expressions
- No raw HTML
- No Markdown images — media goes in the project's `assets` in `projects.ts`
- Only `<Callout>` is available as a component, and it takes no props
- Headings must be `##` or `###`, must be plain text, must be unique, and a
  `###` cannot appear before the first `##`

**Release mode is stricter than development.** Running with `--release` (or with
a site origin configured) additionally rejects pending social links, draft
projects, unreviewed content, and placeholder assets. `npm run check` uses
development mode; `npx tsx scripts/validate-content.ts --release` runs the strict
pass, and it is what to run before publishing anything.

## After editing

From `web/`:

```
npm run check            # schema, prose, lint, types, tests
npm run generate:desk    # only if you touched anything under lib/desk/
npm run dev              # look at it
```
