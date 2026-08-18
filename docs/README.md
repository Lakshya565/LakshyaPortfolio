# Documentation index

Seven documents. Each one owns a subject, and where two could plausibly cover the
same thing, the table says which wins. **If a doc contradicts one of these
owners, the owner is right and the other doc is stale.**

| Read this | When you want to | Authoritative for |
|---|---|---|
| [`editing-copy.md`](editing-copy.md) | Change a sentence on the site | Which file holds which visible words |
| [`content-authoring.md`](content-authoring.md) | Add a project, a case study, or media | The content model, publication states, MDX policy |
| [`operations.md`](operations.md) | Build, release, or deploy | **Standing rules**, the release checklist, deployment, rollback |
| [`desk-artwork-handoff.md`](desk-artwork-handoff.md) | Touch the isometric scene | Projection, objects, the lettering, the review method |
| [`visual-system.md`](visual-system.md) | Change colour, type, or spacing | Tokens, contrast, interaction states |
| [`portfolio-overview.md`](portfolio-overview.md) | Understand why the site is shaped this way | Product strategy, architecture, accepted decisions |
| [`desk-project-tree-redesign-phases.md`](desk-project-tree-redesign-phases.md) | Start the next redesign phase | Phases 3+, and the invariants that gate them |
| [`decisions/`](decisions/) | Trace one architectural choice | Individual ADRs |

## Start here

- **Standing rules** — no deploying or publishing without authorization, no
  fabricated claims, the Cisco omission review, the resume rule — live in
  [`operations.md`](operations.md#standing-rules) and nowhere else. Other docs
  point at them rather than restating them, so there is one copy to keep true.
- **Open items before publication** are in
  [`operations.md`](operations.md#open-before-publication).

## What was removed, and why

Five documents were deleted on 2026-08-17. All were process artifacts for work
that has since shipped, and between them they were 1,632 lines actively
contradicting the running site. Everything still live was moved into
`operations.md` first; `git log` has the originals.

| Removed | Why |
|---|---|
| `portfolio-implementation-phases.md` | 866 lines of phase gates for phases 1–9, all complete |
| `claude-code-ui-handoff.md` | Declared the UI "not visually approved" and described a desk SVG that no longer exists. `desk-artwork-handoff.md` had grown a whole section listing its errors |
| `release-audit.md` | A dated point-in-time audit whose figures were already stale. Its open blockers moved to `operations.md` |
| `content-inventory.md` | A Phase 8 checklist, all but two boxes ticked. Those two moved to `operations.md` |
| `linkedin-audit.md` | A one-time reconciliation against the public profile, complete |

Phases 1 and 2 of the redesign plan were also trimmed out of
`desk-project-tree-redesign-phases.md`, since both shipped and their behaviour is
now enforced by the code and the test suite rather than by prose.

## The rule that keeps this working

A document describing *completed* work is a liability, not a record — git already
has the record, and prose that no longer matches the code will be believed by
somebody. When a plan ships, delete the plan and keep the invariant.
