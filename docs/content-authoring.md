# Portfolio content authoring

## Source of truth

Portfolio content is version-controlled under `web/content/`:

- `site.ts` contains identity and social/contact input slots.
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

Development validation permits known drafts and placeholders so later phases can build against representative content. Release validation rejects pending contact inputs, draft projects, placeholder copy, and placeholder assets.

Run:

```powershell
npm.cmd run validate:content
npm.cmd run validate:content:release
```

The second command is expected to fail until final URLs, Cisco omissions, copy, and media are complete. It is a release gate, not the normal Phase 1 build gate.

## Adding a case-study project

1. Add a stable slug to `caseStudyKeys` in `web/types/content.ts`.
2. Add a `presentation: "case-study"` record to `web/content/projects.ts`.
3. Create `web/content/case-studies/<slug>.mdx`.
4. Add the explicit loader to `web/content/case-studies/registry.ts`.
5. Add referenced media under `web/public/media/projects/<slug>/`.
6. Run content validation, tests, and the production build.

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

## Contact placeholders

GitHub, LinkedIn, and email currently use typed pending records with `href: null`. No fake URL is rendered or placed into public content. Before release:

1. Request the real values from Lakshya.
2. Change each entry to `status: "published"` with a valid HTTPS URL or `mailto:` address.
3. Run release validation.

The Vercel URL is requested separately during deployment for canonical metadata.

## Editing and removal

- Keep slugs stable after publication. A change requires a redirect.
- Keep `displayOrder` values unique and leave gaps for future insertion.
- Do not duplicate canonical prose in React components.
- Do not place confidential originals or metadata-bearing source assets in `public/`.
- Removing a manifest record removes it from future builds; review deletions deliberately.
- Cisco appears only as a project case study. Lakshya supplies the final omission list before final content approval.

