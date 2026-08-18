import Link from "next/link";

import { IsometricDesk } from "@/components/desk/isometric-desk";
import { DiaTextReveal } from "@/components/ui/dia-text-reveal";
import { ProjectTree } from "@/components/project-tree/project-tree";
import { SocialLinks } from "@/components/site/social-links";
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
 * its own container already specifies — `--primary` for the title and headline,
 * `--secondary` for the intro — instead of repeating those values here.
 */
const heroNoScriptCss =
  ".hero-reveal{color:inherit!important;-webkit-text-fill-color:currentColor!important;background-image:none!important}";

export default function Home() {
  const data = getHomePageData();

  return (
    <main id="main-content" tabIndex={-1}>
      <header className="personal-hero site-container">
        {/* The three lines sweep in one after another, so the reader's eye is
            walked down the hero rather than handed all of it at once. The
            offsets are shorter than the sweep, which makes them cascade instead
            of queueing. `DiaTextReveal` already honours `prefers-reduced-motion`
            by jumping to the finished state. */}
        <h1 className="hero-title">
          <DiaTextReveal
            className="hero-reveal leading-[1.05]"
            colors={heroSweep}
            delay={0}
            text={data.profile.name}
            textColor="var(--primary)"
          />
        </h1>
        {/* The headline used to be the h1, set at 4.25rem. A visitor arriving
            from an application or a project link is looking for a name, and a
            sentence at that size read as a billboard rather than as an
            introduction — so the name takes the title and the sentence keeps
            second place. */}
        <p className="hero-headline">
          <DiaTextReveal
            className="hero-reveal align-baseline leading-[1.3]"
            colors={heroSweep}
            delay={0.45}
            text={data.profile.headline}
            textColor="var(--primary)"
          />
        </p>
        <p className="hero-intro">
          <DiaTextReveal
            className="hero-reveal align-baseline leading-[1.75]"
            colors={heroSweep}
            delay={0.9}
            text={data.profile.shortIntro}
            textColor="var(--secondary)"
          />
        </p>
        <SocialLinks className="hero-social-links" links={data.socialLinks} />
        {/* The reveal paints its text with `background-clip: text` over a
            transparent colour, so with scripting off the hero would render
            blank. The markup already contains the real words — this just puts
            the colour back. */}
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
              className="mt-4 whitespace-normal text-left"
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
