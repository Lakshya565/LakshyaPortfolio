# Portfolio content authoring

How the content model works: the records, their states, and the rules that
validate them. If you only want to know **which file holds a sentence you can see
on the page**, read [`editing-copy.md`](editing-copy.md) instead — it maps the
rendered site back to its sources, including the copy that is hardcoded in pages
rather than held in `web/content/`.

## Source of truth

Portfolio content is version-controlled under `web/content/`:

- `site.ts` contains identity and reviewed public social/contact links.
- `projects.ts` contains every routed project record.
- `about.ts` contains structured skills and About items.
- `about.ts` also contains the editable labels and descriptions for the nine
  personal desk motifs used by eight typed hotspot groups.
- The About page is typed content, not MDX — see `about.ts` → `aboutIntro`
  and `aboutPanels`. `about.mdx` was removed when that page was rebuilt.
- `case-studies/*.mdx` contains project stories whose depth follows the available evidence.
- `portfolio.ts` assembles the complete validated content object.

The shared contract is in `web/types/content.ts`. Runtime schemas and cross-file checks live under `web/lib/content/`.

## Publication states

Every project declares:

- `publication`: `draft` or `published`.
- `contentStatus`: `placeholder` or `reviewed`.

Development validation permits known drafts and placeholders so later phases can build against representative content. Release validation rejects pending contact inputs, draft projects, placeholder copy, and placeholder assets. The current contact inputs are resolved; the pending variant remains in the schema for safe future edits.

`publication: "published"` means a record is eligible for the site's public
queries. It does not mean the content is approved for deployment. The separate
`contentStatus` and asset `placeholder` flags keep unfinished records behind the
release gate. All ten intended launch records are available to local queries;
all ten have reviewed copy.

Run:

```powershell
npm.cmd run validate:content
npm.cmd run validate:content:release
```

The second command currently passes because no draft copy, pending contact
input, or temporary media is published. It is a machine-checkable gate, not a
substitute for the Cisco omission review, client approvals, or rendered review.

## Static project routes

Every published project prerenders at `/projects/<slug>`. The route gets its
parameters from the manifest, resolves MDX through the explicit loader registry,
and sets `dynamicParams = false`; unknown and unpublished slugs
therefore return the shared 404 page instead of invoking runtime generation.

Project slugs are permanent public identifiers. Changing a published slug also
requires an explicit redirect, which is deferred until there is a real rename.
Do not accept a pathname from MDX or construct a dynamic import from URL input.

The project metadata builder emits title, description, Open Graph, and Twitter
text from the same normalized record. It also exposes the stable canonical path
to tests. A canonical `<link>` is deliberately not emitted until the assigned
Vercel origin is known: Next.js requires an absolute canonical URL or a
configured `metadataBase`, and a guessed domain would be incorrect. Once that
origin exists, every route uses the reviewed static social card as its fallback;
placeholder project SVGs are never used as public share images.

The application uses ordinary Next.js prerendering rather than
`output: "export"`. Each case-study route is generated from local files during the build,
but this preserves normal Vercel capabilities without creating a runtime content
dependency.

## Adding a project

1. Add a stable slug to `projectSlugs` in `web/types/content.ts`.
2. Add the project record to `web/content/projects.ts`.
3. Create `web/content/case-studies/<slug>.mdx`.
4. Add the explicit loader to `web/content/case-studies/registry.ts`.
5. Add referenced media under `web/public/media/projects/<slug>/`.
6. Run content validation, tests, and the production build. Confirm the new slug
   appears in the static route list.

The manifest slug, MDX filename, and registry key must match. Dynamic
user-controlled MDX imports are not permitted. A project with limited evidence
should use a concise, honest story rather than filler; route availability does
not require every story to have the same length.

## Voice and ownership

The portfolio uses a conversational first-person narrator. Write `I` for work
Lakshya personally performed, `we` for team decisions and outcomes, and direct
artifact statements when the system itself is the subject. Do not rewrite every
sentence to begin with `I`; that becomes repetitive and artificial.

Homepage summaries should usually fit in 18–32 words and answer three questions:
what did I do, what problem did it address, and what constraint or outcome makes
it worth remembering?

| Avoid | Prefer |
| --- | --- |
| `Lakshya built an innovative platform...` | `I built the platform to replace...` |
| `A robust solution leveraging AI...` | `I bounded the evidence before asking the model to synthesize it.` |
| `We built the entire device...` when ownership is mixed | `Our team built the device; I worked across hardware, AI, and integration.` |

Content validation flags `Lakshya`, `he`, and `his` when they appear as narrator
terms in public prose. Identity metadata, quotations, and link destinations are
excluded. Treat the validator as a guardrail, then read the result aloud before
approving it.

The Cisco case study remains subject to a final omission and phrasing review
even when automated release validation passes.

