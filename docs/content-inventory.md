# Final content and media inventory

This is the Phase 8 handoff checklist. It records what the repository can safely
represent today and the project-specific evidence still required from Lakshya.
Bracketed entries are explicit inputs, not copy to publish. Public LinkedIn
claims and the supplied LinkedIn profile PDF resolved the checked items below;
the release validator now passes with temporary media intentionally absent. See
`docs/linkedin-audit.md` for source boundaries and profile recommendations.

Public GitHub repositories and the current local RepoFrame checkout were used
to resolve RepoFrame, Lucky Arduino, AgriSense, and RiseNRun details. The private
PDF was read in place as editorial evidence and was not copied into the
repository.

## Site-wide inputs

- [x] Homepage headline and introduction revised from the current LinkedIn summary without duplicating its resume-style headline.
- [x] About narrative, May 2029 education date, Taekwondo leadership, and Camp Hi Sierra context reconciled with the profile PDF.
- [x] Displayed roles and technologies reconciled with the PDF, public project entries, repositories, and current RepoFrame source.
- [x] Initial local-review candidate intentionally contains no local image or diagram assets; future media requires a fresh ownership/licensing check before publication.
- [ ] Confirm ownership/permission for the linked repositories, SmartLift demo, and SmartLift report before public deployment.
- [x] Keep every substantial archive card in the initial launch.
- [ ] Final confidentiality and personal-data review after all content is rendered.

The two private resumes may be used only as editorial source material. They must
not be copied into `public/`, linked, routed, added to navigation, or emitted in
metadata/sitemap output.

## Featured case studies

### Cisco Agentic Runbook Creator

- Current public shape: reviewed featured AI-systems case study; the profile PDF supplies May–Aug 2026 dates, the Software Engineer Intern title, individual implementation areas, and two project-level results. It intentionally launches without media until an approved diagram is supplied.
- [x] May–Aug 2026 dates and Software Engineer Intern wording sourced from the current Experience entry.
- [x] Local SLM reasoning, multi-stage generation, privacy-preserving handoff, Flask integration, and digital-twin evaluator separated from team outcomes.
- [x] Cisco IOS XE fault injection, expansion beyond 13 predefined procedures, and the reported under-25-minute triage result captured with project-level attribution.
- [x] Current Cisco wording approved as-is for local review on 2026-08-09; phrasing and omissions must be reconsidered before public deployment.
- [x] Launch without Cisco media for now; add an approved architecture diagram only after the frontend direction is settled.
- [x] No durable project URL was exposed by the PDF or signed-out LinkedIn index, so none is invented.

### RepoFrame

- Current public shape: featured developer-tool case study with three verified product-shape metrics and one public repository link. Temporary artwork is omitted; screenshots and an architecture diagram remain in the media backlog.
- [x] Public repository added; no durable public live/demo URL was found, so none is invented.
- [x] Four core written outputs—resume, README, portfolio, and LinkedIn—plus separate interview preparation verified against current contracts and routes.
- [x] Bounded evidence retrieval and tool-using audit wording verified against the current implementation.
- [x] Architecture tradeoffs and creator/full-stack contribution sourced from the public repository; no unverified speed, quality, or impact metric is published.
- [x] Launch without RepoFrame media for now; reviewed screenshots and an architecture diagram remain an optional later enhancement.

## Supporting case studies

### NuCurrent Inventory System

- [x] Jan–May 2026 dates and Technical Consultant/frontend-lead role sourced from the current Experience entry.
- [x] Search, check-in/check-out, barcode scanning, label generation, low-stock alerts, schema, and REST API ownership separated from the broader CUBE engagement.
- [x] Spreadsheet replacement, centralized inventory operations, documentation, and client-handoff outcome captured without inventing a metric.
- [x] NuCurrent and the engagement are already named publicly in the Experience entry; official NuCurrent and CUBE organization links are included, while no repository or demo URL is invented.
- [x] Launch without NuCurrent client media; any future screenshots, internal labels, or production data require separate client approval.

### SmartLift Sleeve

- [x] Jan–May 2026 dates, three-person team context, project-lead wording, and published individual circuit contributions.
- [x] Flex/pulse sensing, analog signal conditioning, digital timing/counter logic, seven-segment and LED outputs, integration issues, and output-PCB design scope.
- [x] Published rep-count/exertion behavior, demo/report evidence links, and incomplete-MVP boundary captured without an accuracy claim.
- [x] Launch without SmartLift hardware media; future photographs/diagrams require stripped metadata and confirmed ownership.
- [x] Public demo and final-report shortlinks resolved through LinkedIn's signed-out interstitial to direct YouTube and Google Docs destinations; both returned HTTP 200 on 2026-08-09.

### QuackTA

- [x] March 28–29, 2026 event date confirmed by the official UIUC calendar; LinkedIn supplies five-person team context but not subsystem ownership, so launch copy uses a conservative team-member role.
- [x] Raspberry Pi 5, Arduino Uno R4 Minima, custom enclosure, contextual GPT-4o mini tutoring, app UI, scheduling, and expressive-output architecture.
- [x] Retain the publicly named model with narrower “used with course and schedule context” wording instead of the ambiguous “trained” claim.
- [x] Published tutoring and scheduling behavior captured without inventing an outcome metric.
- [x] Launch without media or external links; add optional evidence later if supplied.

## Archive cards

Archive cards do not require detail routes. Each still needs a verified substantial
summary, role, technology list, and at least one concrete contribution or lesson.
Links/media are optional only when the card remains useful without them.

| Project | LinkedIn resolution | Unresolved or optional follow-up |
| --- | --- | --- |
| Lucky Arduino Collection | Nov 2023–Aug 2025 Experience entry plus two public repositories | Creator/educator role, 50+ videos, 50K+ views, 200+ subscribers, twelve documented repository builds, website, and YouTube channel resolved |
| BackBuddy | Jan–May 2025 scope, personal build work, and capstone result sourced | Optional public photograph, diagram, or presentation evidence |
| Neurify | Aug 2025 scope and Python signal-processing/software contribution sourced | Optional evaluation evidence or repository/demo; the launch copy makes no accuracy claim |
| AgriSense | Aug–Dec 2025 sensor scope, Flask backend work, hardware research, and public repository sourced | Optional concrete outcome or hardware evidence |
| COSMOS RiseNRun Wi-Fi Alarm Clock | Jul–Aug 2024 system behavior, firmware and device-network ownership, user trials, showcase, and public repository sourced | Media remains optional |

## Asset delivery rules

Deliver final assets with descriptive lowercase filenames. For each asset provide:

- Project slug and intended kind (`hero`, `screenshot`, `diagram`, `hardware-photo`, `gallery`, or `video-thumbnail`).
- Accurate alt text and optional caption.
- Ownership/license/attribution status.
- Confirmation that customer data, credentials, faces, location, logs, and device metadata are safe to publish.

Projects may contain any number of gallery images and videos. Each video has its
own label, HTTPS URL, and optional thumbnail reference; no project-level image
or video maximum is hardcoded. Layout adapts to the collection size and each
image's intrinsic aspect ratio.

Final raster files should be optimized and stripped of EXIF/location metadata.
Final SVGs must be reviewed for scripts, event handlers, external references,
editor metadata, and confidential labels before publication.

## Publication gate

The machine-checkable portion of the Phase 8 gate passes. Phase 8 is complete
only after every route has been reviewed in rendered context and the remaining
ownership, confidentiality, Cisco omission, and client-approval checks are
resolved. A passing validator does not provide those editorial approvals.
