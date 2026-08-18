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
| `.eyebrow` | The small uppercase mono line |
| `.hero-title` | Your name |
| `.hero-headline` | The sentence under it |
| `.hero-intro` | The paragraph |
| `.hero-social-links` | The link row |

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
