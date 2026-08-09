# Portfolio content authoring

## Source of truth

Portfolio content is version-controlled under `web/content/`:

- `site.ts` contains identity and reviewed public social/contact links.
- `projects.ts` contains every project and archive-card record.
- `about.ts` contains structured skills and About items.
- `about.mdx` contains the longer personal narrative.
- `case-studies/*.mdx` contains long-form case-study drafts.
- `portfolio.ts` assembles the complete validated content object.

The shared contract is in `web/types/content.ts`. Runtime schemas and cross-file checks live under `web/lib/content/`.

## Publication states

Every project declares:

- `publication`: `draft` or `published`.
- `contentStatus`: `placeholder` or `reviewed`.
- `launchTarget`: currently `initial` for every listed project.

Development validation permits known drafts and placeholders so later phases can build against representative content. Release validation rejects pending contact inputs, draft projects, placeholder copy, and placeholder assets. The current contact inputs are resolved; the pending variant remains in the schema for safe future edits.

`publication: "published"` means a record is eligible for the site's public
queries. It does not mean the content is approved for deployment. The separate
`contentStatus` and asset `placeholder` flags keep unfinished records behind the
release gate. Phase 2 publishes all ten approved records to local queries while
leaving their placeholder status intact.

Run:

```powershell
npm.cmd run validate:content
npm.cmd run validate:content:release
```

The second command is expected to fail until final URLs, Cisco omissions, copy,
and media are complete. It is a release gate, not the normal development/build
gate.

## Static project routes

Published `case-study` records prerender at `/projects/<slug>`. The route gets its
parameters from the manifest, resolves MDX through the explicit loader registry,
and sets `dynamicParams = false`; unknown, unpublished, and archive-only slugs
therefore return the shared 404 page instead of invoking runtime generation.

Published `archive-card` records intentionally have no detail route. Phase 3
will render them as substantial cards in the main portfolio hierarchy.

Project slugs are permanent public identifiers. Changing a published slug also
requires an explicit redirect, which is deferred until there is a real rename.
Do not accept a pathname from MDX or construct a dynamic import from URL input.

The project metadata builder currently emits title, description, Open Graph,
and Twitter text from the same normalized record. It also exposes the stable
canonical path to tests. A canonical `<link>` is deliberately not emitted until
the assigned Vercel origin is known: Next.js requires an absolute canonical URL
or a configured `metadataBase`, and a guessed domain would be incorrect. Social
images are likewise deferred until a reviewed PNG/JPEG exists; placeholder SVGs
are not suitable public share images.

The application uses ordinary Next.js prerendering rather than
`output: "export"`. Each case-study route is generated from local files during the build,
but this preserves normal Vercel capabilities without creating a runtime content
dependency.

## Adding a case-study project

1. Add a stable slug to `caseStudyKeys` in `web/types/content.ts`.
2. Add a `presentation: "case-study"` record to `web/content/projects.ts`.
3. Create `web/content/case-studies/<slug>.mdx`.
4. Add the explicit loader to `web/content/case-studies/registry.ts`.
5. Add referenced media under `web/public/media/projects/<slug>/`.
6. Run content validation, tests, and the production build. Confirm the new slug
   appears in the static route list.

The `caseStudyKey`, manifest slug, MDX filename, and registry key must match. Dynamic user-controlled MDX imports are not permitted.

## Adding an archive card

Archive items use:

- `presentation: "archive-card"`
- `priority: "archive"`
- `caseStudyKey: null`
- `displayInMap: false`

They need a substantial summary, role, technologies, and any available verified links/media, but they do not require an MDX case-study route.

## MDX policy

Case-study MDX may use normal Markdown and these reviewed components:

- `Callout`
- `Figure`
- `Comparison`

Imports, exports, arbitrary JavaScript expressions, raw HTML, and unapproved JSX components fail validation. Additions to the component allowlist require a code review and corresponding validator update.

## Contact links

GitHub, LinkedIn, and email use typed published records. External profiles must
use HTTPS; email must use `mailto:`. If a value becomes uncertain, replace it
with the typed pending variant and `href: null` rather than inventing a URL.
Release validation rejects pending entries.

The Vercel URL is requested separately during deployment for canonical metadata.

## Editing and removal

- Keep slugs stable after publication. A change requires a redirect.
- Keep `displayOrder` values unique and leave gaps for future insertion.
- Do not duplicate canonical prose in React components.
- Do not place confidential originals or metadata-bearing source assets in `public/`.
- Removing a manifest record removes it from future builds; review deletions deliberately.
- Cisco appears only as a project case study. Lakshya supplies the final omission list before final content approval.
