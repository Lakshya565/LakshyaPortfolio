# Portfolio operations

This runbook covers content updates, release approval, Vercel deployment,
verification, rollback, and maintenance. It does not authorize a deployment.
Creating or changing the Vercel project, provider variables, domains, analytics,
or production content still requires Lakshya's explicit approval.

## Local update workflow

1. Edit canonical identity, project, and About records under `web/content/`.
2. Keep case-study narrative in its explicitly registered MDX file. Follow
   `docs/content-authoring.md`; do not add arbitrary JSX or Markdown images.
3. Put reviewed project media under `web/public/media/projects/<slug>/` and
   update its manifest record with dimensions, alt text, caption, and kind.
4. Run from `web/`:

   ```powershell
   npm.cmd run validate:content
   npm.cmd run check
   npm.cmd run build
   ```

5. Review every affected route in rendered context, including keyboard,
   reduced-motion, 320 px, and final-media behavior.
6. For a release candidate, run `npm.cmd run validate:content:release`. A pass
   is required but is not itself publication approval.

The **software** resume is published, at `web/public/lakshya-agarwal-resume.pdf`
(**Reversed on 2026-08-17 at Lakshya's explicit request.** ). To replace it, overwrite that file and commit; the filename is
stable on purpose so links already handed out keep resolving.

Never add the **hardware/embedded** resume, the LinkedIn PDF, or any other
private document to the repository's public assets, routes, metadata,
navigation, or sitemap. Use those only as private editorial evidence.

## Approval checklist

Before production work, record:

- The clean commit and approved public-content review.
- The final Cisco omission/confidentiality review.
- Ownership or license status for every public asset.
- Vercel account/team owner, intended project name, billing expectation, and
  rollback tolerance.
- The assigned production `https://<project>.vercel.app` origin.
- Whether production-branch pushes should auto-promote or require manual
  promotion.

Do not infer approval from a successful preview or build.

## Vercel project configuration

The repository root is not the Next.js application root. Configure Vercel's
Root Directory as `web`, following Vercel's current
[root-directory guidance](https://vercel.com/docs/builds/configure-a-build#root-directory).
Use the detected Next.js framework settings, the repository lockfile, Node 24
from `package.json`, and the normal `npm run build` command. No output-directory
override, runtime database, secret, function, or `vercel.json` is currently
required.

The application emits a static baseline CSP (`base-uri`, `form-action`,
`frame-ancestors`, and `object-src`), a restrictive permissions policy,
`strict-origin-when-cross-origin`, `nosniff`, and `X-Frame-Options: DENY` on all
paths. Verify these headers after deployment. A script/style nonce CSP is not
included because it would require request-time rendering or a separately tested
static-integrity strategy; revisit it only with a concrete threat model and
measured deployment design.

Set `NEXT_PUBLIC_SITE_URL` only for the Production environment, to the exact
assigned HTTPS origin with no path or trailing content. Leave it absent from
Preview and Development so those builds remain non-indexable. Vercel variable
changes apply only to new deployments, so redeploy after adding or changing the
value. See Vercel's
[environment-variable documentation](https://vercel.com/docs/environment-variables).
Configuring the origin automatically switches the repository prebuild validator
to release mode; a deployment with placeholder content must fail before it can
emit crawlable metadata.

If the permanent Vercel origin is not known until the project exists, let the
first deployment remain non-indexable, capture its assigned production origin,
set the variable, and create a new production build. Never substitute a preview
URL or localhost value.

## Production release

After explicit authorization:

1. Import/connect the approved repository and select `web` as Root Directory.
2. Confirm framework, Node, install, and build settings before the first build.
3. Set the production-only site origin and create a fresh production build.
4. Record the deployment URL, deployment ID, commit, build time, and logs.
5. Confirm Vercel reports `/`, `/about`, discovery output, social card, and all
   project pages as static/prerendered rather than runtime functions.
6. Run the production verification matrix below before calling the release
   complete.

Vercel distinguishes Preview and Production environments and can associate
deployments with immutable URLs. Review its current
[environment model](https://vercel.com/docs/deployments/environments) before
changing branch promotion behavior.

## Production verification

With the final origin assigned locally for this shell only:

```powershell
$ProductionOrigin = "https://<assigned-project>.vercel.app"
Invoke-WebRequest -UseBasicParsing "$ProductionOrigin/"
Invoke-WebRequest -UseBasicParsing "$ProductionOrigin/about"
Invoke-WebRequest -UseBasicParsing "$ProductionOrigin/robots.txt"
Invoke-WebRequest -UseBasicParsing "$ProductionOrigin/sitemap.xml"
Invoke-WebRequest -UseBasicParsing "$ProductionOrigin/social-card"
```

Then verify:

- All ten published project routes return 200; an unknown or unpublished slug
  returns 404.
- Canonicals, Open Graph, Twitter image, robots sitemap reference, and every
  sitemap URL use exactly the production origin.
- `robots.txt` allows crawling and advertises the production sitemap.
- The social card is a 1200 × 630 PNG and renders correctly in at least one
  social-preview debugger.
- GitHub, LinkedIn, email, repository, demo, and video links work signed out.
- Final media returns the expected content type, dimensions, alt behavior, and
  cache behavior, with no private metadata or broken requests.
- Desktop/mobile keyboard flows, skip link, all eight desk hotspots, monitor
  dialog focus/history, the `/work` fallback, direct routes, refresh, reduced
  motion, 200% text, 320 px reflow, JavaScript-disabled navigation, Firefox,
  and Safari/WebKit pass.
- Browser console, network requests, and deployment logs contain no error,
  draft, credential, internal path, or confidential content.
- A production Lighthouse run and, when available, field Core Web Vitals are
  recorded in `docs/release-audit.md` with their exact conditions.

## Rollback

Record the last known-good deployment before promotion. If the release is
broken, prefer Vercel Instant Rollback to an already served production
deployment, then verify the restored routes. Vercel notes that rollback restores
the older build's configuration and does not rebuild it with newly changed
environment variables. It also disables automatic production-domain assignment
until rollback is undone or another deployment is promoted. See
[Instant Rollback](https://vercel.com/docs/instant-rollback) and
[`vercel promote`](https://vercel.com/docs/cli/promote).

After service is stable:

1. Revert or fix the offending source change in git; do not rewrite shared
   history.
2. Re-run release validation and the affected audit scenarios.
3. Build a new immutable deployment and promote it only after review.
4. Confirm expected branch auto-promotion behavior has been restored.

## Maintenance

- Monthly or before a content release: run content validation, checks, build,
  and signed-out link/media review.
- Quarterly: review dependency updates and production vulnerability reports,
  then update deliberately with regression checks.
- After any slug change: add an explicit redirect, update inbound links and the
  sitemap, and test old/new URLs before deployment.
- After a domain is added: update only the production site-origin value, rebuild,
  and recheck every canonical/discovery/social URL. Track domain renewal with
  the registrar; Vercel cannot replace that ownership process.
- Re-review factual project claims and Cisco confidentiality whenever content
  changes, not only when code changes.

Analytics remains optional. Evaluate it only when there is a concrete question
that server logs or a short manual audit cannot answer. Before selecting a
vendor, document purpose, data collected, retention, cookies/consent, geographic
requirements, script cost, accessibility impact, cost limits, and deletion
workflow. No analytics script should be added by default.
