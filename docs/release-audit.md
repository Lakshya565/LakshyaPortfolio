# Release audit

## Status

This artifact records the Phase 9 foundation audit performed on 2026-08-09. It
is not final release approval. The current Cisco wording and media-free local
candidate are approved for review, but Phase 8 still requires local rendered,
confidentiality, and linked-evidence ownership review. Phase 10 is intentionally
deferred while the frontend is overhauled on localhost. Re-run this audit against
the eventual final committed content and deployed URL; do not treat these
localhost measurements as field data.

## Audit identity

| Item | Value |
| --- | --- |
| Base commit | `9b5f820`, plus the uncommitted Phase 4–9 worktree |
| Operating environment | Windows, PowerShell |
| Node / npm | Node `24.16.0`, npm `11.13.0` |
| Framework | Next.js `16.3.0`, React `19.2.8` |
| Automated browser | Chrome `150.0.7871.187`, Edge `151.0.4129.72`, Firefox `153`, WebKit `26.5` |
| Lighthouse | `13.4.1`, mobile preset, local production server |
| Content state | All ten project records have reviewed copy; temporary media is intentionally absent and release validation passes |

The final audit must name a clean commit and deployment identifier. An
uncommitted worktree is useful implementation evidence, not a reproducible
release build.

## Release targets

