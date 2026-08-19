import Link from "next/link";

import { IsometricDesk } from "@/components/desk/isometric-desk";
import { HeroBackground } from "@/components/hero/hero-background";
import { HeroLinkButton } from "@/components/hero/hero-link-button";
import { HeroName } from "@/components/hero/hero-name";
import { DiaTextReveal } from "@/components/ui/dia-text-reveal";
import { ProjectTree } from "@/components/project-tree/project-tree";
import { Button } from "@/components/ui/button";
import { getHomePageData } from "@/lib/content/portfolio-repository";

/**
 * The colours the reveal sweeps through, darkest to lightest and back.
 *
 * The component ships a five-stop purple/orange palette. These are the site's
 * own greens — `#62d691` is `ink.accent`, the colour that means "this responds"
 * — so the sweep reads as the page lighting up rather than as a stock effect.
 */
const heroSweep = ["#168253", "#62d691", "#d9ffe9", "#62e895", "#1f5f3f"];

/**
 * `color: inherit` rather than a literal, so each line falls back to whatever
 * its own container already specifies — `--primary` for the headline,
 * `--secondary` for the intro — instead of repeating those values here.
 */
const heroNoScriptCss =
  ".hero-reveal{color:inherit!important;-webkit-text-fill-color:currentColor!important;background-image:none!important}";

export default function Home() {
  const data = getHomePageData();
  /* Resume first. It is the thing a visitor is most likely to have come for,
     and it used to be the fourth of four identical underlined links. */
  const heroLinks = [
    ...data.socialLinks.filter((link) => link.kind === "resume"),
    ...data.socialLinks.filter((link) => link.kind !== "resume"),
  ];

  return (
    <main id="main-content" tabIndex={-1}>
      <header className="personal-hero site-container">
        <HeroBackground />

        {/* Two columns of one fraction each: who, and what. A single stack left
            the right half of a wide screen empty, which read as unfinished
            rather than as restraint. Below 56rem it is one column again. */}
        <div className="personal-hero-split">
          <div className="hero-identity">
            {/* The heading is the real, readable name and nothing else. The
                drawing is a sibling rather than a child: nested inside, the
                SVG's own `<text>` joined the heading's `textContent`, which
                read back as "Lakshya AgarwalLAKSHYAAGARWAL" to anything doing
                plain-text extraction. */}
            <h1 className="hero-title sr-only">{data.profile.name}</h1>
            <HeroName name={data.profile.name} />

            <div className="hero-actions">
              {heroLinks.map((link) => (
                <HeroLinkButton key={link.kind} link={link} />
              ))}
            </div>
          </div>

          {/* A hairline suspended between the halves, with a light bouncing
              down it and back.

              This was `BorderBeam` and could not stay. That component walks a
              square gradient around its host's border box at a constant rate;
              on a one-pixel-wide element that path is 460px down, 1px across,
              460px back up — so the turn happens in a tenth of a percent of the
              cycle, and `offset-rotate` spins the square 180° as it goes. The
              snap was the geometry, not a setting. A segment on an `alternate`
              keyframe eases into each end instead, in CSS, on `transform`. */}
          <div aria-hidden="true" className="hero-divider">
            <span className="hero-divider-beam" />
          </div>

          {/* The two lines sweep in one after the other, so the reader is walked
              down the column rather than handed it at once. The offset is
              shorter than the sweep, which makes them cascade instead of queue.
              `DiaTextReveal` already honours `prefers-reduced-motion` by
              jumping to the finished state.

              The name no longer takes a reveal: it paints text transparent and
              fills it with a moving gradient, which is the same slot the glyph
              field occupies. They cannot both own the letterforms. */}
          <div className="hero-statement">
            <p className="hero-headline">
              <DiaTextReveal
                className="hero-reveal align-baseline leading-[1.3]"
                colors={heroSweep}
                delay={0.2}
                text={data.profile.headline}
                textColor="var(--primary)"
              />
            </p>
            <p className="hero-intro">
              <DiaTextReveal
                className="hero-reveal align-baseline leading-[1.75]"
                colors={heroSweep}
                delay={0.65}
                text={data.profile.shortIntro}
                textColor="var(--secondary)"
              />
            </p>
          </div>
        </div>

        {/* The reveal paints its text with `background-clip: text` over a
            transparent colour, so with scripting off those two lines would
            render blank. The markup already contains the real words — this just
            puts the colour back. */}
        <noscript>
          <style>{heroNoScriptCss}</style>
        </noscript>
      </header>

      {/* The scene is a 2:1 band, so it spans the page rather than sharing a
          column. Squeezed into half the width it renders too small to tell one
          object from another, which is the whole point of it. */}
      <section aria-label="Things on my desk" className="desk-band">
        <IsometricDesk hotspots={data.personalHotspots} />
      </section>

      {/* The project tree lives here now rather than on its own route: one page,
          one index, and the work sits directly under the illustration. */}
      <section
        aria-labelledby="project-tree-title"
        className="home-tree site-container"
        id="project-tree"
      >
        <div className="project-tree-page-header">
          <p className="eyebrow">
            Work · {data.projectTree.projectCount} projects
          </p>
          <h2 id="project-tree-title">Project tree</h2>
          <p>
            Open a node for context, or follow it to the complete project story.
          </p>
        </div>
        <ProjectTree branchHeadingLevel="h3" data={data.projectTree} />
      </section>

      <section
        aria-labelledby="about-title"
        className="border-t border-line"
        id="contact"
      >
        <div className="personal-closing site-container">
          <div>
            <p className="eyebrow">Away from the workbench</p>
            <h2 id="about-title">I like learning with other people.</h2>
          </div>
          <div>
            <p>
              Teaching has shaped how I engineer. So have bouldering, lifting,
              anime nights, and finding good food—from boba and froyo to sushi,
              Thai food, and Indian food—with people I care about.
            </p>
            <Button
              asChild
              /* `px-0` because the link variant keeps a button's horizontal
                 padding, which pushed this 17px off the left rail every other
                 block on the page sits on. */
              className="mt-4 px-0 whitespace-normal text-left"
              variant="link"
            >
              <Link href="/about">A little more about me →</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
