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

- The `COMPUTER ENGINEERING` eyebrow above your name
- `Work · N projects` (the count is computed, the word "Work" is not)
- The `Project tree` heading and the line under it
- The whole closing block: `Away from the workbench`, *I like learning with other
  people.*, the paragraph about teaching and bouldering, and the
  `A little more about me →` link label

That closing block is prose that never needed to be reused anywhere, which is
why it sits in the page. If it ever needs to appear twice, move it to
`web/content/site.ts` first.

### Type sizes in the hero

If the issue is size rather than wording, it is CSS, in `web/app/globals.css`:

| Class | What it sets |
|---|---|
| `.hero-title` | Your name — size, the mono face, the uppercasing, the tracking |
| `.hero-headline` | The sentence under it |
| `.hero-intro` | The paragraph |
| `.hero-social-links` | The link row, and the fade that ends the reveal sequence |
| `.eyebrow` | The small uppercase mono line used elsewhere on the site |

**The title's `font-size` is a `clamp()`, and its floor is not a taste
decision.** `clamp(1.75rem, 5.5vw, 3rem)` — the middle value scales with the
viewport, the last is the desktop size, and the first is the floor. At 1.75rem
the uppercase name measures 271px against the 288px available at a 320px
viewport, which is the narrowest width this site is expected to reflow at.
Raising the floor overflows that screen. Raise the **maximum** instead; there is
plenty of room there.

---

## Fonts

### Where they are defined

Two custom properties near the top of `web/app/globals.css`, inside `:root`:

```css
--font-body: "Inter", "Segoe UI", sans-serif;
--font-code: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
```

`--font-body` is the page. `--font-code` is the technical voice: the nav
wordmark, every eyebrow, metric labels, timeline values, and now the hero title.

**Nothing here is downloaded.** These are *system font stacks* — the browser uses
the first name the visitor's machine already has, and falls through to the next.
That is why the site loads no font files and never flashes unstyled text, and it
is also the catch: **a visitor without Cascadia Code installed does not see
Cascadia Code.** Most Macs and most Linux machines don't have it, so they get
whatever their generic `monospace` is (Menlo, DejaVu Sans Mono), and the hero
looks noticeably different from what you see on Windows. Same story for Inter.

If you want the site to look the same everywhere, that means shipping a real
font file — see [Adding a real webfont](#adding-a-real-webfont) below.

### Changing just the hero title

One line, in `.hero-title`:

```css
.hero-title {
  font-family: var(--font-code);   /* ← change this */
}
```

Give it a stack, not a single name, so there is something to fall back to:

```css
font-family: "JetBrains Mono", var(--font-code);
```

### Changing a font everywhere

Edit the token instead of the rule, and every user of it follows:

```css
--font-code: "IBM Plex Mono", "Cascadia Code", Consolas, monospace;
```

Be deliberate about this one — `--font-code` is doing a lot of work across the
site, and what reads well at 3rem in the hero may read badly at 0.6875rem on a
technology badge.

### Switching the hero title face

**All five candidates are already wired up.** The faces are declared in
`web/app/fonts.ts` and exposed as CSS variables; the choice is a block of
commented alternatives at the top of `web/app/globals.css`, in `:root`:

```css
/* Cascadia Code — the site's own mono. */
--font-display: var(--font-code);
--font-display-weight: 600;
--font-display-tracking: 0.06em;

/* JetBrains Mono — taller and wider than Cascadia; holds up blown up.
--font-display: var(--font-jetbrains-mono), var(--font-code);
--font-display-weight: 600;
--font-display-tracking: 0.05em; */
```

Comment out the active block, uncomment another, done. Nothing else changes.

**All three values move together on purpose.** Weight is in there because
Departure Mono has only one, and asking a single-weight pixel face for 600 makes
the browser synthesise a bold that smears the pixel grid. Tracking is in there
because letter-spacing that suits one face rarely suits another.

### How the fonts are loaded

`next/font` downloads each file at **build** time and self-hosts it. Nothing is
fetched from Google at runtime, so there is no third-party request, no privacy
question, and no change needed to the CSP.

**Every face sets `preload: false`, and that is deliberate.** `preload` defaults
to true, which injects a `<link rel="preload">` per face — five declared faces
would mean five downloads on every page load for a site that otherwise ships
none. With preload off, an unused `@font-face` costs only its few hundred bytes
of CSS, and the browser fetches a file when text actually asks for it. Verified:
switching the variable at runtime downloads that face and nothing else.

**Once you settle on one, set its `preload: true` in `fonts.ts`.** It is the
active face, so paying for it up front is the right trade.

Departure Mono is the one that is not on Google Fonts. Its `.woff2` is committed
at `web/app/fonts/`, with `DepartureMono-OFL.txt` beside it — copyright
2022–2024 Helena Zhang, SIL Open Font License 1.1, which permits bundling with
software and requires the licence to travel with the font. **Do not separate
them.**

### The five faces

Measured at a 1280px viewport, 48px type, name set in caps:

| Face | Character | Width | File |
|---|---|---:|---|
| **Cascadia Code** | The site's own mono. Even, slightly rounded | 465px | none — system stack |
| **JetBrains Mono** | Taller x-height, wider apertures; built to survive being blown up | 468px | ~25 KB |
| **IBM Plex Mono** | Warmer and slightly humanist; less terminal, more engineering document | 468px | ~28 KB |
| **Space Grotesk** | A geometric *sans*, not a mono. Minimal, tighter, more modern | 450px | ~30 KB |
| **Departure Mono** | Pixel/bitmap face; rhymes directly with the desk lettering | 516px | ~22 KB |

Cascadia is the only one that downloads nothing — and the only one that is not
guaranteed to be what a visitor sees, since a machine without it installed falls
back to its generic `monospace`. **Choosing any of the other four is also
choosing that everyone sees the same thing.**

Two things to check after any font change: the name still fits on one line at a
320px viewport (see the `clamp()` note above), and the uppercase tracking still
looks right — `letter-spacing` that suits one face usually does not suit another.

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