## MDX policy

Case-study MDX may use CommonMark paragraphs, emphasis, strong text, ordered and
unordered lists, blockquotes, fenced/inline code, safe links, level-two and
level-three headings, and this reviewed component:

- `Callout`

`Callout` accepts children only. Imports, exports, arbitrary JavaScript or prop
expressions, raw HTML/JSX elements, component props, Markdown images, unsafe
protocols, and unapproved components fail validation and compilation. Safe links
are HTTPS URLs, `mailto:` URLs, root-relative site paths, or same-page fragments.

The project page owns the only `h1`. MDX headings must therefore use plain-text
`##` and `###` headings, begin at level two, and produce unique normalized
anchors. Four or more headings create an on-page outline automatically. Images
must not be embedded in prose; keep them in the typed manifest so paths,
dimensions, alt text, and publication state stay reviewable.

Tables and arbitrary embeds are intentionally unsupported because no current
case study requires them. Add a feature only with a real content need, validator
coverage, responsive styling, and a compiler-policy update.

## Project media

- Store media under `web/public/media/projects/<project-slug>/`.
- Use lowercase `.avif`, `.jpeg`, `.jpg`, `.png`, `.svg`, or `.webp` filenames.
- Declare positive intrinsic `width` and `height` values for every asset.
- Provide descriptive alt text; captions add context but do not replace alt text.
- Use `hero`, `screenshot`, `diagram`, `hardware-photo`, or `gallery` for images.
- At most one `hero` is allowed. Other images render in source order in the shared gallery.
- Case-study `videos` are a repeatable list of HTTPS destinations with a label
  and optional `thumbnailPath`. There is no fixed image or video count.
- A `video-thumbnail` asset must be referenced by exactly one video's
  `thumbnailPath`. Unassigned, missing, duplicate, and wrong-kind thumbnail
  references fail validation.
- Image and video collections use content-responsive grids. Videos open as
  explicit outbound links; the site does not autoplay or embed iframes.
- Placeholder filenames and placeholder flags fail release validation even if a flag is accidentally relabeled.

Local SVGs are served as image resources rather than inlined. Review final SVGs
for scripts, external references, metadata, and confidential details. Strip EXIF
and location metadata from final raster media during the publication phase.

## Contact links

GitHub, LinkedIn, email, and the resume use typed published records. External
profiles must use HTTPS; email must use `mailto:`. If a value becomes uncertain,
replace it with the typed pending variant and `href: null` rather than inventing
a URL. Release validation rejects pending entries.

**The resume is the exception to "links point off the site."** Its `href` is a
site-relative path, and the schema constrains it to a PDF at the root of
`public/` — a bare `/something` could point the link at a route, and a nested
path would put the file where the file check is not looking.
`validate-portfolio-content.ts` fails the build when the named file is missing,
because a resume link that 404s is worse than no resume link. Replace the
document by overwriting `web/public/lakshya-agarwal-resume.pdf`; the filename is
stable on purpose so a link already handed out keeps resolving to the current
version.

One list feeds three places — the header nav, the home hero, and the footer — so
adding an entry adds it everywhere.

The Vercel URL is requested separately during deployment for canonical metadata.

## Desk hotspots and project-tree membership

Every published project appears in the shared project tree. Do not add a
second scene-eligibility flag: `publication` and `displayOrder` are the canonical
membership and ordering controls for both `/work` and the homepage dialog.

Personal hotspot geometry is presentation data in `web/lib/desk/hotspots.ts`.
The eight definitions must assign all nine `personalMotifs` exactly once and
stay within the desk's normalized percentage bounds. The local desk SVG keeps
matching groups named `desk-<hotspot-key>` plus `desk-monitor`; it must remain a
passive, self-contained image with no scripts, event attributes, external
references, or project facts embedded in the artwork.

`workMode` is editorial meaning, not a color picker:

- `software` means software, infrastructure, or computation-led work and renders green.
- `hardware` means physical circuitry, devices, or human-facing hardware and renders purple.
- `hybrid` means neither software nor hardware explains the project alone and renders blue.

The tree groups projects into Hybrid, Software, and Hardware branches, in that
visible order. Within each branch, `displayOrder` communicates editorial ordering;
work-mode color communicates technical character, never quality. The typed tree
adapter owns that presentation grouping so authored project records remain free
of layout coordinates.

## Editing and removal

- Keep slugs stable after publication. A change requires a redirect.
- Keep `displayOrder` values unique and leave gaps for future insertion.
- Do not duplicate canonical prose in React components.
- Do not place confidential originals or metadata-bearing source assets in `public/`.
- Removing a manifest record removes it from future builds; review deletions deliberately.
- Cisco appears only as a project case study. Lakshya supplies the final omission list before final content approval.