Use the current Core Web Vitals “good” thresholds at the 75th percentile: LCP
at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below
0.1. Lighthouse Total Blocking Time is only a lab responsiveness proxy; it is
not INP. See [How the Core Web Vitals thresholds were defined](https://web.dev/articles/defining-core-web-vitals-thresholds).

Accessibility review targets WCAG 2.2 AA. Relevant explicit checks include
320-CSS-pixel reflow, 24-by-24-CSS-pixel pointer targets or a documented
exception, visible keyboard focus, logical semantics, and motion reduction. See
the W3C guidance for [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow),
[target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum),
and [focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance).
The CSS `prefers-reduced-motion` query is the supported product boundary; no
experimental preference API is required. See
[MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion).

## Automated commands

| Command | Result |
| --- | --- |
| `npm.cmd run check` | Passed content validation, ESLint, strict TypeScript, and 9 Vitest files / 56 tests |
| `npm.cmd run validate:content:release` | Passed; no draft copy, pending contact input, or placeholder media is published |
| `npm.cmd run build` | Passed; `/`, `/about`, 404, discovery files, and social card are static; five project routes are SSG |
| Temporary `npx.cmd --yes knip --no-progress` audit | Passed with no unused files, dependencies, or exported symbols after cleanup |
| `npm.cmd audit --omit=dev --audit-level=high` | Passed; 0 reported production-dependency vulnerabilities |
| Public-build private-source scan | Passed; the supplied PDF filename, its Gmail address, and removed editorial source annotations are absent from emitted server/static output |
| Static rendered-artifact scan | Passed across home, About, and all five case studies: one `h1`, one `main`, no empty sections, and no placeholder/private-source markers per page |
| Published-link audit | 12 of 13 HTTPS destinations returned HTTP 200; LinkedIn alone returned its known automation-only HTTP 999 response. The email target passed schema/render validation without sending mail |
| Runtime response-header matrix | Passed on the home page, a project route, the social card, and a 404 response |
| Custom Chrome production matrix | Passed with no unexpected console errors, failed requests, invalid image markup, heading skips, unnamed links, or horizontal overflow |
| Custom Edge production matrix | Passed the same scenarios against the current build |
| Disposable Playwright Firefox/WebKit matrix | Passed responsive, text-enlargement, reduced-motion, JavaScript-disabled, semantic, image, keyboard, and 404 scenarios |
| Lighthouse: home | Performance 99, accessibility 100, best practices 100, SEO 63 |
| Lighthouse: RepoFrame | Performance 99, accessibility 100, best practices 100, SEO 66 |

The expected low SEO scores are caused only by the intentional preview
`noindex`. Missing `NEXT_PUBLIC_SITE_URL` also produces a crawl-disallowing
`robots.txt`, an empty sitemap, no canonical, and no social-image URL. Unit tests
verify that one valid HTTPS production origin enables all discovery output
together without emitting localhost.

## Lab measurements

| Route | FCP | LCP | TBT | CLS | Total transfer |
| --- | ---: | ---: | ---: | ---: | ---: |
| Home | 0.8 s | 2.0 s | 70 ms | 0 | 189 KiB |
| RepoFrame | 0.8 s | 2.0 s | 100 ms | 0 | 189 KiB |

Both runs used Lighthouse mobile throttling against `next start` on localhost.
The current network trace transferred roughly 135–141 KB of JavaScript in the
custom browser matrix. Lighthouse estimated about 52 KiB unused, predominantly
in shared Next/React runtime chunks. The retained client boundaries have current
responsibilities: primary/mobile navigation state, route-arrival focus/motion,
and offscreen circuit-animation pausing. Removing those behaviors solely to
chase a synthetic score is not justified while performance remains 99, but the
trace must be repeated after approved final content, any added media, and
production delivery are present.

## Browser and resilience matrix

| Scenario | Chrome | Edge | Firefox | WebKit |
| --- | --- | --- | --- | --- |
| Desktop home, About, rich RepoFrame, sparse NuCurrent | Passed | Passed | Passed | Passed |
| 320 px reflow and non-inline 24 px target scan | Passed | Passed | Passed | Passed |
| 200% text enlargement | Passed | Passed | Passed | Passed |
| Skip link first in interaction order, visible focus, focus reaches `main` | Passed | Passed | Passed | Passed* |
| JavaScript disabled: content, project links, native mobile menu | Passed | Passed | Passed | Passed |
| Reduced motion: no running animations | Passed | Passed | Passed | Passed |
| Invalid project slug | Correct 404 with one `h1` | Correct 404 with one `h1` | Correct 404 with one `h1` | Correct 404 with one `h1` |
| Social card | Static PNG, 1200 × 630, about 48 KiB | Same | Loaded | Loaded |

Firefox and WebKit were downloaded to a disposable audit directory rather than
added as repository dependencies. The headless WebKit build models Safari's
default full-keyboard-access preference, in which plain Tab does not focus
links. Its skip-link check therefore verified that the link is the first
interactive DOM element, focused it explicitly, and confirmed that Enter moves
focus to `main`. Repeat the matrix with final content on current native browsers
and real devices before production approval.

## Resolved blockers

- Removed link `aria-label` values that disagreed with visible labels, restoring speech-input and accessible-name consistency.
- Corrected metric definition-list markup so every context belongs to its corresponding `dd`.
- Made every `main` landmark programmatically focusable so the native skip link moves focus, without adding it to normal tab order.
- Replaced Next’s origin-dependent file-based social-image convention after it attempted to resolve preview metadata against localhost.
- Added a validated site-origin boundary, preview-safe robots/canonical behavior, published-route-only sitemap generation, and a static social card.
- Added static baseline CSP, permissions, referrer, MIME-sniffing, and frame-denial headers without introducing nonce-driven runtime rendering.

## Link and privacy checks

- GitHub returned HTTP 200 during the audit.
- LinkedIn rejected direct automated profile requests with HTTP 999. Its search-indexed public snapshot supplied project content for the Phase 8 source pass; its signed-out shortlink interstitial exposed the direct SmartLift YouTube demo and Google Docs report destinations now used by the portfolio. Recheck those destinations during the production smoke test.
- The resolved SmartLift YouTube demo and Google Docs report destinations both returned HTTP 200 on 2026-08-09.
- The email link passes schema and rendered-link validation; sending mail was not part of the audit.
- No resume file or route is present. Archive cards are absent from the sitemap because they have no detail routes.
- No temporary media is published. Future files remain project-namespaced and still need ownership, metadata stripping, confidentiality, alt-text, and rendered-context review.

The local Next 16 production server writes an internal `NoFallbackError` stack
when an unknown slug is rejected by `dynamicParams = false`, even though the
response is the correct custom 404 and the browser sees no error. The official
route contract confirms that `false` is the static-only 404 boundary; changing
it to `true` would permit on-demand streaming renders and is the worse tradeoff.
Recheck provider logs on Vercel and either confirm the framework noise is
suppressed/accepted or resolve it with a tested framework update. Do not relax
the static route allowlist to silence a log.

On Windows, the successful Webpack production build also warns that it cannot
statically trace `@next/mdx`'s platform-dependent dynamic config import for
cache invalidation. This originates in the installed loader rather than project
code and does not change the generated static routes. Recheck it after a tested
Next/MDX upgrade; do not patch dependency internals solely to silence the
warning.

## Open release blockers

- Complete every unchecked input in `docs/content-inventory.md`, including the final Cisco omission list and media/client-approval checks.
- Add final media only after ownership and confidentiality review; intentional absence is preferable to generic stand-ins.
- Repeat accessibility, performance, image, and confidentiality review with final content.
- Repeat cross-engine checks with final content, including native Safari and representative real devices.
- Recheck the unknown-slug `NoFallbackError` against the deployed framework/runtime and record its disposition.
- Configure the real Vercel HTTPS origin, then verify canonicals, crawlable robots, sitemap URLs, social previews, and signed-out public links.
- Record production field data only if a later analytics decision explicitly authorizes a privacy-appropriate measurement approach; do not present Lighthouse as field INP.
