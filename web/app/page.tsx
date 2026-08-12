import Link from "next/link";

import { IsometricDesk } from "@/components/desk/isometric-desk";
import { ProjectTree } from "@/components/project-tree/project-tree";
import { SocialLinks } from "@/components/site/social-links";
import { Button } from "@/components/ui/button";
import { getHomePageData } from "@/lib/content/portfolio-repository";

export default function Home() {
  const data = getHomePageData();

  return (
    <main id="main-content" tabIndex={-1}>
      <header className="personal-hero site-container">
        <p className="eyebrow">{data.profile.name} · Computer Engineering</p>
        <h1 className="hero-title">{data.profile.headline}</h1>
        <p className="hero-intro">{data.profile.shortIntro}</p>
        <SocialLinks className="hero-social-links" links={data.socialLinks} />
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
