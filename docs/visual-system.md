# Portfolio visual system

## Direction and invariants

The portfolio is permanently dark and uses a restrained atmospheric
computer-system language. Green identifies Software work, electric blue
identifies Hybrid work, and purple identifies Hardware work. A tri-color
treatment represents Lakshya's combined identity; warm amber belongs only to
personal motifs. None of these colors encode quality or completion.
The desk artwork is replaceable. Semantic headings, the shared server-rendered
project tree, case studies, `/work`, and content projections are the lasting
architecture.

Later visual iterations may change composition, typography, illustration, glow,
or density without moving canonical project facts into components or making the
desk dialog required navigation.

## Semantic tokens

Core tokens live in `web/app/globals.css` and are exposed to Tailwind where a
utility class is useful.

| Role | Token | Use |
| --- | --- | --- |
| Page background | `--canvas` | Browser and route canvas |
| Recessed/raised surfaces | `--surface`, `--surface-raised` | Cards, controls, menus |
| Text hierarchy | `--primary`, `--secondary`, `--muted` | Headings, body, metadata |
| Boundaries | `--line`, `--line-strong` | Dividers and control edges |
| Project modes | `--accent-green`, `--accent-blue`, `--accent-purple` | Software, Hybrid, and Hardware project identity |
| Personal detail | `--accent-personal` | Hobbies and biographical workbench motifs only |
| Keyboard focus | `--focus` | The only focus-ring source |
| Motion | `--duration-interaction`, `--duration-route`, `--ease-out` | Press/hover and route arrival |
| Geometry | `--content-wide`, `--content-reading`, radius tokens | Shared layout/readability constraints |

Do not introduce raw component colors. Add a semantic token only when a real
state needs it. Alpha variants are named tokens so the desk, header, links,
and selection treatment cannot silently drift.

## Contrast record

WCAG contrast was calculated from the current OKLCH values after sRGB gamut
clamping. Body and metadata text exceed AA; graphical borders and focus exceed
the 3:1 non-text threshold.

| Pair | Ratio |
| --- | ---: |
| Primary / canvas | 18.35:1 |
| Secondary / canvas | 13.27:1 |
| Muted / canvas | 7.32:1 |
| Green / canvas | 11.12:1 |
| Blue / canvas | 10.72:1 |
| Purple / canvas | 9.70:1 |
| Border / canvas | 3.16:1 |
| Strong border / canvas | 4.72:1 |
| Focus / canvas | 15.07:1 |

## Typography and layout

The foundation uses local system sans and monospace stacks. This avoids a font
license decision, network dependency, or font-loading layout shift before the
final design iteration. `--content-wide` controls editorial sections;
`--content-reading` limits case-study prose. Type scales use `clamp()` only for
high-level headings and remain content-driven everywhere else.

## Interaction states

- Hover treatments run only on fine pointers and never contain required content.
- `:focus-visible` is global, high contrast, and never removed by a component.
- Pressable controls use a subtle `0.98` active scale with the shared interaction timing.
- Current navigation uses `aria-current` plus a raised surface, not color alone.
- Reduced motion removes continuous signal movement and route-entry motion.
- Keyboard-initiated routes do not animate; focus moves to the arriving heading or fragment.
- Disabled, warning, and error visuals should be added only with the behavior that needs them. Add semantic tokens at that point, and pair state color with an explicit label or icon.

## Media and effects

Blur and glow are static, restrained, and never required for legibility. Project
images retain intrinsic dimensions and their source order. The desk SVG is a
decorative, passive local image hidden from assistive technology; its monitor is
a separate semantic `/work` link enhanced into a dialog trigger. Placeholder
artwork is layout evidence only and is blocked by release validation.

The project tree uses one static grid texture across every routed story. Visible
Hybrid, Software, and Hardware branch headings pair with the blue, green, and
purple connectors, so color is never required to understand the hierarchy.
Native disclosure reflows the static branch connectors without measured geometry
or animation.
