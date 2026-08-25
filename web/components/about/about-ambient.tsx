import { DotPattern } from "@/components/ui/dot-pattern";
import { GridPattern } from "@/components/ui/grid-pattern";
import { HexagonPattern } from "@/components/ui/hexagon-pattern";

/**
 * The texture behind the About page.
 *
 * The three branch shapes carry the whole visual identity of the project tree,
 * and this is the page that tree points at — so the page is drawn in them. Not
 * on the panels, though: a panel wearing the Hybrid grid would claim to *be*
 * Hybrid, and those three shapes are locked to the three branches. As one
 * ambient layer under everything they read as the house texture instead.
 *
 * **Vertical zones.** Grid behind the intro, hexagon behind the first rail, dot
 * behind the second and the Connect block, each masked so it fades into the
 * next rather than meeting it at a line. The texture changes as you scroll,
 * which quietly marks where on the page you are.
 *
 * The order — grid, hexagon, dot, which is blue, green, purple — is the branch
 * order in the project tree, so the page runs through the same three colours in
 * the same sequence as the tree that points at it, and the panel borders follow
 * it too.
 *
 * Server-rendered and static: three tiled `<pattern>`s, no measuring, no
 * client bundle. `globals.css` owns the masks, the colours and the opacity.
 */
export function AboutAmbient() {
  return (
    <div aria-hidden="true" className="about-ambient">
      <GridPattern className="about-ambient-layer about-ambient-top" height={44} width={44} />
      <HexagonPattern className="about-ambient-layer about-ambient-middle" radius={26} />
      <DotPattern
        className="about-ambient-layer about-ambient-bottom"
        cr={1.3}
        cx={2}
        cy={2}
        height={18}
        width={18}
      />
    </div>
  );
}
